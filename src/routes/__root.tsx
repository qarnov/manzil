import { Outlet, createRootRoute, HeadContent, Scripts, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1 style={{ fontFamily: "Amiri, serif", fontSize: 48 }}>404</h1>
      <p style={{ fontFamily: "DM Mono, monospace", color: "#9C7A5A" }}>Page not found</p>
      <a href="/" style={{ color: "#B89A72" }}>← Home</a>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: "Manzil — Your peaceful home" },
      { name: "description", content: "Manzil — Quran, Duas, Prayer Times for the Beary Muslim community of Mangaluru." },
      { name: "theme-color", content: "#3D2B1F" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onboarded = localStorage.getItem("manzil_onboarded") === "true";
    if (!onboarded && !isOnboarding) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [isOnboarding, navigate]);

  if (isOnboarding) {
    return (
      <div className="app-shell" style={{ paddingBottom: 0 }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Outlet />
      <BottomNav />
    </div>
  );
}
