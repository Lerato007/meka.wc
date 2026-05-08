import crypto from "crypto";
import dns from "dns";
import axios from "axios";

/**
 * URL-encode a string following PayFast's rules:
 *  - spaces become "+"
 *  - all other percent-encoded characters must be UPPER CASE (e.g. %2F not %2f)
 */
const pfEncode = (value) =>
  encodeURIComponent(String(value).trim())
    .replace(/%20/g, "+")        // spaces → +
    .replace(/%[a-f0-9]{2}/g, (match) => match.toUpperCase()); // lowercase hex → upper

/**
 * Build the signature parameter string.
 * Rules (from PayFast spec — Step 3):
 *  1. Only NON-BLANK values are included.
 *  2. Field order must match the PayFast attribute order (object insertion order).
 *  3. Passphrase is appended last if provided, also percent-encoded upper case.
 *  4. No trailing "&".
 */
export const buildSignatureString = (dataObj, passPhrase = null) => {
  let pfOutput = "";

  for (const key in dataObj) {
    if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
      const val = dataObj[key];
      // Skip blank / undefined / null values
      if (val !== "" && val !== undefined && val !== null) {
        pfOutput += `${key}=${pfEncode(val)}&`;
      }
    }
  }

  // Remove trailing "&"
  let sigString = pfOutput.slice(0, -1);

  // Append passphrase as the last parameter
  if (passPhrase !== null && passPhrase !== undefined && passPhrase !== "") {
    sigString += `&passphrase=${pfEncode(passPhrase)}`;
  }

  return sigString;
};

/**
 * Generate the PayFast MD5 signature.
 * Pass the payment data object (WITHOUT the signature field itself)
 * and the merchant passphrase.
 */
export const generateSignature = (dataObj, passPhrase = null) => {
  const sigString = buildSignatureString(dataObj, passPhrase);
  return crypto.createHash("md5").update(sigString).digest("hex");
};

/**
 * Convert a data object to a URL-encoded string for the HTTP POST body.
 * All fields are included (including blank ones) — this is separate from
 * the signature string which skips blanks.
 */
export const dataToString = (dataObj) => {
  let pfParamString = "";
  for (const key in dataObj) {
    if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
      const val = dataObj[key];
      // Skip blank values — must match buildSignatureString behaviour
      if (val !== "" && val !== undefined && val !== null) {
        pfParamString += `${key}=${pfEncode(val)}&`;
      }
    }
  }
  return pfParamString.slice(0, -1);
};


// ─────────────────────────────────────────────────────────────────────────────
// ITN Security Checks (Section 4.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check 1 — Verify the ITN signature.
 *
 * Rebuild the param string from all posted fields EXCEPT "signature",
 * preserving the order PayFast sent them (object insertion order).
 * Append the passphrase, MD5 the result and compare to the posted signature.
 *
 * Note: this intentionally uses the raw encode path (not generateSignature)
 * because the ITN param string must be built exactly as PayFast posted it —
 * no trimming of already-blank values that PayFast may have included.
 */
export const pfValidSignature = (pfData, pfPassphrase = null) => {
  let pfParamString = "";

  for (const key in pfData) {
    if (Object.prototype.hasOwnProperty.call(pfData, key) && key !== "signature") {
      pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove trailing "&"
  pfParamString = pfParamString.slice(0, -1);

  if (pfPassphrase !== null) {
    pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
  }

  const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
  return pfData["signature"] === signature;
};

/**
 * Check 2 — Verify the request originated from a valid PayFast IP.
 *
 * Resolves all A records for each known PayFast hostname and checks whether
 * the incoming request IP is among them. Handles both direct connections
 * and reverse-proxy setups (x-forwarded-for).
 */
const ipLookup = (domain) =>
  new Promise((resolve, reject) => {
    dns.lookup(domain, { all: true }, (err, addresses) => {
      if (err) return reject(err);
      resolve(addresses.map((item) => item.address));
    });
  });

export const pfValidIP = async (req) => {
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  const pfIp =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress;

  let validIps = [];

  try {
    for (const host of validHosts) {
      const ips = await ipLookup(host);
      validIps = [...validIps, ...ips];
    }
  } catch (err) {
    console.error("IP lookup error:", err);
  }

  const uniqueIps = [...new Set(validIps)];
  return uniqueIps.includes(pfIp);
};

/**
 * Check 3 — Verify the gross amount matches the order total.
 *
 * Allows a 1-cent tolerance to account for floating-point rounding.
 */
export const pfValidPaymentData = (orderTotal, pfData) =>
  Math.abs(parseFloat(orderTotal) - parseFloat(pfData["amount_gross"])) <= 0.01;

/**
 * Check 4 — Server-to-server confirmation with PayFast.
 *
 * Posts the ITN param string to PayFast's validate endpoint.
 * PayFast returns the string "VALID" if everything checks out.
 */
export const pfValidServerConfirmation = async (pfHost, pfData) => {
  // Rebuild the param string (same format as Check 1, without passphrase)
  let pfParamString = "";
  for (const key in pfData) {
    if (Object.prototype.hasOwnProperty.call(pfData, key) && key !== "signature") {
      pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }
  pfParamString = pfParamString.slice(0, -1);

  try {
    const response = await axios.post(
      `https://${pfHost}/eng/query/validate`,
      pfParamString,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data === "VALID";
  } catch (err) {
    console.error("PayFast server confirmation error:", err);
    return false;
  }
};