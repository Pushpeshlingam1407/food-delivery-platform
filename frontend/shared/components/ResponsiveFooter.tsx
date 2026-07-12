import React from "react";
import { Link } from "react-router-dom";

export interface FooterLinkItem {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
}

export interface FooterSection {
  title: string;
  links: FooterLinkItem[];
}

interface ResponsiveFooterProps {
  sections: FooterSection[];
  bottomText: string;
}

export const ResponsiveFooter: React.FC<ResponsiveFooterProps> = ({
  sections,
  bottomText,
}) => {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        {sections.map((section) => (
          <div key={section.title} className="footer-column">
            <h4>{section.title}</h4>
            <ul>
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.onClick ? (
                    <button
                      type="button"
                      onClick={link.onClick}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {link.label}
                    </button>
                  ) : link.href ? (
                    <a href={link.href}>{link.label}</a>
                  ) : (
                    <Link to={link.to || "/"}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div>{bottomText}</div>
      </div>
    </footer>
  );
};