import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Home, BookOpen, MessageSquare, Code2, Brain, BarChart3, Cloud, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trends } from '@/data/trendsData';
import MainHeader from '@/components/MainHeader';

const getIcon = (id: string) => {
    switch (id) {
        case 'full-stack': return Code2;
        case 'ml-engineering': return Brain;
        case 'data-science': return BarChart3;
        case 'devops': return Cloud;
        default: return Code2;
    }
};

export default function TrendsHub() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <MainHeader />

            <main className="container max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-10 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-display">
                        Future-Proof Your Career
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Explore the hottest tech domains dominating the industry right now.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {trends.map((trend, index) => {
                        const Icon = getIcon(trend.id);
                        return (
                            <motion.div
                                key={trend.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.01 }}
                                onClick={() => navigate(`/trends/${trend.id}`)}
                                className={`cursor-pointer group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border ${trend.gradient.split(' ')[2]}`} // using border color from gradient string
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${trend.gradient} opacity-100`} />

                                {/* Content */}
                                <div className="relative p-6 h-full min-h-[180px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${trend.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                                            {trend.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                            {trend.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        <span>Explore path</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
                <div className="flex items-center justify-around h-16">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <div className="p-1 rounded-full">
                            <Home className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Home</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <div className="p-1 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Roadmap</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-primary"
                    >
                        <div className="p-1 rounded-full bg-primary/10">
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
        </div>
    );
}
