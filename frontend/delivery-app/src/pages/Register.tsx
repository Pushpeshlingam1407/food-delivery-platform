import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) {
      notify.warning("Please fill out all fields to register.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        role: "delivery_partner",
      });

      if (response.data.status === "success") {
        notify.success("Account created successfully!", {
          description: "You can now log in to the delivery portal.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      const errMsg =
        error.response?.data?.message || "Registration failed. Try again.";
      notify.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Delivery Registration</h2>
        <p className="auth-subtitle">
          Create an account to join the delivery fleet
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field-group-horizontal">
            <div className="auth-field-group">
              <label className="auth-label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amit"
                required
                className="auth-input-style"
              />
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Singh"
                required
                className="auth-input-style"
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@delivery.com"
              required
              className="auth-input-style"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+917654321098"
              required
              className="auth-input-style"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="auth-input-style"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn-style">
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer-prompt">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
