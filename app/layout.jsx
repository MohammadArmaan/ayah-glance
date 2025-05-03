import { Geist, Geist_Mono, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const scheherazade = Scheherazade_New({
    subsets: ["arabic"],
    weight: "400",
    variable: "--font-scheherazade",
  });

export const metadata = {
    title: "AyahGlance | Reflect on Every Ayah (آية) & Dua (دُعاء)",
    description:
        "AyahGlance is your daily spiritual guide to explore the beauty and wisdom of the Qur'an — offering concise reflections on Surahs (سُوَر), Ayat (آيات), and powerful Duas (أدعية). Discover divine insight one glance at a time — تَدَبَّر الآيات وعيها بقلبٍ حاضر.",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${scheherazade.variable}`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <Header />
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
