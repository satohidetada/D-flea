import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// app/layout.tsx の metadata 部分
export const metadata: Metadata = {
  title: "NOMI",
  description: "地域でつながるフリマアプリ",
  manifest: "/manifest.json", // ★これを追加
  themeColor: "#ef4444",      // ★これを追加（iPhoneの上のバーの色などになります）
  appleWebApp: {              // ★iPhone向けの対応
    capable: true,
    statusBarStyle: "default",
    title: "NOMI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
