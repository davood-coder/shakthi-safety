import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Shield, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SafetyTimer = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(20); // default 20 mins
  const [checkId, setCheckId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      triggerAutoSOS();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = async () => {
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);

    const { data, error } = await supabase
      .from("safety_checks")
      .insert({
        user_id: user.id,
        duration_minutes: duration,
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start safety check");
      return;
    }

    setCheckId(data.id);
    setTimeLeft(duration * 60);
    setIsActive(true);
    toast.success(`Safety check active for ${duration} minutes`);
  };

  const cancelTimer = async () => {
    if (!checkId) return;

    const { error } = await supabase
      .from("safety_checks")
      .update({ status: "completed" })
      .eq("id", checkId);

    if (error) {
      toast.error("Failed to stop safety check");
    } else {
      setIsActive(false);
      setCheckId(null);
      toast.success("I'm Safe! Timer stopped.");
    }
  };

  const triggerAutoSOS = async () => {
    setIsActive(false);
    if (!checkId) return;

    await supabase
      .from("safety_checks")
      .update({ status: "triggered" })
      .eq("id", checkId);

    // Trigger SOS logic (this will call the existing SOS function)
    const event = new CustomEvent("trigger-sos", { detail: { type: "timer_expiry" } });
    window.dispatchEvent(event);
    
    toast.error("Safety timer expired! Triggering SOS...");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isActive ? "text-safe animate-pulse" : "text-muted-foreground"}`} />
          <h3 className="text-sm font-display font-bold text-foreground">Safety Check Timer</h3>
        </div>
        {isActive && (
          <div className="px-3 py-1 rounded-full bg-safe/10 text-safe text-[10px] font-bold uppercase tracking-wider">
            Active
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              Going somewhere? Set a timer. If you don't check in before it ends, we'll automatically alert your emergency contacts.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Duration (Mins)</label>
                <div className="flex items-center gap-2">
                  {[10, 20, 30, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setDuration(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        duration === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={startTimer} className="w-full h-11 rounded-xl font-bold gap-2">
              <Timer className="w-4 h-4" />
              Start Safety Check
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center py-4"
          >
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-secondary"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * timeLeft) / (duration * 60)}
                  className="text-safe transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold text-foreground">{formatTime(timeLeft)}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Remaining</span>
              </div>
            </div>

            <Button
              onClick={cancelTimer}
              variant="outline"
              className="w-full h-12 rounded-xl border-safe text-safe hover:bg-safe/5 font-bold gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              I'm Safe (Stop Timer)
            </Button>
            
            <p className="mt-4 text-[10px] text-center text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              SOS will trigger automatically at 0:00
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SafetyTimer;
