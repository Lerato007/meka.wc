// Dynamically loads PayFast's Onsite Payments engine script (sandbox or live)
// so it's only fetched when actually needed, and only loaded once per mode.

let engineLoadedMode = null;
let loadPromise       = null;

export const loadPayfastEngine = (mode) => {
  const src =
    mode === "live"
      ? "https://www.payfast.co.za/onsite/engine.js"
      : "https://sandbox.payfast.co.za/onsite/engine.js";

  // Already loaded with this mode — nothing to do
  if (engineLoadedMode === mode && window.payfast_do_onsite_payment) {
    return Promise.resolve();
  }

  // Already in the process of loading this mode
  if (loadPromise && engineLoadedMode === mode) {
    return loadPromise;
  }

  engineLoadedMode = mode;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src   = src;
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => {
      engineLoadedMode = null;
      loadPromise = null;
      reject(new Error("Failed to load PayFast payment engine"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
};