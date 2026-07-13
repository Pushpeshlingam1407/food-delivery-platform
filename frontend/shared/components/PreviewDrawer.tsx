import React from "react";
import { X } from "lucide-react";

interface PreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <>
      {isOpen && <div className="preview-drawer-backdrop" onClick={onClose} />}
      <div className={`preview-drawer ${isOpen ? "open" : ""}`}>
        {isOpen && (
          <>
            <div className="preview-drawer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  {title}
                </h3>
                {subtitle && (
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    {subtitle}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="preview-drawer-body">{children}</div>
            {footer && <div className="preview-drawer-footer">{footer}</div>}
          </>
        )}
      </div>
    </>
  );
};
