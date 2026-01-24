'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'gaming' | 'gaming-coin' | 'minimal';
}

export function Loading({ size = 'md', text, variant = 'gaming' }: LoadingProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className={`animate-spin rounded-full border-2 border-transparent ${
          size === 'sm' ? 'h-5 w-5 border-t-2' : 
          size === 'md' ? 'h-8 w-8 border-t-2' : 
          'h-12 w-12 border-t-2'
        } ${isDark ? 'border-t-primary' : 'border-t-gray-400'}`} />
        {text && <span className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} text-muted`}>{text}</span>}
      </div>
    );
  }

  if (variant === 'gaming-coin') {
    // Coin only loading animation (no Mario Bros)
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Loading Text */}
        {text && (
          <motion.p
            className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.p>
        )}

        {/* Coin Animation */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="relative"
              style={{
                width: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
                height: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 360],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            >
              {/* Coin */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                    : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  border: `2px solid ${isDark ? '#FFA500' : '#D97706'}`,
                  boxShadow: `0 2px 4px ${isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
                  fontWeight: 'bold',
                  color: isDark ? '#8B4513' : '#92400E',
                }}
              >
                $
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'gaming') {
    // Mario Bros loading animation
    const marioSize = size === 'sm' ? 40 : size === 'md' ? 60 : 80;
    const blockSize = size === 'sm' ? 20 : size === 'md' ? 30 : 40;
    
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        {/* Mario Character Animation */}
        <div className="relative mb-0.5" style={{ width: `${marioSize * 2}px`, height: `${marioSize * 1.5}px` }}>
          {/* Mario Character */}
          <motion.div
            className="relative"
            style={{
              width: `${marioSize}px`,
              height: `${marioSize}px`,
            }}
            animate={{
              x: [0, marioSize, 0],
              y: [0, -marioSize * 0.3, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Mario Head (Red Cap) */}
            <div 
              className="absolute rounded-t-full"
              style={{
                width: `${marioSize * 0.6}px`,
                height: `${marioSize * 0.3}px`,
                top: '0px',
                left: `${marioSize * 0.2}px`,
                background: isDark ? '#E60012' : '#DC2626',
                border: `2px solid ${isDark ? '#CC0000' : '#B91C1C'}`,
              }}
            />
            {/* Mario Face */}
            <div 
              className="absolute rounded-full"
              style={{
                width: `${marioSize * 0.5}px`,
                height: `${marioSize * 0.5}px`,
                top: `${marioSize * 0.25}px`,
                left: `${marioSize * 0.25}px`,
                background: isDark ? '#FFDBAC' : '#FED7AA',
                border: `2px solid ${isDark ? '#E6C99A' : '#FBBF24'}`,
              }}
            />
            {/* Mario Eyes */}
            <div 
              className="absolute rounded-full"
              style={{
                width: `${marioSize * 0.08}px`,
                height: `${marioSize * 0.08}px`,
                top: `${marioSize * 0.35}px`,
                left: `${marioSize * 0.35}px`,
                background: '#000',
              }}
            />
            <div 
              className="absolute rounded-full"
              style={{
                width: `${marioSize * 0.08}px`,
                height: `${marioSize * 0.08}px`,
                top: `${marioSize * 0.35}px`,
                right: `${marioSize * 0.35}px`,
                background: '#000',
              }}
            />
            {/* Mario Mustache */}
            <div 
              className="absolute"
              style={{
                width: `${marioSize * 0.3}px`,
                height: `${marioSize * 0.1}px`,
                top: `${marioSize * 0.45}px`,
                left: `${marioSize * 0.35}px`,
                background: '#8B4513',
                borderRadius: '50%',
              }}
            />
            {/* Mario Body (Red Shirt) */}
            <div 
              className="absolute"
              style={{
                width: `${marioSize * 0.5}px`,
                height: `${marioSize * 0.4}px`,
                top: `${marioSize * 0.5}px`,
                left: `${marioSize * 0.25}px`,
                background: isDark ? '#E60012' : '#DC2626',
                border: `2px solid ${isDark ? '#CC0000' : '#B91C1C'}`,
                borderRadius: '0 0 8px 8px',
              }}
            />
            {/* Mario Arms */}
            <motion.div
              className="absolute"
              style={{
                width: `${marioSize * 0.15}px`,
                height: `${marioSize * 0.2}px`,
                top: `${marioSize * 0.55}px`,
                left: `${marioSize * 0.1}px`,
                background: isDark ? '#FFDBAC' : '#FED7AA',
                borderRadius: '4px',
              }}
              animate={{
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute"
              style={{
                width: `${marioSize * 0.15}px`,
                height: `${marioSize * 0.2}px`,
                top: `${marioSize * 0.55}px`,
                right: `${marioSize * 0.1}px`,
                background: isDark ? '#FFDBAC' : '#FED7AA',
                borderRadius: '4px',
              }}
              animate={{
                rotate: [0, -20, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Mario Legs (Blue Overalls) */}
            <div 
              className="absolute"
              style={{
                width: `${marioSize * 0.2}px`,
                height: `${marioSize * 0.25}px`,
                top: `${marioSize * 0.75}px`,
                left: `${marioSize * 0.15}px`,
                background: isDark ? '#0066CC' : '#2563EB',
                border: `2px solid ${isDark ? '#0052A3' : '#1D4ED8'}`,
                borderRadius: '0 0 4px 4px',
              }}
            />
            <div 
              className="absolute"
              style={{
                width: `${marioSize * 0.2}px`,
                height: `${marioSize * 0.25}px`,
                top: `${marioSize * 0.75}px`,
                right: `${marioSize * 0.15}px`,
                background: isDark ? '#0066CC' : '#2563EB',
                border: `2px solid ${isDark ? '#0052A3' : '#1D4ED8'}`,
                borderRadius: '0 0 4px 4px',
              }}
            />
          </motion.div>

          {/* Question Block Animation */}
          <motion.div
            className="absolute"
            style={{
              width: `${blockSize}px`,
              height: `${blockSize}px`,
              top: `${marioSize * 0.2}px`,
              right: '0px',
            }}
            animate={{
              y: [0, -blockSize * 0.3, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            {/* Question Block */}
            <div 
              className="relative"
              style={{
                width: `${blockSize}px`,
                height: `${blockSize}px`,
                background: isDark ? '#FFD700' : '#FBBF24',
                border: `3px solid ${isDark ? '#FFA500' : '#F59E0B'}`,
                borderRadius: '4px',
                boxShadow: `inset 0 2px 4px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              {/* Question Mark */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: blockSize * 0.5,
                  fontWeight: 'bold',
                  color: isDark ? '#8B4513' : '#92400E',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                ?
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading Text */}
        {text && (
          <motion.p
            className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.p>
        )}

        {/* Coin Animation */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="relative"
              style={{
                width: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
                height: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 360],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            >
              {/* Coin */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                    : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  border: `2px solid ${isDark ? '#FFA500' : '#D97706'}`,
                  boxShadow: `0 2px 4px ${isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
                  fontWeight: 'bold',
                  color: isDark ? '#8B4513' : '#92400E',
                }}
              >
                $
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - simple spinner
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`relative flex items-center justify-center ${
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
        }`}
      >
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-transparent ${
            isDark 
              ? 'border-t-primary border-r-primary/50' 
              : 'border-t-gray-500 border-r-gray-300'
          }`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
      {text && (
        <p className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} text-muted`}>
          {text}
        </p>
      )}
    </div>
  );
}
