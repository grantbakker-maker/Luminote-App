
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import HeaderBar from '../components/layout/HeaderBar';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const navigate = useNavigate();
    const premiumActive = true; // Hardcoded for full access

    const { data: allEntries = [], isLoading } = useQuery({
        queryKey: ['allEntries'],
        queryFn: async () => {
            const entries = await base44.entities.Entry.filter({ archived: false }, '-date');
            return entries;
        },
    });

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = allEntries.filter(entry => {
            const searchableText = [
                entry.bright_spots,
                entry.intentions,
                entry.affirmations,
                entry.body,
                entry.spark_prompt,
                format(new Date(entry.date), 'MMMM d, yyyy')
            ].filter(Boolean).join(' ').toLowerCase();

            return searchableText.includes(query);
        });

        setFilteredResults(results);
    }, [searchQuery, allEntries]);

    const handleEntryClick = (entryId) => {
        navigate(createPageUrl(`NoteDetail?id=${entryId}`));
    };

    const getPreviewText = (entry, query) => {
        const parts = [];
        if (entry.bright_spots) parts.push(entry.bright_spots);
        if (entry.intentions) parts.push(entry.intentions);
        if (entry.affirmations) parts.push(entry.affirmations);
        if (entry.body) parts.push(entry.body);
        
        const combined = parts.join(' • ');
        
        // Find the query in the text and show context around it
        if (query.trim()) {
            const lowerCombined = combined.toLowerCase();
            const queryIndex = lowerCombined.indexOf(query.toLowerCase());
            
            if (queryIndex !== -1) {
                const start = Math.max(0, queryIndex - 50);
                const end = Math.min(combined.length, queryIndex + query.length + 50);
                const preview = (start > 0 ? '...' : '') + 
                               combined.substring(start, end) + 
                               (end < combined.length ? '...' : '');
                return preview;
            }
        }
        
        return combined.length > 120 ? combined.substring(0, 120) + '...' : combined || 'No content';
    };

    const highlightMatch = (text, query) => {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? 
                <mark key={index} className="bg-[var(--paper-accent)] bg-opacity-30 px-1 rounded">{part}</mark> : 
                part
        );
    };

    const getEntryIcon = (entry) => {
        if (entry.is_capsule) {
            if (entry.status === 'delivered') return '📬';
            if (entry.status === 'scheduled') return '🔒';
        }
        return '📝';
    };

    return (
        <>
            <HeaderBar title="Search" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
            <div className="py-6">
                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--paper-ink-faded)]" />
                        <Input
                            type="text"
                            placeholder="Search your journal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-12 text-base bg-[var(--paper-bg-2)] border-[var(--paper-line)] focus:border-[var(--paper-accent-2)]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--paper-ink-faded)] hover:text-[var(--paper-fg)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="text-center py-10 text-[var(--paper-ink-faded)]">Loading...</div>
                ) : !searchQuery.trim() ? (
                    <div className="text-center py-20 text-[var(--paper-ink-faded)]">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)] opacity-50" />
                        <p className="font-semibold">Search your journal</p>
                        <p className="text-sm">Find entries by keyword, date, or phrase</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-20 text-[var(--paper-ink-faded)]">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-[var(--paper-accent)] opacity-50" />
                        <p className="font-semibold">No matches found</p>
                        <p className="text-sm">Try a different search term</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--paper-ink-faded)] mb-4">
                            Found {filteredResults.length} {filteredResults.length === 1 ? 'entry' : 'entries'}
                        </p>
                        {filteredResults.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleEntryClick(entry.id)}
                            >
                                <div className="card-paper cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{getEntryIcon(entry)}</span>
                                                <p className="text-sm font-semibold text-[var(--paper-accent-2)]">
                                                    {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                                                </p>
                                            </div>
                                            {entry.spark_prompt && searchQuery && entry.spark_prompt.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                                <p className="text-xs italic text-[var(--paper-ink-faded)] mb-2">
                                                    {highlightMatch(`"${entry.spark_prompt}"`, searchQuery)}
                                                </p>
                                            )}
                                            <p className="text-[var(--paper-ink-faded)] text-sm leading-relaxed">
                                                {highlightMatch(getPreviewText(entry, searchQuery), searchQuery)}
                                            </p>
                                        </div>
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
