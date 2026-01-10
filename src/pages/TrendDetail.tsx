import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, TrendingUp, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trends } from '@/data/trendsData';
import { useEffect, useState } from 'react';

export default function TrendDetail() {
    const { trendId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const trend = trends.find(t => t.id === trendId);

    if (!trend) {
        return <Navigate to="/trends" replace />;
    }

    const handleGenerateRoadmap = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Please sign in to generate a roadmap");
                navigate('/auth');
                return;
            }

            // Update profile with target skill and reset onboarding
            const { error } = await supabase
                .from('profiles')
                .update({
                    target_skill: trend.targetSkillId,
                    onboarding_completed: false
                })
                .eq('id', session.user.id);

            if (error) throw error;

            toast.success(`Starting your ${trend.title} journey!`);
            navigate('/dashboard');

        } catch (error) {
            console.error('Error selecting trend:', error);
            toast.error('Failed to start roadmap');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Image Background */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    src={trend.image}
                    alt="Background"
                    className="w-full h-full object-cover blur-3xl"
                />
                <div className="absolute inset-0 bg-background/80" />
            </div>

            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
                <div className="container px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/trends')} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <h1 className="font-display font-bold text-lg hidden md:block">{trend.title}</h1>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={handleGenerateRoadmap} disabled={loading} className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate Roadmap
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 relative z-10">

                <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border"
                    >
                        <img src={trend.image} alt={trend.title} className="w-full h-full object-cover" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            Trending Now
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                            {trend.title}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {trend.description}
                        </p>

                        <div className="glass-card p-6 border-l-4 border-l-primary">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Why it's hot
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {trend.whyTrending}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Key Skills You'll Learn
                        </h3>
                        <ul className="space-y-3">
                            {trend.keySkills.map((skill, i) => (
                                <li key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-medium">{skill}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            High-Level Path
                        </h3>
                        <div className="space-y-4">
                            {trend.learningPath.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {i + 1}
                                        </div>
                                        {i < trend.learningPath.length - 1 && (
                                            <div className="w-px flex-1 bg-border my-1" />
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className="font-medium pt-1">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={handleGenerateRoadmap} size="lg" disabled={loading} className="w-full md:w-auto min-w-[200px] h-12 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                        <Sparkles className="w-5 h-5" />
                        Generate {trend.title} Roadmap
                    </Button>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Instantly create a personalized plan based on this stack
                    </p>
                </div>

            </main>
        </div>
    );
}
