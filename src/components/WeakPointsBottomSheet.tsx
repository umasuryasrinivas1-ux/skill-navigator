import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, AlertCircle, Lightbulb, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WeakPoint {
  id: string;
  title: string;
  summary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  commonMistakes: string[];
  detailedExplanation?: string;
  realWorldExamples?: Array<{
    title: string;
    description: string;
    code?: string;
    illustration?: string;
  }>;
  whyLearnersStruggle?: string;
  tips?: string[];
}

interface WeakPointsBottomSheetProps {
  skillName: string;
  phase: string;
  weakPoints: WeakPoint[];
}

export default function WeakPointsBottomSheet({
  skillName,
  phase,
  weakPoints,
}: WeakPointsBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleWeakPointClick = (weakPoint: WeakPoint) => {
    navigate(`/weak-point/${weakPoint.id}`, {
      state: {
        skillName,
        phase,
        weakPoint,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="absolute inset-0 bg-black/30 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isExpanded ? 0 : 'calc(100% - 80px)' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="pointer-events-auto bg-background border-t border-border rounded-t-2xl shadow-lg"
      >
        {/* Handle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-4 flex items-center justify-center hover:bg-secondary/50 transition-colors border-b border-border rounded-t-2xl"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            </motion.div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">
                {weakPoints.length} Common Weak Points
              </span>
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[60vh] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Areas Where Learners Struggle
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These are common misconceptions and challenging concepts for {skillName}. Tap any to learn more.
                  </p>
                </div>

                <div className="space-y-3 mt-6">
                  {weakPoints.map((weakPoint) => (
                    <button
                      key={weakPoint.id}
                      onClick={() => handleWeakPointClick(weakPoint)}
                      className="w-full text-left p-4 rounded-lg border border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                            {weakPoint.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {weakPoint.summary}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                                weakPoint.difficulty
                              )}`}
                            >
                              {weakPoint.difficulty.charAt(0).toUpperCase() +
                                weakPoint.difficulty.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {weakPoint.commonMistakes.length} common mistakes
                            </span>
                          </div>
                        </div>
                        <TrendingDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>

                {weakPoints.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No weak points identified for this skill yet.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Preview */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-border"
          >
            <div className="space-y-3 max-h-24 overflow-hidden">
              {weakPoints.slice(0, 2).map((weakPoint) => (
                <div key={weakPoint.id} className="text-xs">
                  <p className="font-medium text-muted-foreground">
                    • {weakPoint.title}
                  </p>
                </div>
              ))}
              {weakPoints.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  + {weakPoints.length - 2} more weak points...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
