
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from "framer-motion";
import { format, subDays, subYears, isSameDay, startOfDay } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import HeaderBar from "../components/layout/HeaderBar";
import DailySpark from "../components/journal/DailySpark";
import EntryForm from "../components/journal/EntryForm";
import TimeCapsule from "../components/journal/TimeCapsule";
import StreakDisplay from "../components/journal/StreakDisplay";
import FutureMeModal from "../components/journal/FutureMeModal";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

const SPARK_PROMPTS = {
  gratitude: ["What made you smile today?", "Who helped you recently?", "Name 3 small wins.", "What comfort are you grateful for?"],
  reflection: ["What did today teach you?", "One thing you'd do differently?", "A moment you want to remember.", "What surprised you?"],
  creativity: ["Invent a tiny ritual.", "Write a 2-line poem.", "Describe a color without naming it.", "If today was a song…"],
  relationships: ["Who deserves a thank-you?", "A conversation to start.", "How did you show up for someone?", "Who energized you today?"],
  wellness: ["How does your body feel?", "Energy level 1–10 & why.", "What calmed you today?", "What boundary did you keep?"]
};

const SPARK_QUOTES = {
  gratitude: ["\"Gratitude is the healthiest of all human emotions.\" - Zig Ziglar", "\"He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.\" - Epictetus"],
  reflection: ["\"The unexamined life is not worth living.\" - Socrates", "\"We do not learn from experience... we learn from reflecting on experience.\" - John Dewey"],
  creativity: ["\"Creativity is intelligence having fun.\" - Albert Einstein", "\"You can't use up creativity. The more you use, the more you have.\" - Maya Angelou"],
  relationships: ["\"The best thing to hold onto in life is each other.\" - Audrey Hepburn", "\"A real friend is one who walks in when the rest of the world walks out.\" - Walter Winchell"],
  wellness: ["\"The greatest wealth is health.\" - Virgil", "\"Take care of your body. It's the only place you have to live.\" - Jim Rohn"]
};

// Simple hash function to get a consistent number for a string
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export default function Journal() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [dailyPrompt, setDailyPrompt] = useState(''); // New state for daily prompt
  const [pastEntries, setPastEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user || !user.daily_spark_enabled) {
        setDailyPrompt('');
        return;
    }

    const mode = user.spark_mode || 'prompt';
    const bank = mode === 'quote' ? SPARK_QUOTES : SPARK_PROMPTS;
    
    const themes = Object.keys(bank);
    let theme = user.daily_spark_theme || 'random';
    if (theme === 'random') {
        // Use day of the year to pick a random theme that's stable for the day
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        theme = themes[dayOfYear % themes.length];
    }
    
    const prompts = bank[theme];
    if (prompts) {
        const seed = format(new Date(), "yyyy-MM-dd");
        const hash = simpleHash(seed + theme);
        const index = (Math.abs(hash) % prompts.length);
        setDailyPrompt(prompts[index]);
    }
  }, [user]);

  const calculateStreak = useCallback((entries) => {
    if (entries.length === 0) {
      setStreak(0);
      return;
    }

    // Normalize all dates to start of day for accurate comparison
    const sortedDates = entries
      .map(entry => startOfDay(new Date(entry.date)))
      .sort((a, b) => b - a); // Sort descending

    let currentStreak = 0;
    let checkDate = startOfDay(new Date()); // Start checking from today

    // Check if there's an entry today
    const hasEntryToday = sortedDates.some(date => 
      date.getTime() === checkDate.getTime()
    );
    
    // If no entry today, but there was an entry yesterday, streak is still active from yesterday.
    // So, we adjust checkDate to yesterday to correctly count the streak.
    if (!hasEntryToday && sortedDates.some(date => date.getTime() === subDays(checkDate, 1).getTime())) {
        checkDate = subDays(checkDate, 1);
    } else if (!hasEntryToday) {
        // If no entry today and no entry yesterday, streak is 0 or needs to start from the most recent entry.
        // We ensure checkDate is not ahead of the latest entry if there's a gap.
        // For example, if latest entry is 2 days ago, and no entry today/yesterday, the streak is 0.
        // The loop below will handle this by breaking.
    }

    // Count consecutive days backwards
    for (const entryDate of sortedDates) {
        if (entryDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else if (entryDate < checkDate) {
            // Gap found, streak is broken
            break;
        }
        // If entryDate is same as checkDate, but we already counted it, it means duplicate entry for same day
        // This won't cause issue as entryDate will be equal and checkDate would have been decremented
        // We're iterating sortedDates, so duplicate dates would appear next to each other.
        // The checkDate will decrement only once for a given day.
    }
    
    setStreak(currentStreak);
  }, []);

  const unlockDueCapsules = useCallback(async () => {
    try {
      const scheduledCapsules = await base44.entities.Entry.filter({
        is_capsule: true,
        status: 'scheduled',
      });
      
      const now = new Date();
      const dueCapsules = scheduledCapsules.filter(c => new Date(c.deliver_at) <= now);

      if (dueCapsules.length > 0) {
        const updatePromises = dueCapsules.map(capsule => {
          // Migrate array fields to strings if needed
          const updateData = {
            status: 'delivered',
            delivered_at: now.toISOString(),
          };
          
          // Convert arrays to strings for data migration
          if (Array.isArray(capsule.bright_spots)) {
            updateData.bright_spots = capsule.bright_spots.join('\n');
          }
          if (Array.isArray(capsule.intentions)) {
            updateData.intentions = capsule.intentions.join('\n');
          }
          if (Array.isArray(capsule.affirmations)) {
            updateData.affirmations = capsule.affirmations.join('\n');
          }
          
          return base44.entities.Entry.update(capsule.id, updateData);
        });
        await Promise.all(updatePromises);
        
        const firstCapsule = dueCapsules[0];
        toast({
          title: "A note from your past self",
          description: `Your Luminote from ${format(new Date(firstCapsule.date), "MMM d, yyyy")} has arrived.`,
          action: (
              <ToastAction asChild altText="View note">
                  <Link to={createPageUrl(`NoteDetail?id=${firstCapsule.id}`)}>View</Link>
              </ToastAction>
          ),
          duration: 8000,
        });
      }
    } catch (error) {
      console.error("Error unlocking due capsules:", error);
    }
  }, [toast]);

  const loadData = useCallback(async () => {
    try {
      // Changed to use base44.entities.Entry.filter
      const allEntries = await base44.entities.Entry.filter({}, "-date");
      const todayData = allEntries.find(e => e.date === today);
      setTodayEntry(todayData || null);

      // Removed allQuotes and todayQuote related logic

      const oneMonthAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const oneYearAgo = format(subYears(new Date(), 1), "yyyy-MM-dd");
      const pastEntriesData = allEntries.filter(e => e.date === oneMonthAgo || e.date === oneYearAgo);
      setPastEntries(pastEntriesData);

      setTotalEntries(allEntries.length);
      calculateStreak(allEntries);

    } catch (error) {
      console.error("Error loading journal data:", error);
    } finally {
      // This is now handled in the main useEffect
    }
  }, [today, calculateStreak]);

  useEffect(() => {
    const initializeApp = async () => {
      setIsInitialLoading(true);
      await unlockDueCapsules();
      await loadData();
      setIsInitialLoading(false);
    };
    initializeApp();
  }, [loadData, unlockDueCapsules]);


  const handleSaveEntry = async (entryData, isAutosave) => {
    if (!isAutosave) setIsLoading(true);
    
    try {
      // Find the existing entry again to prevent race conditions, especially for autosave
      const existingEntriesToday = await base44.entities.Entry.filter({ date: today }); // Changed to use base44.entities.Entry.filter
      const currentTodayEntry = existingEntriesToday[0];

      const entryPayload = {
        date: today,
        spark_prompt: dailyPrompt, // New: Add dailyPrompt
        // Removed quote_id: todayQuote?.id || null,
        ...entryData
      };
      
      if (currentTodayEntry) {
        // Only update if there are actual changes
        const hasChanges = Object.keys(entryPayload).some(key => 
          JSON.stringify(currentTodayEntry[key]) !== JSON.stringify(entryPayload[key])
        );
        if(hasChanges){
            await base44.entities.Entry.update(currentTodayEntry.id, entryPayload); // Changed to use base44.entities.Entry.update
            // If it's not an autosave, or if there were changes and it was an autosave, update the local state
            // to reflect the latest changes. For autosave, we only update todayEntry to prevent a full reload
            if (isAutosave) {
              setTodayEntry({ ...currentTodayEntry, ...entryPayload });
            }
        }
      } else {
        await base44.entities.Entry.create(entryPayload); // Changed to use base44.entities.Entry.create
      }
      
      if (!isAutosave) {
        await loadData(); // Only perform full reload on manual save
      }
      
      // Invalidate Timeline cache so it shows the updated entry
      queryClient.invalidateQueries({ queryKey: ['timelineEntries'] });

    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      if (!isAutosave) setIsLoading(false);
    }
  };
  
  const handleScheduleCapsule = async (capsuleData) => {
    setIsLoading(true);
    try {
        const existingEntriesToday = await base44.entities.Entry.filter({ date: today }); // Changed to use base44.entities.Entry.filter
        const currentTodayEntry = existingEntriesToday[0];
        
        // Combine with existing data from the form
        const entryPayload = {
            ...(todayEntry || {}), // Use an empty object if todayEntry is null to prevent error
            date: today,
            // Removed quote_id: todayQuote?.id || null,
            ...capsuleData,
            is_capsule: true,
            status: 'scheduled',
        };
        
        if (currentTodayEntry) {
            await base44.entities.Entry.update(currentTodayEntry.id, entryPayload); // Changed to use base44.entities.Entry.update
        } else {
            // If there's no entry for today yet, create one with the capsule data
            await base44.entities.Entry.create(entryPayload); // Changed to use base44.entities.Entry.create
        }
        await loadData(); // Reload to reflect the capsule status
        
        // Invalidate Timeline cache
        queryClient.invalidateQueries({ queryKey: ['timelineEntries'] });
        
        toast({
          description: `We’ll deliver this on ${format(new Date(capsuleData.deliver_at), "MMM d, yyyy")}.`,
        });
    } catch(error) {
        console.error("Error scheduling capsule:", error);
    } finally {
        setIsLoading(false);
        setIsFutureModalOpen(false); // Close modal after scheduling
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--paper-accent)] mx-auto mb-4"></div>
          <p className="text-lg text-[var(--paper-ink-faded)]">Loading your bright journal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <HeaderBar title="Luminote" rightIcon="settings" onRight="Settings" showLogo={true} logoPosition="left" />
      <div className="pt-4 pb-12">
        <StreakDisplay streak={streak} totalEntries={totalEntries} />
        { dailyPrompt && <DailySpark prompt={dailyPrompt} /> }
        <EntryForm
          onSave={handleSaveEntry}
          existingEntry={todayEntry}
          isLoading={isLoading}
          onOpenFutureModal={() => setIsFutureModalOpen(true)}
          dailyPrompt={dailyPrompt}
        />
        <TimeCapsule pastEntries={pastEntries} isLoading={false} />
      </div>
      <FutureMeModal
        isOpen={isFutureModalOpen}
        onOpenChange={setIsFutureModalOpen}
        onSchedule={handleScheduleCapsule}
        currentEntry={todayEntry}
      />
    </>
  );
}
