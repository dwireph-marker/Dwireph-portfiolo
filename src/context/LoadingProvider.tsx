import { PropsWithChildren, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { LoadingContext, LoadingType } from "./LoadingContext";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const view: "portfolio" | "admin" = location.pathname.startsWith("/admin") ? "admin" : "portfolio";

  const setView = useCallback((newView: "portfolio" | "admin") => {
    navigate(newView === "admin" ? "/admin" : "/", { replace: newView === "portfolio" });
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setView(view === "admin" ? "portfolio" : "admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, setView]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove("scroll-locked");
    }, 3500);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const value: LoadingType = {
    isLoading,
    setIsLoading,
    setLoading,
    view,
    setView,
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && view !== "admin" && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};
