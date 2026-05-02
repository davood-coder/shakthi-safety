import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type EmergencyLog = {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type SendAlertResponse = {
  sent: boolean;
  recipients?: number;
  message?: string;
  error?: string;
};

const buildEmergencyMessage = (latitude: number | null, longitude: number | null) => {
  const location =
    latitude !== null && longitude !== null
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : "Location unavailable";

  return `SOS Alert from SecureSakhi. I may need urgent help. My location: ${location}`;
};

const openAlertDrafts = (contacts: Array<{ phone: string; email: string | null }>, message: string) => {
  const phones = contacts.map((contact) => contact.phone.trim()).filter(Boolean);
  const emails = contacts
    .map((contact) => contact.email?.trim())
    .filter((email): email is string => Boolean(email));

  if (emails.length > 0) {
    const subject = encodeURIComponent("SOS Alert from SecureSakhi");
    const body = encodeURIComponent(message);
    window.open(`mailto:${emails.join(",")}?subject=${subject}&body=${body}`, "_blank");
  }

  if (phones.length > 0) {
    const separator = /Android/i.test(navigator.userAgent) ? "?" : "&";
    const body = encodeURIComponent(message);
    window.open(`sms:${phones.join(",")}${separator}body=${body}`, "_blank");
  }

  return { phoneCount: phones.length, emailCount: emails.length };
};

const sendEmailAlert = async (record: EmergencyLog) => {
  const { data, error } = await supabase.functions.invoke<SendAlertResponse>("send-alert", {
    body: { record },
  });

  if (error) {
    throw error;
  }

  if (!data?.sent) {
    throw new Error(data?.message || data?.error || "Email alert was not sent.");
  }

  return data;
};

const EmergencyButton = () => {
  const [pressed, setPressed] = useState(false);
  const { user } = useAuth();

  const triggerEmergency = async () => {
    setPressed(true);

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // Location unavailable, proceed without it.
    }

    const alertMessage = buildEmergencyMessage(latitude, longitude);

    if (user) {
      const { data: emergencyLog, error: logError } = await supabase
        .from("emergency_logs")
        .insert({
          user_id: user.id,
          type: "sos",
          latitude,
          longitude,
          status: "triggered",
        })
        .select("id,user_id,latitude,longitude,created_at")
        .single();

      if (logError) {
        toast.error("Failed to log emergency");
      } else {
        toast.success("Emergency alert logged.");

        try {
          const result = await sendEmailAlert(emergencyLog);
          toast.success(`Email alert sent to ${result.recipients ?? 0} trusted contact(s).`);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to send email alert";
          console.error("Email alert error:", error);
          
          if (message.includes("Missing email provider secrets")) {
            toast.error("Email credentials not set. Please configure GMAIL_USER and GMAIL_APP_PASSWORD in Supabase.");
          } else if (message.includes("Gmail SMTP failed")) {
            toast.error("Gmail alert failed. Please check if your App Password is correct and 2FA is enabled.");
          } else {
            toast.error(`Email alert failed: ${message}`);
          }
        }
      }

      const { data: contacts, error: contactsError } = await supabase
        .from("trusted_contacts")
        .select("phone,email")
        .eq("user_id", user.id);

      if (contactsError) {
        toast.error(contactsError.message);
      } else {
        const { phoneCount, emailCount } = openAlertDrafts(contacts ?? [], alertMessage);
        if (phoneCount || emailCount) {
          toast.success(`Alert draft opened for ${phoneCount} phone and ${emailCount} email contact(s).`);
        } else {
          toast.error("Add trusted contacts with phone numbers or emails before sending alerts.");
        }
      }
    }

    setTimeout(() => setPressed(false), 3000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Tap for Emergency</p>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={triggerEmergency}
        disabled={pressed}
        className={`relative w-40 h-40 rounded-full bg-gradient-emergency flex items-center justify-center shadow-emergency transition-all duration-300 disabled:opacity-80 ${
          pressed ? "scale-95" : "emergency-pulse"
        }`}
      >
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute -inset-3 rounded-full border border-primary/10" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-display font-bold text-primary-foreground">SOS</span>
          <span className="text-[10px] text-primary-foreground/70 font-medium tracking-wider uppercase">
            {pressed ? "Sending..." : "Tap to activate"}
          </span>
        </div>
      </motion.button>
      {pressed && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-primary font-semibold"
        >
          Alerting trusted contacts...
        </motion.p>
      )}
    </div>
  );
};

export default EmergencyButton;
