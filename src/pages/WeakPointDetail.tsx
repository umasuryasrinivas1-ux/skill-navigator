import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Code2,
  Eye,
  Brain,
  Zap,
} from 'lucide-react';

interface WeakPoint {
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

interface LocationState {
  skillName: string;
  phase: string;
  weakPoint: WeakPoint;
}

export default function WeakPointDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [weakPoint, setWeakPoint] = useState<WeakPoint | null>(null);
  const [skillName, setSkillName] = useState('');
  const [phase, setPhase] = useState('');

  useEffect(() => {
    const state = location.state as LocationState;
    if (state) {
      setWeakPoint(state.weakPoint);
      setSkillName(state.skillName);
      setPhase(state.phase);
    }
  }, [location]);

  if (!weakPoint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Weak point not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              {skillName} • Phase {phase}
            </p>
            <h1 className="font-semibold truncate">{weakPoint.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-border bg-secondary/30"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{weakPoint.title}</h2>
              <p className="text-muted-foreground">{weakPoint.summary}</p>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full border whitespace-nowrap ${getDifficultyColor(
                weakPoint.difficulty
              )}`}
            >
              {weakPoint.difficulty.charAt(0).toUpperCase() +
                weakPoint.difficulty.slice(1)}
            </span>
          </div>
        </motion.div>

        {/* Why Learners Struggle Section */}
        {weakPoint.whyLearnersStruggle && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-500" />
              Why Learners Struggle With This
            </h3>
            <Card className="p-6 bg-purple-500/5 border-purple-500/20">
              <p className="text-muted-foreground leading-relaxed">
                {weakPoint.whyLearnersStruggle}
              </p>
            </Card>
          </motion.section>
        )}

        {/* Common Mistakes Section */}
        {weakPoint.commonMistakes && weakPoint.commonMistakes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Common Mistakes
            </h3>
            <div className="space-y-3">
              {weakPoint.commonMistakes.map((mistake, idx) => (
                <Card
                  key={idx}
                  className="p-4 bg-red-500/5 border-red-500/20 flex gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-sm text-muted-foreground">{mistake}</p>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Detailed Explanation Section */}
        {weakPoint.detailedExplanation && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-blue-500" />
              Understanding the Concept
            </h3>
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {weakPoint.detailedExplanation}
                </p>
              </div>
            </Card>
          </motion.section>
        )}

        {/* Real World Examples Section */}
        {weakPoint.realWorldExamples &&
          weakPoint.realWorldExamples.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Real-World Examples
              </h3>
              <div className="space-y-4">
                {weakPoint.realWorldExamples.map((example, idx) => (
                  <Card
                    key={idx}
                    className="p-6 bg-secondary/30 border-border overflow-hidden"
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {idx + 1}
                      </span>
                      {example.title}
                    </h4>

                    <p className="text-sm text-muted-foreground mb-4">
                      {example.description}
                    </p>

                    {example.code && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <Code2 className="w-4 h-4" />
                          Code Example
                        </p>
                        <pre className="bg-background p-4 rounded-lg border border-border overflow-x-auto text-xs">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    )}

                    {example.illustration && (
                      <div className="mt-4 p-4 rounded-lg bg-background border border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-3">
                          Illustration
                        </p>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">
                            📊 {example.illustration}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </motion.section>
          )}

        {/* Tips & Solutions Section */}
        {weakPoint.tips && weakPoint.tips.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              How to Master This Concept
            </h3>
            <div className="space-y-3">
              {weakPoint.tips.map((tip, idx) => (
                <Card key={idx} className="p-4 bg-green-500/5 border-green-500/20">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-8 border-t border-border"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Skill
          </Button>
          <Button className="gap-2 ml-auto">
            <BookOpen className="w-4 h-4" />
            Study Related Resources
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
