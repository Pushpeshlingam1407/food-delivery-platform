import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../shared/services/api";

export const CmsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/cms/page/${slug}`);
        if (response.data.status === "success") {
          setPage(response.data.data);
        }
      } catch (err) {
        console.error("Fetch CMS page failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading page...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>Page Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0" }}>
          The requested page does not exist or has been unpublished.
        </p>
        <button onClick={() => navigate("/")} className="btn-premium">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "var(--text-slate)",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "8px",
          fontFamily: "var(--font-anthropic)",
        }}
      >
        {page.title}
      </h1>
      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "32px",
        }}
      >
        Last updated:{" "}
        {new Date(page.updated_at || page.created_at).toLocaleDateString()}
      </div>

      <div
        style={{
          lineHeight: "1.7",
          fontSize: "1.1rem",
          color: "var(--text-slate)",
          whiteSpace: "pre-wrap",
        }}
      >
        {page.content}
      </div>
    </div>
  );
};
