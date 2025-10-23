
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import HeaderBar from '../components/layout/HeaderBar';
import { format } from 'date-fns';
import { Lock, CheckCircle, Info } from 'lucide-react';

export default function NoteDetail() {
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchEntry = async () => {
      const params = new URLSearchParams(location.search);
      const entryId = params.get('id');

      if (!entryId) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedEntry = await base44.entities.Entry.get(entryId);
        setEntry(fetchedEntry);
      } catch (error) {
        console.error("Error fetching entry:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [location.search]);

  if (isLoading) {
    return (
      <>
        <HeaderBar title="Loading Note..." leftIcon="back" showLogo={true} logoPosition="right" />
        <div className="text-center py-20 text-[var(--paper-ink-faded)]">Loading...</div>
      </>
    );
  }

  if (!entry) {
    return (
      <>
        <HeaderBar title="Not Found" leftIcon="back" showLogo={true} logoPosition="right" />
        <div className="text-center py-20 text-[var(--paper-ink-faded)]">
            <Info className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)]" />
            <p>Sorry, we couldn't find that entry.</p>
        </div>
      </>
    );
  }

  const isDeliveredCapsule = entry.is_capsule && entry.status === 'delivered';
  const isScheduledCapsule = entry.is_capsule && entry.status === 'scheduled';

  return (
    <>
      <HeaderBar title="Journal Entry" leftIcon="back" showLogo={true} logoPosition="right" />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
            <p className="text-lg font-semibold text-[var(--paper-fg)]">
                {format(new Date(entry.date), 'MMMM d, yyyy')}
            </p>
        </div>

        {isDeliveredCapsule && (
            <div className="flex items-center justify-center gap-2 p-3 mb-6 bg-green-100 text-green-800 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span>Delivered on {format(new Date(entry.delivered_at), 'MMM d, yyyy')}</span>
            </div>
        )}

        {isScheduledCapsule ? (
            <div className="text-center py-20 card-paper">
                <Lock className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)]" />
                <p className="text-lg font-semibold">This note is sealed.</p>
                <p className="text-[var(--paper-ink-faded)]">It will be delivered on {format(new Date(entry.deliver_at), 'MMM d, yyyy')}.</p>
            </div>
        ) : isDeliveredCapsule ? (
            <div className="memory-card">
                <p className="whitespace-pre-wrap font-serif text-[var(--paper-fg)] leading-relaxed text-lg">{entry.body}</p>
            </div>
        ) : (
            <div className="memory-card">
                 {entry.spark_prompt && (
                    <div className="quote-note mb-6">
                        <p className="text-sm text-[var(--paper-ink-faded)] italic mb-1">Your daily spark was:</p>
                        <div className="quote-text text-base">"{entry.spark_prompt}"</div>
                    </div>
                )}
                {entry.bright_spots && (
                    <div className="mb-4">
                        <h4 className="section-title text-base mb-1">Bright Spots</h4>
                        <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.bright_spots}</p>
                    </div>
                )}
                 {entry.intentions && (
                    <div className="mb-4">
                        <h4 className="section-title text-base mb-1">Intentions</h4>
                        <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.intentions}</p>
                    </div>
                )}
                 {entry.affirmations && (
                    <div>
                        <h4 className="section-title text-base mb-1">Affirmations</h4>
                        <p className="whitespace-pre-wrap text-[var(--paper-fg)]">{entry.affirmations}</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </>
  );
}
