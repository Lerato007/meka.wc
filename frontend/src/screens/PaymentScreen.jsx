import { React, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Form, Button, Col } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import FormContainer from "../components/formContainer";
import { savePaymentMethod } from "../slices/cartSlice";

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress) {
      navigate("/shipping");
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));

    navigate("/placeorder"); // Normal order flow
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              className="my-2"
              label="Credit Card"
              id="CreditCard"
              name="paymentMethod"
              value="Credit Card"
              checked={paymentMethod === "Credit Card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />

            {/* <Form.Check
              type="radio"
              className="my-2"
              label="PayFast"
              id="PayFast"
              name="paymentMethod"
              value="PayFast"
              checked={paymentMethod === "PayFast"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            /> */}

            <Button type="submit" variant="primary" className="mt-3">
              Continue
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
