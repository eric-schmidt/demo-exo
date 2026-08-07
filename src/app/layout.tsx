import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experience Orchestration Demo",
  description: "Experience Orchestration Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`h-full antialiased`}>
        <main className="flex min-h-screen flex-col items-center justify-between p-12 md:p-24">
          <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
