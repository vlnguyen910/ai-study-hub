import { Card } from "@/components/ui/Card";

interface DocumentStatsBarProps {
  readonly total: number;
  readonly approved: number;
  readonly pending: number;
  readonly isLoading: boolean;
}

interface StatCardProps {
  readonly label: string;
  readonly value: number;
  readonly accentClassName: string;
}

function StatCard({
  label,
  value,
  accentClassName,
}: StatCardProps): React.JSX.Element {
  return (
    <Card className="p-4 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-on-surface-variant">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-on-surface">{value}</p>
        </div>
        <span
          className={`material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${accentClassName}`}
          aria-hidden="true"
        >
          folder
        </span>
      </div>
    </Card>
  );
}

export function DocumentStatsBar({
  total,
  approved,
  pending,
  isLoading,
}: DocumentStatsBarProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[88px] animate-pulse rounded-2xl border border-outline-variant bg-surface-container-lowest"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Tài liệu"
        value={total}
        accentClassName="bg-primary/10 text-primary"
      />
      <StatCard
        label="Đã duyệt"
        value={approved}
        accentClassName="bg-success-container/40 text-success"
      />
      <StatCard
        label="Chờ duyệt"
        value={pending}
        accentClassName="bg-warning-container/40 text-warning"
      />
    </div>
  );
}
