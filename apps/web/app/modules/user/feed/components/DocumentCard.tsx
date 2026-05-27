import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { FC } from "react";

interface DocumentCardProps {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  pageCount: number;
  className?: string;
}

export const DocumentCard: FC<DocumentCardProps> = ({
  id,
  title,
  subtitle,
  coverImage,
  pageCount,
  className = "",
}) => {
  return (
    <Link href={`/documents/${id}`}>
      <div
        className={`
          group
          w-[320px]
          shrink-0
          cursor-pointer
          select-none
          snap-start
          ${className}
  `}
      >
        {/* CARD INNER (no border, no bg → glass/clean feel) */}
        <div className="flex h-[420px] flex-col">
          {/* ===================== SECTION 1 (2/3) ===================== */}
          <div className="relative flex-[2] overflow-hidden rounded-2xl">
            <img
              src={coverImage}
              alt={title}
              className="
              h-full w-full object-cover
              transition-transform duration-300
              group-hover:scale-[1.03]
            "
            />

            {/* subtle overlay for readability */}
            <div className="absolute inset-0 bg-black/10" />

            {/* badge bottom-right */}
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-white text-black shadow-sm">
                {pageCount} pages
              </Badge>
            </div>
          </div>

          {/* ===================== SECTION 2 (1/3) ===================== */}
          <div className="flex flex-[1] flex-col justify-center px-1 pt-3">
            <h3 className="text-base font-semibold leading-snug line-clamp-2 text-on-surface">
              {title}
            </h3>

            <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
