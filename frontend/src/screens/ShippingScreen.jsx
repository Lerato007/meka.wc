import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress, savePaymentMethod } from "../slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";

const ShippingScreen = () => {
  const { shippingAddress } = useSelector((state) => state.cart);

  const [address,    setAddress]    = useState(shippingAddress?.address    || "");
  const [city,       setCity]       = useState(shippingAddress?.city       || "");
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || "");
  const [phone,      setPhone]      = useState(shippingAddress?.phone      || "");
  const country = "South Africa";

  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setIsFormValid(
      address.trim() &&
      city.trim() &&
      postalCode.trim() &&
      postalCode.length === 4 &&
      phone.trim() &&
      phone.length === 10
    );
  }, [address, city, postalCode, phone]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    dispatch(saveShippingAddress({ address, city, postalCode, country, phone }));
    // Payment method is always PayFast — set it and skip the payment screen
    dispatch(savePaymentMethod("PayFast"));
    navigate("/placeorder");
  };

  return (
    <div className="checkout-wrapper">
      <CheckoutSteps step1 />

      <div className="checkout-card">
        <p className="checkout-card__eyebrow">Step 1 of 3</p>
        <h1 className="checkout-card__title">Shipping</h1>
        <div className="checkout-card__accent" />

        <Form onSubmit={submitHandler}>

          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="123 Main Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </Form.Group>

          <Form.Group controlId="city" className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Cape Town"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
            />
          </Form.Group>

          <Form.Group controlId="postalCode" className="mb-3">
            <Form.Label>
              Postal Code
              {postalCode && postalCode.length !== 4 && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--bs-danger)", fontWeight: 400, marginLeft: "0.5rem" }}>
                  Must be 4 digits
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="7000"
              value={postalCode}
              onChange={(e) => { if (/^\d{0,4}$/.test(e.target.value)) setPostalCode(e.target.value); }}
              autoComplete="postal-code"
            />
          </Form.Group>

          <Form.Group controlId="phone" className="mb-3">
            <Form.Label>
              Phone Number
              {phone && phone.length !== 10 && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--bs-danger)", fontWeight: 400, marginLeft: "0.5rem" }}>
                  Must be 10 digits
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="0821234567"
              value={phone}
              onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setPhone(e.target.value); }}
              autoComplete="tel"
            />
          </Form.Group>

          <Form.Group controlId="country" className="mb-4">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              value={country}
              readOnly
              style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
            />
          </Form.Group>

          <button type="submit" className="checkout-submit-btn" disabled={!isFormValid}>
            Review Order
          </button>
        </Form>
      </div>
    </div>
  );
};

export default ShippingScreen;