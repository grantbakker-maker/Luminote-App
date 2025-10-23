
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Send } from 'lucide-react';
import { format, addMonths, addYears, startOfYear } from 'date-fns';

export default function FutureMeModal({ isOpen, onOpenChange, onSchedule, currentEntry }) {
  const [note, setNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-populate note from current entry
      const brightSpotsText = currentEntry?.bright_spots;
      const intentionsText = currentEntry?.intentions;
      
      let prefilledText = `Dear Future Me,\n\n`;
      if (brightSpotsText) {
        prefilledText += `Remember this day? Here were some of the bright spots:\n${brightSpotsText}\n\n`;
      }
      if (intentionsText) {
        prefilledText += `You were focusing on these intentions:\n${intentionsText}\n\n`;
      }
      prefilledText += `A note from your past self:\n`;

      setNote(prefilledText);
      setDeliveryDate(addMonths(new Date(), 3)); // Default to 3 months
    }
  }, [isOpen, currentEntry]);

  const handleSchedule = () => {
    if (!note.trim()) {
      alert("Please write a note.");
      return;
    }
    if (!deliveryDate || deliveryDate <= new Date()) {
      alert("Choose a future date.");
      return;
    }
    
    onSchedule({ body: note, deliver_at: deliveryDate });
    // The onOpenChange(false) will be handled by the parent component after successful scheduling
  };

  const setQuickDate = (duration) => {
    if (duration === '3m') setDeliveryDate(addMonths(new Date(), 3));
    if (duration === '1y') setDeliveryDate(addYears(new Date(), 1));
    if (duration === 'jan1') setDeliveryDate(startOfYear(addYears(new Date(), 1)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[var(--paper-bg)] border-[var(--ui-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--paper-fg)]">Send a note to your future self</DialogTitle>
          <DialogDescription className="text-[var(--paper-ink-faded)]">
            Schedule a message to your future self. What do you want to remember?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
           <div>
             <label htmlFor="fn_noteText" className="text-sm font-medium text-[var(--paper-ink-faded)]">Your note</label>
             <Textarea
                id="fn_noteText"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dear Future Me..."
                rows={8}
                className="mt-1 bg-[var(--paper-bg-2)] border-[var(--ui-border)] text-[var(--paper-fg)]"
             />
           </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--paper-ink-faded)]">Deliver on</label>
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="btn-ink w-[220px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[var(--paper-bg)] border-[var(--ui-border)]">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                    disabled={(date) => date <= new Date()}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-2">
                <Button variant="outline" className="btn-ink" onClick={() => setQuickDate('3m')}>In 3 months</Button>
                <Button variant="outline" className="btn-ink" onClick={() => setQuickDate('1y')}>In 1 year</Button>
                <Button variant="outline" className="btn-ink" onClick={() => setQuickDate('jan1')}>Next Jan 1</Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[var(--paper-ink-faded)]">Cancel</Button>
          <Button onClick={handleSchedule} className="btn-ink bg-[var(--paper-accent)] text-white hover:bg-[var(--paper-accent-2)]">
            <Send className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
