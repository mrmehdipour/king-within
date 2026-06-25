import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel, Vazirmatn } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for the brand wordmark / big headings (Latin).
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Persian/Arabic-script font, applied when <html lang="fa">.
const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "King Within — Awaken the leader inside",
  description:
    "A step-by-step path for modern men, built on the archetypes of Initiate, Warrior, Magician, and King.",
  applicationName: "King Within",
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Set lang/dir before first paint to avoid an LTR flash on .ir (and honor an
// explicit ?lang= / saved choice). Mirrors getInitialLocale() in lib/i18n.
const localeBootstrap = `(function(){try{var p=new URLSearchParams(location.search).get('lang');var s=localStorage.getItem('kw_locale');var l=(p==='fa'||p==='en')?p:(s==='fa'||s==='en')?s:(location.hostname.indexOf('.ir',location.hostname.length-3)!==-1?'fa':'en');document.documentElement.lang=l;document.documentElement.dir=(l==='fa')?'rtl':'ltr';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrap }} />
      </head>
      <body className="min-h-full">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
