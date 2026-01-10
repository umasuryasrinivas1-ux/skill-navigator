import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  LogOut,
  Sparkles,
  Loader2,
  Code2,
  Globe,
  Zap,
  Shield,
  Database,
  Smartphone,
  Layout,
  Terminal,
  BrainCircuit,
  LineChart,
  Home,
  BookOpen,
  CheckSquare,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import Onboarding from '@/components/Onboarding';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import GeneralAssessment from '@/components/GeneralAssessment';
import ProgressDashboard from '@/components/ProgressDashboard';
import DashboardNavLink from '@/components/DashboardNavLink';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  education_level: string | null;
  existing_skills: string[];
  target_skill: string | null;
  weekly_hours: number;
  weekly_goal_hours?: number;
  onboarding_completed: boolean;
}

interface Roadmap {
  id: string;
  target_skill: string;
  roadmap_data: any;
  created_at: string;
}

type DashboardView = 'home' | 'roadmap';

const CAREERS = [
  { id: 'Full-Stack Development', icon: Globe, label: 'Full-Stack Development', available: true },
  { id: 'Frontend Development', icon: Layout, label: 'Frontend Development', available: true },
  { id: 'Backend Development', icon: Code2, label: 'Backend Development', available: true },
  { id: 'Data Science', icon: Database, label: 'Data Science', available: true },
  { id: 'AI / Machine Learning', icon: BrainCircuit, label: 'AI / Machine Learning', available: true },
  { id: 'Cybersecurity', icon: Shield, label: 'Cybersecurity', available: true },
  { id: 'DevOps', icon: Terminal, label: 'DevOps', available: true },
  { id: 'Mobile App Development', icon: Smartphone, label: 'Mobile App Development', available: true },
  { id: 'Product Management', icon: LineChart, label: 'Product Management', available: true },
  { id: 'UI/UX Design', icon: Layout, label: 'UI/UX Design', available: true },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>('home');

  // Derived State
  // Derived State
  const generalDone = profile?.existing_skills?.some(s => s.startsWith('General_Q4')) ?? false;
  const careerSelected = !!profile?.target_skill;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      setProfile(profileData);

      const { data: roadmapData } = await supabase
        .from('skill_roadmaps')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setRoadmap(roadmapData);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const selectCareer = async (careerId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          target_skill: careerId,
          onboarding_completed: false
        })
        .eq('id', user!.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      toast.error('Failed to select career');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const showFullDashboard = generalDone && careerSelected && profile?.onboarding_completed && roadmap;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl">DoThenDecide</span>
            </div>

            {/* Navigation - only show when roadmap exists */}
            {showFullDashboard && (
              <nav className="hidden md:flex items-center gap-1">
                <DashboardNavLink
                  icon={Home}
                  label="Home"
                  active={currentView === 'home'}
                  onClick={() => setCurrentView('home')}
                />
                <DashboardNavLink
                  icon={BookOpen}
                  label="Roadmap"
                  active={currentView === 'roadmap'}
                  onClick={() => setCurrentView('roadmap')}
                />
                <DashboardNavLink
                  icon={TrendingUp}
                  label="Trends"
                  active={false}
                  onClick={() => navigate('/trends')}
                />
                <DashboardNavLink
                  icon={MessageSquare}
                  label="Mentor"
                  active={false}
                  onClick={() => navigate('/mentor')}
                />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {profile && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile.full_name || user?.email}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Phase 1: General Assessment */}
          {!generalDone && (
            <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneralAssessment userId={user!.id} onComplete={fetchData} />
            </motion.div>
          )}

          {/* Phase 2: Career Selection */}
          {generalDone && !careerSelected && (
            <motion.div key="career" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold font-display">Choose your path</h1>
                <p className="text-muted-foreground text-lg">Select a career track to begin your personalized journey</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CAREERS.map((career) => (
                  <div
                    key={career.id}
                    onClick={() => career.available && selectCareer(career.id)}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 ${career.available
                      ? 'bg-card border-border hover:border-primary/50 hover:shadow-lg cursor-pointer group'
                      : 'bg-secondary/20 border-border/50 opacity-60 cursor-not-allowed'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${career.available ? 'bg-primary/10 text-primary group-hover:scale-110 transition-transform' : 'bg-secondary text-muted-foreground'}`}>
                      <career.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{career.label}</h3>
                    {!career.available && (
                      <span className="inline-block px-2 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 3: Onboarding */}
          {generalDone && careerSelected && !profile?.onboarding_completed && (
            <motion.div key="specific" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Onboarding userId={user!.id} onComplete={fetchData} />
              <div className="text-center mt-8">
                <Button variant="link" onClick={() => selectCareer('')} className="text-muted-foreground">
                  Choose a different career
                </Button>
              </div>
            </motion.div>
          )}

          {/* Phase 4: Home Dashboard */}
          {showFullDashboard && currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressDashboard
                userId={user!.id}
                profile={profile}
                roadmap={roadmap}
                onViewRoadmap={() => setCurrentView('roadmap')}
              />
            </motion.div>
          )}

          {/* Phase 4: Roadmap View */}
          {showFullDashboard && currentView === 'roadmap' && (
            <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RoadmapDisplay
                roadmap={roadmap}
                userId={user!.id}
                onNewRoadmap={async () => {
                  await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', user!.id);
                  fetchData();
                }}
              />
            </motion.div>
          )}

          {/* Loading state */}
          {generalDone && careerSelected && profile?.onboarding_completed && !roadmap && (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Retrieving your plan...</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      {
        showFullDashboard && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
            <div className="flex items-center justify-around h-16">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'home'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <div className={`p-1 rounded-full transition-all ${currentView === 'home' ? 'bg-primary/10' : ''
                  }`}>
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Home</span>
              </button>
              <button
                onClick={() => setCurrentView('roadmap')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'roadmap'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <div className={`p-1 rounded-full transition-all ${currentView === 'roadmap' ? 'bg-primary/10' : ''
                  }`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Roadmap</span>
              </button>
              <button
                onClick={() => navigate('/trends')}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
              >
                <div className="p-1 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Trends</span>
              </button>
              <button
                onClick={() => navigate('/mentor')}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
              >
                <div className="p-1 rounded-full">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Mentor</span>
              </button>
            </div>
          </nav>
        )}
    </div >
  );
}
