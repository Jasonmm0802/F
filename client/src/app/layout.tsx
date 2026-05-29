import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AIAssistant from "@/components/AIAssistant";

export const metadata: Metadata = {
  title: "智慧剩食循環系統",
  description: "建立兼顧安全、便利與效率的再分配與再利用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <AIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
