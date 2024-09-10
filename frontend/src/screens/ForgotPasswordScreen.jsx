import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/formContainer";
import Loader from "../components/Loader";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useLoginMutation();

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

    if (!recaptchaValue) {
      toast.error("Please complete the ReCAPTCHA");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>Password Reset</h1>

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

      <Row className="py-3">
        <Col>
          <Link to={redirect ? `/forgotPassword?redirect=${redirect}` : "/forgotPassword"}>
            Forgot Password
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
