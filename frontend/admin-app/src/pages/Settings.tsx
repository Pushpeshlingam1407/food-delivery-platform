import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface SettingItem {
  key_name: string;
  value: string;
  description: string;
}

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/admin/settings");
      if (response.data.status === "success") {
        setSettings(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueChange = (keyName: string, newValue: string) => {
    setSettings((prev) =>
      prev.map((item) => (item.key_name === keyName ? { ...item, value: newValue } : item))
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/admin/settings", { settings });
      if (response.data.status === "success") {
        toast.success("System configurations updated successfully!");
        fetchSettings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update configurations.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "8px", fontFamily: "var(--font-anthropic)" }}>
          System Configuration
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Adjust global parameters such as delivery pricing, tax rates, and commission percentages.</p>
      </div>

      <div style={{ background: "#FFF", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-standard)", padding: "32px", boxShadow: "var(--glass-shadow)" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "28px", display: "flex", alignItems: "center", gap: "8px" }}>
          <SettingsIcon size={18} color="var(--accent-violet)" /> Global Parameters
        </h3>

        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {settings.map((item) => (
            <div key={item.key_name} style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "16px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {item.key_name.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                value={item.value}
                onChange={(e) => handleValueChange(item.key_name, e.target.value)}
                required
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  fontSize: "0.95rem",
                  outline: "none",
                  maxWidth: "200px",
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.description}</span>
            </div>
          ))}

          <button type="submit" disabled={saving} className="btn-premium" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", marginTop: "10px" }}>
            <Save size={18} /> {saving ? "Saving Configurations..." : "Save Parameters"}
          </button>
        </form>
      </div>
    </div>
  );
};
