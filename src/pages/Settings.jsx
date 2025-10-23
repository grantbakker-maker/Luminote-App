
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeaderBar from '../components/layout/HeaderBar';
import ExportPreviewModal from '../components/settings/ExportPreviewModal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { addDays, format, subDays, parseISO } from "date-fns";

const SettingsSection = ({ title, children }) => (
  <div>
    <h2 className="section-title px-4 mb-2">{title}</h2>
    <div className="card-paper divide-y divide-[var(--paper-line)] p-0">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ label, description, children, disabled = false }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex-grow sm:pr-4">
      <Label className="font-semibold text-base">{label}</Label>
      {description && <p className="text-sm text-[var(--paper-ink-faded)]">{description}</p>}
    </div>
    <div className={`flex-shrink-0 ${disabled ? 'pointer-events-none' : ''}`}>{children}</div>
  </div>
);


export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [exportFormat, setExportFormat] = useState('PlainText');
  const [includeCapsules, setIncludeCapsules] = useState(true);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Local state for UI controls
  const [localSparkEnabled, setLocalSparkEnabled] = useState(true);
  const [localSparkMode, setLocalSparkMode] = useState('prompt');
  const [localSparkTheme, setLocalSparkTheme] = useState('random');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (user) {
      setLocalSparkEnabled(!!user.daily_spark_enabled);
      setLocalSparkMode(user.spark_mode || 'prompt');
      setLocalSparkTheme(user.daily_spark_theme || 'random');
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (newSettings) => base44.auth.updateMe(newSettings),
    onSuccess: (data, variables) => {
      // Invalidate the query to force a refetch, ensuring all components have fresh data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Custom toast messages
      if ('export_last_used_range' in variables) {
          toast({ description: "Export ready to share." });
      } else if ('daily_spark_enabled' in variables || 'daily_spark_theme' in variables || 'spark_mode' in variables) {
          toast({ description: "Daily Spark settings saved."});
      } else {
          toast({ description: "Settings saved." });
      }
    },
    onError: (error) => {
        console.error("Failed to update settings:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save settings. Please try again." });
        // On error, invalidate to refetch and revert optimistic UI
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const handleSettingChange = (key, value) => {
    // Update local state immediately for snappy UI
    if (key === 'daily_spark_enabled') setLocalSparkEnabled(value);
    if (key === 'spark_mode') setLocalSparkMode(value);
    if (key === 'daily_spark_theme') setLocalSparkTheme(value);

    // Persist change to backend
    if (user) {
      updateUserMutation.mutate({ [key]: value });
    }
  };

  const generateExportContent = (entries, formatType) => {
    if (!entries || entries.length === 0) return "";
    const range = `Range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`;
    const count = `Count: ${entries.length}`;

    if (formatType === 'JSON') {
        return JSON.stringify(entries, null, 2);
    }

    if (formatType === 'Markdown') {
        const header = `# Luminote Export\n\n**${range}**\n\n**${count}**\n\n`;
        const body = entries.map(note => {
            const date = `## Date: ${format(new Date(note.created_at), "yyyy-MM-dd HH:mm")}`;
            const type = `**Type:** \`${note.is_capsule ? note.status : "journal"}\``;
            let entryBody = "";
            if(note.bright_spots && note.bright_spots.length) entryBody += `### Bright Spots\n${note.bright_spots.map(s => `- ${s}`).join('\n')}\n`;
            if(note.intentions && note.intentions.length) entryBody += `### Intentions\n${note.intentions.map(s => `- ${s}`).join('\n')}\n`;
            if(note.affirmations && note.affirmations.length) entryBody += `### Affirmations\n${note.affirmations.map(s => `- ${s}`).join('\n')}\n`;
            if(note.body) entryBody += `### Note\n${note.body}\n`;
            return `${date}\n${type}\n\n${entryBody}`;
        }).join('\n---\n');
        return header + body;
    }

    // Default to PlainText
    const header = `Luminote Export\n${range}\n${count}\n\n`;
    const body = entries.map(note => {
        const date = `Date: ${format(new Date(note.created_at), "yyyy-MM-dd HH:mm")}`;
        const type = `Type: ${note.is_capsule ? note.status : "journal"}`;
        let entryBody = "";
        if(note.bright_spots && note.bright_spots.length) entryBody += `Bright Spots:\n${note.bright_spots.map(s => `  - ${s}`).join('\n')}\n`;
        if(note.intentions && note.intentions.length) entryBody += `Intentions:\n${note.intentions.map(s => `  - ${s}`).join('\n')}\n`;
        if(note.affirmations && note.affirmations.length) entryBody += `Affirmations:\n${note.affirmations.map(s => `  - ${s}`).join('\n')}\n`;
        if(note.body) entryBody += `Note:\n${note.body}\n`;
        return `${date}\n${type}\n${entryBody}`;
    }).join('----------------------------------------\n');
    return header + body;
  };

  const handleGenerateExport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
        toast({ variant: "destructive", description: "Please choose a date range." });
        return null;
    }
    setIsGenerating(true);
    try {
        const filter = {
            created_at: {
                $gte: format(dateRange.from, "yyyy-MM-dd'T'00:00:00"),
                $lte: format(dateRange.to, "yyyy-MM-dd'T'23:59:59"),
            }
        };
        if (!includeCapsules) {
            filter.is_capsule = false;
        }

        const entries = await base44.entities.Entry.filter(filter, 'created_at');

        if (entries.length > 5000) {
            toast({
                title: "Large Export",
                description: `Your export of ${entries.length} entries may take a moment to generate.`,
            });
        }
        
        if (entries.length === 0) {
            toast({ description: "No entries found in that date range." });
            return null;
        }

        const content = generateExportContent(entries, exportFormat);
        return { content, count: entries.length };
    } catch (error) {
        console.error("Export error:", error);
        toast({ variant: "destructive", description: "Failed to generate export." });
        return null;
    } finally {
        setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    const result = await handleGenerateExport();
    if (result && result.content !== null) { // Check for null explicitly
        setPreviewContent(result.content);
        setPreviewModalOpen(true);
    }
  };

  const handleShare = async () => {
    const result = await handleGenerateExport();
    if (!result) return;

    const { content, count } = result;

    const extension = { 'PlainText': 'txt', 'Markdown': 'md', 'JSON': 'json' }[exportFormat] || 'txt';
    const mimeType = { 'PlainText': 'text/plain', 'Markdown': 'text/markdown', 'JSON': 'application/json' }[exportFormat] || 'text/plain';
    const fileName = `Luminote_Export_${format(new Date(), 'yyyy-MM-dd')}.${extension}`;
    
    const blob = new Blob([content], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Luminote Export',
                text: `Luminote export (${count} entries)`,
            });
        } catch (error) {
            if (error.name !== 'AbortError') console.error('Share failed:', error);
        }
    } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    updateUserMutation.mutate({
        export_last_used_range: {
            start: format(dateRange.from, 'yyyy-MM-dd'),
            end: format(dateRange.to, 'yyyy-MM-dd'),
            count: count,
        }
    });
  };

  if (isLoading || !user) {
    return (
      <>
        <HeaderBar title="Settings" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
        <div className="text-center py-20">Loading settings...</div>
      </>
    );
  }
  
  const handleDateChange = (field, value) => {
    if (value) {
      setDateRange(prev => ({ ...prev, [field]: parseISO(value) }));
    } else {
      // If the input is cleared, set the date field to null
      setDateRange(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <>
      <HeaderBar title="Settings" leftIcon="back" onLeft="Journal" showLogo={true} logoPosition="right" />
      <div className="py-8 space-y-8">
        
        <SettingsSection title="Daily Spark">
          <SettingsRow label="Enable Daily Spark">
            <Switch
              id="sw_dailySparkEnabled"
              checked={localSparkEnabled}
              onCheckedChange={(checked) => handleSettingChange('daily_spark_enabled', checked)}
            />
          </SettingsRow>
          <SettingsRow label="Mode" disabled={!localSparkEnabled}>
            <Select
              value={localSparkMode}
              onValueChange={(value) => handleSettingChange('spark_mode', value)}
              disabled={!localSparkEnabled}
            >
              <SelectTrigger id="dd_sparkMode" className="w-[180px] btn-ink">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt">Prompts</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow label="Theme" disabled={!localSparkEnabled}>
            <Select
              value={localSparkTheme}
              onValueChange={(value) => handleSettingChange('daily_spark_theme', value)}
              disabled={!localSparkEnabled}
            >
              <SelectTrigger id="dd_dailySparkTheme" className="w-[180px] btn-ink">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="gratitude">Gratitude</SelectItem>
                <SelectItem value="reflection">Reflection</SelectItem>
                <SelectItem value="creativity">Creativity</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </SettingsSection>
        
        <SettingsSection title="Export Data">
            <SettingsRow label="Date Range">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="date"
                        value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        className="btn-ink"
                        aria-label="Start Date"
                    />
                    <Input
                        type="date"
                        value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        className="btn-ink"
                        aria-label="End Date"
                    />
                </div>
            </SettingsRow>
            <SettingsRow label="Include Capsules" description="Include sealed & delivered notes.">
                <Switch
                    id="sw_includeCapsules"
                    checked={includeCapsules}
                    onCheckedChange={setIncludeCapsules}
                />
            </SettingsRow>
             <SettingsRow label="Export Format">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-[180px] btn-ink">
                        <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PlainText">Plain Text</SelectItem>
                        <SelectItem value="Markdown">Markdown</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                    </SelectContent>
                </Select>
            </SettingsRow>
             <SettingsRow label="Actions">
                <div className="flex gap-2">
                    <Button variant="outline" className="btn-ink" onClick={handlePreview} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Preview'}
                    </Button>
                    <Button className="btn-ink bg-[var(--paper-accent)] text-white hover:bg-[var(--paper-accent-2)]" onClick={handleShare} disabled={isGenerating}>
                        {isGenerating ? 'Sharing...' : 'Share'}
                    </Button>
                </div>
            </SettingsRow>
        </SettingsSection>

        {/* Legal Links */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--paper-ink-faded)]">
            <a 
              href="https://www.luminoteapp.com/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[var(--paper-accent-2)] transition-colors"
            >
              Privacy Policy
            </a>
            <span>|</span>
            <a 
              href="https://www.luminoteapp.com/terms.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[var(--paper-accent-2)] transition-colors"
            >
              Terms of Use
            </a>
          </div>
        </div>

      </div>
      <ExportPreviewModal
        isOpen={isPreviewModalOpen}
        onOpenChange={setPreviewModalOpen}
        previewContent={previewContent}
        format={exportFormat}
      />
    </>
  );
}
