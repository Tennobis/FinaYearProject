import { Card } from '@/components/ui/Card';

export function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5" />
        </div>
        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
      </div>
    </Card>
  );
}
