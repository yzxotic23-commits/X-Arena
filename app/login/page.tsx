'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Loading } from '@/components/Loading';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);

    if (success) {
      showToast('Login successful! Welcome to X Arena Dashboard', 'success', 3000);
      // Delay navigation to show toast
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back to Landing */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landing</span>
          </Link>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-heading font-bold text-foreground-primary">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to access X Arena Dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-semibold text-foreground-primary flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-background border-2 border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-background border-2 border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {/* Error Message */}
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

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
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

                {/* Default Credentials Hint */}
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <p className="text-xs text-muted text-center">
                    Default credentials: <span className="font-semibold text-foreground-primary">admin / admin</span>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

