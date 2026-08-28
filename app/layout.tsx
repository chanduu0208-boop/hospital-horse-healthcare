import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "馬体管理",
  description: "馬の健康・体調管理システム",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="overflow-x-hidden">
        <div className="overflow-x-hidden max-w-[100vw]">
          {children}
        </div>
      </body>
    </html>
  );
}
