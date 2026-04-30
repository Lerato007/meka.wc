import React from "react";
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";

const ICONS = {
  info:    <FaInfoCircle />,
  success: <FaCheckCircle />,
  danger:  <FaExclamationCircle />,
  warning: <FaExclamationTriangle />,
};

const Message = ({ variant = "info", children }) => (
  <div className={`meka-message meka-message--${variant}`} role="alert">
    <span className="meka-message__icon">{ICONS[variant] || ICONS.info}</span>
    <span>{children}</span>
  </div>
);

export default Message;