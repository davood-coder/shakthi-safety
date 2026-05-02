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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, fullName, isSignUp } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. If it's a Sign Up, create the user first
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // Confirm them automatically so Supabase doesn't send an email
        user_metadata: { full_name: fullName },
      });
      // If user already exists, we'll just proceed to send a login link
      if (signUpError && signUpError.message !== "User already registered") throw signUpError;
    }

    // 2. Generate the Magic Link URL from Supabase
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${new URL(req.headers.get("origin") || "").origin}/`,
      }
    });

    if (linkError) throw linkError;

    const magicLink = data.properties.action_link;

    // 3. Send the email using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `SecureSakhi <${GMAIL_USER}>`,
      to: email,
      subject: "Your SecureSakhi Login Link",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #ef4444;">SecureSakhi</h2>
          <p>Hello! Use the button below to sign in to your account. This link will bypass any email restrictions.</p>
          <a href="${magicLink}" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirm & Log In</a>
          <p style="margin-top: 25px; font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
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
