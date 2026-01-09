import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Target, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const EDUCATION_LEVELS = [
  'High School',
  'Some College',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Self-taught',
  'Bootcamp Graduate',
];

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'HTML/CSS',
  'TypeScript', 'Java', 'C++', 'Machine Learning', 'Data Analysis',
  'Cloud Computing', 'DevOps', 'Mobile Development', 'UI/UX Design'
];

const POPULAR_TARGETS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'Cloud Architect',
  'Cybersecurity Specialist',
];

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  
  // Form data
  const [educationLevel, setEducationLevel] = useState('');
  const [existingSkills, setExistingSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [targetSkill, setTargetSkill] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);

  const addSkill = (skill: string) => {
    if (skill && !existingSkills.includes(skill)) {
      setExistingSkills([...existingSkills, skill]);
    }
    setCustomSkill('');
  };

  const removeSkill = (skill: string) => {
    setExistingSkills(existingSkills.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (step === 1 && !educationLevel) {
      toast.error('Please select your education level');
      return;
    }
    if (step === 3 && !targetSkill && !customTarget) {
      toast.error('Please select or enter your target skill');
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    const finalTarget = customTarget || targetSkill;
    if (!finalTarget) {
      toast.error('Please select a target skill or role');
      return;
    }

    setLoading(true);
    setGeneratingRoadmap(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          education_level: educationLevel,
          existing_skills: existingSkills,
          target_skill: finalTarget,
          weekly_hours: weeklyHours,
          onboarding_completed: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Generate roadmap via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId,
          educationLevel,
          existingSkills,
          targetSkill: finalTarget,
          weeklyHours,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      toast.success('Your personalized roadmap is ready!');
      onComplete();
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
      setGeneratingRoadmap(false);
    }
  };

  const steps = [
    { icon: GraduationCap, title: 'Education', description: 'Your background' },
    { icon: Sparkles, title: 'Skills', description: 'What you know' },
    { icon: Target, title: 'Goal', description: 'What to learn' },
    { icon: Clock, title: 'Time', description: 'Availability' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  i + 1 <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-1 transition-all ${
                    i + 1 < step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">What's your education background?</h2>
                <p className="text-muted-foreground">This helps us tailor your learning path</p>
              </div>

              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">What skills do you already have?</h2>
                <p className="text-muted-foreground">Select or add your current skills (optional)</p>
              </div>

              {/* Selected Skills */}
              {existingSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {existingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Skills */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.filter(s => !existingSkills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(customSkill)}
                  className="bg-secondary/50"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addSkill(customSkill)}
                  disabled={!customSkill}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">What do you want to learn?</h2>
                <p className="text-muted-foreground">Choose your target skill or career goal</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {POPULAR_TARGETS.map((target) => (
                  <button
                    key={target}
                    onClick={() => {
                      setTargetSkill(target);
                      setCustomTarget('');
                    }}
                    className={`p-3 rounded-lg text-left transition-all ${
                      targetSkill === target
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">or enter custom</span>
                </div>
              </div>

              <Input
                placeholder="Enter your target skill or role..."
                value={customTarget}
                onChange={(e) => {
                  setCustomTarget(e.target.value);
                  setTargetSkill('');
                }}
                className="bg-secondary/50"
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">How much time can you dedicate?</h2>
                <p className="text-muted-foreground">Weekly hours for learning</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 hour</span>
                  <span className="font-display font-bold text-2xl text-foreground">{weeklyHours}h/week</span>
                  <span>40 hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[5, 10, 20].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setWeeklyHours(hours)}
                      className={`py-2 rounded-lg transition-all ${
                        weeklyHours === hours
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {hours}h/week
                    </button>
                  ))}
                </div>
              </div>

              {generatingRoadmap && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div>
                      <p className="font-medium text-primary">Generating your roadmap...</p>
                      <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} className="glow-effect">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} className="glow-effect">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Roadmap
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
