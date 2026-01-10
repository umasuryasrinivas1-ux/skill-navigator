import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Zap,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CAREERS } from '@/data/careers';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ProgressDashboardProps {
  userId: string;
  profile: {
    full_name: string | null;
    weekly_hours: number;
    weekly_goal_hours?: number;
    existing_skills: string[];
  };
  roadmap: {
    id: string;
    target_skill: string;
  } | null;
  onViewRoadmap: () => void;
}

interface LearningActivity {
  date: string;
  minutes_spent: number;
  skills_completed: number;
}

interface SkillProgress {
  completed: boolean;
  completed_at: string | null;
}

export default function ProgressDashboard({
  userId,
  profile,
  roadmap,
  onViewRoadmap,
}: ProgressDashboardProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  useEffect(() => {
    fetchData();
  }, [userId, roadmap?.id]);

  const fetchData = async () => {
    try {
      // Fetch last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activityData } = await supabase
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setActivities(activityData || []);

      // Calculate streak
      calculateStreak(activityData || []);

      // Calculate totals
      const total = (activityData || []).reduce((sum, a) => sum + a.minutes_spent, 0);
      setTotalMinutes(total);

      // Calculate weekly minutes
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekly = (activityData || [])
        .filter(a => new Date(a.date) >= weekAgo)
        .reduce((sum, a) => sum + a.minutes_spent, 0);
      setWeeklyMinutes(weekly);

      // Fetch skill progress if roadmap exists
      if (roadmap?.id) {
        const { data: progressData } = await supabase
          .from('skill_progress')
          .select('completed, completed_at')
          .eq('roadmap_id', roadmap.id);

        setSkillProgress(progressData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (data: LearningActivity[]) => {
    if (data.length === 0) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has activity today or yesterday to start counting
    const sortedData = [...data].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedData.length; i++) {
      const activityDate = new Date(sortedData[i].date);
      activityDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (activityDate.getTime() === expectedDate.getTime() && sortedData[i].minutes_spent > 0) {
        currentStreak++;
      } else if (i === 0 && activityDate.getTime() === today.getTime() - 86400000) {
        // Yesterday is ok for first check
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const getWeeklyGoalProgress = () => {
    const goalMinutes = (profile.weekly_goal_hours || profile.weekly_hours || 10) * 60;
    return Math.min(100, Math.round((weeklyMinutes / goalMinutes) * 100));
  };

  const getSkillCompletionRate = () => {
    if (skillProgress.length === 0) return 0;
    const completed = skillProgress.filter(s => s.completed).length;
    return Math.round((completed / skillProgress.length) * 100);
  };

  const getChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const activity = activities.find(a => a.date === dateStr);
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: activity?.minutes_spent || 0,
        skills: activity?.skills_completed || 0,
      });
    }
    return last7Days;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const recommendedIds = profile.existing_skills
    .filter(s => s.startsWith('Recommended: '))
    .map(s => s.replace('Recommended: ', ''))
    .filter(id => id !== roadmap?.target_skill); // Don't show current skill

  // If no recommendations stored, show default suggestions
  const defaultRecommendations = ['Full-Stack Development', 'Frontend Development', 'Data Science'];
  const idsToUse = recommendedIds.length > 0 ? recommendedIds : defaultRecommendations.filter(id => id !== roadmap?.target_skill);

  const recommendations = CAREERS.filter(c => idsToUse.includes(c.id));

  const firstName = profile.full_name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          {streak > 0
            ? `You're on a ${streak} day streak! Keep it up!`
            : 'Start learning today to build your streak!'}
        </p>
      </motion.div>

      {/* Personalized Recommendations - Prominent Position */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 rounded-2xl blur-xl animate-pulse" />

          <div className="relative glass-card p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-lg shadow-primary/10">
            <div className="relative z-10">
              {/* Header with badge */}
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 mb-3">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl">
                  {recommendedIds.length > 0 ? '✨ Best Recommended Career for You' : 'Explore New Paths'}
                </h3>
                <p className="text-sm text-muted-foreground">Based on your interests and skills</p>
              </div>

              {/* Career Cards - Horizontal Layout */}
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                {recommendations.slice(0, 2).map((career, index) => (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex-1 max-w-sm group flex items-center gap-4 p-5 rounded-xl bg-background/80 border border-border/50 hover:border-primary/50 hover:bg-background hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                      <career.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">{career.label}</p>
                      <p className="text-sm text-muted-foreground">Click to explore</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Streak Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <p className="text-3xl font-bold font-display">{streak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>

        {/* Time Spent Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">This Week</span>
          </div>
          <p className="text-3xl font-bold font-display">{formatTime(weeklyMinutes)}</p>
          <p className="text-xs text-muted-foreground">
            of {(profile.weekly_goal_hours || profile.weekly_hours || 10)}h goal
          </p>
        </div>

        {/* Skills Completed Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold font-display">
            {skillProgress.filter(s => s.completed).length}
          </p>
          <p className="text-xs text-muted-foreground">
            of {skillProgress.length} skills
          </p>
        </div>

        {/* Progress Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
          <p className="text-3xl font-bold font-display">{getSkillCompletionRate()}%</p>
          <p className="text-xs text-muted-foreground">overall completion</p>
        </div>
      </motion.div>

      {/* Weekly Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Weekly Goal</h2>
          </div>
          <span className="text-2xl font-bold gradient-text">
            {getWeeklyGoalProgress()}%
          </span>
        </div>
        <Progress value={getWeeklyGoalProgress()} className="h-3 mb-3" />
        <p className="text-sm text-muted-foreground">
          {formatTime(weeklyMinutes)} of {(profile.weekly_goal_hours || profile.weekly_hours || 10)} hours this week
        </p>
      </motion.div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Learning Activity</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                  dataKey="minutes"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Minutes"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skills Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Skills Completed</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="skills"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Skills"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 h-full flex flex-col justify-center"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">
                    Continue Learning: {roadmap.target_skill}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pick up where you left off
                  </p>
                </div>
              </div>
              <Button onClick={onViewRoadmap} className="gap-2 shrink-0">
                View Roadmap
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}