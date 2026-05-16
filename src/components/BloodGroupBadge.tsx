const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

export const BLOOD_GROUP_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'A-': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'B+': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'B-': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'AB+': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'AB-': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'O+': 'bg-red-500/20 text-red-400 border-red-500/30',
  'O-': 'bg-red-500/10 text-red-300 border-red-500/20',
};

export function BloodGroupBadge({ group, size = 'md' }: { group: string; size?: 'sm' | 'md' | 'lg' }) {
  const colorClass = BLOOD_GROUP_COLORS[group] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-lg' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${colorClass} ${sizeClass}`}>
      {group}
    </span>
  );
}

export { BLOOD_GROUPS };
