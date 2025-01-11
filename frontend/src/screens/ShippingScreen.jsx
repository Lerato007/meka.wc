import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/formContainer";
import { saveShippingAddress } from "../slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || ""
  );
  const [country] = useState("South Africa"); // Set country to South Africa and disable editing
  const [phone, setPhone] = useState(shippingAddress?.phone || ""); // Add phone number state
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if the form is valid
  useEffect(() => {
    const isValid =
      address.trim() &&
      city.trim() &&
      postalCode.trim() &&
      postalCode.length === 4 &&
      phone.trim() &&
      phone.length === 10; // Ensure phone has 10 digits
    setIsFormValid(isValid);
  }, [address, city, postalCode, phone]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (isFormValid) {
      dispatch(saveShippingAddress({ address, city, postalCode, country, phone })); // Include phone in saveShippingAddress
      navigate("/placeorder");
    }
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />

      <h1>Shipping</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group controlId="address" className="my-2">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="city" className="my-2">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="postalCode" className="my-2">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => {
              const { value } = e.target;
              // Allow only digits and limit to 4 characters
              if (/^\d{0,4}$/.test(value)) setPostalCode(value);
            }}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="phone" className="my-2">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => {
              const { value } = e.target;
              // Allow only digits and limit to 10 characters
              if (/^\d{0,10}$/.test(value)) setPhone(value);
            }}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="country" className="my-2">
          <Form.Label>Country</Form.Label>
          <Form.Control
            type="text"
            placeholder="Country"
            value={country}
            readOnly // Make field read-only
          ></Form.Control>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="my-2"
          disabled={!isFormValid} // Disable button if form is invalid
        >
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
