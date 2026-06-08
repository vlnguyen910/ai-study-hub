import { Button } from "@/components/ui/Button";

interface Props {
  readonly data: any;
}

export function DocumentHero({ data }: Props): React.JSX.Element {
  return (
    <section
      className="
        rounded-2xl
        border
        border-outline-variant
        bg-surface
        p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        {/* Left */}
        <div className="space-y-4">
          <h1
            className="
              max-w-3xl
              text-3xl
              font-bold
              leading-tight
            "
          >
            {data.title}
          </h1>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-4
              text-sm
              text-on-surface-variant
            "
          >
            {/* Avatar */}
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-primary
                font-semibold
                text-white
              "
            >
              {data.author.avatar}
            </div>

            <div>
              <p className="font-medium text-on-surface">{data.author.name}</p>

              <p>{data.author.role}</p>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined">visibility</span>
              <span> {data.stats.views}</span>

              <span className="material-symbols-outlined">download</span>
              <span> {data.stats.downloads}</span>

              <span className="material-symbols-outlined">favorite</span>
              <span> {data.stats.likes}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="primary">Tải xuống</Button>

          <Button variant="outline">Lưu lại</Button>
        </div>
      </div>
    </section>
  );
}
