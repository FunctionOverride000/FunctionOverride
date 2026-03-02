import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Setup Font Utama (Inter)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Setup Font Coding (JetBrains Mono)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "Function Override",
  description: "Personal Control Panel & Digital Portfolio of Febri Osht",
  icons: {
    icon: "/fosht.png",
    shortcut: "/fosht.png",
    apple: "/fosht.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#050505] text-[#e0e0e0]`}
      >
        {children}
      </body>
    </html>
  );
}