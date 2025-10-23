import React from "react";
import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";

export default function StreakDisplay({ streak, totalEntries }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center py-8"
    >
      <div className="flex justify-center items-center gap-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--paper-accent)] rounded-lg flex items-center justify-center mb-2 shadow-note">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--paper-fg)]">{streak}</p>
          <p className="text-sm text-[var(--paper-ink-faded)]">Day Streak</p>
        </div>

        <div className="w-px h-12 bg-[var(--paper-line)]"></div>

        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--paper-accent)] rounded-lg flex items-center justify-center mb-2 shadow-note">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--paper-fg)]">{totalEntries}</p>
          <p className="text-sm text-[var(--paper-ink-faded)]">Total Entries</p>
        </div>
      </div>
    </motion.div>
  );
}