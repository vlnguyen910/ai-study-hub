import type { FC, ReactNode } from "react";

export interface ToastProps {
  readonly icon?: ReactNode;
  readonly message: string;
}

export const Toast: FC<ToastProps> = ({ icon, message }) => {
  return (
    <div className="bg-surface shadow-md border border-outline-variant rounded-xl p-3 flex items-center gap-3 w-max">
      {icon ? (
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          {icon}
        </div>
      ) : null}
      <span className="font-medium text-sm text-on-surface">{message}</span>
    </div>
  );
};
