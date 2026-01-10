import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CAREERS } from '@/data/careers';
import {
  LogOut,
  Sparkles,
  Loader2,
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
import MainHeader from '@/components/MainHeader';
import { useSearchParams } from 'react-router-dom';

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
  phases: any[];
  created_at: string;
}

type DashboardView = 'home' | 'roadmap';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>(
    (searchParams.get('view') as DashboardView) || 'home'
  );

  useEffect(() => {
    const view = searchParams.get('view') as DashboardView;
    if (view === 'home' || view === 'roadmap') {
      setCurrentView(view);
    }
  }, [searchParams]);

  // Derived State
  // Derived State
  const generalDone = profile?.existing_skills?.some(s => s.startsWith('General_Q5')) ?? false;
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
      <MainHeader
        currentView={currentView}
        onViewChange={setCurrentView}
      />

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
                {CAREERS.map((career) => {
                  const isRecommended = profile?.existing_skills?.includes(`Recommended: ${career.id}`);

                  return (
                    <div
                      key={career.id}
                      onClick={() => career.available && selectCareer(career.id)}
                      className={`relative p-6 rounded-2xl border transition-all duration-300 ${career.available
                        ? isRecommended
                          ? 'bg-primary/5 border-primary shadow-md hover:shadow-xl cursor-pointer group ring-1 ring-primary/20'
                          : 'bg-card border-border hover:border-primary/50 hover:shadow-lg cursor-pointer group'
                        : 'bg-secondary/20 border-border/50 opacity-60 cursor-not-allowed'
                        }`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${career.available
                        ? isRecommended
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform'
                          : 'bg-primary/10 text-primary group-hover:scale-110 transition-transform'
                        : 'bg-secondary text-muted-foreground'
                        }`}>
                        <career.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{career.label}</h3>
                      {!career.available && (
                        <span className="inline-block px-2 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  );
                })}
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
                profile={{
                  ...profile,
                  existing_skills: profile.existing_skills || []
                }}
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
