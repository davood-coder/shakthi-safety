import { Shield, MapPin, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StatusBar = () => {
  const { user } = useAuth();

  const { data: activeTimer } = useQuery({
    queryKey: ["active_safety_check"],
    queryFn: async () => {
      const { data } = await supabase
        .from("safety_checks")
        .select("status")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border">
        {activeTimer ? (
          <Timer className="w-3 h-3 text-safe animate-pulse" />
        ) : (
          <Shield className="w-3 h-3 text-safe" />
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground">
          {activeTimer ? "Safety Active" : "Protected"}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
    </div>
  );
};

export default StatusBar;
