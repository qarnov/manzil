import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export function TopBar({
  title,
  subtitle,
  back,
  right,
  arabicTitle,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  arabicTitle?: string;
}) {
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {back && (
          <Link to="/more" className="back" onClick={(e) => { e.preventDefault(); history.back(); }}>‹</Link>
        )}
        <div>
          <h1>{arabicTitle || title}</h1>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
      </div>
      <div className="icons">{right}</div>
    </header>
  );
}
