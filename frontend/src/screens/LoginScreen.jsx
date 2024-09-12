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

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(""); 

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

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

  // Password strength checker
  const evaluatePasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("Weak");
    } else if (password.length < 10) {
      setPasswordStrength("Medium");
    } else if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Weak");
    }
  };

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
      <h1>Sign In</h1>

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

        <Form.Group controlId="password" className="my-3">
  <Form.Label>Password</Form.Label>
  <Form.Control
    type="password"
    placeholder="Enter password"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      evaluatePasswordStrength(e.target.value);
    }}
  ></Form.Control>
          {/* Strength bar container */}
  <div className="password-strength-container">
    <div className={`strength-bar ${passwordStrength}`}></div>
    <p>{passwordStrength && `Password strength: ${passwordStrength}`}</p>
  </div>
        </Form.Group>

        <ReCAPTCHA
          sitekey="6Le_Sn8pAAAAALTafNKsPbgL-Plw6iRYTb9vvKP6"
          onChange={onChange}
        />

        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading || !recaptchaValue}
        >
          Sign In
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          New Customer?{" "}
          <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}>
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
