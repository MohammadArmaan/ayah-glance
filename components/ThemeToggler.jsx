"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

export default function ThemeToggler() {
    const { theme, setTheme } = useTheme();
    return (
        <div>
            <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg bg-transparent border-1 dark:text-white text-black hover:bg-foreground hover:text-background dark:hover:text-black hover p-1"
            >
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotated-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 " />
            </Button>
        </div>
    );
}
