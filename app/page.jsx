"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/data/auth";
import { clearMessages, createMessages, getMessages } from "@/data/messages";
import { startSpeechRecognition } from "@/data/speechToText";

import { useUser } from "@clerk/nextjs";
import { Mic, MicOff, Send, Trash2, Volume2, VolumeX } from "lucide-react";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const name = user?.fullName;
    const imageUrl = user?.imageUrl;

    const [prompt, setPrompt] = useState("");
    const [chatLog, setChatLog] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);

    useEffect(() => {
        if (!user) {
            redirect("/sign-in");
        }
        if (user) {
            createUser(email, name, imageUrl);
        }
    });

    useEffect(() => {
        fetchData();
    }, [email]);

    async function fetchData() {
        if (!email) return;
        setIsChatLoading(true);
        const data = await getMessages(email);
        const formattedMessages = data.map((message) => ({
            from: message.role,
            text: message.message,
        }));
        setChatLog(formattedMessages); // Set once with all messages
        setIsChatLoading(false);
    }
    async function handleChat(e) {
        e.preventDefault();
        if (!prompt) return;

        // Add user's message first
        setChatLog((prev) => [...prev, { from: "user", text: prompt }]);
        createMessages(email, "user", prompt);
        setPrompt(""); // clear input

        setIsLoading(true);

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, name }),
        });

        const data = await res.json();

        // Then add Gemini's response
        setChatLog((prev) => [
            ...prev,
            { from: "gemini", text: data.response },
        ]);
        createMessages(email, "gemini", data.response);

        setIsLoading(false);
    }

    async function handleSpeakChat(prompt) {
        console.log(prompt);
        if (!prompt) return;

        // Add user's message first
        setChatLog((prev) => [...prev, { from: "user", text: prompt }]);
        createMessages(email, "user", prompt);
        setPrompt(""); // clear input

        setIsLoading(true);

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, name }),
        });

        const data = await res.json();

        // Then add Gemini's response
        setChatLog((prev) => [
            ...prev,
            { from: "gemini", text: data.response },
        ]);
        createMessages(email, "gemini", data.response);

        setIsLoading(false);
    }

    function extractTextFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.body.textContent || "";
    }

    return (
        <section className="min-h-screen mt-32">
            <div className="container mx-auto p-5 flex items-center justify-center">
                {/* Scrollable chat area */}
                <div className="w-[500px] lg:w-[1000px] overflow-y-auto px-4 py-2">
                    <div className="flex flex-col gap-4 mb-40">
                        {isChatLoading  && (
                            <div className="min-h-[200px] flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin" />
                            </div>
                        )}
                        {!chatLog.length && !isChatLoading && (
                            <div className="text-center space-y-2 transition-all">
                                <h1 className="font-extrabold text-4xl">
                                    Welcome to{" "}
                                    <span className="text-primary">
                                        AyahGlance
                                    </span>
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    AyahGlance is your personal AI companion for
                                    understanding the Quran. Speak or type your
                                    questions, and receive meaningful,
                                    voice-assisted insights from the verses —
                                    delivered in a clear, soothing manner.
                                </p>
                            </div>
                        )}

                        {chatLog.map((msg, index) =>
                            msg.from === "gemini" ? (
                                <div
                                    key={index}
                                    className="relative self-start bg-muted text-foreground sm:max-w-[400px] max-w-[350px] px-4 py-2 rounded-md text-sm break-words [&_a]:text-primary [&_a:hover]:underline"
                                >
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: msg.text,
                                        }}
                                    />
                                    <button
                                        onClick={async () => {
                                            if (speakingIndex === index) {
                                              window.speechSynthesis.cancel();
                                              setSpeakingIndex(null);
                                              return;
                                            }
                                          
                                            const plainText = extractTextFromHTML(msg.text);
                                            window.speechSynthesis.cancel();
                                            setSpeakingIndex(index);
                                          
                                            const utterance = new SpeechSynthesisUtterance(plainText);
                                            utterance.rate = 1.5;
                                            utterance.pitch = 1;
                                          
                                            // Wait for voices to load (especially important on mobile)
                                            const getVoices = () =>
                                              new Promise((resolve) => {
                                                const voices = window.speechSynthesis.getVoices();
                                                if (voices.length) return resolve(voices);
                                                window.speechSynthesis.onvoiceschanged = () => {
                                                  resolve(window.speechSynthesis.getVoices());
                                                };
                                              });
                                          
                                            const voices = await getVoices();
                                          
                                            const arabicVoice =
                                              voices.find((v) => v.lang === "ar-SA") ||
                                              voices.find((v) => v.lang.startsWith("ar"));
                                          
                                            const fallbackEnglishVoice =
                                              voices.find((v) => v.lang === "en-IN") ||
                                              voices.find((v) => v.lang === "en-US");
                                          
                                            const selectedVoice = arabicVoice || fallbackEnglishVoice || voices[0];
                                          
                                            utterance.voice = selectedVoice;
                                            utterance.lang = selectedVoice.lang;
                                          
                                            utterance.onend = () => setSpeakingIndex(null);
                                          
                                            console.log("Using voice:", selectedVoice.name, selectedVoice.lang);
                                            window.speechSynthesis.speak(utterance);
                                          }}
                                          
                                        className="mt-2 flex items-center gap-1 text-blue-500 hover:text-blue-600"
                                        title="Speak response"
                                    >
                                        {speakingIndex === index ? (
                                            <VolumeX size={18} />
                                        ) : (
                                            <Volume2 size={18} />
                                        )}
                                        {/* <span className="text-xs">Speak</span> */}
                                    </button>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className="self-end bg-primary text-white max-w-full px-4 py-2 rounded-md text-sm break-words"
                                >
                                    {msg.text}
                                </div>
                            )
                        )}

                        {isLoading && (
                            <div className="self-start bg-muted text-foreground max-w-fit px-4 py-2 rounded-md text-sm">
                                <span className="animate-pulse text-xl">
                                    ...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input stays fixed at bottom */}
                <form
                    onSubmit={handleChat}
                    className="md:p-10 p-5 flex flex-col md:flex-row items-start md:items-center justify-center  w-[300px] md:w-[500px] border-1 bg-white dark:bg-black z-50 fixed -bottom-10 md:bottom-5 right-[50%] left-[50%] translate-[-50%] rounded-md h-auto md:h-[80px] shadow-lg gap-2"
                >
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask something..."
                        className="w-full rounded-full dark:text-white"
                    />
                    <div className="flex gap-1">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="dark:text-white"
                        >
                            <Send size={20} />
                        </Button>
                        <Button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                startSpeechRecognition((text) => {
                                    setPrompt(text);
                                    // Short timeout to ensure state is updated before handling the chat
                                    setTimeout(() => {
                                        handleSpeakChat(text); // Use the text directly, not prompt state
                                    }, 100);
                                }, setIsListening);
                            }}
                            className={`dark:text-white bg-blue-500 hover:bg-blue-600 ${
                                isListening ? "bg-red-500 animate-pulse" : ""
                            }`}
                        >
                            {isListening ? (
                                <MicOff size={20} />
                            ) : (
                                <Mic size={20} />
                            )}
                        </Button>

                        <Button
                            type="button"
                            onClick={async () => {
                                await clearMessages(email);
                                setChatLog([]);
                            }}
                            disabled={!chatLog.length}
                            className="dark:text-white bg-red-500 hover:bg-red-600"
                        >
                            <Trash2 size={20} />
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
