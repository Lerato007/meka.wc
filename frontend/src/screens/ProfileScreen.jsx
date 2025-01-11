import React, { useState, useEffect } from "react";
import { Table, Form, Button, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa"; // Importing eye icons
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    country: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setAddress(userInfo.address || {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
    }
  }, [userInfo]);

  // 🔐 Password Strength Validation
  const validatePassword = (pwd) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(pwd)) {
      return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate password strength
    const passwordError = validatePassword(password);
    if (password && passwordError) {
      toast.error(passwordError); // Show toast error for weak password
      return;
    }

    // Check if passwords match
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const updateData = {
        _id: userInfo._id,
        name,
        password,
        address,
      };

      if (userInfo.isAdmin) {
        updateData.email = email;
      }

      const res = await updateProfile(updateData).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        {loadingUpdateProfile && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email" className="my-2">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!userInfo.isAdmin}
            />
          </Form.Group>

          <Form.Group controlId="password" className="my-2">
            <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
                style={{ paddingRight: "40px" }}
              />
              <span
                className="position-absolute end-0 top-50 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="my-2">
            <Form.Label>Confirm Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: "40px" }}
              />
              <span
                className="position-absolute end-0 top-50 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </Form.Group>

          <Button type="submit" variant="primary">
            Update
          </Button>
        </Form>
      </Col>

      <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: "red" }} />
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: "red" }} />
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button className="btn-sm" variant="light">
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
