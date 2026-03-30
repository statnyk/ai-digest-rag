import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI News Digest",
  description: "RSS ingestion, weekly digest, and RAG-powered chat for AI news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
