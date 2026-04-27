import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPageScreen from "./screens/LandingPageScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <>
      <Header />
      {isLanding ? (
        <LandingPageScreen />
      ) : (
        <Container>
          <main className="py-4">
            <Outlet />
          </main>
        </Container>
      )}
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastStyle={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          borderRadius: "var(--radius-md)",
        }}
      />
    </>
  );
};

export default App;