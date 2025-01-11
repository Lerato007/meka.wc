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

  return (
    <>
      <Header />
      {location.pathname === "/" ? (
        // Render LandingPageScreen directly without a container
        <LandingPageScreen />
      ) : (
        // Render other pages within a Container
        <Container>
          <main className="py-3">
            <Outlet />
          </main>
        </Container>
      )}
      <Footer />
      {/* Include ToastContainer */}
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default App;
