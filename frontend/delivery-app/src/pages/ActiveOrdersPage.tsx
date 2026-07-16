import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Check, Navigation, Truck } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

interface Order {
  id: string;
  order_number: string;
  status: string;
  restaurant_name: string;
  street_address: string;
  city: string;
}

export const ActiveOrdersPage: React.FC = () => {
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

  const fetchActiveJob = async () => {
    try {
      const ordersRes = await api.get("/orders");
      if (ordersRes.data.status === "success") {
        const active =
          ordersRes.data.data?.find(
            (order: Order) => order.status === "out_for_delivery",
          ) || null;
        setActiveJob(active);
      }
    } catch (error) {
      console.error("Unable to load active deliveries:", error);
    }
  };

  useEffect(() => {
    fetchActiveJob();

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

  const handleDeliverJob = async () => {
    if (!activeJob) return;
    try {
      const response = await api.put(`/orders/${activeJob.id}/status`, {
        status: "delivered",
      });
      if (response.data.status === "success") {
        localStorage.removeItem(`delivery_step_${activeJob.id}`);
        setActiveJob(null);
        notify.success("Delivery completed successfully!");
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
          <p className="driver-workspace__eyebrow">Assigned Deliveries</p>
          <h1>Active Orders & Navigation</h1>
          <p>
            Real-time transit coordinates routing, step tracking, and
            fulfillment triggers.
          </p>
        </div>
      </header>

      {/* Active Job Tracker */}
      <section
        className="driver-panel driver-current-job"
        id="driver-job-section"
      >
        <div className="driver-panel__heading">
          <div>
            <p>Active Route</p>
            <h2>
              {activeJob
                ? `Order #${activeJob.order_number}`
                : "No assigned delivery route active"}
            </h2>
            {activeJob && (
              <p className="driver-order-id-label">ID: {activeJob.id}</p>
            )}
          </div>
          {activeJob && <span className="driver-step-label">{activeStep}</span>}
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
                  {activeJobDetails?.street_address || activeJob.street_address}
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
                    (deliveryStep === "arrived_store" && step === "accepted") ||
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
              <strong>Your active route mapping will appear here.</strong>
              <p>
                Go to the Requests screen to accept a pending pickup
                opportunity.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
