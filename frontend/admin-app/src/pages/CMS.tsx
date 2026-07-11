import React, { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
}

export const CMS: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<CmsPage[]>([]);

  // New CMS page form states
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPages = async () => {
    try {
      const response = await api.get("/cms");
      if (response.data.status === "success") {
        setPages(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load CMS pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !title || !content) return;

    setSubmitting(true);
    try {
      const response = await api.post("/cms", {
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        title,
        content,
        meta_title: metaTitle,
        meta_description: metaDesc,
        is_published: isPublished,
      });

      if (response.data.status === "success") {
        toast.success("CMS Page published successfully!");
        setSlug("");
        setTitle("");
        setContent("");
        setMetaTitle("");
        setMetaDesc("");
        setIsPublished(false);
        setShowForm(false);
        fetchPages();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish page.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const response = await api.delete(`/cms/${id}`);
      if (response.data.status === "success") {
        toast.success("CMS page deleted successfully.");
        setPages((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete page.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading CMS catalog...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.2rem",
              marginBottom: "8px",
              fontFamily: "var(--font-anthropic)",
            }}
          >
            CMS Manager
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Compose marketing pages, update terms & conditions, and configure
            metadata.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-premium"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} /> {showForm ? "View Pages List" : "Add CMS Page"}
        </button>
      </div>

      {showForm ? (
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-standard)",
            padding: "32px",
            boxShadow: "var(--glass-shadow)",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Create Dynamic Page
          </h3>
          <form
            onSubmit={handleCreatePage}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  PAGE TITLE *
                </label>
                <input
                  type="text"
                  placeholder="About Us"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  URL SLUG *
                </label>
                <input
                  type="text"
                  placeholder="about-us"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                MARKDOWN CONTENT *
              </label>
              <textarea
                placeholder="# About bites\n\nWe deliver fresh food fast..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  minHeight: "150px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  META TITLE
                </label>
                <input
                  type="text"
                  placeholder="About bites - Food Delivery"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  META DESCRIPTION
                </label>
                <input
                  type="text"
                  placeholder="Learn about the bites platform..."
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                margin: "8px 0",
              }}
            >
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish this page immediately
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-premium"
              style={{ padding: "12px" }}
            >
              {submitting ? "Publishing..." : "Publish Dynamic Page"}
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "32px",
          }}
        >
          {pages.map((p) => (
            <div
              key={p.id}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-standard)",
                padding: "24px",
                boxShadow: "var(--glass-shadow)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <strong style={{ fontSize: "1.1rem" }}>{p.title}</strong>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "100px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: p.is_published
                        ? "rgba(76, 175, 80, 0.08)"
                        : "rgba(25, 25, 25, 0.04)",
                      color: p.is_published ? "#4CAF50" : "var(--text-muted)",
                    }}
                  >
                    {p.is_published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--accent-orange)",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                    fontWeight: 700,
                  }}
                >
                  <Globe size={14} /> /{p.slug}
                </div>

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    marginBottom: "20px",
                  }}
                >
                  {p.content}
                </p>
              </div>

              <button
                onClick={() => handleDeletePage(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: "1px solid rgba(244, 67, 54, 0.2)",
                  borderRadius: "6px",
                  color: "#F44336",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <Trash2 size={16} /> Delete Page
              </button>
            </div>
          ))}

          {pages.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px",
                color: "var(--text-muted)",
              }}
            >
              No CMS pages composition found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
