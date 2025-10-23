
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HeaderBar from '../components/layout/HeaderBar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Mail, Wind } from 'lucide-react';

const DeliveredCapsule = ({ capsule, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="memory-card">
      <div className="memory-label">
        Note from {format(new Date(capsule.date), 'MMMM d, yyyy')}
      </div>
      <div className="memory-date">
        Delivered on {format(new Date(capsule.delivered_at), 'MMMM d, yyyy')}
      </div>
      <div className="mt-4 p-4 bg-[var(--paper-bg-2)] rounded-lg border border-[var(--paper-line)]">
         <p className="whitespace-pre-wrap font-serif text-[var(--paper-fg)] leading-relaxed">{capsule.body}</p>
      </div>
    </div>
  </motion.div>
);

export default function TimeCapsulePage() {
  const [deliveredCapsules, setDeliveredCapsules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveredCapsules = async () => {
      try {
        const capsules = await base44.entities.Entry.filter(
          { status: 'delivered' },
          '-delivered_at' // Show most recently delivered first
        );
        setDeliveredCapsules(capsules);
      } catch (error) {
        console.error("Error fetching delivered capsules:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveredCapsules();
  }, []);

  return (
    <>
      <HeaderBar title="To You" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
      <div className="py-8">
        <div className="text-center mb-8">
            <h2 className="section-title text-2xl" style={{ color: 'var(--paper-accent-2)' }}>Delivered Notes</h2>
            <p className="section-sub">Messages from your past, delivered to you.</p>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-[var(--paper-ink-faded)]">Loading...</div>
        ) : deliveredCapsules.length === 0 ? (
          <div className="text-center py-20 text-[var(--paper-ink-faded)]">
            <Wind className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)]" />
            <p className="font-semibold">No delivered notes yet.</p>
            <p>Once a scheduled note's time arrives, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveredCapsules.map((capsule, index) => (
              <DeliveredCapsule key={capsule.id} capsule={capsule} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
