import { Droplets } from 'lucide-react';

export default function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Droplets className="w-8 h-8 text-slate-500" />
      </div>
      <p className="text-slate-400 text-lg mb-4">{message}</p>
      {action}
    </div>
  );
}
