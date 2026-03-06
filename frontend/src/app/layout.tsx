import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Luminary",
  description: "Illuminate your learning. Upload notes, ask questions, and visualize your knowledge.",
  icons: {
    icon: "/logo.png",
  },
};

import { FileProvider } from "@/context/FileContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans antialiased`}
      >
        <FileProvider>{children}</FileProvider>
      </body>
    </html>
  );
}
