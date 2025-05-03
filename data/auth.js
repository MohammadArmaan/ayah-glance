import { supabase } from "./supabase";

export async function createUser(email, name, imageUrl) {
  // Check if user already exists
  const { data: existingUser, error: selectError } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .single(); // `.single()` assumes email is unique

  if (selectError && selectError.code !== 'PGRST116') {
    // Some other error occurred
    console.error("Error checking user:", selectError);
    return;
  }

  if (existingUser) {
    return;
  }

  // If user doesn't exist, insert a new user
  const { error: insertError } = await supabase
    .from("user")
    .insert([{ email, name, image_url: imageUrl }]);

  if (insertError) {
    console.error("Error inserting user:", insertError);
  } else {
    console.log("New user created!");
  }
}
