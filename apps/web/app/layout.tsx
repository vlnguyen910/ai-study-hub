import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { createWebThemeStyles } from "@repo/tokens/web";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Study Hub",
  description: "AcademiShare - File sharing for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): any {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: createWebThemeStyles() }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
