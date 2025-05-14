import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { supabase } from "@/data/supabase";
import { v4 as uuidv4 } from "uuid";

// Load and embed the file from Supabase
export async function embedQuranFile(filePath) {
    try {
        // 1. Fetch file from Supabase
        const { data: file, error } = await supabase.storage
            .from("movie-files")
            .download(filePath);

        if (error) throw new Error("Failed to download file: " + error.message);

        const text = await file.text();

        // 2. Split using RecursiveCharacterTextSplitter
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });

        const docs = await splitter.createDocuments([text]);

        // 3. Initialize Google Embeddings
        const embedder = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001",
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        });

        const vectors = await embedder.embedDocuments(
            docs.map((d) => d.pageContent)
        );

        // 4. Insert embeddings into Supabase
        for (let i = 0; i < docs.length; i++) {
            const content = docs[i].pageContent;
            const embedding = vectors[i];

            await supabase.from("movie_embeddings").insert({
                id: uuidv4(),
                content,
                embedding,
            });
        }

        return {
            success: true,
            message: "Embeddings created and stored successfully.",
        };
    } catch (err) {
        console.error("Embedding error:", err);
        return { success: false, error: err.message };
    }
}
