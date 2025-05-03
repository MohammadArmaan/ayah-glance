import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "@/data/supabase";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
let chat;

async function getRelevantContext(prompt) {
    const embedder = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const embedding = await embedder.embedQuery(prompt);

    const { data, error } = await supabase.rpc("match_movie_chunks", {
        query_embedding: embedding,
        match_count: 3,
    });

    if (error) {
        console.error("Similarity search error:", error.message);
        return "";
    }

    return data.map((d) => d.content).join("\n\n");
}

export async function POST(req) {
    try {
        const { prompt, name } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "No prompt provided" },
                { status: 400 }
            );
        }

        // Step 1: Get relevant context from embeddings
        const similarContext = await getRelevantContext(prompt);

        // Step 2: Create enhanced prompt
        const newPrompt = `
You are a Quran breifer(AyahGlance) for this  website. You will breif and expalin the surahs from the quran
- If the user aks anything about Quran questions, then answer from the below context
- Respond in **HTML format** with proper use of tags like <h3>, <h4>, <h5> <strong>, <ul>, <li>, <p>, etc. Do not forget to highlight the headings. 
- Also apply stylings such as padding, margins, spacing. For Link color apply this colour oklch(0.723 0.219 149.579) and for text and headings use this #000 
- Always remember to answer only with respect to Islam and its follwings.
- The links should have target="_blank" propery so that it opens in differnt tabs
- Let the answer be short and on point with respect to Quran
- Always mention the chapter name, number, surah name and ayah name of any verses asked by the user
- If a user asks about a Surah, dua, ayat or any verses, Start with the original Arabic surah or dua (with reference if available) then provide the transliteration in Roman English and at last Then give a simple English translation that is spiritually accurate and easy to understand. 
- Note first finish the entire surah or dua first then proceed with transliteration and at last translation. Dont do it line by line or ayah by ayah complete whole surah or dua first
- Appreciate the user after if they thank you
- Don't answer any other answers other than Islamic related questions

Username: ${name}
Relevant Movie Info: 
${similarContext}

Question: ${prompt}
`;

        // Step 3: Initialize chat if not already
        if (!chat) {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });

            chat = model.startChat({
                history: [],
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1000,
                },
            });
        }

        const result = await chat.sendMessage(newPrompt);
        let response = await result.response.text();

        response = response
            .replace(/```html\s*|```/g, "") // Remove ```html and ```
            .trim();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Gemini error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
