"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";

type AuthMode = "login" | "register";

export interface AuthLayoutProps {
  readonly mode: AuthMode;
  readonly title: string;
  readonly subtitle?: string;
  readonly switchHref: string;
  readonly switchText: string;
  readonly switchCta: string;
  readonly children: ReactNode;
}

const slideTiming = "cubic-bezier(0.4,0,0.2,1)";

export default function AuthLayout({
  mode,
  title,
  subtitle,
  switchHref,
  switchText,
  switchCta,
  children,
}: AuthLayoutProps): React.JSX.Element {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [isSwitching, setIsSwitching] = useState(false);
  const panelOnRight = activeMode === "login";

  const handleSwitch = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (isSwitching) {
      return;
    }

    setIsSwitching(true);
    setActiveMode(mode === "register" ? "login" : "register");

    window.setTimeout(() => {
      router.push(switchHref);
    }, 600);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#041437] font-body-md text-on-surface">
      <style>{`
        @keyframes auth-data-drift {
          0% { transform: translate3d(-8%, 12%, 0); opacity: 0.12; }
          50% { opacity: 0.34; }
          100% { transform: translate3d(18%, -18%, 0); opacity: 0.12; }
        }

        @keyframes auth-grid-breathe {
          0%, 100% { transform: perspective(900px) rotateX(62deg) translateY(18px) scale(1); opacity: 0.24; }
          50% { transform: perspective(900px) rotateX(62deg) translateY(4px) scale(1.03); opacity: 0.34; }
        }

        @keyframes auth-form-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes auth-fluid-divider {
          0%, 100% {
            background-position: 0% 50%, 50% 0%, 50% 100%;
            opacity: 0.84;
          }
          50% {
            background-position: 100% 50%, 50% 14%, 50% 86%;
            opacity: 0.98;
          }
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(80,150,255,0.28),transparent_28%),radial-gradient(circle_at_76%_72%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,#061130_0%,#082a68_48%,#0b5ed7_100%)]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(219,225,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(219,225,255,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute bottom-[-18%] left-[4%] h-[58%] w-[92%] origin-bottom rounded-[50%] border border-cyan-200/10 bg-[linear-gradient(rgba(180,197,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(180,197,255,0.15)_1px,transparent_1px)] bg-[length:48px_48px] blur-[0.2px] [animation:auth-grid-breathe_12s_ease-in-out_infinite]" />
        <div className="absolute left-[18%] top-[18%] h-1 w-1 rounded-full bg-cyan-100/70 shadow-[72px_28px_0_rgba(219,225,255,0.38),164px_92px_0_rgba(125,211,252,0.30),238px_20px_0_rgba(255,255,255,0.26),320px_160px_0_rgba(147,197,253,0.30),420px_64px_0_rgba(255,255,255,0.20)] [animation:auth-data-drift_18s_linear_infinite]" />
        <div className="absolute left-[8%] top-[58%] h-px w-28 bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent [animation:auth-data-drift_22s_linear_infinite]" />
        <div className="absolute right-[16%] top-[28%] h-px w-36 bg-gradient-to-r from-transparent via-blue-100/35 to-transparent [animation:auth-data-drift_26s_linear_infinite_reverse]" />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-[180px] -translate-x-1/2 backdrop-blur-[20px] md:block ${
            panelOnRight
              ? "bg-[linear-gradient(270deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.64)_28%,rgba(178,210,255,0.30)_54%,rgba(5,49,120,0.10)_78%,rgba(4,20,55,0)_100%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.36),transparent_46%),radial-gradient(circle_at_50%_82%,rgba(59,130,246,0.22),transparent_48%)]"
              : "bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.64)_28%,rgba(178,210,255,0.30)_54%,rgba(5,49,120,0.10)_78%,rgba(4,20,55,0)_100%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.36),transparent_46%),radial-gradient(circle_at_50%_82%,rgba(59,130,246,0.22),transparent_48%)]"
          } bg-[length:220%_100%,100%_120%,100%_120%] [animation:auth-fluid-divider_9s_ease-in-out_infinite]`}
        />

        <section
          aria-hidden={panelOnRight}
          className={`absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center px-10 py-12 text-white transition-all duration-[600ms] md:flex ${
            panelOnRight
              ? "pointer-events-none -translate-x-8 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
          style={{ transitionTimingFunction: slideTiming }}
        >
          <GlassPanel
            switchCta={switchCta}
            switchHref={switchHref}
            switchText={switchText}
            title={title}
            subtitle={subtitle}
            onSwitch={handleSwitch}
          />
        </section>

        <section
          aria-hidden={!panelOnRight}
          className={`absolute inset-y-0 left-0 hidden w-1/2 items-center justify-center px-10 py-12 text-white transition-all duration-[600ms] md:flex ${
            panelOnRight
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-8 opacity-0"
          }`}
          style={{ transitionTimingFunction: slideTiming }}
        >
          <GlassPanel
            switchCta={switchCta}
            switchHref={switchHref}
            switchText={switchText}
            title={title}
            subtitle={subtitle}
            onSwitch={handleSwitch}
          />
        </section>

        <section
          className={`relative z-10 flex min-h-screen items-center justify-center overflow-y-auto bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef5ff_100%)] px-4 py-6 shadow-2xl shadow-black/20 transition-transform duration-[600ms] sm:px-6 sm:py-8 lg:px-10 md:absolute md:inset-y-0 md:left-0 md:h-screen md:w-1/2 ${
            panelOnRight ? "md:translate-x-full" : "md:translate-x-0"
          }`}
          style={{ transitionTimingFunction: slideTiming }}
        >
          <div
            className={`my-auto w-full max-w-md ${
              isSwitching
                ? "opacity-0"
                : "animate-[auth-form-enter_360ms_ease-out]"
            } transition-opacity duration-200`}
          >
            <div className="mb-8 md:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

interface GlassPanelProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly switchHref: string;
  readonly switchText: string;
  readonly switchCta: string;
  readonly onSwitch: (event: MouseEvent<HTMLAnchorElement>) => void;
}

function GlassPanel({
  title,
  subtitle,
  switchHref,
  switchText,
  switchCta,
  onSwitch,
}: GlassPanelProps): React.JSX.Element {
  return (
    <div className="w-full max-w-xl">
      <div className="mb-16 inline-flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur-xl">
          <span className="text-lg font-black leading-none">A</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide">
            AcademiShare
          </p>
          <p className="truncate text-xs text-white/75">AI Study Hub</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.18] p-8 shadow-2xl shadow-black/25 backdrop-blur-xl ring-1 ring-white/10">
        <h1 className="font-display text-display font-bold leading-tight tracking-wide text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 font-body-lg text-body-lg leading-8 text-white/82">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="font-label-md text-label-md text-white/80">
            {switchText}
          </span>
          <Link
            href={switchHref}
            onClick={onSwitch}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white px-5 font-label-md text-label-md font-semibold text-primary shadow-lg shadow-black/15 transition-colors hover:bg-white/90"
          >
            {switchCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
