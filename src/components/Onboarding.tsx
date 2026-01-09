import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Code2,
  Globe,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

// Q1: Experience Level
const EXP_LEVELS = [
  { id: 'Beginner', label: 'I’m just starting out', sub: 'Starting my journey' },
  { id: 'Intermediate', label: 'I’ve built a few things and understand the basics', sub: 'Ready for more complexity' },
  { id: 'Advanced', label: 'I build full applications confidently', sub: 'Polishing my skills' },
];

// Q1 Follow-ups
const EXP_FOLLOWUPS = {
  'Beginner': [
    { id: 'Zero', label: 'I’ve never built a website or app' },
    { id: 'HTML_CSS', label: 'I’ve tried HTML/CSS but no real apps' },
    { id: 'Tutorials', label: 'I’ve followed tutorials but never built end-to-end projects' },
  ],
  'Intermediate': [
    { id: 'Frontend_Small', label: 'Small frontend apps (forms, dashboards, UI)' },
    { id: 'Full_Basic', label: 'Apps with frontend and basic backend' },
    { id: 'Full_API', label: 'Apps using APIs, authentication, or databases' },
  ],
  'Advanced': [
    { id: 'Frontend_Arch', label: 'Frontend architecture and performance' },
    { id: 'Backend_Scale', label: 'Backend systems and scalability' },
    { id: 'Clean_Code', label: 'Clean code and best practices' },
    { id: 'Market_Ready', label: 'Market or interview readiness' },
  ]
};

// Q2: Goals
const GOALS = [
  { id: 'Job', label: 'Get a Full-Stack developer job', icon: Briefcase },
  { id: 'Startup', label: 'Build my own product or startup', icon: Rocket },
  { id: 'Freelance', label: 'Freelancing or client projects', icon: Globe },
  { id: 'Fundamentals', label: 'Strengthen my Full-Stack fundamentals', icon: Layers },
];

// Q3: Time & Duration
const DURATIONS = [
  { id: 30, label: '30 Days' },
  { id: 60, label: '60 Days' },
  { id: 90, label: '90 Days' },
  { id: 180, label: '6 Months' },
];

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0); // Start at 0, which is Q1
  const [loading, setLoading] = useState(false);

  // State
  const [expLevel, setExpLevel] = useState<string>('');
  const [expDetail, setExpDetail] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [dailyHours, setDailyHours] = useState<number>(1);
  const [targetDuration, setTargetDuration] = useState<number>(30); // days

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Calculate weekly hours
      const weeklyHours = Math.ceil(dailyHours * 7);

      // Prepare context for the edge function
      const context = {
        level: expLevel,
        background: expDetail,
        goal: goal,
        daily_time: dailyHours,
        target_duration: targetDuration // days
      };

      // 1. Fetch current profile to preserve General Assessment tags
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('existing_skills')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentSkills = currentProfile?.existing_skills || [];
      // Avoid duplicates if they retry
      const newTags = [`Goal: ${goal}`, `Detail: ${expDetail}`];
      const mergedSkills = [...new Set([...currentSkills, ...newTags])];

      // 2. Update profile with merged skills
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          education_level: expLevel,
          existing_skills: mergedSkills, // Preserves General_Q4 tag
          weekly_hours: weeklyHours,
          onboarding_completed: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Generate Roadmap via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId,
          targetSkill: 'Full-Stack Development',
          educationLevel: expLevel,
          existingSkills: context.background ? [context.background] : [],
          weeklyHours: weeklyHours,
          context: context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      // Direct transition
      onComplete();

    } catch (error: any) {
      console.error('Error in onboarding:', error);
      toast.error('Failed to create your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="w-full h-1 bg-secondary rounded-full mb-12 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Experience Level */}
        {step === 0 && (
          <motion.div key="step0" {...fadeIn} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Experience Level</h2>
              <p className="text-muted-foreground">How would you describe your experience with building web applications?</p>
            </div>
            <div className="grid gap-3">
              {EXP_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => { setExpLevel(level.id); handleNext(); }}
                  className="group p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all text-left"
                >
                  <div className="font-semibold text-lg">{level.label}</div>
                  <div className="text-sm text-muted-foreground">{level.sub}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Follow-up Detail */}
        {step === 1 && (
          <motion.div key="step1" {...fadeIn} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Let's get specific</h2>
              <p className="text-muted-foreground">
                {expLevel === 'Beginner' && "What best describes where you are right now?"}
                {expLevel === 'Intermediate' && "What have you already built on your own?"}
                {expLevel === 'Advanced' && "Which area do you want to improve the most?"}
              </p>
            </div>
            <div className="grid gap-3">
              {EXP_FOLLOWUPS[expLevel as keyof typeof EXP_FOLLOWUPS].map((option) => (
                <button
                  key={option.id}
                  onClick={() => { setExpDetail(option.id); handleNext(); }}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all text-left font-medium"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={handleBack} className="mt-4">Back</Button>
          </motion.div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <motion.div key="step2" {...fadeIn} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Your Main Goal</h2>
              <p className="text-muted-foreground">What do you want to achieve with Full-Stack skills?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGoal(g.id); handleNext(); }}
                  className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all text-center flex flex-col items-center gap-3 h-40 justify-center"
                >
                  <g.icon className="w-8 h-8 text-primary/80" />
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={handleBack} className="mt-4">Back</Button>
          </motion.div>
        )}

        {/* Step 3: Time & Duration */}
        {step === 3 && (
          <motion.div key="step3" {...fadeIn} className="space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Commitment</h2>
              <p className="text-muted-foreground">How much time can you spend, and for how long?</p>
            </div>

            {/* Daily Time */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground block">Daily Study Time</label>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <input
                  type="range" min="0.5" max="8" step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="font-mono font-bold w-16 text-right">{dailyHours}h</span>
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground block">Target Readiness</label>
              <div className="grid grid-cols-2 gap-3">
                {DURATIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setTargetDuration(d.id)}
                    className={`p-3 rounded-lg border transition-all ${targetDuration === d.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card/30 hover:bg-card'
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button onClick={handleComplete} disabled={loading} className="w-full gap-2 text-lg h-12">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate My Plan
              </Button>
              <Button variant="ghost" onClick={handleBack} className="w-full mt-2" disabled={loading}>Back</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
