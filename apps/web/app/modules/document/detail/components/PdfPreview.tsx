"use client";

import { Document, Page } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface Props {
  readonly fileUrl: string;
}

export function PdfPreview({ fileUrl }: Props): React.JSX.Element {
  return (
    <div className="flex justify-center">
      <Document file={fileUrl}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}
