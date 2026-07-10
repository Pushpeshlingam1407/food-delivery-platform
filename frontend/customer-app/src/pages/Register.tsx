import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../shared/services/api";

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) {
      toast.error("All registration fields are required.");
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
        role,
      });

      if (response.data.status === "success") {
        toast.success("Registration successful!", {
          description: "You can now log in with your credentials.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      const errMsg =
        error.response?.data?.message || "Registration failed. Try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Sign up to order delicious meals in seconds
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-flex-row">
            <div className="auth-form-field">
              <label className="auth-label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
                className="auth-input"
              />
            </div>
            <div className="auth-form-field">
              <label className="auth-label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-form-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@domain.com"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-field">
            <label className="auth-label">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919999912345"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-field">
            <label className="auth-label">Join as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input"
            >
              <option value="customer">Customer (Order Food)</option>
              <option value="restaurant_owner">
                Restaurant Owner (Sell Food)
              </option>
              <option value="delivery_partner">
                Delivery Partner (Deliver Food)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium auth-button"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
  );
};
