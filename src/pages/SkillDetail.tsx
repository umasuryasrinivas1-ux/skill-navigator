import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
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
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import SkillNotes from '@/components/SkillNotes';
import WeakPointsBottomSheet, { WeakPoint } from '@/components/WeakPointsBottomSheet';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces (duplicated from RoadmapDisplay/SkillDetailModal for self-containment)
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

interface Phase {
  name: string;
  skills: Skill[];
}

interface RoadmapData {
  phases: Phase[];
}

interface SkillProgress {
  id: string;
  skill_name: string;
  phase: string;
  completed: boolean;
}

export default function SkillDetail() {
  const { roadmapId, phaseName, skillName } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [user, setUser] = useState<any>(null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });
  }, [navigate]);

  useEffect(() => {
    if (user && roadmapId) {
      fetchData();
    }
  }, [user, roadmapId, skillName, phaseName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Roadmap
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('skill_roadmaps')
        .select('*')
        .eq('id', roadmapId)
        .single();

      if (roadmapError) throw roadmapError;
      setRoadmap(roadmapData);

      // Find Skill & Phase
      const decodedPhaseName = decodeURIComponent(phaseName || '');
      const decodedSkillName = decodeURIComponent(skillName || '');

      const foundPhase = roadmapData.roadmap_data.phases.find((p: Phase) => p.name === decodedPhaseName);
      const foundSkill = foundPhase?.skills.find((s: Skill) => s.name === decodedSkillName);

      if (!foundSkill || !foundPhase) {
        toast.error('Skill not found');
        navigate('/dashboard'); // or 404
        return;
      }

      setPhase(foundPhase);
      setSkill(foundSkill);

      // Fetch Progress
      const { data: progressData, error: progressError } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('roadmap_id', roadmapId);

      if (progressError) throw progressError;
      setProgress(progressData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  const isSkillCompleted = (sName: string, pName: string) => {
    return progress.find(p => p.skill_name === sName && p.phase === pName)?.completed || false;
  };

  const markSkillComplete = async () => {
    if (!skill || !phase || !user) return;
    
    const existingProgress = progress.find(
      p => p.skill_name === skill.name && p.phase === phase.name
    );

    if (!existingProgress) return;

    try {
      const { error } = await supabase
        .from('skill_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);

      if (error) throw error;

      setProgress(prev =>
        prev.map(p =>
          p.id === existingProgress.id ? { ...p, completed: true } : p
        )
      );

      toast.success(`${skill.name} completed! 🎉`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  // Lock Logic
  const checkIsLocked = () => {
    if (!roadmap || !phase || !skill) return false;
    
    const phases = roadmap.roadmap_data.phases as Phase[];
    const phaseIndex = phases.findIndex(p => p.name === phase.name);
    const skillIndex = phases[phaseIndex].skills.findIndex(s => s.name === skill.name);

    if (phaseIndex === 0 && skillIndex === 0) return false;

    if (skillIndex === 0) {
      // First skill of a phase - check if last skill of previous phase is completed
      const prevPhase = phases[phaseIndex - 1];
      const lastSkillOfPrevPhase = prevPhase.skills[prevPhase.skills.length - 1];
      return !isSkillCompleted(lastSkillOfPrevPhase.name, prevPhase.name);
    } else {
      // Check if previous skill in same phase is completed
      const prevSkill = phases[phaseIndex].skills[skillIndex - 1];
      return !isSkillCompleted(prevSkill.name, phase.name);
    }
  };

  const getLockedMessage = () => {
    if (!roadmap || !phase || !skill) return '';
    const phases = roadmap.roadmap_data.phases as Phase[];
    const phaseIndex = phases.findIndex(p => p.name === phase.name);
    const skillIndex = phases[phaseIndex].skills.findIndex(s => s.name === skill.name);

    if (skillIndex === 0 && phaseIndex > 0) {
      const prevPhase = phases[phaseIndex - 1];
      const lastSkill = prevPhase.skills[prevPhase.skills.length - 1];
      return `Complete "${lastSkill.name}" first to unlock this skill.`;
    } else if (skillIndex > 0) {
      const prevSkill = phases[phaseIndex].skills[skillIndex - 1];
      return `Complete "${prevSkill.name}" first to unlock this skill.`;
    }
    return '';
  };

  // Quiz Handling
  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = async () => {
    const quiz = skill?.quiz || [];
    if (Object.keys(answers).length < quiz.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmittingQuiz(true);
    
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const passed = correct >= Math.ceil(quiz.length * 0.67); // Need 2/3 correct
    setQuizPassed(passed);
    setQuizSubmitted(true);
    setSubmittingQuiz(false);

    if (passed) {
      toast.success(`Quiz passed! ${correct}/${quiz.length} correct 🎉`);
      markSkillComplete();
    } else {
      toast.error(`Quiz not passed. ${correct}/${quiz.length} correct. Try again!`);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
  };

  // Helpers
  const getResourceIcon = (resource: string) => {
    const lower = resource.toLowerCase();
    if (lower.includes('youtube')) return <Youtube className="w-5 h-5" />;
    if (lower.includes('docs') || lower.includes('documentation')) return <FileText className="w-5 h-5" />;
    return <BookOpen className="w-5 h-5" />;
  };

  const getResourceLink = (resource: string) => {
    if (resource.startsWith('http')) return resource;
    if (resource.toLowerCase().includes('youtube')) {
      const title = resource.replace(/^YouTube:\s*/i, '');
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(resource + ' ' + (skill?.name || ''))}`;
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

  if (loading || !skill || !phase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCompleted = isSkillCompleted(skill.name, phase.name);
  const isLocked = checkIsLocked();
  const lockedMessage = isLocked ? getLockedMessage() : '';
  const timeDisplay = skill.days || skill.estimatedTime || 'N/A';
  const quiz = skill.quiz || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col overflow-hidden">
             <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                <span>{roadmap?.target_skill}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{phase.name}</span>
             </div>
             <h1 className="font-display font-bold text-lg truncate">{skill.name}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isCompleted && (
               <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/20 text-success text-sm rounded-full font-medium">
                 <CheckCircle2 className="w-4 h-4" />
                 Completed
               </span>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="glass-card p-6 md:p-8">
             <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-2 text-primary uppercase tracking-wider text-xs font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      Skill Module
                   </div>
                   <h2 className="text-3xl md:text-4xl font-bold font-display">{skill.name}</h2>
                   <p className="text-lg text-muted-foreground leading-relaxed">
                     {skill.description}
                   </p>
                   <div className="flex items-center gap-4 pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-sm">
                         <Clock className="w-4 h-4" />
                         {timeDisplay}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Locked State */}
        {isLocked && (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
              <Lock className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-500 text-lg">This skill is locked</h3>
                <p className="text-muted-foreground">{lockedMessage}</p>
              </div>
            </div>
        )}

        {/* Resources */}
        {!isLocked && skill.resources && skill.resources.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-2xl font-bold font-display flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Learning Resources
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {skill.resources.map((resource, i) => {
                const isYouTube = resource.toLowerCase().includes('youtube');
                return (
                  <a
                    key={i}
                    href={getResourceLink(resource)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-lg ${
                      isYouTube
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        : 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                    }`}
                  >
                    <div className={`p-3 rounded-lg transition-colors ${isYouTube ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20'}`}>
                      {getResourceIcon(resource)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isYouTube ? 'text-red-400' : 'text-blue-400'}`}>
                        {getResourceLabel(resource)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isYouTube ? 'Video Tutorial' : 'Documentation'}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Notes */}
        {!isLocked && (
           <section className="space-y-4">
              <SkillNotes
                userId={user.id}
                roadmapId={roadmapId!}
                skillName={skill.name}
                phase={phase.name}
              />
           </section>
        )}

        {/* Quiz */}
        {!isLocked && !isCompleted && quiz.length > 0 && (
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold font-display flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Skill Assessment
                </h3>
             </div>

             <div className="glass-card p-6 md:p-8">
                {!showQuiz ? (
                   <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                         <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h4>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Take a quick quiz to verify your understanding of {skill.name} and complete this module.
                      </p>
                      <Button onClick={() => setShowQuiz(true)} size="lg" className="px-8">
                        Start Quiz
                      </Button>
                   </div>
                ) : (
                   <div className="space-y-8">
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border">
                        Answer at least 2 out of 3 questions correctly to mark this skill as complete.
                      </p>

                      <div className="space-y-8">
                        {quiz.map((q, qIndex) => (
                           <div key={qIndex} className="space-y-4">
                              <h4 className="font-medium text-lg">
                                 <span className="text-primary mr-2">{qIndex + 1}.</span>
                                 {q.question}
                              </h4>
                              <RadioGroup
                                 value={answers[qIndex]?.toString()}
                                 onValueChange={(v) => handleAnswerChange(qIndex, parseInt(v))}
                                 disabled={quizSubmitted}
                                 className="grid gap-3"
                              >
                                 {q.options.map((option, oIndex) => (
                                    <div
                                       key={oIndex}
                                       className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                                          quizSubmitted
                                             ? oIndex === q.correctAnswer
                                                ? 'bg-success/10 border-success/30 ring-1 ring-success/30'
                                                : answers[qIndex] === oIndex
                                                ? 'bg-destructive/10 border-destructive/30 ring-1 ring-destructive/30'
                                                : 'bg-card border-border opacity-60'
                                             : answers[qIndex] === oIndex
                                             ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                             : 'bg-card border-border hover:border-primary/50 cursor-pointer'
                                       }`}
                                    >
                                       <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                       <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer font-normal">
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
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                         {!quizSubmitted ? (
                            <>
                               <Button onClick={handleSubmitQuiz} disabled={submittingQuiz} size="lg" className="w-full sm:w-auto">
                                  {submittingQuiz && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                  Submit Answers
                               </Button>
                               <Button variant="outline" onClick={() => setShowQuiz(false)} size="lg" className="w-full sm:w-auto">
                                  Cancel
                               </Button>
                            </>
                         ) : (
                            <>
                               {!quizPassed && (
                                  <Button onClick={resetQuiz} size="lg" className="w-full sm:w-auto">
                                     <Play className="w-4 h-4 mr-2" />
                                     Try Again
                                  </Button>
                               )}
                               <Button variant="outline" onClick={() => setShowQuiz(false)} size="lg" className="w-full sm:w-auto">
                                  Close
                               </Button>
                            </>
                         )}
                      </div>
                   </div>
                )}
             </div>
          </section>
        )}

        {/* Already Completed Message */}
        {isCompleted && (
          <div className="p-8 rounded-2xl bg-success/5 border border-success/20 text-center space-y-3">
             <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto text-success">
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-success-foreground">You have mastered this skill!</h3>
             <p className="text-muted-foreground">Great job keeping up with your roadmap.</p>
          </div>
        )}
      </main>

      {/* Weak Points Sheet */}
      {skill.weakPoints && skill.weakPoints.length > 0 && (
         <WeakPointsBottomSheet
            skillName={skill.name}
            phase={phase.name}
            weakPoints={skill.weakPoints}
         />
      )}
    </div>
  );
}
