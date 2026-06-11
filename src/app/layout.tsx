import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitFlow — Premium Fintech Expense Sharing",
  description: "Intelligent collective financial tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <body
        className={`${inter.className} h-full text-slate-900 dark:text-slate-100 font-sans animated-bg custom-scroll selection:bg-purple-500/30`}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] ambient-glow-1 rounded-full mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] ambient-glow-2 rounded-full mix-blend-screen"></div>
            <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] ambient-glow-3 rounded-full mix-blend-screen"></div>
        </div>
        <div id="toast-container" className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none"></div>
        
        <div id="app-root" className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
