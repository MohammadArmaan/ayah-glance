import { supabase } from "./supabase";

export async function createMessages(email, role, message) {
    if (!email) {
        return console.error("Email is Required");
    }

    const { data, error } = await supabase
        .from("messages")
        .insert([{ email, role, message }])
        .order("created_at", { ascending: true });

    if (error) {
        return console.error(error.message);
    }
}

export async function getMessages(email) {
    if (!email) {
        return console.error("Email is Required");
    }

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: true });

    if (error) {
        return console.error(error.message);
    }

    return data
}

export async function clearMessages(email) {
    if (!email) return console.error("Email is required");
  
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("email", email);
  
    if (error) console.error(error.message);
  }