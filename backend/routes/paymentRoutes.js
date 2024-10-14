const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const dns = require("dns");

const router = express.Router();
const testingMode = true;
const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
  // Calculate security signature
  let tempParamString = '';
  if (pfPassphrase !== null) {
    pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
  }

  const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
  return pfData['signature'] === signature;
};

async function ipLookup(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, { all: true }, (err, address) => {
      if (err) {
        reject(err);
      } else {
        const addressIps = address.map(item => item.address);
        resolve(addressIps);
      }
    });
  });
}

const pfValidIP = async (req) => {
  const validHosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za'
  ];

  let validIps = [];
  const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    for (let host of validHosts) {
      const ips = await ipLookup(host);
      validIps = [...validIps, ...ips];
    }
  } catch (err) {
    console.error(err);
  }

  const uniqueIps = [...new Set(validIps)];
  return uniqueIps.includes(pfIp);
};

const pfValidPaymentData = (cartTotal, pfData) => {
  return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
};

const pfValidServerConfirmation = async (pfHost, pfParamString) => {
  const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error(error);
    });
  return result === 'VALID';
};

// Payment confirmation route
router.post('/payment-confirmation', async (req, res) => {
  const pfData = req.body; // Payment data from PayFast
  const cartTotal = req.session.cartTotal; // Ensure you have the cart total saved in the session or retrieve it accordingly

  let pfParamString = "";
  for (let key in pfData) {
    if (pfData.hasOwnProperty(key) && key !== "signature") {
      pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }
  pfParamString = pfParamString.slice(0, -1); // Remove last ampersand

  const passPhrase = "your-passphrase"; // Replace with your passphrase
  const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
  const check2 = await pfValidIP(req);
  const check3 = pfValidPaymentData(cartTotal, pfData);
  const check4 = await pfValidServerConfirmation(pfHost, pfParamString);

  if (check1 && check2 && check3 && check4) {
    // All checks have passed, the payment is successful
    res.status(200).send({ message: "Payment successful" });
  } else {
    // Some checks have failed, log for investigation
    console.error("Payment validation failed", { check1, check2, check3, check4 });
    res.status(400).send({ message: "Payment validation failed" });
  }
});

module.exports = router;
