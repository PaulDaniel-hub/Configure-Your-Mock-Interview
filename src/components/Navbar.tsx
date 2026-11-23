import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { AppView } from '../types/interview';

interface NavbarProps {
  activeView: AppView;
  activeNavSection?: string;
  onNavigate: (view: AppView, sectionId?: string) => void;
  onStartInterview: () => void;
}

export function Navbar({ activeView, activeNavSection, onNavigate, onStartInterview }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (view: AppView, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  const handleCtaClick = () => {
    setMobileMenuOpen(false);
    onStartInterview();
  };

  const isHomeActive = activeView === 'landing' && activeNavSection !== 'features';
  const isFeaturesActive = activeView === 'landing' && activeNavSection === 'features';
  const isAboutActive = activeView === 'contact' && activeNavSection !== 'contact-form';
  const isContactActive = activeView === 'contact' && activeNavSection === 'contact-form';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080D1B]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 py-3.5 sm:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('landing')}
          className="flex shrink-0 items-center gap-2.5 text-left whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#477BFF]"
          aria-label="InterviewAce AI Home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#477BFF] to-[#8857FF] shadow-sm shadow-[#477BFF]/25"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15.5 9.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            InterviewAce AI
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          <button
            type="button"
            onClick={() => handleLinkClick('landing')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#477BFF] ${
              isHomeActive
                ? 'text-white underline decoration-[#477BFF] decoration-2 underline-offset-8'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('landing', 'features')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#477BFF] ${
              isFeaturesActive
                ? 'text-white underline decoration-[#477BFF] decoration-2 underline-offset-8'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('contact', 'about')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#477BFF] ${
              isAboutActive
                ? 'text-white underline decoration-[#477BFF] decoration-2 underline-offset-8'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            About
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('contact', 'contact-form')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#477BFF] ${
              isContactActive
                ? 'text-white underline decoration-[#477BFF] decoration-2 underline-offset-8'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleCtaClick}
            className="hidden rounded-lg bg-[#477BFF] px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#3A6DF0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6994FF] sm:inline-flex"
          >
            Start Interview
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 text-slate-200 hover:bg-slate-800/70 md:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-[#0D1426] px-5 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleLinkClick('landing')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/70"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'features')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/70"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('contact', 'about')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/70"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('contact', 'contact-form')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/70"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={handleCtaClick}
              className="mt-2 rounded-lg bg-[#477BFF] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#3A6DF0]"
            >
              Start Interview
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
