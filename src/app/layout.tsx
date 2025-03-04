import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TrainingProvider } from "@/contexts/TrainingContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "力量训练追踪",
  description: "记录和分析你的力量训练数据",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <TrainingProvider>
          {children}
        </TrainingProvider>
      </body>
    </html>
  );
}
