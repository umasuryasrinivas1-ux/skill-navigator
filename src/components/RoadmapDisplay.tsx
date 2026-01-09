import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Circle,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Skill {
  name: string;
  estimatedTime: string;
  description: string;
  order: number;
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

interface RoadmapDisplayProps {
  roadmap: {
    id: string;
    target_skill: string;
    roadmap_data: RoadmapData;
  };
  userId: string;
  onNewRoadmap: () => void;
}

const phaseStyles = {
  'Beginner / Foundation': 'phase-beginner',
  'Intermediate': 'phase-intermediate',
  'Advanced': 'phase-advanced',
};

const phaseIcons = {
  'Beginner / Foundation': '🌱',
  'Intermediate': '🚀',
  'Advanced': '⭐',
};

export default function RoadmapDisplay({ roadmap, userId, onNewRoadmap }: RoadmapDisplayProps) {
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['Beginner / Foundation']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [roadmap.id]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('roadmap_id', roadmap.id);

      if (error) throw error;
      
      // Initialize progress for all skills if not exists
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

  const toggleSkillCompletion = async (skillName: string, phase: string) => {
    const existingProgress = progress.find(
      p => p.skill_name === skillName && p.phase === phase
    );

    if (!existingProgress) return;

    const newCompleted = !existingProgress.completed;

    try {
      const { error } = await supabase
        .from('skill_progress')
        .update({ 
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', existingProgress.id);

      if (error) throw error;

      setProgress(progress.map(p => 
        p.id === existingProgress.id 
          ? { ...p, completed: newCompleted }
          : p
      ));

      if (newCompleted) {
        toast.success(`${skillName} completed! 🎉`);
      }
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
          <span className="font-medium">Your Learning Path</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          {roadmap.target_skill}
        </h1>
        <p className="text-muted-foreground">
          Follow this personalized roadmap to achieve your goal
        </p>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Overall Progress</h2>
          <span className="text-2xl font-bold gradient-text">{getTotalProgress()}%</span>
        </div>
        <Progress value={getTotalProgress()} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {progress.filter(p => p.completed).length} of {progress.length} skills completed
        </p>
      </motion.div>

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.roadmap_data.phases.map((phase, phaseIndex) => {
          const phaseProgress = getPhaseProgress(phase.name);
          const isExpanded = expandedPhases.includes(phase.name);
          const styleClass = phaseStyles[phase.name as keyof typeof phaseStyles] || 'phase-beginner';
          const icon = phaseIcons[phase.name as keyof typeof phaseIcons] || '📚';

          return (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + phaseIndex * 0.1 }}
              className="glass-card overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.name)}
                className="w-full p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{icon}</span>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg">{phase.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {phase.skills.length} skills • {phaseProgress}% complete
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
                      const skillProgress = progress.find(
                        p => p.skill_name === skill.name && p.phase === phase.name
                      );
                      const isCompleted = skillProgress?.completed || false;

                      return (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: skillIndex * 0.05 }}
                          className={`p-4 rounded-lg border transition-all ${
                            isCompleted 
                              ? 'bg-success/10 border-success/30' 
                              : 'bg-secondary/30 border-border hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleSkillCompletion(skill.name, phase.name)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-success" />
                              ) : (
                                <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {skill.order}. {skill.name}
                                </h4>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                                  <Clock className="w-4 h-4" />
                                  {skill.estimatedTime}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {skill.description}
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
