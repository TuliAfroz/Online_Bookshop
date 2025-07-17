import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Serif_Bengali } from "next/font/google";
import { BookOpen, FacebookIcon, InstagramIcon, YoutubeIcon } from "lucide-react";

import "./globals.css";

// Load fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bengaliFont = Noto_Serif_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "পড়ুয়া",
  description: "পড়ুয়া - An Online Bookstore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bengaliFont.variable} bg-slate-50 flex flex-col min-h-screen`}
      >
        {/* Header */}
        <header className="flex items-center p-4 bg-slate-700 text-white space-x-2">
          <BookOpen size={32} className="text-white" />
          <span
            className="text-2xl tracking-widest italic"
            style={{ fontFamily: "var(--font-bangla)" }}
          >
            পড়ুয়া
          </span>
        </header>

        {/* Main content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-300 text-black text-sm px-6 py-8 space-y-4 mt-12">
          <div className="space-y-1">
            <p className="font-semibold text-lg">+88 01913-312424</p>
            <p>ECE Building · Bangladesh University of Engineering and Technology · Dhaka 1205</p>
            <p>support@porua.com.bd</p>
            <p>Trade License : TRAD/DSCC/2333/2025</p>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <span className="font-semibold">Stay Connected : </span>
            <FacebookIcon size={20} className="hover:text-blue-500 cursor-pointer" />
            <YoutubeIcon size={20} className="hover:text-red-500 cursor-pointer" />
            <InstagramIcon size={20} className="hover:text-pink-400 cursor-pointer" />
          </div>

          <hr className="border-gray-600" />

          <p className="text-center text-gray-500 mt-4">
            © 2025 porua.com.bd All rights Reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
