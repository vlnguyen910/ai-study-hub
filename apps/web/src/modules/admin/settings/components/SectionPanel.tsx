import type { ReactNode } from "react";
import { AdminCard, MaterialIcon } from "../../components/AdminPrimitives";

interface SectionPanelProps {
  readonly icon: string;
  readonly title: string;
  readonly children: ReactNode;
}

export function SectionPanel({
  icon,
  title,
  children,
}: SectionPanelProps): React.JSX.Element {
  return (
    <AdminCard className="overflow-hidden">
      <div className="flex w-full items-center gap-3 border-b border-outline-variant p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-primary-fixed text-primary">
          <MaterialIcon name={icon} />
        </span>
        <span className="text-xl font-semibold tracking-normal text-on-surface">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </AdminCard>
  );
}
