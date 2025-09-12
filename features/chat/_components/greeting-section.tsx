'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGreeting } from '../_hooks/use-greeting';

interface GreetingSectionProps {
  hasMessages: boolean;
}

export function GreetingSection({ hasMessages }: GreetingSectionProps) {
  const { session, greetingText } = useGreeting();

  return (
    <AnimatePresence>
      {!hasMessages && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          {session && session.user && (
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {greetingText}
            </h1>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
