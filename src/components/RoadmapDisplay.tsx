import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  Layout,
  Server,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import RoadmapExportShare from './RoadmapExportShare';

interface Phase {
  name: string;
  skills: any[];
  duration_days?: number;
  description?: string;
}

interface RoadmapData {
  phases: Phase[];
}

interface RoadmapDisplayProps {
  roadmap: {
    id: string;
    target_skill: string;
    roadmap_data: RoadmapData;
  };
  userId: string;
  onNewRoadmap: () => void;
}

// Define the three main modules
const MAIN_MODULES = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    description: 'Build beautiful, responsive user interfaces with modern web technologies',
    icon: Layout,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Create powerful server-side applications and APIs',
    icon: Server,
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    borderColor: 'border-violet-500/30',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Master data storage, retrieval, and management techniques',
    icon: Database,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
];

export default function RoadmapDisplay({ roadmap, userId, onNewRoadmap }: RoadmapDisplayProps) {
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string) => {
    navigate(`/roadmap/${roadmap.id}/module/${moduleId}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
          <Target className="w-4 h-4" />
          <span className="font-medium text-sm">Your Learning Path</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          {roadmap.target_skill}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Master each core area step by step. Click on any module to explore detailed topics and resources.
        </p>

        {/* Export & Share */}
        <div className="flex justify-center">
          <RoadmapExportShare
            roadmapId={roadmap.id}
            targetSkill={roadmap.target_skill}
            roadmapData={roadmap.roadmap_data}
          />
        </div>
      </motion.div>

      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-8"
      >
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Core Learning Modules</h2>
      </motion.div>

      {/* Three Main Module Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {MAIN_MODULES.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => handleModuleClick(module.id)}
            className={`group cursor-pointer rounded-2xl border ${module.borderColor} bg-gradient-to-br ${module.bgGradient} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10`}
          >
            {/* Module Number */}
            <div className="flex items-center justify-between mb-6">
              <span className={`text-5xl font-display font-bold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent opacity-30`}>
                0{index + 1}
              </span>
              <div className={`p-3 rounded-xl ${module.iconBg} transition-transform group-hover:scale-110`}>
                <module.icon className={`w-6 h-6 ${module.iconColor}`} />
              </div>
            </div>

            {/* Module Content */}
            <h3 className="font-display text-xl font-bold mb-3">{module.name}</h3>
            <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
              {module.description}
            </p>

            {/* CTA */}
            <div className={`flex items-center gap-2 font-medium text-sm bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
              Explore Module
              <ArrowRight className={`w-4 h-4 ${module.iconColor} transition-transform group-hover:translate-x-1`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visual Connection Line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="hidden md:flex items-center justify-center my-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Complete all modules to become a Full-Stack Developer</span>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
