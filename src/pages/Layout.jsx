

import React, { useEffect } from "react";
import BottomNav from "./components/layout/BottomNav";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
  const premiumActive = true; // Hardcoded for full access

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    const applyTheme = (theme) => {
      root.classList.remove('light-theme', 'dark-theme');
      root.classList.add(`${theme}-theme`);
    };

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
    
  }, []);

  return (
    <>
      <style>{`
        :root, .light-theme {
          /* Paper & ink */
          --paper-bg: #F8F1E6;
          --paper-bg-2: #F5EBDC;
          --paper-fg: #2B2A27;
          --paper-ink-faded: #5c584e;
          --paper-line: rgba(60, 54, 42, 0.18);
          --paper-accent: #C7A27A;
          --paper-accent-2: #A67C52;

          /* State & UI */
          --ui-muted: rgba(43,42,39,0.55);
          --ui-border: rgba(43,42,39,0.18);
          --ui-success: #6B8E23;
          
          /* Header title */
          --header-title: #3C2A21;
          --header-accent: #F7C948;
        }

        .dark-theme {
          --paper-bg: #2B2A27;
          --paper-bg-2: #383632;
          --paper-fg: #EAE3D9;
          --paper-ink-faded: #9e9a8f;
          --paper-line: rgba(200, 180, 150, 0.15);
          --paper-accent: #C7A27A;
          --paper-accent-2: #D9BB99;

          --ui-muted: rgba(234, 227, 217, 0.55);
          --ui-border: rgba(234, 227, 217, 0.12);
          --ui-success: #8FBC8F;
          
          /* Header title for dark mode */
          --header-title: #EAE3D9;
          --header-accent: #F7C948;
        }

        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Montserrat:wght@600&display=swap');
        :root {
          /* Typography */
          --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
          --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-type: "Caveat", cursive;
          --font-display: "Montserrat", sans-serif;

          /* Rounding & shadows */
          --radius: 14px;
          --shadow-ink: 0 1px 0 rgba(0,0,0,0.04);
          --shadow-paper: 0 10px 20px rgba(77, 63, 38, 0.08);
          --shadow-note: 0 2px 8px rgba(67, 54, 34, 0.12);
        }
        
        .dark-theme {
            --shadow-paper: 0 10px 20px rgba(0, 0, 0, 0.2);
            --shadow-note: 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        body {
          background: var(--paper-bg);
          color: var(--paper-fg);
          font-family: var(--font-serif);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Hide scrollbars globally while keeping scroll functionality */
        * {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        *::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* App page structure */
        .app-page {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        /* Typography */
        .section-title {
            font-family: var(--font-sans);
            font-weight: 600;
            font-size: 1.125rem;
            color: var(--paper-fg);
        }
        .section-sub {
            font-size: 0.9rem;
            color: var(--paper-ink-faded);
        }

        /* Card styles */
        .card-paper {
            background-color: var(--paper-bg-2);
            border-radius: var(--radius);
            padding: 1.25rem;
            box-shadow: var(--shadow-note);
            border: 1px solid var(--paper-line);
        }

        .memory-card {
            background-color: var(--paper-bg-2);
            padding: 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-note);
            position: relative;
            border: 1px solid var(--paper-line);
        }
        
        .memory-label {
            font-family: var(--font-type);
            color: var(--paper-accent-2);
            font-size: 1.125rem;
            margin-bottom: 0.25rem;
        }

        .memory-date {
            font-size: 0.8rem;
            color: var(--paper-ink-faded);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* Quote / Spark styling */
        .quote-note {
          border-left: 3px solid var(--paper-accent);
          padding-left: 1rem;
          margin: 1rem 0;
        }

        .quote-text {
            font-style: italic;
            color: var(--paper-ink-faded);
        }
        
        /* Entry Form specific styles */
        .section {
          padding: 0 0.5rem;
        }
        .ruled {
            margin-left: 2.75rem;
            border-top: 1px solid var(--paper-line);
            padding-top: 1rem;
            space-y: 0.25rem;
        }
        .input-line {
            background-color: var(--paper-bg);
            border: 1px solid var(--paper-line);
            border-radius: calc(var(--radius) - 4px);
            padding: 0.75rem 1rem;
            width: 100%;
            font-size: 1rem;
            line-height: 1.6;
        }
        .input-line::placeholder {
            color: var(--ui-muted);
        }
        .input-line:focus {
            box-shadow: none;
            outline: none;
            border-color: var(--paper-accent-2);
        }
        
        /* ShadCN overrides */
        .btn-ink {
            background-color: var(--paper-bg-2);
            color: var(--paper-fg);
            border: 1px solid var(--ui-border);
        }
        .btn-ink:hover {
            background-color: var(--paper-bg);
        }
        .btn-ghost {
            color: var(--paper-ink-faded);
        }
        .btn-ghost:hover {
            background-color: var(--paper-bg-2);
            color: var(--paper-fg);
        }
      `}</style>
      <div className="min-h-screen">
        <main className="pb-24">
          <div className="app-page">
            {children}
          </div>
        </main>
        <BottomNav premiumActive={premiumActive} />
      </div>
    </>
  );
}

