import React from "react";
import { motion } from "framer-motion";

export default function DailySpark({ prompt }) {
  if (!prompt) {
    return null; // Return null if there is no prompt
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center py-12 px-6"
    >
      <div className="card-paper max-w-2xl mx-auto">
        <div className="quote-note">
          <p className="quote-text text-lg md:text-xl leading-relaxed mb-2 font-serif select-all">
            {prompt}
          </p>
        </div>
      </div>
    </motion.div>
  );
}