"use client";

import { useState } from "react";
import { toast } from "sonner";

import { generateDocumentSummary } from "@/apis/document.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/auth/store";

interface Props {
  readonly documentId: string;
  readonly initialSummary?: string | null;
}

function SummaryContent({
  text,
}: {
  readonly text: string;
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      {text.split("\n").map((line, lineIndex) => {
        const isBullet = /^\s*[-*]\s+/.test(line);
        const normalizedLine = isBullet
          ? line.trim().replace(/^[-*]\s*/, "")
          : line;
        const parts = normalizedLine.split(/\*\*([^*]+)\*\*/g);
        const content = parts.map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className="font-semibold text-primary">
              {part}
            </strong>
          ) : (
            part
          ),
        );

        if (isBullet) {
          return (
            <div
              key={lineIndex}
              className="flex gap-2 text-sm leading-relaxed text-on-surface-variant"
            >
              <span className="text-primary">•</span>
              <span>{content}</span>
            </div>
          );
        }

        return (
          <p
            key={lineIndex}
            className="min-h-4 text-sm leading-relaxed text-on-surface-variant"
          >
            {content}
          </p>
        );
      })}
    </div>
  );
}

export function DocumentSummaryCard({
  documentId,
  initialSummary,
}: Props): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tạo tóm tắt tài liệu bằng AI.");
      return;
    }

    setIsGenerating(true);
    try {
      const summaryText = await generateDocumentSummary(documentId);
      setSummary(summaryText);
      toast.success("Đã tạo bản tóm tắt tài liệu bằng AI.");
    } catch (error) {
      console.error("Failed to generate summary", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tạo tóm tắt. Vui lòng thử lại sau.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-primary/5 p-5">
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <span className="material-symbols-outlined text-2xl text-primary">
          auto_awesome
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-on-surface">
              Tóm tắt bằng AI
            </h3>
            {summary ? (
              <Badge tone="neutral" className="text-[10px]">
                AI Generated
              </Badge>
            ) : null}
          </div>

          <div className="mt-4">
            {summary ? (
              <SummaryContent text={summary} />
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-on-surface-variant">
                  Tạo bản tóm tắt có cấu trúc để nắm nhanh nội dung chính của
                  tài liệu.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={isGenerating}
                  onClick={() => void handleGenerateSummary()}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isGenerating ? "progress_activity" : "auto_awesome"}
                  </span>
                  {isGenerating ? "Đang tạo..." : "Tạo tóm tắt"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
