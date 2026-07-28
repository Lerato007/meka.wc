-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "inventoryReleasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_paymentStatus_expiresAt_idx" ON "Order"("paymentStatus", "expiresAt");
