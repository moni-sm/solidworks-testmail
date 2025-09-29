import React from "react";
import { useNavigate } from "react-router-dom";

const Confirmation = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <style>{`
        .confirmation-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f4f8;
          padding: 20px;
          box-sizing: border-box;
          color: #2c3e50;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #27ae60;
        }
        p {
          font-size: 1.1rem;
          margin: 0.3rem 0;
          max-width: 400px;
          text-align: center;
        }
        .btn-home {
          margin-top: 30px;
          padding: 12px 28px;
          background-color: #27ae60;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-home:hover {
          background-color: #2ecc71;
        }
      `}</style>

      <div className="confirmation-container">
        <h1>Thank You for Registering!</h1>
        <p>Your registration has been successfully submitted.</p>
        <p>We will contact you soon with further event details.</p>
        <button className="btn-home" onClick={handleGoHome}>
          Back to Home
        </button>
      </div>
    </>
  );
};

export default Confirmation;
