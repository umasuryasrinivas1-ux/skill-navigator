import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Sparkles } from 'lucide-react';

interface GeneralAssessmentProps {
    userId: string;
    onComplete: () => void;
}

const QUESTIONS = [
    {
        id: 1,
        question: "How familiar are you with building or learning technical skills?",
        options: [
            "I’m completely new",
            "I’ve tried learning and building a bit",
            "I’m fairly confident and have built things"
        ]
    },
    {
        id: 2,
        question: "When you start learning something new, which best describes you?",
        options: [
            "I need clear step-by-step guidance",
            "I understand faster with examples and practice",
            "I like exploring and improving on my own"
        ]
    },
    {
        id: 3,
        question: "Which statement feels closest to you right now?",
        options: [
            "I’m exploring and figuring things out",
            "I’m preparing seriously for real opportunities",
            "I want to sharpen and level up my skills"
        ]
    },
    {
        id: 4,
        question: "How confident do you feel about your current skill level overall?",
        options: [
            "Not confident yet",
            "Somewhat confident",
            "Very confident"
        ]
    }
];

export default function GeneralAssessment({ userId, onComplete }: GeneralAssessmentProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (option: string) => {
        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            await finishAssessment(newAnswers);
        }
    };

    const finishAssessment = async (finalAnswers: string[]) => {
        setLoading(true);
        try {
            // Store answers as tags/metadata in existing_skills for now, 
            // formatted as "General_Q{i}: {answer}"
            const formattedAnswers = finalAnswers.map((ans, i) => `General_Q${i + 1}: ${ans}`);

            const { error } = await supabase
                .from('profiles')
                .update({
                    existing_skills: formattedAnswers,
                    // We can use a metadata field if available, but schema limitations force us to re-use existing columns creatively 
                    // or we trust the state flow.
                    // Let's mark a flag? We don't have a 'general_onboarding_completed' flag. 
                    // But we can check if existing_skills contains 'General_Q4'.
                })
                .eq('id', userId);

            if (error) throw error;

            onComplete();
        } catch (error) {
            console.error('Error saving assessment:', error);
            toast.error('Failed to save progress');
        } finally {
            setLoading(false);
        }
    };

    const currentQ = QUESTIONS[step];

    return (
        <div className="min-h-[60vh] flex flex-col justify-center max-w-xl mx-auto px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Question {step + 1} of {QUESTIONS.length}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-display leading-tight">
                            {currentQ.question}
                        </h2>
                    </div>

                    <div className="grid gap-3">
                        {currentQ.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                disabled={loading}
                                className="group flex items-center justify-between p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all text-left"
                            >
                                <span className="font-medium text-lg">{option}</span>
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="flex items-center gap-2 text-primary animate-pulse">
                            <Sparkles className="w-4 h-4" />
                            <span>Personalizing your experience...</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
