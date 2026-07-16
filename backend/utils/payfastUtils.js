import crypto from "crypto";
import fetch from "node-fetch";

const PAYFAST_HOST =
  process.env.PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za"
    : "https://sandbox.payfast.co.za";

// Build the urlencoded parameter string PayFast expects — spaces encoded as '+',
// fields joined in the exact order they appear on the object (order matters for the signature,
// but since we build both the signature string and the POST body from the same object,
// consistency is all that's required — not a specific fixed order).
const buildParamString = (data) => {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}`
    )
    .join("&");
};

export const generateSignature = (data, passphrase) => {
  let paramString = buildParamString(data);
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }
  return crypto.createHash("md5").update(paramString).digest("hex");
};

// Ask PayFast for a one-time payment identifier (uuid) to trigger the Onsite payment modal.
export const getOnsitePaymentIdentifier = async (paymentData) => {
  const data = {
    merchant_id:  process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    ...paymentData,
  };

  data.signature = generateSignature(data, process.env.PAYFAST_PASSPHRASE);

  const response = await fetch(`${PAYFAST_HOST}/onsite/process`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    buildParamString(data),
  });

  const result = await response.json();

  if (!result?.uuid) {
    throw new Error(
      result?.data?.response_data ||
      result?.error ||
      "PayFast did not return a payment identifier"
    );
  }

  return result.uuid;
};

// Verify the signature PayFast sent back with an ITN (webhook) payload.
export const verifyItnSignature = (pfData) => {
  const receivedSignature = pfData.signature;
  if (!receivedSignature) return false;

  const dataWithoutSignature = { ...pfData };
  delete dataWithoutSignature.signature;

  const expectedSignature = generateSignature(dataWithoutSignature, process.env.PAYFAST_PASSPHRASE);
  return expectedSignature === receivedSignature;
};

// Server-to-server confirmation with PayFast, as recommended for ITN security —
// re-posts the raw received body back to PayFast and expects "VALID" in the response.
export const confirmItnWithPayfast = async (rawBody) => {
  const response = await fetch(`${PAYFAST_HOST}/eng/query/validate`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    rawBody,
  });
  const text = await response.text();
  return text.trim() === "VALID";
};