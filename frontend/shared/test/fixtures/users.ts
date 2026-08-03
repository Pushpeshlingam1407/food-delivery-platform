export const mockUser = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  role: "customer",
  token: "mock-access-token-123",
  refreshToken: "mock-refresh-token-456"
};

export const mockAdmin = {
  id: "admin-456",
  name: "Jane Admin",
  email: "admin@example.com",
  role: "admin",
  token: "mock-admin-token-789",
  refreshToken: "mock-refresh-token-012"
};

export const mockDriver = {
  id: "driver-789",
  name: "Dave Driver",
  email: "driver@example.com",
  role: "delivery",
  token: "mock-driver-token-345",
  refreshToken: "mock-refresh-token-678"
};

export const mockAddresses = [
  {
    id: "addr-1",
    street: "123 Main St",
    city: "Metropolis",
    state: "NY",
    zip_code: "10001",
    is_default: true,
  },
  {
    id: "addr-2",
    street: "456 Side St",
    city: "Gotham",
    state: "NJ",
    zip_code: "07001",
    is_default: false,
  }
];

export const mockWallet = {
  balance: "500.00",
  transactions: [
    { id: "tx-1", type: "deposit", amount: "1000.00", created_at: new Date().toISOString() },
    { id: "tx-2", type: "payment", amount: "500.00", created_at: new Date().toISOString() }
  ]
};
