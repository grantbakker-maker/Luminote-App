import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ExportPreviewModal({ isOpen, onOpenChange, previewContent, format: fileFormat }) {
    
    const handleDownload = () => {
        const extension = {
            'PlainText': 'txt',
            'Markdown': 'md',
            'JSON': 'json'
        }[fileFormat] || 'txt';
        
        const fileName = `Luminote_Export_${format(new Date(), 'yyyy-MM-dd')}.${extension}`;
        const blob = new Blob([previewContent], { type: `text/${fileFormat.toLowerCase()};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col bg-[var(--paper-bg)] border-[var(--ui-border)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--paper-fg)]">Export Preview</DialogTitle>
                    <DialogDescription className="text-[var(--paper-ink-faded)]">
                        Review your generated export file below.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow py-4">
                    <Textarea
                        value={previewContent}
                        readOnly
                        className="w-full h-full resize-none bg-[var(--paper-bg-2)] border-[var(--ui-border)] text-[var(--paper-fg)]"
                        placeholder="Generating preview..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[var(--paper-ink-faded)]">Close</Button>
                    <Button onClick={handleDownload} className="btn-ink bg-[var(--paper-accent)] text-white hover:bg-[var(--paper-accent-2)]">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}