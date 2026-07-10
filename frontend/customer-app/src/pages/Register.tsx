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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "48px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-anthropic)",
            fontSize: "2rem",
            color: "var(--text-slate)",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            marginBottom: "32px",
          }}
        >
          Sign up to order delicious meals in seconds
        </p>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-slate)",
                }}
              >
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-standard)",
                  border: "1px solid var(--glass-border)",
                  fontFamily: "var(--font-apple)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-slate)",
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-standard)",
                  border: "1px solid var(--glass-border)",
                  fontFamily: "var(--font-apple)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@domain.com"
              required
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-standard)",
                border: "1px solid var(--glass-border)",
                fontFamily: "var(--font-apple)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919999912345"
              required
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-standard)",
                border: "1px solid var(--glass-border)",
                fontFamily: "var(--font-apple)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-standard)",
                border: "1px solid var(--glass-border)",
                fontFamily: "var(--font-apple)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Join as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-standard)",
                border: "1px solid var(--glass-border)",
                fontFamily: "var(--font-apple)",
                fontSize: "0.9rem",
                outline: "none",
                background: "var(--bg-sand)",
                color: "var(--text-slate)",
              }}
            >
              <option value="customer">Customer (Order Food)</option>
              <option value="restaurant_owner">Restaurant Owner (Sell Food)</option>
              <option value="delivery_partner">Delivery Partner (Deliver Food)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium"
            style={{
              padding: "12px",
              fontSize: "0.95rem",
              marginTop: "12px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent-orange)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
