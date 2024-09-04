import React from "react";
import { Alert } from "react-bootstrap";

/*** CODE STARTS HERE ***/
const Message = ({ variant, children }) => {
  return <Alert variant={variant}>{children}</Alert>;
};

Message.defaultProps = {
  variant: "info",
};

export default Message;
