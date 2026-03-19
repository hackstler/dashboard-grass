import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "./ui/Toast";
import { MenuIcon } from "./ui/Icons";
import { useApp } from "../context/AppContext";

interface LayoutProps {
  onLogout: () => void;
  children: ReactNode;
}

export function Layout({ onLogout, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts, removeToast } = useApp();

  return (
    <div className="flex h-screen bg-bg text-text font-sans text-sm noise-bg">
      <Sidebar
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border glass-subtle">
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-press text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <MenuIcon size={20} />
          </button>
          <span className="font-bold text-sm text-text-bright font-mono tracking-tight">
            hackstler
          </span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative cyber-grid">
          {/* Global ambient orbs */}
          <div className="ambient-orb w-[500px] h-[400px] bg-accent/[0.04] -top-20 right-0 fixed" />
          <div className="ambient-orb w-[400px] h-[300px] bg-brand/[0.03] bottom-0 -left-20 fixed" style={{ animationDelay: "2s" }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">{children}</div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
