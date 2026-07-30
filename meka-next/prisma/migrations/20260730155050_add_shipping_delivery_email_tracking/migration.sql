-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveredEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "shippedEmailSentAt" TIMESTAMP(3);
