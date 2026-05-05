import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @deno-types="npm:@types/nodemailer@6.4.17"
import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GMAIL_USER = Deno.env.get("GMAIL_USER") ?? "";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
// Set this in Supabase secrets: supabase secrets set SITE_URL="https://your-site.vercel.app"
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, fullName, isSignUp } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Generate a random temporary password
    const tempPassword = Math.random().toString(36).substring(2, 12) + "!" + Math.random().toString(36).substring(2, 5).toUpperCase();

    // 2. Create or Update the user with this password
    let userId: string | undefined;
    if (isSignUp) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (error && !error.message.includes("already registered")) throw error;
      userId = data.user?.id;
    }
    
    // If user already exists, update their password
    if (!userId) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const user = users.find(u => u.email === email);
      if (!user) throw new Error("User not found. Please sign up first.");
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: tempPassword
      });
      if (updateError) throw updateError;
      userId = user.id;
    }

    // 3. Create the Login Link using SITE_URL env var
    const loginUrl = `${SITE_URL}/auth/verify?email=${encodeURIComponent(email)}&p=${encodeURIComponent(tempPassword)}`;

    // 4. Send Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `SecureSakhi <${GMAIL_USER}>`,
      to: email,
      subject: "Your SecureSakhi Login Link",
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #ef4444;">SecureSakhi</h2>
          <p>Click the button below to sign in instantly.</p>
          <a href="${loginUrl}" style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Log In Now</a>
          <p style="font-size: 10px; color: #999; margin-top: 20px;">This is a one-time login link.</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ message: "Success! Check your Gmail." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
