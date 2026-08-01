import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const normalizeUrl = (value?: string) => value?.replace(/\/+$/, "");

const appUrl = normalizeUrl(process.env.APP_URL);
const appOrigins = (process.env.APP_ORIGINS ?? appUrl ?? "")
  .split(",")
  .map((origin) => normalizeUrl(origin)?.trim())
  .filter((origin): origin is string => Boolean(origin));

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: appUrl,
  app_origins: appOrigins,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expiry_in: process.env.JWT_ACCESS_EXPIRY_IN!,
  jwt_refresh_expiry_in: process.env.JWT_REFRESH_EXPIRY_IN!,
  stripe_secret_key: process.env.STRIPED_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPED_WEBHOOK_SECRET!,
};
