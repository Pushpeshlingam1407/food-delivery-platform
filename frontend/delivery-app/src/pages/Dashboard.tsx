import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Check, Navigation, Power, Truck, Wallet } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

interface Order {
  id: string;
  order_number: string;
  status:
    | "placed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  total_amount: number;
  restaurant_name: string;
  street_address: string;
  city: string;
  delivery_charges?: string;
}

export const Dashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [activeJobDetails, setActiveJobDetails] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deliveryStep, setDeliveryStep] = useState<
    "accepted" | "arrived_store" | "picked_up"
  >("accepted");
  const [deliveryTimer, setDeliveryTimer] = useState(600);
  const [gpsProgress, setGpsProgress] = useState(0);
  const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState(0);
  const [totalEarningAmt, setTotalEarningAmt] = useState(0);

  const driverName = localStorage.getItem("userName") || "Driver";

  const simulateGPSMovement = (orderId: string) => {
    let lat = 12.9716;
    let lon = 77.5946;
    let stepCount = 0;
    setGpsProgress(0);

    const interval = setInterval(() => {
      if (stepCount >= 10) {
        clearInterval(interval);
        return;
      }
      lat += 0.0005;
      lon += 0.0005;
      stepCount += 1;
      setGpsProgress(stepCount * 10);
      socket?.emit("updateLocation", {
        orderId,
        latitude: lat,
        longitude: lon,
      });
    }, 4000);
  };

  const fetchDriverStats = async () => {
    try {
      const meRes = await api.get("/auth/me");
      let currentDriverId = "";
      if (meRes.data.status === "success" && meRes.data.data) {
        const online = !!meRes.data.data.is_online;
        setIsOnline(online);
        localStorage.setItem("driverOnline", String(online));
        window.dispatchEvent(new Event("driver-shift-change"));
        currentDriverId = meRes.data.data.id;
      }

      const [walletRes, ordersRes] = await Promise.all([
        api.get("/wallets"),
        api.get("/orders"),
      ]);
      if (walletRes.data.status === "success") {
        setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        setTransactions(walletRes.data.data.transactions || []);
      }
      if (ordersRes.data.status === "success") {
        const allOrders = ordersRes.data.data || [];
        setJobs(
          allOrders.filter(
            (order: Order) => order.status === "ready_for_pickup",
          ),
        );
        setActiveJob(
          allOrders.find(
            (order: Order) => order.status === "out_for_delivery",
          ) || null,
        );
        if (currentDriverId) {
          const completed = allOrders.filter(
            (order: any) =>
              order.status === "delivered" &&
              order.delivery_partner_id === currentDriverId,
          );
          setCompletedDeliveriesCount(completed.length);
          setTotalEarningAmt(
            completed.reduce(
              (sum: number, order: any) =>
                sum + parseFloat(order.delivery_charges || "0"),
              0,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Unable to load driver dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDriverStats();
    const ioSocket = io("http://localhost:5000");
    setSocket(ioSocket);
    return () => {
      ioSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!activeJob) {
      setActiveJobDetails(null);
      return;
    }
    api
      .get(`/orders/${activeJob.id}`)
      .then((res) => {
        if (res.data.status === "success") setActiveJobDetails(res.data.data);
      })
      .catch(console.error);

    const savedStep = localStorage.getItem(`delivery_step_${activeJob.id}`);
    setDeliveryStep(
      (savedStep as "accepted" | "arrived_store" | "picked_up") || "accepted",
    );
  }, [activeJob?.id]);

  useEffect(() => {
    if (!activeJob || deliveryStep !== "picked_up") return;
    const interval = window.setInterval(
      () => setDeliveryTimer((time) => time - 1),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [activeJob, deliveryStep]);

  const handleToggleOnline = async () => {
    const nextOnlineState = !isOnline;
    try {
      const response = await api.put("/delivery/status", {
        is_online: nextOnlineState,
      });
      if (response.data.status === "success") {
        setIsOnline(nextOnlineState);
        localStorage.setItem("driverOnline", String(nextOnlineState));
        window.dispatchEvent(new Event("driver-shift-change"));
        if (nextOnlineState) {
          notify.success("You are now online and ready to accept orders.");
        } else {
          notify.error("You are now offline.");
        }
      }
    } catch {
      notify.error("We couldn't change your status.");
    }
  };

  const handleAcceptJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "out_for_delivery",
      });
      if (response.data.status === "success") {
        localStorage.setItem(`delivery_step_${orderId}`, "accepted");
        setDeliveryStep("accepted");
        await fetchDriverStats();
        notify.success("Delivery accepted! Head to the restaurant.");
      }
    } catch {
      notify.error("We couldn't accept this delivery right now.");
    }
  };

  const handleDeliverJob = async () => {
    if (!activeJob) return;
    try {
      const response = await api.put(`/orders/${activeJob.id}/status`, {
        status: "delivered",
      });
      if (response.data.status === "success") {
        localStorage.removeItem(`delivery_step_${activeJob.id}`);
        setActiveJob(null);
        await fetchDriverStats();
        notify.success("Delivery complete! Great job.");
      }
    } catch {
      notify.error("We couldn't complete this delivery.");
    }
  };

  const handleRequestPayout = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0 || amount > walletBalance) {
      notify.warning("Please enter a valid amount from your balance.");
      return;
    }
    setPayoutLoading(true);
    try {
      const response = await api.post("/wallets/payout", { amount });
      if (response.data.status === "success") {
        setPayoutAmount("");
        await fetchDriverStats();
        notify.success("Payout requested successfully.");
      }
    } catch (error: any) {
      notify.error(
        error.response?.data?.message ||
          "We couldn't request your payout right now.",
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";
  const activeStep =
    deliveryStep === "accepted"
      ? "Head to restaurant"
      : deliveryStep === "arrived_store"
        ? "Collect order"
        : "Deliver order";
  const remainingTime = `${Math.max(0, Math.floor(deliveryTimer / 60))
    .toString()
    .padStart(2, "0")}:${Math.max(0, deliveryTimer % 60)
    .toString()
    .padStart(2, "0")}`;

  const moveToPickup = () => {
    if (!activeJob) return;
    setDeliveryStep("arrived_store");
    localStorage.setItem(`delivery_step_${activeJob.id}`, "arrived_store");
  };

  const startDelivery = () => {
    if (!activeJob) return;
    setDeliveryStep("picked_up");
    setDeliveryTimer(600);
    localStorage.setItem(`delivery_step_${activeJob.id}`, "picked_up");
    socket?.emit("joinRoom", { room: `order_${activeJob.id}` });
    simulateGPSMovement(activeJob.id);
  };

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Driver workspace</p>
          <h1>
            Good {greeting}, {driverName}
          </h1>
          <p>
            {isOnline
              ? "You are available for new delivery requests."
              : "You are offline. Go online when you are ready to work."}
          </p>
        </div>
        <div className="driver-workspace__shift">
          <span
            className={`driver-status ${isOnline ? "is-online" : "is-offline"}`}
          >
            <i />
            {isOnline ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            className={`driver-shift-button ${isOnline ? "is-online" : ""}`}
            onClick={handleToggleOnline}
          >
            <Power size={17} /> {isOnline ? "End shift" : "Start shift"}
          </button>
        </div>
      </header>

      <section
        className="driver-stat-grid"
        aria-label="Today’s delivery summary"
      >
        <article>
          <span>Today’s earnings</span>
          <strong>${totalEarningAmt.toFixed(2)}</strong>
          <small>{completedDeliveriesCount} completed</small>
        </article>
        <article>
          <span>Available requests</span>
          <strong>{jobs.length}</strong>
          <small>{isOnline ? "Ready to accept" : "Go online to accept"}</small>
        </article>
        <article>
          <span>Wallet balance</span>
          <strong>${walletBalance.toFixed(2)}</strong>
          <small>Available to cash out</small>
        </article>
      </section>

      <div className="driver-workspace__grid">
        <section
          className="driver-panel driver-current-job"
          id="driver-job-section"
        >
          <div className="driver-panel__heading">
            <div>
              <p>Current delivery</p>
              <h2>
                {activeJob
                  ? `Order #${activeJob.order_number}`
                  : "No delivery in progress"}
              </h2>
            </div>
            {activeJob && (
              <span className="driver-step-label">{activeStep}</span>
            )}
          </div>

          {activeJob ? (
            <>
              <div className="driver-route">
                <div>
                  <span>Pick up</span>
                  <strong>{activeJob.restaurant_name}</strong>
                  <p>Restaurant</p>
                </div>
                <div>
                  <span>Drop off</span>
                  <strong>
                    {activeJobDetails?.street_address ||
                      activeJob.street_address}
                  </strong>
                  <p>{activeJobDetails?.city || activeJob.city}</p>
                </div>
              </div>
              <div
                className="driver-progress"
                aria-label={`Delivery step: ${activeStep}`}
              >
                {[
                  ["accepted", "1", "To pickup"],
                  ["arrived_store", "2", "At restaurant"],
                  ["picked_up", "3", "Deliver"],
                ].map(([step, number, label]) => (
                  <div
                    key={step}
                    className={
                      deliveryStep === step ||
                      (deliveryStep === "arrived_store" &&
                        step === "accepted") ||
                      deliveryStep === "picked_up"
                        ? "is-complete"
                        : ""
                    }
                  >
                    <b>{number}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="driver-current-job__footer">
                {deliveryStep === "picked_up" && (
                  <span className="driver-timer">
                    {remainingTime} left · {gpsProgress}% route sync
                  </span>
                )}
                {deliveryStep === "accepted" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={moveToPickup}
                  >
                    <Navigation size={17} /> I’m at the restaurant
                  </button>
                )}
                {deliveryStep === "arrived_store" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={startDelivery}
                  >
                    <Check size={17} /> Picked up order
                  </button>
                )}
                {deliveryStep === "picked_up" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={handleDeliverJob}
                  >
                    <Check size={17} /> Complete delivery
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="driver-empty-state">
              <Truck size={22} />
              <div>
                <strong>Your next delivery will show here.</strong>
                <p>Accept a request from the queue when you are online.</p>
              </div>
            </div>
          )}
        </section>

        <section className="driver-panel driver-queue">
          <div className="driver-panel__heading">
            <div>
              <p>Available requests</p>
              <h2>Pickup queue</h2>
            </div>
            <span>{jobs.length}</span>
          </div>
          <div className="driver-queue__list">
            {jobs.slice(0, 4).map((job) => (
              <article key={job.id} className="driver-queue-item">
                <div>
                  <strong>{job.restaurant_name}</strong>
                  <p>
                    {job.city} · Order #{job.order_number}
                  </p>
                </div>
                <div className="driver-queue-item__action">
                  <strong>
                    ${parseFloat(job.delivery_charges || "0").toFixed(2)}
                  </strong>
                  <button
                    type="button"
                    disabled={!isOnline || !!activeJob}
                    onClick={() => handleAcceptJob(job.id)}
                  >
                    Accept
                  </button>
                </div>
              </article>
            ))}
            {jobs.length === 0 && (
              <div className="driver-queue__empty">
                No requests are waiting right now.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="driver-wallet" id="driver-wallet-section">
        <div>
          <div className="driver-wallet__icon">
            <Wallet size={19} />
          </div>
          <div>
            <p>Wallet</p>
            <h2>
              ${walletBalance.toFixed(2)} <span>available</span>
            </h2>
          </div>
        </div>
        <form onSubmit={handleRequestPayout}>
          <input
            className="input-premium"
            type="number"
            min="0"
            step="0.01"
            value={payoutAmount}
            onChange={(event) => setPayoutAmount(event.target.value)}
            placeholder="Amount to withdraw"
          />
          <button type="submit" disabled={payoutLoading || walletBalance <= 0}>
            {payoutLoading ? "Requesting..." : "Cash out"}
          </button>
        </form>
        <div className="driver-wallet__activity">
          {transactions[0] ? (
            <>
              <strong>Latest activity</strong>
              <span>{transactions[0].description}</span>
            </>
          ) : (
            "Your payout activity will appear here."
          )}
        </div>
      </section>
    </div>
  );
};
