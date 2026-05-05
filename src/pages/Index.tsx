import { LogOut, MapPin, Users, Navigation, AlertTriangle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import EmergencyButton from "@/components/EmergencyButton";
import QuickActions from "@/components/QuickActions";
import TrustedContacts from "@/components/TrustedContacts";
import HelplineDirectory from "@/components/HelplineDirectory";
import BottomNav from "@/components/BottomNav";
import SafetyTimer from "@/components/SafetyTimer";
import LiveTracker from "@/components/LiveTracker";
import LiveMap from "@/components/LiveMap";



import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import StatusBar from "@/components/StatusBar";
import { useShakeDetection } from "@/hooks/useShakeDetection";

const Index = () => {
  useShakeDetection();
  const [activeTab, setActiveTab] = useState<"home" | "contacts" | "helpline" | "safety">("home");

  const { user, signOut } = useAuth();

  const { data: contacts = [] } = useQuery({
    queryKey: ["trusted_contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("trusted_contacts").select("*");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["emergency_logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("emergency_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      <LiveTracker />
      <motion.header

        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-5 pt-6 pb-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="SecureSakhi Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">SecureSakhi</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Your Safety, Our Priority</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBar />
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      <main className="flex-1 overflow-y-auto pb-24 px-5">
        {activeTab === "home" && <HomeTab contactsCount={contacts.length} logs={logs} />}
        {activeTab === "contacts" && <TrustedContacts />}
        {activeTab === "helpline" && <HelplineDirectory />}
        {activeTab === "safety" && <SafetyTab />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const HomeTab = ({ contactsCount, logs }: { contactsCount: number; logs: any[] }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="flex flex-col items-center gap-6 pt-4"
  >
    <EmergencyButton />
    <QuickActions />

    <div className="w-full rounded-2xl bg-gradient-card border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-safe animate-pulse" />
        <span className="text-sm font-display font-semibold text-foreground">All Systems Active</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value="Tracking" />
        <MiniStat icon={<Navigation className="w-3.5 h-3.5" />} label="Route" value="Safe" />
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Contacts" value={`${contactsCount} Active`} />
        <MiniStat icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Alerts" value={`${logs.length}`} />
      </div>
    </div>

    {logs.length > 0 && (
      <div className="w-full">
        <h3 className="text-sm font-display font-semibold text-muted-foreground mb-3">Emergency History</h3>
        <div className="space-y-2">
          {logs.map((log) => (
            <ActivityItem
              key={log.id}
              time={new Date(log.created_at).toLocaleString()}
              text={`SOS triggered${log.latitude ? ` at ${log.latitude.toFixed(4)}, ${log.longitude?.toFixed(4)}` : ""}`}
              safe={log.status === "resolved"}
            />
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const SafetyTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pt-2">
    <h2 className="text-xl font-display font-bold text-foreground">Safety Dashboard</h2>

    <SafetyTimer />

    <LiveMap />

    <div className="rounded-2xl bg-gradient-card border border-border p-5">


      <h3 className="text-sm font-display font-semibold text-foreground mb-1">Current Area Risk Score</h3>
      <div className="flex items-end gap-3 mt-3">
        <span className="text-5xl font-display font-bold text-safe">82</span>
        <span className="text-sm text-muted-foreground pb-2">/100 — Safe</span>
      </div>
      <div className="w-full h-2 rounded-full bg-secondary mt-4 overflow-hidden">
        <div className="h-full w-[82%] rounded-full bg-gradient-safe" />
      </div>
    </div>

    <div className="rounded-2xl bg-gradient-card border border-border p-5">
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Cab Safety Monitor</h3>
      <p className="text-xs text-muted-foreground mb-4">Share your ride details to enable route deviation alerts.</p>
      <button className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-semibold text-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
        <Navigation className="w-4 h-4" />
        Start Ride Monitoring
      </button>
    </div>

    <div className="rounded-2xl bg-gradient-card border border-border p-5">
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Offline Emergency</h3>
      <p className="text-xs text-muted-foreground">SMS-based alerts are active. Even without internet, your emergency contacts will receive your GPS coordinates.</p>
      <div className="flex items-center gap-2 mt-3">
        <div className="w-2 h-2 rounded-full bg-safe" />
        <span className="text-xs text-safe font-medium">Offline mode ready</span>
      </div>
    </div>
  </motion.div>
);

const MiniStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 rounded-xl bg-secondary/50 p-2.5">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const ActivityItem = ({ time, text, safe }: { time: string; text: string; safe?: boolean }) => (
  <div className="flex items-center gap-3 rounded-xl bg-gradient-card border border-border p-3">
    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${safe ? "bg-safe" : "bg-warning"}`} />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-foreground truncate">{text}</p>
      <p className="text-[10px] text-muted-foreground">{time}</p>
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
  </div>
);

export default Index;
