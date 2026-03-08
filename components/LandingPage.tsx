'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, User, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/Loading';
import { useToast } from '@/lib/toast-context';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export function LandingPage() {
  const router = useRouter();
  const { login, loginRankOperator } = useAuth();
  const { showToast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [splineMounted, setSplineMounted] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [rankUsername, setRankUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.classList.add('hide-scrollbar', 'on-landing-page');
    document.documentElement.classList.add('hide-scrollbar');
    return () => {
      document.body.classList.remove('hide-scrollbar', 'on-landing-page');
      document.documentElement.classList.remove('hide-scrollbar');
    };
  }, []);

  /* Lazy mount Spline untuk kurangi WebGL context loss (dev hot-reload, Strict Mode) */
  useEffect(() => {
    const t = setTimeout(() => setSplineMounted(true), 500);
    return () => clearTimeout(t);
  }, []);

  /* Tangkap error WebGL dari Spline */
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (e.message?.includes('WebGL') || e.message?.includes('THREE.')) {
        setSplineError(true);
      }
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  return (
    <>
    <motion.div
      className="min-h-screen landing-revamp font-manrope antialiased text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.12.67/build/spline-viewer.js"
        strategy="afterInteractive"
        type="module"
      />
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-white/10"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <nav className="landing-revamp-nav px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <button type="button" onClick={() => router.push('/landing')} className="cursor-pointer border-0 bg-transparent p-0 shrink-0">
            <span className="font-nexokora font-bold text-base tracking-[0.15em] uppercase text-white">
              X-Arena
            </span>
          </button>
          <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12 absolute left-1/2 -translate-x-1/2">
            <a href="#faqs" className="text-sm font-medium text-white/90 hover:text-white transition-colors no-underline">
              Company
            </a>
            <a href="#faqs" className="text-sm font-medium text-white/90 hover:text-white transition-colors no-underline">
              Features
            </a>
            <a href="#support" className="text-sm font-medium text-white/90 hover:text-white transition-colors no-underline">
              Resources
            </a>
            <a href="#faqs" className="text-sm font-medium text-white/90 hover:text-white transition-colors no-underline">
              Docs
            </a>
          </div>
        </nav>
      </motion.header>

      {/* Hero */}
      <section className="landing-revamp-hero pt-10 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: text + CTA */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              className="flex justify-center lg:justify-start mb-5"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
            >
              <span className="inline-flex items-center rounded-full border-2 border-transparent bg-gradient-to-r from-red-500/80 to-red-600/80 p-[2px]">
                <span className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white tracking-wide font-nexokora">
                  X-Arena
                </span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="font-manrope font-black text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] leading-tight tracking-tight text-white mb-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.3 }}
            >
              Real-Time Insights,
              <span className="text-red-500 block mt-1">Real-Time Results</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-base sm:text-[17px] text-gray-400 max-w-[420px] mx-auto lg:mx-0 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.42 }}
            >
              Track your performance, compete with your squad and climb the leaderboard. Gamified dashboard for targets and activities.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
            >
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="rounded-[50px] py-3 px-5 text-sm font-semibold text-gray-900 bg-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Get started <span>&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                className="landing-revamp-btn-doc rounded-[50px] py-3 px-5 text-sm font-semibold text-white border-2 border-red-500/60 hover:border-red-400/80 transition-colors flex items-center gap-2"
              >
                Your Rank <span>&gt;</span>
              </button>
            </motion.div>
          </div>

          {/* Right: Spline 3D */}
          <motion.div
            className="order-1 lg:order-2 relative w-full flex items-center justify-center spline-viewer-wrap overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          >
            <div className="spline-scale-wrap spline-canvas-size w-full h-full">
              {splineError ? (
                <div className="w-full h-full flex items-center justify-center bg-black/60 rounded-xl text-white/60 text-sm text-center px-4">
                  3D viewer tidak tersedia (WebGL terbatas). Coba tutup tab lain atau refresh halaman.
                </div>
              ) : splineMounted ? (
                <spline-viewer
                  url="https://prod.spline.design/IQ3NS9ogGSqrtRtb/scene.splinecode"
                  className="w-full h-full block"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-xl" aria-hidden="true" />
              )}
            </div>
          </motion.div>

        </div>
      </section>
    </motion.div>
      {typeof document !== 'undefined' && document.body && createPortal(
        <>
      {/* Modal Get started (Login) - portal ke body agar fixed center */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="landing-popup-glass relative overflow-hidden rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-heading font-bold text-white">Sign In</h2>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="landing-popup-label text-sm font-semibold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-red-500" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="landing-popup-input w-full px-4 py-3 rounded-lg transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="landing-popup-label text-sm font-semibold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="landing-popup-input w-full px-4 py-3 rounded-lg transition-colors"
                    />
                  </div>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="text-sm text-red-300">{loginError}</span>
                    </motion.div>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white border-2 border-red-500/60 hover:border-red-400/80 focus-visible:ring-red-500/30"
                    disabled={loginLoading}
                    onClick={async () => {
                      if (!loginUsername.trim() || !loginPassword) {
                        setLoginError('Please enter username and password');
                        showToast('Please enter username and password', 'warning', 3000);
                        return;
                      }
                      setLoginError('');
                      setLoginLoading(true);
                      try {
                        const success = await login(loginUsername.trim(), loginPassword);
                        if (success) {
                          showToast('Login successful! Welcome to X Arena Dashboard', 'success', 3000);
                          setShowLoginModal(false);
                          setTimeout(() => router.push('/'), 500);
                        } else {
                          setLoginError('Invalid username or password');
                          showToast('Invalid username or password', 'error', 4000);
                          setLoginLoading(false);
                        }
                      } catch (err) {
                        console.error('Login error:', err);
                        setLoginError('An error occurred. Please try again.');
                        showToast('An error occurred. Please try again.', 'error', 4000);
                        setLoginLoading(false);
                      }
                    }}
                  >
                    {loginLoading ? (
                      <>
                        <Loading size="sm" variant="minimal" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Your Rank */}
      <AnimatePresence>
        {showRankModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRankModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="landing-popup-glass relative overflow-hidden rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-heading font-bold text-white">Check Your Rank</h2>
                  <button
                    type="button"
                    onClick={() => setShowRankModal(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="landing-popup-label text-sm font-semibold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-red-500" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={rankUsername}
                      onChange={(e) => setRankUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="landing-popup-input w-full px-4 py-3 rounded-lg transition-colors"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="text-sm text-red-300">{error}</span>
                    </motion.div>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white border-2 border-red-500/60 hover:border-red-400/80 focus-visible:ring-red-500/30"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!rankUsername.trim()) {
                        setError('Please enter your username');
                        showToast('Please enter your username', 'warning', 3000);
                        return;
                      }
                      setError('');
                      setIsLoading(true);
                      try {
                        const success = await loginRankOperator(rankUsername.trim());
                        if (success) {
                          showToast(`Login successful! Welcome, ${rankUsername.trim()}`, 'success', 3000);
                          setShowRankModal(false);
                          setTimeout(() => router.push('/'), 500);
                        } else {
                          const msg = 'Invalid username. Only rank operators can access this feature.';
                          setError(msg);
                          showToast(msg, 'error', 4000);
                          setIsLoading(false);
                        }
                      } catch (err) {
                        console.error('Login error:', err);
                        const msg = 'An error occurred. Please try again.';
                        setError(msg);
                        showToast(msg, 'error', 4000);
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loading size="sm" variant="minimal" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      'View Rank'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
