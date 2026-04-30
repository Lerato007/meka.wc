import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useGetUsersQuery, useDeleteUserMutation } from "../../slices/usersApiSlice";
import { toast } from "react-toastify";

const AdminPaginate = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="paginate-wrap">
      <button className="page-btn" onClick={() => onChange(Math.max(page - 1, 1))} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>
        <FaChevronLeft size={10} />
      </button>
      {[...Array(pages).keys()].map((x) => (
        <button key={x + 1} className={`page-btn${page === x + 1 ? " active" : ""}`} onClick={() => onChange(x + 1)}>
          {x + 1}
        </button>
      ))}
      <button className="page-btn" onClick={() => onChange(Math.min(page + 1, pages))} disabled={page === pages} style={{ opacity: page === pages ? 0.4 : 1 }}>
        <FaChevronRight size={10} />
      </button>
    </div>
  );
};

const UserListScreen = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const { data, refetch, isLoading, error } = useGetUsersQuery({ pageNumber });
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Delete this user? This cannot be undone.")) {
      try {
        await deleteUser(id);
        toast.success("User deleted");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Users</h1>
          <div className="admin-page__accent" />
        </div>
        {data && (
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            {data.users?.length} users
          </span>
        )}
      </div>

      {loadingDelete && <Loader />}

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <AdminPaginate page={pageNumber} pages={data.pages} onChange={setPageNumber} />

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user._id}>
                    <td><span className="cell-id">{user._id}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-display)", fontSize: "0.88rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                      {user.name}
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} style={{ color: "var(--meka-green)", fontSize: "0.88rem" }}>
                        {user.email}
                      </a>
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--meka-green)", fontSize: "0.82rem", fontWeight: 600 }}>
                          <FaCheckCircle size={12} /> Admin
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          <FaTimesCircle size={12} /> User
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {!user.isAdmin && (
                        <>
                          <Link to={`/admin/user/${user._id}/edit`} className="admin-action-btn" title="Edit user">
                            <FaEdit size={13} />
                          </Link>
                          <button className="admin-action-btn danger" onClick={() => deleteHandler(user._id)} title="Delete user">
                            <FaTrash size={12} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPaginate page={pageNumber} pages={data.pages} onChange={setPageNumber} />
        </>
      )}
    </>
  );
};

export default UserListScreen;