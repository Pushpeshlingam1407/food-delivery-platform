import React, { useEffect, useState } from "react";
import { ArrowUpRight, Bike, ChevronRight, CircleCheck, Clock3, Package, ShieldCheck, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../shared/services/api";
import notify from "../../../shared/utils/toast";
import "../admin.css";
import "./Dashboard.css";

type Analytics = { total_users: number; total_restaurants: number; total_orders: number; total_payments_captured: number };
type QueueItem = { id: string; role: string; status: string; first_name: string; last_name: string; email: string; submitted_at: string; documents_uploaded: number };

const formatNumber = (value = 0) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));
const formatMoney = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
const dayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [health, setHealth] = useState<{ database?: string; uptime?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, pending, status] = await Promise.all([
          api.get("/admin/analytics"),
          api.get("/verification/applications", { params: { status: "pending" } }),
          api.get("/health"),
        ]);
        setAnalytics(stats.data.data);
        setQueue(pending.data.data || []);
        setHealth(status.data);
      } catch { notify.error("Couldn't load your overview right now."); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="dashboard-loading"><div className="dashboard-loading-line wide"/><div className="dashboard-loading-grid"><div/><div/><div/><div/></div></div>;

  const cards = [
    { label: "Gross payments", value: formatMoney(analytics?.total_payments_captured), note: "All-time captured", tone: "blue", icon: <ArrowUpRight size={18}/> },
    { label: "Orders", value: formatNumber(analytics?.total_orders), note: "Across the network", tone: "violet", icon: <Package size={18}/> },
    { label: "Restaurants", value: formatNumber(analytics?.total_restaurants), note: "Partner locations", tone: "orange", icon: <Store size={18}/> },
    { label: "Customers", value: formatNumber(analytics?.total_users), note: "Registered accounts", tone: "green", icon: <Users size={18}/> },
  ];

  return <div className="operations-home">
    <header className="operations-header"><div><p className="operations-kicker">{dayLabel} · Bengaluru</p><h1>{greeting}, {localStorage.getItem("userName") || "Admin"}.</h1><p className="operations-subtitle">Here’s the pulse of Bites today.</p></div><div className="system-health"><span className="health-dot"/> <span>All systems operational</span><span className="health-divider"/> <span>{health?.database === "connected" ? "Database connected" : "Database unavailable"}</span></div></header>
    <section className="overview-metrics" aria-label="Platform overview">{cards.map((card) => <article className="overview-metric" key={card.label}><div className={`overview-metric-icon ${card.tone}`}>{card.icon}</div><div><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div></article>)}</section>
    <div className="operations-columns">
      <section className="workspace-panel queue-panel"><div className="workspace-panel-header"><div><p className="panel-eyebrow">Needs attention</p><h2>Verification queue</h2></div><Link to="/verification" className="quiet-link">View all <ChevronRight size={16}/></Link></div><p className="panel-intro">Review applications before partners go live.</p>{queue.length ? <div className="queue-list">{queue.slice(0, 4).map((item) => <Link to={`/verification`} className="queue-row" key={item.id}><div className="queue-avatar">{item.first_name?.[0]}{item.last_name?.[0]}</div><div className="queue-copy"><strong>{item.first_name} {item.last_name}</strong><span>{item.role === "restaurant_owner" ? "Restaurant owner" : "Delivery partner"} · {item.documents_uploaded} documents</span></div><time>{new Date(item.submitted_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</time><ChevronRight size={16}/></Link>)}</div> : <div className="queue-empty"><CircleCheck size={22}/><span>Nothing waiting for review.</span></div>}</section>
      <section className="workspace-panel"><div className="workspace-panel-header"><div><p className="panel-eyebrow">Workspaces</p><h2>Go to a workspace</h2></div></div><div className="workspace-links"><Link to="/orders"><Package/><span><strong>Orders</strong><small>Resolve fulfilment issues</small></span><ChevronRight/></Link><Link to="/restaurants"><Store/><span><strong>Restaurants</strong><small>Manage partner locations</small></span><ChevronRight/></Link><Link to="/drivers"><Bike/><span><strong>Delivery fleet</strong><small>Monitor rider accounts</small></span><ChevronRight/></Link><Link to="/customers"><Users/><span><strong>Customers</strong><small>Support and account care</small></span><ChevronRight/></Link></div></section>
    </div>
    <section className="operations-footer"><div><ShieldCheck size={18}/><span><strong>Trust & safety</strong><small>Verification decisions are logged and visible to your team.</small></span></div><Link to="/verification">Open verification center <ArrowUpRight size={16}/></Link><div className="footer-time"><Clock3 size={16}/> Last checked just now</div></section>
  </div>;
};
