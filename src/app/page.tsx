"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/components/landing/LandingPage";

const GisApp = dynamic(() => import("@/components/gis/GisApp").then((m) => m.GisApp), {
  ssr: false,
});

export default function Home() {
  const [view, setView] = useState<"landing" | "app">("landing");

  // lock body scroll when app is open
  useEffect(() => {
    if (view === "app") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage onLaunch={() => setView("app")} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0"
        >
          <GisApp onExit={() => setView("landing")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
