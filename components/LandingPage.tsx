'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, Zap, Users, Target, Award, TrendingUp, X, AlertCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/Loading';
import { useToast } from '@/lib/toast-context';
import { useTheme } from '@/lib/theme-context';

export function LandingPage() {
  const router = useRouter();
  const { loginRankOperator } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankUsername, setRankUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hide scrollbar on landing page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.classList.add('hide-scrollbar');
    document.documentElement.classList.add('hide-scrollbar');
    
    return () => {
      document.body.classList.remove('hide-scrollbar');
      document.documentElement.classList.remove('hide-scrollbar');
    };
  }, []);

  const features = [
    {
      icon: Trophy,
      title: 'Gamified Dashboard',
      description: 'Track your contributions and compete with your squad in real-time',
    },
    {
      icon: Zap,
      title: 'Boost System',
      description: 'Activate powerful boosts to multiply your contribution points',
    },
    {
      icon: Users,
      title: 'Squad Competition',
      description: 'Join forces with your squad and compete against others',
    },
    {
      icon: Target,
      title: 'Target Tracking',
      description: 'Set and achieve targets with detailed progress monitoring',
    },
    {
      icon: Award,
      title: 'Leaderboard',
      description: 'Climb the ranks and earn exclusive rewards and badges',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Deep insights into your performance and growth trends',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button
          onClick={toggleTheme}
          className="relative p-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 lg:pt-16 pb-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4 lg:mb-5 leading-tight">
                <span className="text-glow-red block mb-1 sm:mb-1.5">X ARENA</span>
                <span className="text-gray-600 dark:text-gray-400 block font-mono text-xl sm:text-2xl lg:text-3xl">Gamified Dashboard</span>
              </h1>
              <p className="text-sm sm:text-base text-muted mb-6 sm:mb-7 max-w-3xl mx-auto leading-tight px-4">
                Compete, Contribute, and Conquer. Track your performance, compete with your squad, and climb the leaderboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 mt-2 sm:mt-3">
                <Button
                  size="default"
                  variant="default"
                  onClick={() => router.push('/login')}
                  className="text-base px-6 py-4 flex items-center gap-2 group"
                >
                  Enter Arena
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => setShowRankModal(true)}
                  className="text-base px-6 py-4"
                >
                  Your Rank
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pt-4 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground-primary mb-2 sm:mb-3">
              Powerful Features
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
              Everything you need to track, compete, and excel in your contributions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="border-t-2 border-primary/40 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-xl p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0 dark:group-hover:scale-100 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="text-sm sm:text-base font-heading font-bold text-foreground-primary flex-1">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Your Rank Modal */}
      <AnimatePresence>
        {showRankModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRankModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card-glass rounded-xl border border-card-border p-5 sm:p-6 w-full max-w-md relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground-primary">
                      Check Your Rank
                    </h2>
                    <button
                      onClick={() => setShowRankModal(false)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-foreground-primary mb-1.5 sm:mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={rankUsername}
                        onChange={(e) => setRankUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-sm sm:text-base text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 sm:p-2.5 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        <span className="text-xs sm:text-sm text-red-400">{error}</span>
                      </motion.div>
                    )}
                    <Button
                      size="default"
                      variant="default"
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
                            // Show success toast
                            showToast(`Login successful! Welcome, ${rankUsername.trim()}`, 'success', 3000);
                            // Close modal
                            setShowRankModal(false);
                            // Delay navigation to show toast
                            setTimeout(() => {
                              router.push('/');
                            }, 500);
                          } else {
                            const errorMsg = 'Invalid username. Only rank operators can access this feature.';
                            setError(errorMsg);
                            showToast(errorMsg, 'error', 4000);
                            setIsLoading(false);
                          }
                        } catch (err) {
                          console.error('Login error:', err);
                          const errorMsg = 'An error occurred. Please try again.';
                          setError(errorMsg);
                          showToast(errorMsg, 'error', 4000);
                          setIsLoading(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loading size="sm" variant="minimal" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                          View Rank
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t border-primary/40 mt-auto">
        <div className="w-full px-4 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-heading font-bold text-glow-red">X ARENA</h3>
              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-mono">Gamified Dashboard</span>
            </div>
            <span className="hidden sm:block text-muted">|</span>
            <p className="text-xs sm:text-sm text-muted">
              © 2026 X Arena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

