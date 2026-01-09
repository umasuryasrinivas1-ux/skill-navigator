import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layout,
  Server,
  Database,
  BookOpen,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import RoadmapExportShare from './RoadmapExportShare';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Skill {
  name: string;
  estimatedTime?: string;
  days?: string;
  description: string;
  order?: number;
  resources?: string[];
  quiz?: QuizQuestion[];
}

interface Phase {
  name: string;
  skills: Skill[];
  duration_days?: number;
  description?: string;
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

interface RoadmapDisplayProps {
  roadmap: {
    id: string;
    target_skill: string;
    roadmap_data: RoadmapData;
  };
  userId: string;
  onNewRoadmap: () => void;
}

const getTopicColor = (name: string, index: number) => {
  if (name.includes('Frontend')) return 'phase-beginner';
  if (name.includes('Backend')) return 'phase-intermediate';
  if (name.includes('Database')) return 'phase-advanced';
  const colors = ['phase-beginner', 'phase-intermediate', 'phase-advanced', 'phase-market'];
  return colors[index % colors.length];
};

const getTopicIcon = (name: string) => {
  if (name.includes('Frontend')) return <Layout className="w-6 h-6" />;
  if (name.includes('Backend')) return <Server className="w-6 h-6" />;
  if (name.includes('Database')) return <Database className="w-6 h-6" />;
  return <BookOpen className="w-6 h-6" />;
};

export default function RoadmapDisplay({ roadmap, userId, onNewRoadmap }: RoadmapDisplayProps) {
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (roadmap?.roadmap_data?.phases?.length > 0) {
      setExpandedPhases([roadmap.roadmap_data.phases[0].name]);
    }
    fetchProgress();
  }, [roadmap.id]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('roadmap_id', roadmap.id);

      if (error) throw error;

      const existingSkills = new Set(data?.map(p => `${p.phase}-${p.skill_name}`));
      const missingProgress: any[] = [];

      roadmap.roadmap_data.phases.forEach(phase => {
        phase.skills.forEach(skill => {
          const key = `${phase.name}-${skill.name}`;
          if (!existingSkills.has(key)) {
            missingProgress.push({
              user_id: userId,
              roadmap_id: roadmap.id,
              skill_name: skill.name,
              phase: phase.name,
              completed: false,
            });
          }
        });
      });

      if (missingProgress.length > 0) {
        const { data: newProgress, error: insertError } = await supabase
          .from('skill_progress')
          .insert(missingProgress)
          .select();

        if (insertError) throw insertError;
        setProgress([...(data || []), ...(newProgress || [])]);
      } else {
        setProgress(data || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markSkillComplete = async (skillName: string, phase: string) => {
    const existingProgress = progress.find(
      p => p.skill_name === skillName && p.phase === phase
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

      setProgress(progress.map(p =>
        p.id === existingProgress.id ? { ...p, completed: true } : p
      ));

      toast.success(`${skillName} completed! 🎉`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getPhaseProgress = (phaseName: string) => {
    const phaseSkills = progress.filter(p => p.phase === phaseName);
    if (phaseSkills.length === 0) return 0;
    const completed = phaseSkills.filter(p => p.completed).length;
    return Math.round((completed / phaseSkills.length) * 100);
  };

  const getTotalProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.completed).length;
    return Math.round((completed / progress.length) * 100);
  };

  const togglePhase = (phaseName: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseName)
        ? prev.filter(p => p !== phaseName)
        : [...prev, phaseName]
    );
  };

  const handleNewRoadmap = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: false })
        .eq('id', userId);
      onNewRoadmap();
    } catch (error) {
      console.error('Error resetting profile:', error);
      toast.error('Failed to start new roadmap');
    }
  };

  const handleSkillClick = (skill: Skill, phase: string, phaseIndex: number, skillIndex: number) => {
    navigate(`/roadmap/${roadmap.id}/phase/${encodeURIComponent(phase)}/skill/${encodeURIComponent(skill.name)}`);
  };

  const isSkillCompleted = (skillName: string, phase: string) => {
    return progress.find(p => p.skill_name === skillName && p.phase === phase)?.completed || false;
  };

  // Check if a skill is locked (previous skill not completed)
  const isSkillLocked = (phaseIndex: number, skillIndex: number) => {
    // First skill of first phase is never locked
    if (phaseIndex === 0 && skillIndex === 0) return false;

    const phases = roadmap.roadmap_data.phases;

    if (skillIndex === 0) {
      // First skill of a phase - check if last skill of previous phase is completed
      const prevPhase = phases[phaseIndex - 1];
      const lastSkillOfPrevPhase = prevPhase.skills[prevPhase.skills.length - 1];
      return !isSkillCompleted(lastSkillOfPrevPhase.name, prevPhase.name);
    } else {
      // Check if previous skill in same phase is completed
      const currentPhase = phases[phaseIndex];
      const prevSkill = currentPhase.skills[skillIndex - 1];
      return !isSkillCompleted(prevSkill.name, currentPhase.name);
    }
  };

  const getLockedMessage = (phaseIndex: number, skillIndex: number) => {
    const phases = roadmap.roadmap_data.phases;

    if (skillIndex === 0 && phaseIndex > 0) {
      const prevPhase = phases[phaseIndex - 1];
      const lastSkill = prevPhase.skills[prevPhase.skills.length - 1];
      return `Complete "${lastSkill.name}" first to unlock this skill.`;
    } else if (skillIndex > 0) {
      const currentPhase = phases[phaseIndex];
      const prevSkill = currentPhase.skills[skillIndex - 1];
      return `Complete "${prevSkill.name}" first to unlock this skill.`;
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
          <Target className="w-4 h-4" />
          <span className="font-medium">Your Syllabus</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          {roadmap.target_skill}
        </h1>
        <p className="text-muted-foreground mb-6">
          Click on any topic to view resources and take the quiz
        </p>

        {/* Export & Share */}
        <div className="flex justify-center">
          <RoadmapExportShare
            roadmapId={roadmap.id}
            targetSkill={roadmap.target_skill}
            roadmapData={roadmap.roadmap_data}
          />
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Detailed Progress</h2>
          <span className="text-2xl font-bold gradient-text">{getTotalProgress()}%</span>
        </div>
        <Progress value={getTotalProgress()} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {progress.filter(p => p.completed).length} of {progress.length} subtopics completed
        </p>
      </motion.div>

      {/* Phases / Modules */}
      <div className="space-y-4" id="roadmap-content">
        {roadmap.roadmap_data.phases.map((phase, phaseIndex) => {
          let displayName = phase.name;
          const isNewFormat =
            phase.name === "Frontend (Basics)" ||
            phase.name === "Backend" ||
            phase.name.includes("Infrastructure");

          if (!isNewFormat) {
            if (phase.name.includes("Beginner") || phase.name.includes("Foundation")) displayName = "Frontend Development";
            else if (phase.name.includes("Intermediate") || phase.name.includes("Core")) displayName = "Backend Development";
            else if (phase.name.includes("Advanced") || phase.name.includes("Market")) displayName = "Database";
          }

          const phaseProgress = getPhaseProgress(phase.name);
          const isExpanded = expandedPhases.includes(phase.name);
          const styleClass = getTopicColor(displayName, phaseIndex);
          const icon = getTopicIcon(displayName);

          return (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + phaseIndex * 0.1 }}
              className={`glass-card overflow-hidden border-l-4 ${styleClass.replace('phase', 'border')}`}
              style={{ borderLeftColor: `var(--${styleClass})` }}
            >
              {/* Module Header */}
              <button
                onClick={() => togglePhase(phase.name)}
                className="w-full p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl p-2 bg-secondary rounded-lg text-foreground flex items-center justify-center">
                    {icon}
                  </span>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg">{displayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {phase.skills.length} subtopics • {phaseProgress}% complete
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 hidden sm:block">
                    <Progress value={phaseProgress} className="h-2" />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Skills List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    {phase.skills.map((skill, skillIndex) => {
                      const isCompleted = isSkillCompleted(skill.name, phase.name);
                      const isLocked = isSkillLocked(phaseIndex, skillIndex);
                      const timeDisplay = skill.days || skill.estimatedTime;
                      const hasQuiz = skill.quiz && skill.quiz.length > 0;

                      let displaySkillName = skill.name;
                      if (skill.name.includes("HTML5")) displaySkillName = "HTML";
                      if (skill.name.includes("CSS3")) displaySkillName = "CSS";

                      return (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: skillIndex * 0.05 }}
                          onClick={() => handleSkillClick(skill, phase.name, phaseIndex, skillIndex)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${isCompleted
                            ? 'bg-success/10 border-success/30'
                            : isLocked
                              ? 'bg-secondary/20 border-border/50 opacity-60'
                              : 'bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50'
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    {skillIndex + 1}. {displaySkillName}
                                  </h4>
                                  {isCompleted && (
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                  )}
                                  {isLocked && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                                      <Lock className="w-3 h-3" />
                                      Locked
                                    </span>
                                  )}
                                  {!isCompleted && !isLocked && hasQuiz && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                      Quiz
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                                  <Clock className="w-4 h-4" />
                                  {timeDisplay}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {skill.description}
                              </p>
                              <p className="text-xs text-primary mt-2">
                                {isLocked ? 'Complete previous skill to unlock' : 'Click to view resources & take quiz →'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-center"
      >
        <Button
          variant="outline"
          onClick={handleNewRoadmap}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Create New Roadmap
        </Button>
      </motion.div>


    </div>
  );
}
