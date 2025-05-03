import { UserButton } from "@clerk/nextjs";
import ThemeToggler from "./ThemeToggler";
import Logo from "./Logo";

export default function Header() {
    return (
        <header className="h-[80px] w-full shadow-md bg-[#fff] dark:bg-black z-50 fixed top-0 left-0 flex items-center justify-between p-5">
            {/* <div className="font-extrabold text-3xl text-primary">AyahGlance</div> */}
            <Logo />
            <div className="flex items-center gap-3">
                <ThemeToggler />
                <UserButton />
            </div>
        </header>
    );
}
