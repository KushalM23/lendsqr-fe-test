import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "../styles/globals.scss";
import { MirageInitializer } from "./MirageInitializer";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lendsqr Admin Portal",
  description: "Lendsqr Frontend Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={workSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MirageInitializer />
        {children}
      </body>
    </html>
  );
}

