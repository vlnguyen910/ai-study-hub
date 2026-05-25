import type { FC, ReactNode } from "react";

export const DocumentCarousel: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full">
      <div
        className="
          flex
          gap-6
          overflow-x-auto
          scroll-smooth
          snap-x snap-mandatory
          px-1
          pb-2

          [&::-webkit-scrollbar]:hidden
        "
      >
        {children}
      </div>
    </div>
  );
};
