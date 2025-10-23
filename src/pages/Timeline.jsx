
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import HeaderBar from '../components/layout/HeaderBar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function Timeline() {
  const navigate = useNavigate();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['timelineEntries'],
    queryFn: async () => {
      const allEntries = await base44.entities.Entry.filter({ archived: false }, '-date');
      return allEntries;
    },
  });

  const handleEntryClick = (entryId) => {
    navigate(createPageUrl(`NoteDetail?id=${entryId}`));
  };

  const getPreviewText = (entry) => {
    // Create a preview from available content
    const parts = [];
    if (entry.bright_spots) parts.push(entry.bright_spots);
    if (entry.intentions) parts.push(entry.intentions);
    if (entry.affirmations) parts.push(entry.affirmations);
    if (entry.body) parts.push(entry.body);
    
    const combined = parts.join(' • ');
    return combined.length > 120 ? combined.substring(0, 120) + '...' : combined || 'No content';
  };

  const getEntryIcon = (entry) => {
    if (entry.is_capsule) {
      if (entry.status === 'delivered') return '📬';
      if (entry.status === 'scheduled') return '🔒';
    }
    return '📝';
  };

  if (isLoading) {
    return (
       <>
        <HeaderBar title="Timeline" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
        <div className="text-center py-10">Loading timeline...</div>
      </>
    );
  }

  return (
    <>
      <HeaderBar title="Timeline" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
      <div className="py-8">
        {entries.length === 0 ? (
          <div className="text-center py-20 text-[var(--paper-ink-faded)]">
            <p>Your timeline is empty.</p>
            <p>Start by writing your first entry!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleEntryClick(entry.id)}
              >
                <div className="card-paper cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getEntryIcon(entry)}</span>
                        <p className="text-sm font-semibold text-[var(--paper-accent-2)]">
                          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      {entry.spark_prompt && (
                        <p className="text-xs italic text-[var(--paper-ink-faded)] mb-2">
                          "{entry.spark_prompt}"
                        </p>
                      )}
                      <p className="text-[var(--paper-ink-faded)] text-sm leading-relaxed">
                        {getPreviewText(entry)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--paper-ink-faded)] flex-shrink-0 mt-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
