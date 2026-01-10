import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Home, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trends } from '@/data/trendsData';

export default function TrendsHub() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
                <div className="container px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <h1 className="font-display font-bold text-lg">Trending Domains</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl mx-auto px-4 py-8">
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-display">
                        Future-Proof Your Career
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Explore the hottest tech domains dominating the industry right now.
                        Tap a card to see why it's trending and how to master it.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trends.map((trend, index) => (
                        <motion.div
                            key={trend.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/trends/${trend.id}`)}
                            className="cursor-pointer group relative aspect-square rounded-2xl overflow-hidden border border-border"
                        >
                            <img
                                src={trend.image}
                                alt={trend.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h3 className="text-xl font-bold font-display mb-1 group-hover:text-primary transition-colors">
                                    {trend.title}
                                </h3>
                                <p className="text-sm text-white/80 line-clamp-2">
                                    {trend.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
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
                </div>
            </nav>
        </div>
    );
}
