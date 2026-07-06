import axios from "axios";

async function main() {
  try {
    // 1. Register a new restaurant owner
    const email = `owner_${Date.now()}@example.com`;
    const password = "password123";

    console.log("Registering owner...");
    const regRes = await axios.post("http://localhost:5000/api/auth/register", {
      first_name: "Test",
      last_name: "Owner",
      email,
      phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      password,
      role: "restaurant_owner",
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

    // 3. Create Restaurant
    console.log("Creating restaurant...");
    const createRes = await axios.post(
      "http://localhost:5000/api/restaurants",
      {
        name: "Test Diner",
        description: "Test description",
        street_address: "123 Test St",
        landmark: "Near Test",
        city: "Testville",
        state: "Test State",
        postal_code: "123456",
        opening_time: "09:00:00",
        closing_time: "22:00:00",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("Create Restaurant Response:", createRes.data);
    const restaurantId = createRes.data.data.restaurantId;

    // 4. Toggle Status
    console.log("Toggling status to closed...");
    const toggleRes = await axios.put(
      `http://localhost:5000/api/restaurants/${restaurantId}`,
      { status: "closed" },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("Toggle Restaurant Response:", toggleRes.data);
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Connection Error:", err.message);
    }
  }
}

main();
