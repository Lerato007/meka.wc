import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import { useGetUserDetailsQuery, useUpdateUserMutation } from "../../slices/usersApiSlice";

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user, isLoading, refetch, error } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin });
      toast.success("User updated");
      refetch();
      navigate("/admin/userlist");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/userlist" className="admin-back-link">
        <FaArrowLeft size={11} /> Back to Users
      </Link>

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || String(error)}</Message>
      ) : (
        <div className="admin-edit-card">
          <h1 className="admin-edit-card__title">Edit User</h1>
          <div className="admin-edit-card__accent" />

          {loadingUpdate && <Loader />}

          <Form onSubmit={submitHandler}>

            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="isAdmin" className="mb-4">
              <div
                className={`payment-option${isAdmin ? " selected" : ""}`}
                onClick={() => setIsAdmin((prev) => !prev)}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="payment-option__radio"
                  style={{ borderRadius: "3px" }}
                />
                <div>
                  <p className="payment-option__label">Admin Access</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                    Grants full access to admin dashboard
                  </p>
                </div>
                {isAdmin && <span className="payment-option__badge">Active</span>}
              </div>
            </Form.Group>

            <button
              type="submit"
              className="admin-save-btn"
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Saving..." : "Save Changes"}
            </button>
          </Form>
        </div>
      )}
    </>
  );
};

export default UserEditScreen;