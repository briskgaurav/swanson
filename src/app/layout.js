import { Montserrat, Philosopher } from "next/font/google";
import "./globals.css";
import LenisSmoothScroll from "@/components/Animations/LenisSmoothScroll";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Swansons Website - Gaurav",
  description: "Swansons Website - Gaurav",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${philosopher.variable} h-full antialiased`}
    >
      <LenisSmoothScroll />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
