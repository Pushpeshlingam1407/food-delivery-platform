import axios from "axios";

async function main() {
  try {
    // 1. Register a new delivery partner
    const email = `driver_${Date.now()}@example.com`;
    const password = "password123";

    console.log("Registering driver...");
    const regRes = await axios.post("http://localhost:5000/api/auth/register", {
      first_name: "Test",
      last_name: "Driver",
      email,
      phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
      password,
      role: "delivery_partner",
    });
    console.log("Registration Response:", regRes.data);

    // 2. Login
    console.log("Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    console.log("Login Response:", loginRes.data);
    const token = loginRes.data.data.accessToken;

    // 3. Toggle Status
    console.log("Toggling driver status...");
    const toggleRes = await axios.put(
      "http://localhost:5000/api/delivery/status",
      { is_online: true },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("Toggle Status Response:", toggleRes.data);
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Connection Error:", err.message);
    }
  }
}

main();
