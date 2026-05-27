import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  readonly author: any;
}

export function AuthorCard({ author }: Props): React.JSX.Element {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-primary
            font-bold
            text-white
          "
        >
          {author.avatar}
        </div>

        <div>
          <h3 className="font-semibold">{author.name}</h3>

          <p className="text-sm text-on-surface-variant">{author.role}</p>
        </div>
      </div>

      <blockquote
        className="
          border-l-2
          border-primary
          pl-3
          text-sm
          italic
          text-on-surface-variant
        "
      >
        "Chia sẻ kiến thức là cách tốt nhất để học tập."
      </blockquote>

      <Button variant="outline" className="w-full">
        Theo dõi tác giả
      </Button>
    </Card>
  );
}
