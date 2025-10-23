
import React from "react";
import { motion } from "framer-motion";
import { format, subDays, subYears } from "date-fns";

const oneMonthAgoDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
const oneYearAgoDate = format(subYears(new Date(), 1), "yyyy-MM-dd");

const Memory = ({ entry, label }) => {
  if (!entry) return null;

  return (
    <div
      className="memory-card"
    >
      <div className="memory-label">{label}</div>
      <div className="memory-date">{format(new Date(entry.date), "MMMM d, yyyy")}</div>

      {entry.spark_prompt && (
        <div className="quote-note mb-4">
          <p className="text-sm text-[var(--paper-ink-faded)] italic mb-1">Your daily spark was:</p>
          <div className="quote-text text-base">"{entry.spark_prompt}"</div>
        </div>
      )}

      {entry.bright_spots && (
        <div className="mb-3">
          <h4 className="section-title text-base mb-1 mt-2">Bright Spots</h4>
          <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.bright_spots}</p>
        </div>
      )}

      {entry.intentions && (
        <div className="mb-3">
          <h4 className="section-title text-base mb-1 mt-2">Intentions</h4>
          <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.intentions}</p>
        </div>
      )}

      {entry.affirmations && (
        <div>
          <h4 className="section-title text-base mb-1 mt-2">Affirmations</h4>
           <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.affirmations}</p>
        </div>
      )}
    </div>
  );
};

export default function TimeCapsule({ pastEntries, isLoading }) {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <p>Loading Time Capsule...</p>
      </div>
    );
  }

  const monthAgoEntry = pastEntries.find(e => e.date === oneMonthAgoDate);
  const yearAgoEntry = pastEntries.find(e => e.date === oneYearAgoDate);

  return (
    <div className="max-w-2xl mx-auto mt-16 section">
      <div className="text-center mb-8">
        <h2 className="section-title text-2xl" style={{ color: 'var(--paper-accent-2)' }}>A Look Back</h2>
        <p className="section-sub">Your gratitude time capsule</p>
      </div>

      <div className="space-y-6">
        <Memory entry={monthAgoEntry} label="1 Month Ago Today" />
        <Memory entry={yearAgoEntry} label="1 Year Ago Today" />
      </div>

      {!monthAgoEntry && !yearAgoEntry && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[var(--paper-bg-2)] rounded-full mx-auto mb-4 flex items-center justify-center border border-[var(--paper-line)]">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-[var(--paper-ink-faded)]">Your memories will appear here as you build your journal practice.</p>
        </div>
      )}
    </div>
  );
}
