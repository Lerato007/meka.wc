import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../components/Loader";
import { useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const evaluateStrength = (pw) => {
  if (!pw) return "";
  if (pw.length < 6) return "Weak";
  if (pw.length < 10) return "Medium";
  if (PASSWORD_PATTERN.test(pw)) return "Strong";
  return "Medium";
};

const RegisterScreen = () => {
  const [name, setName]                         = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [strength, setStrength]                 = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (EMAIL_PATTERN.test(name)) {
      toast.error("Name cannot be an email address");
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      toast.error(
        "Password must be 8+ characters with uppercase, lowercase, number and special character"
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <p className="auth-card__eyebrow">Join MEKA.WC</p>
        <h1 className="auth-card__title">Create Account</h1>
        <div className="auth-card__accent" />

        <Form onSubmit={submitHandler}>

          {/* Name */}
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Form.Group>

          {/* Email */}
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Form.Group>

          {/* Password */}
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="password-field-wrap">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, upper, number, symbol"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setStrength(evaluateStrength(e.target.value));
                }}
                style={{ paddingRight: "2.5rem" }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className={`strength-bar ${strength}`} />
                <span className={`strength-label ${strength}`}>{strength}</span>
              </div>
            )}
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group controlId="confirmPassword" className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <div className="password-field-wrap">
              <Form.Control
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: "2.5rem" }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((p) => !p)}
                tabIndex={-1}
              >
                {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "var(--bs-danger)",
                marginTop: "0.35rem",
                marginBottom: 0,
              }}>
                Passwords do not match
              </p>
            )}
          </Form.Group>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          {isLoading && <Loader />}
        </Form>

        <hr className="auth-card__divider" />

        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;