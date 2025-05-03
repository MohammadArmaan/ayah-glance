"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();

        const validEmail = process.env.NEXT_PUBLIC_LOGIN_EMAIL;
        const validPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD;

        if (email === validEmail && password === validPassword) {
            Cookies.set("auth", "true");
            router.push("/dashboard");
        } else {
            setError("Invalid credentials.");
        }
    };

    return (
        <div className="min-h-[70vh] flex justify-center items-center p-5">
            <form
                onSubmit={handleLogin}
                className="bg-[#eee] dark:bg-[#27272c] rounded-xl p-6 shadow space-y-4 w-full max-w-sm"
            >
                <h2 className="text-xl font-bold text-primary text-center mb-10">Login to Dashboard</h2>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />

                {error && <p className="text-red-500">{error}</p>}

                <Button
                    type="submit"
                    className="w-full py-2 rounded-md"
                >
                    Login
                </Button>
            </form>
        </div>
    );
}
