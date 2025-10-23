
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Settings, ArrowLeft } from 'lucide-react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d176743803d8bf0a392888/72bf47d21_logo.png";

export default function HeaderBar({ title, leftIcon, onLeft, onRight, rightIcon, showLogo = false, logoPosition = 'right' }) {
  const navigate = useNavigate();

  const handleLeftClick = () => {
    if (onLeft) {
      navigate(createPageUrl(onLeft));
    } else {
      navigate(-1);
    }
  };

  const handleRightClick = () => {
    if (onRight) {
      navigate(createPageUrl(onRight));
    }
  };

  const renderIcon = (icon) => {
    switch (icon) {
      case 'settings':
        return <Settings className="w-6 h-6 text-[var(--paper-ink-faded)]" />;
      case 'back':
        return <ArrowLeft className="w-6 h-6 text-[var(--paper-ink-faded)]" />;
      default:
        return null;
    }
  };

  const renderTitle = () => {
    if (title === 'Luminote') {
      return (
        <>
          Lumin<span style={{ color: 'var(--header-accent)' }}>o</span>te
        </>
      );
    }
    return title;
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-[var(--paper-bg)] bg-opacity-80 backdrop-blur-sm border-b border-[var(--paper-line)]">
      <div className="w-12 flex items-center">
        {showLogo && logoPosition === 'left' ? (
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
        ) : leftIcon ? (
          <button onClick={handleLeftClick} className="p-2 rounded-full hover:bg-[var(--paper-bg-2)]">
            {renderIcon(leftIcon)}
          </button>
        ) : null}
      </div>
      <h1 className="text-center font-semibold" style={{
        fontFamily: 'Montserrat',
        fontSize: title === 'Luminote' ? '2rem' : '1.75rem',
        fontWeight: 600,
        color: 'var(--header-title)',
        lineHeight: 1.2
      }}>{renderTitle()}</h1>
      <div className="w-12 flex justify-end items-center">
        {showLogo && logoPosition === 'right' ? (
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
        ) : rightIcon ? (
          <button onClick={handleRightClick} className="p-2 rounded-full hover:bg-[var(--paper-bg-2)]">
            {renderIcon(rightIcon)}
          </button>
        ) : null}
      </div>
    </header>
  );
}
