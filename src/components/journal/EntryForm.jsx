
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Target, CheckCircle, Send } from "lucide-react";

// Custom hook for autosaving
const useAutosave = (data, onSave, delay = 5000) => {
  const [isSaving, setIsSaving] = useState(false);
  const savedData = useRef(data);
  const timer = useRef(null);

  const save = useCallback(async () => {
    if (JSON.stringify(savedData.current) !== JSON.stringify(data)) {
      setIsSaving(true);
      await onSave(data, true);
      savedData.current = data;
      setIsSaving(false);
    }
  }, [data, onSave]);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      save();
    }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [data, save, delay]);

  const handleBlur = () => {
    save();
  };

  return { isSaving, handleBlur };
};


export default function EntryForm({ onSave, existingEntry, isLoading, onOpenFutureModal, dailyPrompt }) {
  const [brightSpots, setBrightSpots] = useState(existingEntry?.bright_spots || "");
  const [intentions, setIntentions] = useState(existingEntry?.intentions || "");
  
  // Parse affirmations into 3 separate lines
  const parseAffirmations = (text) => {
    if (!text) return ['', '', ''];
    const lines = text.split('\n').filter(line => line.trim());
    return [
      lines[0] || '',
      lines[1] || '',
      lines[2] || ''
    ];
  };
  
  const [affirmation1, setAffirmation1] = useState('');
  const [affirmation2, setAffirmation2] = useState('');
  const [affirmation3, setAffirmation3] = useState('');
  
  const [showSaved, setShowSaved] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (existingEntry) {
        setBrightSpots(existingEntry.bright_spots || "");
        setIntentions(existingEntry.intentions || "");
        
        const [aff1, aff2, aff3] = parseAffirmations(existingEntry.affirmations);
        setAffirmation1(aff1);
        setAffirmation2(aff2);
        setAffirmation3(aff3);
    }
  }, [existingEntry]);

  const handleManualSave = async () => {
    setShowSaved(false);
    const affirmations = [affirmation1, affirmation2, affirmation3]
      .filter(a => a.trim())
      .join('\n');
    
    const entry = {
      bright_spots: brightSpots,
      intentions: intentions,
      affirmations: affirmations,
      spark_prompt: dailyPrompt,
    };
    await onSave(entry, false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };
  
  const onAutosave = useCallback((data, isAutosave) => {
    const affirmations = [data.affirmation1, data.affirmation2, data.affirmation3]
      .filter(a => a.trim())
      .join('\n');
    
    const entry = {
      bright_spots: data.brightSpots,
      intentions: data.intentions,
      affirmations: affirmations,
      spark_prompt: dailyPrompt,
    };
    if (onSave) {
        onSave(entry, isAutosave)
    }
  }, [onSave, dailyPrompt]);
  
  const { handleBlur } = useAutosave(
    { brightSpots, intentions, affirmation1, affirmation2, affirmation3 },
    onAutosave
  );

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Today's Intentions */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible" 
        transition={{ delay: 0.1, duration: 0.6 }}
        className="section"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[var(--paper-accent)] rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="section-title">Today's Intentions</h3>
          </div>
        </div>
        <p className="section-sub ml-11">What are you excited to focus on?</p>
        
        <div className="ruled">
           <Textarea
              value={intentions}
              onBlur={handleBlur}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="Be present in conversations...&#10;Take a mindful walk..."
              className="input-line min-h-[75px]"
            />
        </div>
      </motion.div>

      {/* Affirmations */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, duration: 0.6 }}
        className="section"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[var(--paper-accent)] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="section-title">Affirmations</h3>
          </div>
        </div>
        <p className="section-sub ml-11">Positive statements to uplift you.</p>
        
        <div className="ruled space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base text-[var(--paper-ink-faded)] whitespace-nowrap">I am</span>
            <Input
              value={affirmation1}
              onBlur={handleBlur}
              onChange={(e) => setAffirmation1(e.target.value)}
              placeholder="capable of amazing things"
              className="input-line flex-grow"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-[var(--paper-ink-faded)] whitespace-nowrap">I am</span>
            <Input
              value={affirmation2}
              onBlur={handleBlur}
              onChange={(e) => setAffirmation2(e.target.value)}
              placeholder="choosing to be happy today"
              className="input-line flex-grow"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-[var(--paper-ink-faded)] whitespace-nowrap">I am</span>
            <Input
              value={affirmation3}
              onBlur={handleBlur}
              onChange={(e) => setAffirmation3(e.target.value)}
              placeholder="enough"
              className="input-line flex-grow"
            />
          </div>
        </div>
      </motion.div>

      {/* Bright Spots */}
      <motion.div
        variants={sectionVariants}
        initial="hidden" 
        animate="visible"
        transition={{ delay: 0.3, duration: 0.6 }}
        className="section"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[var(--paper-accent)] rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="section-title">Bright Spots</h3>
          </div>
        </div>
        <p className="section-sub ml-11">What made you smile or feel thankful today?</p>
        
        <div className="ruled">
            <Textarea
              value={brightSpots}
              onBlur={handleBlur}
              onChange={(e) => setBrightSpots(e.target.value)}
              placeholder="A kind word from a friend...&#10;The warmth of the sun...&#10;A delicious cup of coffee..."
              className="input-line min-h-[100px] resize-none overflow-hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center pb-8 flex flex-col items-center gap-4 w-full"
      >
        <Button
          onClick={handleManualSave}
          disabled={isLoading}
          className="btn-ink px-12 h-14 text-lg font-semibold w-full sm:w-64"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--paper-fg)] mr-2" />
              Saving...
            </>
          ) : showSaved ? (
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Saved!
            </motion.div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Save Today's Entry
            </>
          )}
        </Button>
        <Button
            variant="outline"
            onClick={onOpenFutureModal}
            className="btn-ink px-12 h-14 text-lg font-semibold w-full sm:w-64"
            disabled={isLoading}
        >
            <Send className="w-5 h-5 mr-2" />
            Send to Future You
        </Button>
      </motion.div>
    </div>
  );
}
