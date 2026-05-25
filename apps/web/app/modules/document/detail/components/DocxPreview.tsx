"use client";

import { renderAsync } from "docx-preview";

import { useEffect, useRef } from "react";

interface Props {
  readonly file: Blob;
}

export function DocxPreview({ file }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    renderAsync(file, containerRef.current);
  }, [file]);

  return <div ref={containerRef} />;
}
