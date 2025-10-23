
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HeaderBar from '../components/layout/HeaderBar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Mailbox, Lock } from 'lucide-react';

export default function SealedNotes() {
  const [sealedNotes, setSealedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSealedNotes = async () => {
      try {
        const notes = await base44.entities.Entry.filter(
          { is_capsule: true, status: 'scheduled' },
          'deliver_at' // Ascending order by delivery date
        );
        setSealedNotes(notes);
      } catch (error) {
        console.error("Error fetching sealed notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSealedNotes();
  }, []);

  const SealedNoteItem = ({ note, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => alert(`This note is sealed until ${format(new Date(note.deliver_at), "MMM d, yyyy")}.`)}
      className="cursor-pointer"
    >
      <div className="card-paper flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--paper-bg-2)] rounded-lg flex items-center justify-center border border-[var(--ui-border)]">
            <Lock className="w-5 h-5 text-[var(--paper-ink-faded)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--paper-fg)]">
              Opens on {format(new Date(note.deliver_at), 'MMMM d, yyyy')}
            </p>
            <p className="text-sm text-[var(--paper-ink-faded)]">Sealed Note</p>
          </div>
        </div>
        <span className="text-xl">⏳</span>
      </div>
    </motion.div>
  );

  return (
    <>
      <HeaderBar title="Future Notes" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
      <div className="py-8">
        <div className="text-center mb-8">
            <h2 className="section-title text-2xl" style={{ color: 'var(--paper-accent-2)' }}>Sealed Capsules</h2>
            <p className="section-sub">Notes from your past self, waiting to be opened.</p>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-[var(--paper-ink-faded)]">Loading...</div>
        ) : sealedNotes.length === 0 ? (
          <div className="text-center py-20 text-[var(--paper-ink-faded)]">
            <Mailbox className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)]" />
            <p className="font-semibold">Your future mailbox is empty.</p>
            <p>Go to today's entry to send a note to your future self!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sealedNotes.map((note, index) => (
              <SealedNoteItem key={note.id} note={note} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
