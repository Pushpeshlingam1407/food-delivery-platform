import React, { useEffect, useState } from "react";
import api from "../../../shared/services/api";
import notify from "../../../shared/utils/toast";
import { formatIndianCurrency } from "../../../shared/utils/currency";
import { Truck } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  restaurant_name: string;
  city: string;
  delivery_charges?: string;
}

export const DeliveryRequestsPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<Order[]>([]);
  const [hasActiveJob, setHasActiveJob] = useState(false);

  const fetchRequests = async () => {
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
        setHasActiveJob(
          allOrders.some((order: Order) => order.status === "out_for_delivery"),
        );
      }
    } catch (error) {
      console.error("Unable to load delivery requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "out_for_delivery",
      });
      if (response.data.status === "success") {
        localStorage.setItem(`delivery_step_${orderId}`, "accepted");
        notify.success(
          "Delivery accepted! Go to 'Active Orders' to view route mapping.",
        );
        fetchRequests();
      }
    } catch {
      notify.error("We couldn't accept this delivery right now.");
    }
  };

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Requests Queue</p>
          <h1>Delivery Requests</h1>
          <p>
            {isOnline
              ? "Select an order below to accept it and head to the restaurant."
              : "You are offline. Go online from the Home screen to accept delivery requests."}
          </p>
        </div>
      </header>

      {/* Available Requests Queue */}
      <section className="driver-panel driver-queue">
        <div className="driver-panel__heading">
          <div>
            <p>Pickup queue</p>
            <h2>Pending Requests</h2>
          </div>
          <span>{jobs.length}</span>
        </div>
        <div className="driver-queue__list">
          {jobs.map((job) => (
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
                  disabled={!isOnline || hasActiveJob}
                  onClick={() => handleAcceptJob(job.id)}
                >
                  Accept
                </button>
              </div>
            </article>
          ))}
          {jobs.length === 0 && (
            <div className="driver-empty-state">
              <Truck size={22} />
              <div>
                <strong>No requests are waiting right now.</strong>
                <p>We will notify you when new pickup opportunities arrive.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
