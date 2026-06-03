import { Card } from "@/components/ui/Card";

interface Props {
  readonly document: any;
}

export function RelatedDocumentCard({ document }: Props): React.JSX.Element {
  return (
    <Card className="flex gap-4 p-4">
      <div
        className="
          h-20
          w-16
          shrink-0
          rounded-md
          bg-slate-300
        "
      />

      <div className="space-y-2">
        <h4 className="line-clamp-2 text-sm font-semibold">{document.title}</h4>

        <p className="text-xs text-on-surface-variant">{document.author}</p>

        <p className="text-xs">⭐ {document.rating}</p>
      </div>
    </Card>
  );
}
