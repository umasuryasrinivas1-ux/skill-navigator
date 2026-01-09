import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DashboardNavLinkProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function DashboardNavLink({ icon: Icon, label, active, onClick }: DashboardNavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}