import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, Home, BookOpen, TrendingUp, MessageSquare } from 'lucide-react';
import DashboardNavLink from '@/components/DashboardNavLink';
import { toast } from 'sonner';

interface MainHeaderProps {
    currentView?: 'home' | 'roadmap';
    onViewChange?: (view: 'home' | 'roadmap') => void;
}

export default function MainHeader({ currentView, onViewChange }: MainHeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                getProfile(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                getProfile(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const getProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', userId)
                .single();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
        toast.success('Logged out successfully');
    };

    const isDashboard = location.pathname === '/dashboard';

    // Determine active state
    // If in Dashboard, use currentView prop.
    // If not, check path.
    const isHomeActive = isDashboard && currentView === 'home';
    const isRoadmapActive = isDashboard && currentView === 'roadmap';
    const isTrendsActive = location.pathname.startsWith('/trends');
    const isMentorActive = location.pathname.startsWith('/mentor');

    const handleNavigation = (target: 'home' | 'roadmap' | 'trends' | 'mentor') => {
        if (target === 'home') {
            if (isDashboard && onViewChange) {
                onViewChange('home');
            } else {
                navigate('/dashboard');
            }
        } else if (target === 'roadmap') {
            if (isDashboard && onViewChange) {
                onViewChange('roadmap');
            } else {
                // Navigate to dashboard and signal to show roadmap? 
                // For now just go to dashboard, we might need to handle query params in Dashboard to switch view.
                navigate('/dashboard?view=roadmap');
            }
        } else if (target === 'trends') {
            navigate('/trends');
        } else if (target === 'mentor') {
            navigate('/mentor');
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="font-display font-bold text-primary-foreground text-xl">D</span>
                        </div>
                        <span className="font-display font-bold text-xl hidden sm:inline-block">DoThenDecide</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <DashboardNavLink
                            icon={Home}
                            label="Home"
                            active={isHomeActive}
                            onClick={() => handleNavigation('home')}
                        />
                        <DashboardNavLink
                            icon={BookOpen}
                            label="Roadmap"
                            active={isRoadmapActive}
                            onClick={() => handleNavigation('roadmap')}
                        />
                        <DashboardNavLink
                            icon={TrendingUp}
                            label="Trends"
                            active={isTrendsActive}
                            onClick={() => handleNavigation('trends')}
                        />
                        <DashboardNavLink
                            icon={MessageSquare}
                            label="Mentor"
                            active={isMentorActive}
                            onClick={() => handleNavigation('mentor')}
                        />
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {profile && (
                        <span className="text-sm text-muted-foreground hidden lg:block">
                            {profile.full_name || profile.email}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
