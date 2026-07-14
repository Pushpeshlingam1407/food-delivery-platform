import React from "react";
import { X } from "lucide-react";
import "./PreviewDrawer.css";

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
                <h3 className="preview-drawer-title-text">{title}</h3>
                {subtitle && (
                  <span className="preview-drawer-subtitle-text">
                    {subtitle}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="preview-drawer-close-button">
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
