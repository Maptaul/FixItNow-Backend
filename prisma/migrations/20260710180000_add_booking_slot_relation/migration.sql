-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "slotId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings"("slotId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "availability_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
