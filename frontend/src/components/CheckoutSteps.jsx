import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const STEPS = [
  { label: "Shipping",    path: "/shipping",   key: "step1" },
  { label: "Payment",     path: "/payment",    key: "step2" },
  { label: "Place Order", path: "/placeorder", key: "step3" },
];

const CheckoutSteps = ({ step1, step2, step3 }) => {
  const enabled = { step1, step2, step3 };
  const { pathname } = useLocation();

  const getStatus = (stepKey, path) => {
    const isEnabled = enabled[stepKey];
    const isCurrent = pathname === path;
    if (isCurrent) return "active";
    if (isEnabled && !isCurrent) return "completed";
    return "disabled";
  };

  return (
    <nav className="checkout-steps" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const status   = getStatus(step.key, step.path);
        const isLast      = index === STEPS.length - 1;
        const isCompleted = status === "completed";
        const isActive    = status === "active";
        const ItemTag  = isCompleted ? Link : "div";
        const itemProps = isCompleted ? { to: step.path } : {};

        return (
          <div key={step.key} className="checkout-step">
            <ItemTag
              {...itemProps}
              className={`checkout-step__item ${status}`}
            >
              <div className="checkout-step__circle">
                {isCompleted ? <FaCheck size={10} /> : index + 1}
              </div>
              <span className="checkout-step__label">{step.label}</span>
            </ItemTag>

            {!isLast && (
              <div className={`checkout-step__connector${isCompleted || isActive ? " completed" : ""}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default CheckoutSteps;