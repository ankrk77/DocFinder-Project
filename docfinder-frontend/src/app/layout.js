import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DocFinder | National Registry",
  description: "Official portal for Lost and Found Documents",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* CSS fix to prevent Google Translate from breaking the layout toolbar */}
        <style dangerouslySetInnerHTML={{__html: `
          body { top: 0 !important; }
          .skiptranslate iframe { display: none !important; }
          #goog-gt-tt { display: none !important; }
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        
        {/* 🌐 GOOGLE TRANSLATE TARGET DIV (Hidden for custom button control) */}
        <div id="google_translate_element" className="hidden"></div>
        
        {/* 🌐 GOOGLE TRANSLATE ENGINE SCRIPTS */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en', 
                includedLanguages: 'en,hi', // Sirf English aur Hindi allow kar rahe hain
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}