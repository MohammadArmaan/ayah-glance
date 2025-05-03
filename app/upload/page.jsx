"use client";

import { Button } from "@/components/ui/button";
import { embedQuranFile } from "@/data/embeddings";
import { supabase } from "@/data/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

export default function UploadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Upload />
        </Suspense>
    );
}

function Upload() {
    const { user } = useUser();
    const authorizedEmail =
        user?.primaryEmailAddress?.emailAddress ===
        process.env.NEXT_PUBLIC_LOGIN_EMAIL;
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const fileref = useRef();

    useEffect(() => {
        if (user && !authorizedEmail) {
            router.push("/");
        }
    }, [authorizedEmail, user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file.");
            return;
        }

        setUploading(true);
        setError(null);
        setResponse(null);

        const filename = "Holy-Quran.txt";

        try {
            const { data, error } = await supabase.storage
                .from("movie-files")
                .upload(filename, file, {
                    upsert: true,
                    contentType: "plain/text",
                });

            setResponse(data.path);

            embedQuranFile(data.path);
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center">
            <div className="container mx-auto p-5">
                <div className="max-w-[500px] bg-white dark:bg-black mx-auto p-4 border-1 rounded-lg shadow">
                    <h1 className="text-xl font-bold mb-4">
                        Upload Quran File
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => {
                                setFile(e.target.files[0]);
                                setFileName(e.target.files[0].name);
                            }}
                            className="hidden"
                            ref={fileref}
                        />
                        <div className="border-primary border-2 p-3 rounded-md flex gap-3 items-center">
                            <Button
                                type="button"
                                onClick={() => fileref.current.click()}
                                className="text-white"
                            >
                                Choose File
                            </Button>
                            <span className="text-md text-black dark:text-white">
                                {fileName ? fileName : "No Files Choosen"}
                            </span>
                        </div>
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 text-white"
                        >
                            {uploading ? "Uploading..." : "Upload File"}
                        </Button>
                    </form>

                    {response && (
                        <p className="mt-4 text-green-600">
                            ✅ File uploaded successfully:{" "}
                            <code>{response}</code>
                        </p>
                    )}

                    {error && (
                        <p className="mt-4 text-red-600">❌ Error: {error}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
