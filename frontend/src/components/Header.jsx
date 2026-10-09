import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, LogIn, LogOut, LayoutDashboard, Briefcase, Newspaper, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Header Navigation Component:
 * - Brand logo & arch glyph
 * - Navigation links: Dashboard, Jobs, News (News visible even when logged out; Dashboard/Jobs open login modal when logged out)
 * - When logged out: "Log in" ghost button
 * - When logged in: avatar circle (first letter of email, amber) with a menu containing "Log out"
 * - Mobile responsive: collapses into a menu button with slide-down sheet
 */
export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isInitialStep = location.pathname === '/';

  const userInitial = (user?.email?.[0] || 'U').toUpperCase();

  const handleProtectedNav = (path) => {
    setIsMobileMenuOpen(false);
    if (!isAuthenticated) {
      openAuthModal(() => navigate(path));
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-warm/95 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-ink hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber rounded-lg px-1"
          aria-label="SkillBridge Home"
        >
          {/* Amber bridge / arch glyph */}
          <div className="w-8 h-8 rounded-xl bg-cream border border-amber/50 flex items-center justify-center shadow-soft-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F1B16"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19V12C4 8 7.5 5 12 5C16.5 5 20 8 20 12V19" />
              <path d="M4 19H20" />
              <path d="M9 19V11" />
              <path d="M15 19V11" />
            </svg>
          </div>

          <span className="font-bold text-lg tracking-tight text-ink">
            SkillBridge
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => handleProtectedNav('/dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber ${
              location.pathname.startsWith('/dashboard')
                ? 'bg-cream text-ink border border-amber/40 shadow-soft-sm'
                : 'text-ink-muted hover:text-ink hover:bg-cream/40'
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => handleProtectedNav('/jobs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber ${
              location.pathname === '/jobs'
                ? 'bg-cream text-ink border border-amber/40 shadow-soft-sm'
                : 'text-ink-muted hover:text-ink hover:bg-cream/40'
            }`}
          >
            Jobs
          </button>

          <Link
            to="/news"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber ${
              location.pathname === '/news'
                ? 'bg-cream text-ink border border-amber/40 shadow-soft-sm'
                : 'text-ink-muted hover:text-ink hover:bg-cream/40'
            }`}
          >
            News
          </Link>
        </nav>

        {/* Right Action: Auth Buttons / Avatar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Start Over button (if not on home) */}
          {!isInitialStep && (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink bg-surface hover:bg-cream border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              aria-label="Start over with a new resume"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start over</span>
            </Link>
          )}

          {/* If Logged Out: Show ghost button */}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-ink bg-transparent hover:bg-cream border border-surface-border transition-colors focus:outline-none focus:ring-2 focus:ring-amber shadow-soft-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          ) : (
            /* If Logged In: Avatar circle with drop down */
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 rounded-full bg-amber text-ink font-bold text-xs flex items-center justify-center border border-amber/80 shadow-soft-sm hover:ring-2 hover:ring-amber transition-all focus:outline-none focus:ring-2 focus:ring-amber"
                aria-label="User account menu"
                aria-expanded={isProfileMenuOpen}
              >
                {userInitial}
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-surface-border shadow-soft-lg py-2 z-30">
                    <div className="px-4 py-2 border-b border-surface-border">
                      <p className="text-[11px] font-semibold text-ink-muted">Signed in as</p>
                      <p className="text-xs font-bold text-ink truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-ink hover:bg-cream flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-ink-muted" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/jobs');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-ink hover:bg-cream flex items-center gap-2"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-ink-muted" />
                        <span>Target Jobs</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-coral hover:bg-coral/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-coral" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {!isInitialStep && (
            <Link
              to="/"
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream"
              aria-label="Start over"
            >
              <RotateCcw className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-ink rounded-xl hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-Down Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-surface-warm/95 px-4 pt-3 pb-5 space-y-2.5">
          <button
            type="button"
            onClick={() => handleProtectedNav('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink hover:bg-cream text-left"
          >
            <LayoutDashboard className="w-4 h-4 text-ink-muted" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleProtectedNav('/jobs')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink hover:bg-cream text-left"
          >
            <Briefcase className="w-4 h-4 text-ink-muted" />
            <span>Jobs</span>
          </button>

          <Link
            to="/news"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink hover:bg-cream text-left"
          >
            <Newspaper className="w-4 h-4 text-ink-muted" />
            <span>News</span>
          </Link>

          <div className="pt-2 border-t border-surface-border">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber text-ink text-center shadow-soft-sm"
              >
                Log in / Sign up
              </button>
            ) : (
              <div className="space-y-2">
                <div className="px-3 text-xs text-ink-muted">
                  Logged in as <strong className="text-ink">{user.email}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-coral bg-coral/15 hover:bg-coral/25 text-left flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-coral" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
