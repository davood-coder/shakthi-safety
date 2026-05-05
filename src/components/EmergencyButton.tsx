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

const sendEmailAlert = async (record: EmergencyLog) => {
  // CALLING BACKEND API (Supabase Edge Function)
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

    if (user) {
      // 1. Log the emergency in the database
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
        setPressed(false);
        return;
      }

      toast.success("Emergency logged. Sending background alerts...");

      try {
        // 2. TRIGGER AUTOMATIC BACKGROUND EMAIL
        const result = await sendEmailAlert(emergencyLog);
        toast.success(`✅ SOS ALERTS SENT successfully to ${result.recipients ?? 0} contacts!`, {
          duration: 5000,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send email alert";
        console.error("Email alert error:", error);
        
        if (message.includes("Missing email provider secrets")) {
          toast.error("CRITICAL: Backend Email not configured. Admin must set GMAIL_USER.");
        } else {
          toast.error(`Background Alert Failed: ${message}`);
        }
      }
    }

    // Reset button state after a delay
    setTimeout(() => setPressed(false), 5000);
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
            {pressed ? "ALERTING..." : "Tap to activate"}
          </span>
        </div>
      </motion.button>
      {pressed && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-primary font-semibold"
        >
          Sending silent alerts to trusted contacts...
        </motion.p>
      )}
    </div>
  );
};

export default EmergencyButton;
