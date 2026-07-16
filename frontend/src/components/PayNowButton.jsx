import React, { useState } from "react";
import { toast } from "react-toastify";
import { loadPayfastEngine } from "../utils/payfast";
import { useCreatePayfastIdentifierMutation } from "../slices/PayfastApiSlice";

// Reusable "Pay Now" trigger for PayFast's Onsite payment modal.
// Used both right after placing an order, and as a retry button on the order page
// for orders that are unpaid but still in a payable state.
const PayNowButton = ({
  orderId,
  onPaymentResult,
  className = "pay-btn",
  children  = "Pay with PayFast",
}) => {
  const [createIdentifier, { isLoading: creatingIdentifier }] = useCreatePayfastIdentifierMutation();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    try {
      const { uuid, mode } = await createIdentifier(orderId).unwrap();
      await loadPayfastEngine(mode);

      setProcessing(true);
      window.payfast_do_onsite_payment({ uuid }, (result) => {
        setProcessing(false);
        if (result === true) {
          toast.success("Payment successful! Confirming with PayFast...");
        } else {
          toast.info("Payment was not completed. You can try again anytime.");
        }
        onPaymentResult?.(result);
      });
    } catch (err) {
      setProcessing(false);
      toast.error(err?.data?.message || err.message || "Could not start payment");
    }
  };

  const busy = creatingIdentifier || processing;

  return (
    <button className={className} onClick={handlePay} disabled={busy} type="button">
      {busy ? "Please wait…" : children}
    </button>
  );
};

export default PayNowButton;