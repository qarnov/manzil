import { Link, useLocation } from "@tanstack/react-router";

const tabs = [
  { to: "/", icon: "🏠", label: "Home" },
  { to: "/quran", icon: "📖", label: "Quran" },
  { to: "/duas", icon: "🤲", label: "Duas" },
  { to: "/qibla", icon: "🧭", label: "Qibla" },
  { to: "/more", icon: "☰", label: "More" },
];

const moreRoutes = ["/more", "/tasbih", "/zakat", "/hijri", "/prayer"];

export function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to === "/more") return moreRoutes.some((r) => pathname.startsWith(r));
    if (to === "/duas") return pathname.startsWith("/duas");
    if (to === "/quran") return pathname.startsWith("/quran");
    if (to === "/qibla") return pathname.startsWith("/qibla");
    return false;
  };
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} className={isActive(t.to) ? "active" : ""}>
          <span className="icon">{t.icon}</span>
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
