// @deno-types="npm:@types/nodemailer@6.4.17"
import nodemailer from "npm:nodemailer@6.9.16";

type EmergencyRecord = {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type Contact = {
  name: string;
  email: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const gmailUser = Deno.env.get("GMAIL_USER") ?? "";
const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
const fromEmail = Deno.env.get("ALERT_FROM_EMAIL") ?? `SecureSakhi <${gmailUser}>`;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getMapLink = (record: EmergencyRecord) => {
  if (record.latitude === null || record.longitude === null) {
    return "Location unavailable";
  }

  return `https://maps.google.com/?q=${record.latitude},${record.longitude}`;
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase REST request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
};

const sendEmailWithGmail = async (to: string[], subject: string, html: string) => {
  console.log(`Attempting to send Gmail alert to ${to.length} recipients...`);
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `SecureSakhi <${gmailUser}>`,
      to: to.join(", "),
      subject,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Gmail SMTP Error:", error);
    throw new Error(`Gmail SMTP failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

const sendEmail = async (to: string[], subject: string, html: string) => {
  if (gmailUser && gmailAppPassword) {
    return sendEmailWithGmail(to, subject, html);
  }

  throw new Error("Missing Gmail credentials. Please set GMAIL_USER and GMAIL_APP_PASSWORD in Supabase secrets.");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    const payload = await req.json();
    const record = payload.record as EmergencyRecord | undefined;

    if (!record?.user_id) {
      return jsonResponse({ error: "Missing emergency record." }, 400);
    }

    const profileParams = new URLSearchParams({
      select: "full_name",
      user_id: `eq.${record.user_id}`,
      limit: "1",
    });

    const contactsParams = new URLSearchParams({
      select: "name,email",
      user_id: `eq.${record.user_id}`,
      email: "not.is.null",
    });

    const [profiles, contacts] = await Promise.all([
      fetchJson<Array<{ full_name: string | null }>>(`profiles?${profileParams}`),
      fetchJson<Contact[]>(`trusted_contacts?${contactsParams}`),
    ]);

    const recipients = contacts.map((contact) => contact.email).filter((email): email is string => Boolean(email));

    if (recipients.length === 0) {
      return jsonResponse({ sent: false, message: "No trusted contact emails found." });
    }

    const userName = profiles[0]?.full_name || "A SecureSakhi user";
    const mapLink = getMapLink(record);
    const html = `
      <h2>SOS Alert from SecureSakhi</h2>
      <p><strong>${userName}</strong> may need urgent help.</p>
      <p>Location: ${
        mapLink.startsWith("http")
          ? `<a href="${mapLink}">${mapLink}</a>`
          : mapLink
      }</p>
      <p>Triggered at: ${new Date(record.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
    `;

    const result = await sendEmail(recipients, "SOS Alert from SecureSakhi", html);

    return jsonResponse({ sent: true, recipients: recipients.length, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    return jsonResponse({ error: message }, 500);
  }
});
