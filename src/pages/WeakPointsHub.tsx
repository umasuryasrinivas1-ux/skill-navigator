import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { exampleWeakPoints } from '@/data/weakPointsExamples';

export default function WeakPointsHub() {
    const navigate = useNavigate();

    // Aggregate all weak points
    const allWeakPoints = [
        { category: 'HTML', items: exampleWeakPoints.html },
        { category: 'CSS', items: exampleWeakPoints.css },
        { category: 'JavaScript', items: exampleWeakPoints.javaScript },
        { category: 'React', items: exampleWeakPoints.reactHooks },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
                <div className="container px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🙊</span>
                        <h1 className="font-display font-bold text-lg">My Learning Guide</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="glass-card p-6 md:p-8 bg-primary/5 border-primary/20">
                    <h2 className="text-2xl font-bold font-display mb-2">Hey there! I'm your assistant.</h2>
                    <p className="text-muted-foreground">
                        I've noticed some topics that many learners find tricky. Let's master them together so you don't get stuck!
                    </p>
                </div>

                <div className="grid gap-8">
                    {allWeakPoints.map((section) => (
                        <div key={section.category} className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                {section.category} Tricky Spots
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                {section.items.map((point) => (
                                    <motion.div
                                        key={point.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(`/weak-point/${point.id}`, { state: { weakPoint: point, skillName: section.category, phase: 'General' } })}
                                        className="cursor-pointer group relative p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                                    {point.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {point.summary}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full border ${point.difficulty === 'beginner' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                                                    point.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-700 border-red-500/20'
                                                }`}>
                                                {point.difficulty.charAt(0).toUpperCase() + point.difficulty.slice(1)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
