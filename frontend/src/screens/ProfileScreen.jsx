import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const ProfileScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  const { data: orders, isLoading: loadingOrders, error: ordersError } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdate }] = useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password && !PASSWORD_REGEX.test(password)) {
      toast.error("Password must be 8+ chars with uppercase, lowercase, number and special character");
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const updateData = { _id: userInfo._id, name, password };
      if (userInfo.isAdmin) updateData.email = email;

      const res = await updateProfile(updateData).unwrap();
      dispatch(setCredentials({ ...res }));
      setPassword("");
      setConfirmPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Avatar initials
  const initials = userInfo?.name
    ? userInfo.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="profile-layout">

      {/* ── Left: edit profile ── */}
      <div className="profile-card">

        {/* Avatar + identity */}
        <div className="profile-card__avatar">{initials}</div>
        <p className="profile-card__name">{userInfo?.name}</p>
        <p className="profile-card__email">{userInfo?.email}</p>

        <hr className="profile-card__divider" />

        <p className="profile-section__title">Edit Profile</p>

        {loadingUpdate && <Loader />}

        <Form onSubmit={submitHandler}>

          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!userInfo?.isAdmin}
              style={!userInfo?.isAdmin ? {
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-muted)",
              } : {}}
              autoComplete="email"
            />
            {!userInfo?.isAdmin && (
              <Form.Text style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Contact support to change your email.
              </Form.Text>
            )}
          </Form.Group>

          <hr className="profile-card__divider" />
          <p className="profile-section__title">Change Password</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
            Leave blank to keep current password.
          </p>

          <Form.Group controlId="password" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <div className="password-field-wrap">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <div className="password-field-wrap">
              <Form.Control
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
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
              <p style={{ fontSize: "0.75rem", color: "var(--bs-danger)", marginTop: "0.3rem", marginBottom: 0 }}>
                Passwords do not match
              </p>
            )}
          </Form.Group>

          <button
            type="submit"
            className="profile-update-btn"
            disabled={loadingUpdate}
          >
            {loadingUpdate ? "Saving..." : "Save Changes"}
          </button>
        </Form>
      </div>

      {/* ── Right: order history ── */}
      <div>
        <div className="orders-panel__header">
          <h2 className="orders-panel__title">My Orders</h2>
          {orders && (
            <span className="orders-panel__count">{orders.length} orders</span>
          )}
        </div>

        {loadingOrders ? (
          <Loader />
        ) : ordersError ? (
          <Message variant="danger">
            {ordersError?.data?.message || ordersError.error}
          </Message>
        ) : orders?.length === 0 ? (
          <Message>
            No orders yet.{" "}
            <Link to="/home" style={{ color: "var(--meka-green)", fontWeight: 600 }}>
              Start shopping
            </Link>
          </Message>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
            }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                  {["Order ID", "Date", "Total", "Paid", "Delivered", ""].map((h) => (
                    <th key={h} style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      padding: "0.75rem 0.6rem",
                      textAlign: h === "" ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td style={{ padding: "0.85rem 0.6rem" }}>
                      <span className="order-row__id">{order._id}</span>
                    </td>
                    <td style={{ padding: "0.85rem 0.6rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td style={{ padding: "0.85rem 0.6rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--meka-green)" }}>
                      R{order.totalPrice}
                    </td>
                    <td style={{ padding: "0.85rem 0.6rem" }}>
                      {order.isPaid ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--meka-green)", fontSize: "0.82rem", fontWeight: 600 }}>
                          <FaCheckCircle size={12} />
                          {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--bs-danger)", fontSize: "0.82rem" }}>
                          <FaTimesCircle size={12} /> Unpaid
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.85rem 0.6rem" }}>
                      {order.isDelivered ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--meka-green)", fontSize: "0.82rem", fontWeight: 600 }}>
                          <FaCheckCircle size={12} />
                          {order.deliveredAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          <FaTimesCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.85rem 0.6rem", textAlign: "right" }}>
                      <Link
                        to={`/order/${order._id}`}
                        className="order-row__details-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;