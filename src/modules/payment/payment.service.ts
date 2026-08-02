import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "./payment.interface";

// Shared: mark a booking's payment COMPLETED and advance ACCEPTED -> PAID.
const markBookingPaid = async (
  bookingId: string,
  transactionId: string,
) => {
  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { bookingId },
      data: { status: "COMPLETED", paidAt: new Date(), transactionId },
    }),
    prisma.booking.updateMany({
      where: { id: bookingId, status: "ACCEPTED" },
      data: { status: "PAID" },
    }),
  ]);
};

const paymentInclude = {
  booking: {
    include: {
      service: { select: { id: true, title: true } },
      customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  },
};

/**
 * Where Stripe returns the customer after checkout.
 *
 * The caller may ask for its own origin — local dev and the deployed
 * frontend are different hosts, and a single APP_URL can only ever be right
 * for one of them. The request is honoured **only** when it exactly matches
 * an entry in APP_ORIGINS (the same allow-list CORS uses), so this can never
 * be talked into redirecting a paying customer somewhere arbitrary.
 *
 * Falls back to the first configured origin, then APP_URL.
 */
const resolveReturnOrigin = (requested?: string): string => {
  const normalized = requested?.replace(/\/+$/, "");

  if (normalized && config.app_origins.includes(normalized)) {
    return normalized;
  }

  const fallback = config.app_origins[0] ?? config.app_url;

  if (!fallback) {
    // Stripe rejects a relative success_url with an opaque error; say what's
    // actually wrong instead.
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "No frontend origin is configured. Set APP_ORIGINS (or APP_URL) on the API.",
    );
  }

  return fallback;
};

// Create a Stripe Checkout Session for an ACCEPTED booking.
const createPaymentSession = async (
  userId: string,
  bookingId: string,
  origin?: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { email: true } },
      payment: true,
    },
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your booking");
  }
  if (booking.status !== "ACCEPTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Booking must be ACCEPTED before payment",
    );
  }
  if (booking.payment?.status === "COMPLETED") {
    throw new AppError(httpStatus.BAD_REQUEST, "This booking is already paid");
  }

  const unitAmount = Math.round(Number(booking.totalAmount) * 100);
  const returnOrigin = resolveReturnOrigin(origin);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.customer.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    success_url: `${returnOrigin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnOrigin}/payment/cancel`,
    metadata: { bookingId: booking.id, userId },
  });

  // One payment row per booking — reuse it if a session was created before.
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount: booking.totalAmount,
      provider: "STRIPE",
      status: "PENDING",
      transactionId: session.id,
    },
    update: { transactionId: session.id, status: "PENDING" },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    paymentId: payment.id,
  };
};

// Verify a checkout session and, if paid, mark the booking PAID.
const confirmPayment = async (userId: string, sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid checkout session");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your booking");
  }

  if (session.payment_status === "paid") {
    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { bookingId },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          transactionId: (session.payment_intent as string) ?? sessionId,
        },
        include: paymentInclude,
      });
      // Advance the booking only from ACCEPTED -> PAID.
      if (booking.status === "ACCEPTED") {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "PAID" },
        });
      }
      return updated;
    });
    return { paid: true, payment };
  }

  // Not paid yet — keep it pending.
  const payment = await prisma.payment.update({
    where: { bookingId },
    data: { status: "PENDING" },
    include: paymentInclude,
  });
  return { paid: false, message: "Payment not completed yet", payment };
};

const getMyPaymentsFromDB = async (user: AuthUser) => {
  const where =
    user.role === "ADMIN" ? {} : { booking: { customerId: user.id } };
  return prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: paymentInclude,
  });
};

const getPaymentByIdFromDB = async (user: AuthUser, id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }
  if (user.role !== "ADMIN" && payment.booking.customerId !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this payment",
    );
  }
  return payment;
};

// Stripe webhook — verify signature, then fulfil on checkout completion.
const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (err) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${(err as Error).message}`,
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId && session.payment_status === "paid") {
      await markBookingPaid(
        bookingId,
        (session.payment_intent as string) ?? session.id,
      );
    }
  } else {
    console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return { received: true };
};

export const paymentService = {
  createPaymentSession,
  confirmPayment,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB,
  handleWebhook,
};
