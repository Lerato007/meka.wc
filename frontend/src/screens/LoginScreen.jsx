import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../components/Loader";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";

const evaluateStrength = (pw) => {
  if (!pw) return "";
  if (pw.length < 6) return "Weak";
  if (pw.length < 10) return "Medium";
  if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return "Strong";
  return "Weak";
};

const LoginScreen = () => {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength]         = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email: email.toLowerCase(), password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1 className="auth-card__title">Sign In</h1>
        <div className="auth-card__accent" />

        <Form onSubmit={submitHandler}>
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

          <Form.Group controlId="password" className="mb-2">
            <Form.Label>Password</Form.Label>
            <div className="password-field-wrap">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setStrength(evaluateStrength(e.target.value));
                }}
                style={{ paddingRight: "2.5rem" }}
                autoComplete="current-password"
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

          <div style={{ textAlign: "right", marginBottom: "1.25rem" }}>
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {isLoading && <Loader />}
        </Form>

        <hr className="auth-card__divider" />

        <p className="auth-card__footer">
          New to MEKA.WC?{" "}
          <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;