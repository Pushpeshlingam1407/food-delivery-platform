import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Check, Navigation, Truck } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { formatIndianCurrency } from "../../../shared/utils/currency";

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

export const DeliveriesPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [activeJobDetails, setActiveJobDetails] = useState<any | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [deliveryStep, setDeliveryStep] = useState<
    "accepted" | "arrived_store" | "picked_up"
  >("accepted");
  const [deliveryTimer, setDeliveryTimer] = useState(600);
  const [gpsProgress, setGpsProgress] = useState(0);

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

  const fetchJobsAndDriver = async () => {
    try {
      const meRes = await api.get("/auth/me");
      if (meRes.data.status === "success" && meRes.data.data) {
        setIsOnline(!!meRes.data.data.is_online);
      }

      const ordersRes = await api.get("/orders");
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
      }
    } catch (error) {
      console.error("Unable to load deliveries:", error);
    }
  };

  useEffect(() => {
    fetchJobsAndDriver();

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

  const handleAcceptJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "out_for_delivery",
      });
      if (response.data.status === "success") {
        localStorage.setItem(`delivery_step_${orderId}`, "accepted");
        setDeliveryStep("accepted");
        await fetchJobsAndDriver();
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
        await fetchJobsAndDriver();
        notify.success("Delivery complete! Great job.");
      }
    } catch {
      notify.error("We couldn't complete this delivery.");
    }
  };

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
          <p className="driver-workspace__eyebrow">Shift Operations</p>
          <h1>Active Deliveries & Board</h1>
          <p>
            {isOnline
              ? "You are online. Keep track of accepted orders and upcoming requests."
              : "You are offline. Go online from the Home screen to accept jobs."}
          </p>
        </div>
      </header>

      {/* Active Job & Queue grid */}
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
              {activeJob && (
                <p className="driver-order-id-label">ID: {activeJob.id}</p>
              )}
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

              {/* Map simulation container */}
              <div className="driver-map-preview">
                <div className="driver-map-bg">
                  <div className="driver-map-streets" />
                  <div className="driver-map-marker marker-restaurant">
                    <span>Rest.</span>
                  </div>
                  <div className="driver-map-marker marker-customer">
                    <span>Cust.</span>
                  </div>
                  <div
                    className="driver-map-marker marker-driver"
                    style={{
                      top: `${130 + (gpsProgress / 100) * 80}px`,
                      left: `${130 + (gpsProgress / 100) * 110}px`,
                    }}
                  >
                    <Truck size={12} />
                    <span>You</span>
                  </div>
                </div>
                <div className="driver-map-gps-bar">
                  <div
                    className="driver-map-gps-fill"
                    style={{ width: `${gpsProgress}%` }}
                  />
                </div>
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

        {/* Requests Queue */}
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
                  <p className="driver-order-id-label">ID: {job.id}</p>
                </div>
                <div className="driver-queue-item__action">
                  <strong>{formatIndianCurrency(job.delivery_charges)}</strong>
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
    </div>
  );
};
