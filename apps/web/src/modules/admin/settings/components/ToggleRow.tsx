import { Switch } from "@/components/ui/Switch";

interface ToggleRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: ToggleRowProps): React.JSX.Element {
  return (
    <div className="flex min-h-[74px] items-center justify-between gap-4 rounded border border-outline-variant bg-surface p-4">
      <div>
        <p className="font-label-md text-label-md tracking-normal">{label}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
          {checked ? "Đang bật" : "Đang tắt"}
        </p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
