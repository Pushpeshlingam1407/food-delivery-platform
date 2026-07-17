import React, { useEffect, useState } from "react";
import {
  Check,
  Eye,
  FileText,
  Search,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import api from "../../../shared/services/api";
import notify from "../../../shared/utils/toast";
import "./VerificationCenter.css";

type Status = "pending" | "approved" | "rejected" | "suspended";
interface Application {
  id: string;
  role: "restaurant_owner" | "delivery_partner";
  status: Status;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  submitted_at: string;
  documents_uploaded: number;
  rejection_reason?: string;
  payload?: string | Record<string, unknown>;
  documents?: { id: string; document_type: string; document_url: string }[];
  timeline?: {
    id: string;
    action: string;
    created_at: string;
    admin_name?: string;
  }[];
}
const tabs: Status[] = ["pending", "approved", "rejected", "suspended"];
const label = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const VerificationCenter: React.FC = () => {
  const [status, setStatus] = useState<Status>("pending");
  const [role, setRole] = useState("all");
  const [items, setItems] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/verification/applications", {
        params: { status, ...(role !== "all" ? { role } : {}) },
      });
      setItems(data.data);
    } catch {
      notify.error("We couldn't load the verification queue.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [status, role]);
  const preview = async (id: string) => {
    try {
      const { data } = await api.get(`/verification/applications/${id}`);
      setSelected(data.data);
    } catch {
      notify.error("Couldn't open this application.");
    }
  };
  const update = async (next: Status) => {
    if (!selected) return;
    const rejectionReason =
      next === "rejected"
        ? window.prompt("Provide constructive feedback for the applicant:")
        : null;
    if (next === "rejected" && !rejectionReason?.trim())
      return notify.warning("A rejection reason is required.");
    if (
      !window.confirm(
        `Confirm ${next} for ${selected.first_name} ${selected.last_name}?`,
      )
    )
      return;
    const previous = selected.status;
    setSelected({ ...selected, status: next });
    setItems((all) => all.filter((x) => x.id !== selected.id));
    try {
      await api.patch(`/verification/applications/${selected.id}/status`, {
        status: next,
        rejectionReason,
      });
      notify.success(
        next === "approved"
          ? "Verification approved successfully."
          : `Verification marked ${next}.`,
      );
      setSelected(null);
    } catch {
      setSelected({ ...selected, status: previous });
      notify.error("The update didn't save. Please try again.");
      load();
    }
  };
  const visible = items.filter((x) =>
    `${x.first_name} ${x.last_name} ${x.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="verification-center">
      <section className="verification-hero">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={15} /> Trust & safety
          </span>
          <h1>Verification Center</h1>
          <p>
            Review merchants and delivery partners with a complete, auditable
            decision trail.
          </p>
        </div>
        <div className="verification-hero-stat">
          <b>{items.length}</b>
          <span>in this queue</span>
        </div>
      </section>
      <div className="verification-toolbar">
        <div className="verification-tabs">
          {tabs.map((tab) => (
            <button
              className={status === tab ? "active" : ""}
              onClick={() => setStatus(tab)}
              key={tab}
            >
              {label(tab)}
            </button>
          ))}
        </div>
        <div className="verification-filters">
          <label className="verification-search">
            <Search size={16} />
            <input
              aria-label="Search applicants"
              placeholder="Search name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All partners</option>
            <option value="restaurant_owner">Restaurant owners</option>
            <option value="delivery_partner">Delivery partners</option>
          </select>
        </div>
      </div>
      <section className="verification-list" aria-busy={loading}>
        {loading ? (
          <div className="verification-empty">Loading review queue…</div>
        ) : visible.length ? (
          visible.map((app) => (
            <article key={app.id} className="verification-card">
              <div className="verification-avatar">
                {app.first_name[0]}
                {app.last_name[0]}
              </div>
              <div className="verification-person">
                <h3>
                  {app.first_name} {app.last_name}
                </h3>
                <p>
                  {app.email} · {app.phone}
                </p>
                <small>
                  {label(app.role)} · Applied{" "}
                  {new Date(app.submitted_at).toLocaleDateString()}
                </small>
              </div>
              <span className={`verification-badge ${app.status}`}>
                {label(app.status)}
              </span>
              <div className="verification-docs">
                <FileText size={16} />
                {app.documents_uploaded} docs
              </div>
              <div className="verification-actions">
                <button
                  className="icon-action"
                  onClick={() => preview(app.id)}
                  aria-label="Preview application"
                >
                  <Eye size={18} />
                </button>
                {status === "pending" && (
                  <>
                    <button
                      className="action approve"
                      onClick={() => preview(app.id)}
                    >
                      <Check size={16} /> Review
                    </button>
                  </>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="verification-empty">
            <AlertTriangle size={22} />
            <p>No applications match this view.</p>
          </div>
        )}
      </section>
      {selected && (
        <aside
          className="verification-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Application details"
        >
          <div className="drawer-head">
            <div>
              <span className="eyebrow">Application review</span>
              <h2>
                {selected.first_name} {selected.last_name}
              </h2>
            </div>
            <button
              className="icon-action"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X />
            </button>
          </div>
          <div className="drawer-scroll">
            <section>
              <h3>Profile</h3>
              <dl>
                <dt>Email</dt>
                <dd>{selected.email}</dd>
                <dt>Phone</dt>
                <dd>{selected.phone}</dd>
                <dt>Role</dt>
                <dd>{label(selected.role)}</dd>
                <dt>Status</dt>
                <dd>
                  <span className={`verification-badge ${selected.status}`}>
                    {label(selected.status)}
                  </span>
                </dd>
              </dl>
            </section>
            <section>
              <h3>Submitted details</h3>
              <pre>
                {JSON.stringify(
                  typeof selected.payload === "string"
                    ? JSON.parse(selected.payload || "{}")
                    : selected.payload || {},
                  null,
                  2,
                )}
              </pre>
            </section>
            <section>
              <h3>Documents</h3>
              {selected.documents?.map((doc) => (
                <a
                  className="document-row"
                  key={doc.id}
                  href={doc.document_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={17} />
                  {label(doc.document_type)}
                  <span>Preview ↗</span>
                </a>
              ))}
            </section>
            <section>
              <h3>Verification timeline</h3>
              {selected.timeline?.map((event) => (
                <div className="timeline" key={event.id}>
                  <b>{label(event.action)}</b>
                  <span>
                    {new Date(event.created_at).toLocaleString()}{" "}
                    {event.admin_name ? `by ${event.admin_name}` : ""}
                  </span>
                </div>
              ))}
            </section>
          </div>
          <footer className="drawer-actions">
            {selected.status !== "approved" && (
              <button
                className="action approve"
                onClick={() => update("approved")}
              >
                <Check size={16} /> Approve
              </button>
            )}
            {selected.status !== "rejected" && (
              <button
                className="action reject"
                onClick={() => update("rejected")}
              >
                Reject
              </button>
            )}
            {selected.status !== "suspended" && (
              <button
                className="action suspend"
                onClick={() => update("suspended")}
              >
                Suspend
              </button>
            )}
          </footer>
        </aside>
      )}
    </div>
  );
};
