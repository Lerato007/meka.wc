import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import FormContainer from "../components/formContainer";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../slices/usersApiSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const navigate = useNavigate();  // Declare navigate

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const evaluatePasswordStrength = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

    if (isValidLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar) {
      setPasswordStrength("Strong");
    } else if (password.length >= 6) {
      setPasswordStrength("Medium");
    } else {
      setPasswordStrength("Weak");
    }
  };

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isValidLength;
  };

  const submitEmailHandler = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response.message || "Email verified. Please set a new password.");
      setShowPasswordReset(true);
    } catch (err) {
      toast.error(err?.data?.message || "Error verifying email.");
      setShowPasswordReset(false);
    }
  };

  const submitPasswordHandler = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ email, password }).unwrap();
      toast.success("Password reset successfully.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordReset(false);

      // Redirect to login page after successful password reset
      navigate("/login");  // Replace '/login' with your actual login route if different
    } catch (err) {
      toast.error(err?.data?.message || "Error resetting password.");
    }
  };

  return (
    <FormContainer>
      <h1>Forgot Password</h1>
      <Form onSubmit={showPasswordReset ? submitPasswordHandler : submitEmailHandler}>
        {!showPasswordReset && (
          <Form.Group controlId="email" className="my-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
        )}

        {showPasswordReset && (
          <>
            <Form.Group controlId="password" className="my-3">
              <Form.Label>New Password</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    evaluatePasswordStrength(e.target.value);
                  }}
                ></Form.Control>
                <Button
                  variant="link"
                  className="text-decoration-none p-0 mx-2"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              <div className="password-strength">
                <div className={`strength-bar ${passwordStrength}`}></div>
                <p>{passwordStrength && `${passwordStrength}`}</p>
              </div>
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="my-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </>
        )}

        <Button type="submit" variant="primary" disabled={isForgotLoading || isResetLoading}>
          {showPasswordReset ? "Reset Password" : "Verify Email"}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
