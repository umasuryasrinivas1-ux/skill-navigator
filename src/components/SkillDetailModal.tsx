import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ExternalLink,
  Youtube,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Play,
  Award,
  Loader2,
  Lock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SkillNotes from './SkillNotes';
import WeakPointsBottomSheet, { WeakPoint } from './WeakPointsBottomSheet';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Skill {
  name: string;
  description: string;
  estimatedTime?: string;
  days?: string;
  resources?: string[];
  quiz?: QuizQuestion[];
  weakPoints?: WeakPoint[];
}

interface SkillDetailModalProps {
  skill: Skill | null;
  phase: string;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onComplete: () => void;
  userId: string;
  roadmapId: string;
  isLocked?: boolean;
  lockedMessage?: string;
}

export default function SkillDetailModal({
  skill,
  phase,
  isOpen,
  onClose,
  isCompleted,
  onComplete,
  userId,
  roadmapId,
  isLocked = false,
  lockedMessage = '',
}: SkillDetailModalProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!skill) return null;

  const timeDisplay = skill.days || skill.estimatedTime || 'N/A';
  const quiz = skill.quiz || [];

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < quiz.length) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);
    
    // Check answers
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const passed = correct >= Math.ceil(quiz.length * 0.67); // Need 2/3 correct
    setQuizPassed(passed);
    setQuizSubmitted(true);
    setLoading(false);

    if (passed) {
      toast.success(`Quiz passed! ${correct}/${quiz.length} correct 🎉`);
      onComplete();
    } else {
      toast.error(`Quiz not passed. ${correct}/${quiz.length} correct. Try again!`);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
  };

  const getResourceIcon = (resource: string) => {
    const lower = resource.toLowerCase();
    if (lower.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (lower.includes('docs') || lower.includes('documentation')) return <FileText className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const getResourceLink = (resource: string) => {
    if (resource.startsWith('http')) return resource;
    if (resource.toLowerCase().includes('youtube')) {
      const title = resource.replace(/^YouTube:\s*/i, '');
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(resource + ' ' + skill.name)}`;
  };

  const getResourceLabel = (resource: string) => {
    if (resource.startsWith('http')) {
      try {
        const url = new URL(resource);
        return url.hostname.replace('www.', '');
      } catch {
        return 'Documentation';
      }
    }
    if (resource.toLowerCase().includes('youtube')) {
      return resource.replace(/^YouTube:\s*/i, '');
    }
    return resource;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <GraduationCap className="w-6 h-6 text-primary" />
            {skill.name}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Locked Message */}
          {isLocked && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-medium text-amber-500">This skill is locked</p>
                <p className="text-sm text-muted-foreground">{lockedMessage}</p>
              </div>
            </div>
          )}

          {/* Description & Time */}
          <div className="space-y-3">
            <p className="text-muted-foreground">{skill.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {timeDisplay}</span>
            </div>
          </div>

          {/* Resources Section */}
          {!isLocked && skill.resources && skill.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Learning Resources
              </h3>
              <div className="grid gap-3">
                {skill.resources.map((resource, i) => {
                  const isYouTube = resource.toLowerCase().includes('youtube');
                  return (
                    <a
                      key={i}
                      href={getResourceLink(resource)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                        isYouTube
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                          : 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isYouTube ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {getResourceIcon(resource)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isYouTube ? 'text-red-400' : 'text-blue-400'}`}>
                          {getResourceLabel(resource)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isYouTube ? 'Video Tutorial' : 'Documentation'}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {!isLocked && (
            <SkillNotes
              userId={userId}
              roadmapId={roadmapId}
              skillName={skill.name}
              phase={phase}
            />
          )}

          {/* Quiz Section */}
          {!isLocked && !isCompleted && quiz.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Skill Assessment
                </h3>
                {!showQuiz && (
                  <Button onClick={() => setShowQuiz(true)} size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Take Quiz
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showQuiz && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <p className="text-sm text-muted-foreground">
                      Answer at least 2 out of 3 questions correctly to mark this skill as complete.
                    </p>

                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="space-y-3">
                        <p className="font-medium">
                          {qIndex + 1}. {q.question}
                        </p>
                        <RadioGroup
                          value={answers[qIndex]?.toString()}
                          onValueChange={(v) => handleAnswerChange(qIndex, parseInt(v))}
                          disabled={quizSubmitted}
                        >
                          {q.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                                quizSubmitted
                                  ? oIndex === q.correctAnswer
                                    ? 'bg-success/10 border-success/30'
                                    : answers[qIndex] === oIndex
                                    ? 'bg-destructive/10 border-destructive/30'
                                    : 'bg-secondary/20 border-border'
                                  : answers[qIndex] === oIndex
                                  ? 'bg-primary/10 border-primary/30'
                                  : 'bg-secondary/20 border-border hover:border-primary/30'
                              }`}
                            >
                              <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                              <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                              {quizSubmitted && oIndex === q.correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              )}
                              {quizSubmitted && answers[qIndex] === oIndex && oIndex !== q.correctAnswer && (
                                <XCircle className="w-5 h-5 text-destructive" />
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                      {!quizSubmitted ? (
                        <>
                          <Button onClick={handleSubmitQuiz} disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Answers
                          </Button>
                          <Button variant="outline" onClick={() => setShowQuiz(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {!quizPassed && (
                            <Button onClick={resetQuiz} className="gap-2">
                              <Play className="w-4 h-4" />
                              Try Again
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setShowQuiz(false)}>
                            Close Quiz
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Already Completed Message */}
          {isCompleted && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <p className="text-success">You have completed this skill!</p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Weak Points Bottom Sheet */}
      {skill.weakPoints && skill.weakPoints.length > 0 && (
        <WeakPointsBottomSheet
          skillName={skill.name}
          phase={phase}
          weakPoints={skill.weakPoints}
        />
      )}
    </Dialog>
  );
}
