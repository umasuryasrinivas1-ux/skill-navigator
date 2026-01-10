import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MonkeyAssistant() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Show tooltip occasionally
    useEffect(() => {
        const interval = setInterval(() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 4000);
        }, 15000); // Every 15 seconds

        // Initial delay
        const timeout = setTimeout(() => setShowTooltip(true), 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const handleClick = () => {
        navigate('/weak-points-hub');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Speech Bubble Tooltip */}
            <AnimatePresence>
                {(showTooltip || isHovered) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="mb-4 mr-2 bg-white dark:bg-zinc-800 text-foreground px-4 py-3 rounded-2xl shadow-xl border border-border max-w-[200px] relative pointer-events-auto"
                    >
                        <p className="text-sm font-medium">
                            Stuck? I can show you common tricky spots! 🍌
                        </p>
                        {/* Bubble arrow */}
                        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-zinc-800 border-b border-r border-border rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D Monkey Character */}
            <motion.div
                className="relative cursor-pointer pointer-events-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
                animate={{
                    y: [0, -8, 0], // Bobbing idle animation
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9, y: 5 }}
            >
                <div className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl filter hover:brightness-110 transition-all">
                    <img
                        src="/monkey-3d-transparent.png"
                        alt="AI Assistant"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 opacity-50 animate-pulse" />
            </motion.div>
        </div>
    );
}
