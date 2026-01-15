'use client';

import { CheckCircle2, AlertCircle, XCircle, Edit } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  variant: 'success' | 'info' | 'danger' | 'warning';
  label: string;
}

const variantStyles = {
  success: {
    cardBg: 'bg-white dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-slate-700 dark:text-emerald-100',
    count: 'text-emerald-600 dark:text-emerald-300',
    Icon: CheckCircle2
  },
  info: {
    cardBg: 'bg-white dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-slate-700 dark:text-blue-100',
    count: 'text-blue-600 dark:text-blue-300',
    Icon: AlertCircle
  },
  danger: {
    cardBg: 'bg-white dark:bg-red-900/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-slate-700 dark:text-red-100',
    count: 'text-red-600 dark:text-red-300',
    Icon: XCircle
  },
  warning: {
    cardBg: 'bg-white dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-slate-700 dark:text-purple-100',
    count: 'text-purple-600 dark:text-purple-300',
    Icon: Edit
  }
};

export function StatCard({ title, count, variant, label }: StatCardProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.cardBg} p-4 transition-all hover:shadow-lg hover:-translate-y-1 duration-200 shadow-sm relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${styles.iconBg} rounded-full blur-3xl -mr-12 -mt-12 transition-all opacity-50 group-hover:opacity-100`}></div>
      
      <div className="relative z-10 flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${styles.iconBg} transition-colors`}>
          <Icon className={`h-6 w-6 ${styles.icon}`} />
        </div>
        <h3 className={`font-medium text-sm ${styles.text} uppercase tracking-wide`}>{title}</h3>
      </div>
      
      <div className="relative z-10 space-y-1 pl-1">
        <div className={`text-3xl font-bold ${styles.count} tracking-tight`}>
          {count.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
}
