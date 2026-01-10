import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Layout,
  Server,
  Database,
  BookOpen,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  CheckSquare,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Skill {
  name: string;
  estimatedTime?: string;
  days?: string;
  description: string;
  resources?: string[];
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

interface Roadmap {
  id: string;
  target_skill: string;
  roadmap_data: RoadmapData;
  created_at: string;
}

const getTopicColor = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (lower.includes('frontend') || lower.includes('foundation') || lower.includes('basic') || lower.includes('beginner')) return 'phase-beginner';
  if (lower.includes('backend') || lower.includes('core') || lower.includes('intermediate')) return 'phase-intermediate';
  if (lower.includes('database') || lower.includes('advanced') || lower.includes('mastery') || lower.includes('infrastructure')) return 'phase-advanced';
  const colors = ['phase-beginner', 'phase-intermediate', 'phase-advanced', 'phase-market'];
  return colors[index % colors.length];
};

const getTopicIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('frontend') || lower.includes('foundation') || lower.includes('basic') || lower.includes('beginner')) return <Layout className="w-6 h-6" />;
  if (lower.includes('backend') || lower.includes('core') || lower.includes('intermediate')) return <Server className="w-6 h-6" />;
  if (lower.includes('database') || lower.includes('advanced') || lower.includes('mastery') || lower.includes('infrastructure')) return <Database className="w-6 h-6" />;
  return <BookOpen className="w-6 h-6" />;
};

export default function SharedRoadmap() {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchRoadmap();
    }
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_roadmaps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Roadmap not found');

      const roadmapData = data.roadmap_data as unknown as RoadmapData;
      setRoadmap({ ...data, roadmap_data: roadmapData });
      if (roadmapData?.phases?.length > 0) {
        setExpandedPhases([roadmapData.phases[0].name]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseName: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseName)
        ? prev.filter(p => p !== phaseName)
        : [...prev, phaseName]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">{error || 'Roadmap not found'}</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">DoThenDecide</span>
          </Link>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
            <Target className="w-4 h-4" />
            <span className="font-medium">Shared Roadmap</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {roadmap.target_skill}
          </h1>
          <p className="text-muted-foreground">
            A learning path created with DoThenDecide
          </p>
        </motion.div>

        {/* Phases */}
        <div className="space-y-4">
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
                        {phase.skills.length} subtopics
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {phase.skills.map((skill, skillIndex) => {
                        const timeDisplay = skill.days || skill.estimatedTime;

                        return (
                          <div
                            key={skill.name}
                            className="p-4 rounded-lg bg-secondary/30 border border-border"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h4 className="font-medium">
                                {skillIndex + 1}. {skill.name}
                              </h4>
                              {timeDisplay && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {timeDisplay}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {skill.description}
                            </p>

                            {skill.resources && skill.resources.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {skill.resources.map((resource, i) => {
                                  const isYouTube = resource.toLowerCase().includes('youtube');
                                  let href = resource;
                                  if (!resource.startsWith('http')) {
                                    if (isYouTube) {
                                      href = `https://www.youtube.com/results?search_query=${encodeURIComponent(resource.replace(/^YouTube:\s*/i, ''))}`;
                                    } else {
                                      href = `https://www.google.com/search?q=${encodeURIComponent(resource)}`;
                                    }
                                  }

                                  return (
                                    <a
                                      key={i}
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${isYouTube
                                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                        : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                                        }`}
                                    >
                                      {isYouTube ? '▶️' : '📖'}
                                      <span className="font-medium">{isYouTube ? 'Tutorial' : 'Docs'}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="glass-card p-8">
            <h2 className="font-display text-2xl font-bold mb-2">Want your own personalized roadmap?</h2>
            <p className="text-muted-foreground mb-6">
              Create a free account and get AI-generated learning paths tailored to your goals.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
