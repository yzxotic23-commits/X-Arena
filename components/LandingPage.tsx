'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, Zap, Users, Target, Award, TrendingUp, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/Loading';

export function LandingPage() {
  const router = useRouter();
  const { loginRankOperator } = useAuth();
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankUsername, setRankUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-8 sm:mb-10 lg:mb-12 leading-tight">
                <span className="text-glow-red block mb-2 sm:mb-3">X ARENA</span>
                <span className="text-foreground-primary block">Gamified Dashboard</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted mb-12 sm:mb-14 lg:mb-16 max-w-2xl mx-auto leading-relaxed px-4">
                Compete, Contribute, and Conquer. Track your performance, compete with your squad, and climb the leaderboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                <Button
                  size="lg"
                  variant="default"
                  onClick={() => router.push('/login')}
                  className="text-lg px-8 py-6 flex items-center gap-2 group"
                >
                  Enter Arena
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowRankModal(true)}
                  className="text-lg px-8 py-6"
                >
                  Your Rank
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-foreground-primary mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Everything you need to track, compete, and excel in your contributions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-card-glass rounded-xl border border-card-border p-6 hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-4 dark:group-hover:scale-100 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-card-glass rounded-2xl border-2 border-primary/50 p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden group"
          >
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-64 h-64 card-gradient-blur rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground-primary mb-4">
                Ready to Compete?
              </h2>
              <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
                Join thousands of players competing for the top spot. Track your progress, activate boosts, and claim your rewards.
              </p>
              <Button
                size="lg"
                variant="default"
                onClick={() => router.push('/login')}
                className="text-lg px-8 py-6 flex items-center gap-2 mx-auto group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
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
              <div className="bg-card-glass rounded-xl border border-card-border p-6 sm:p-8 w-full max-w-md relative overflow-hidden group">
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-foreground-primary">
                      Check Your Rank
                    </h2>
                    <button
                      onClick={() => setShowRankModal(false)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground-primary mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={rankUsername}
                        onChange={(e) => setRankUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full px-4 py-3 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-red-400">{error}</span>
                      </motion.div>
                    )}
                    <Button
                      size="lg"
                      variant="default"
                      onClick={async () => {
                        if (!rankUsername.trim()) {
                          setError('Please enter your username');
                          return;
                        }
                        
                        setError('');
                        setIsLoading(true);
                        
                        try {
                          const success = await loginRankOperator(rankUsername.trim());
                          
                          if (success) {
                            // Redirect to dashboard
                            router.push('/');
                          } else {
                            setError('Invalid username. Only rank operators can access this feature.');
                            setIsLoading(false);
                          }
                        } catch (err) {
                          console.error('Login error:', err);
                          setError('An error occurred. Please try again.');
                          setIsLoading(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loading size="sm" variant="minimal" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-5 h-5" />
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
      <footer className="relative z-10 border-t-2 border-primary/40 bg-white/40 dark:bg-black/40 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-heading font-bold text-glow-red">X ARENA</h3>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">Gamified Dashboard</span>
            </div>
            <p className="text-sm text-muted">
              © 2024 X Arena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

