import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/formContainer";
import Loader from "../components/Loader";
import { useForgotPasswordMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
]

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = use(useForgotPasswordMutation);

  const onChange = (value) => {
    setRecaptchaValue(value);
  };

  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);


  const submitHandler = async (e) => {
    e.preventDefault();


  return (
    <FormContainer>
      <h1>Reset Password</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading}
        >
          Send link
        </Button>

        {isLoading && <Loader />}
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
