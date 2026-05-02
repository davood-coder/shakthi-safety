import { Signal, Battery, Wifi } from "lucide-react";

const StatusBar = () => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
      <span className="text-[10px] font-medium">Protected</span>
    </div>
  </div>
);

export default StatusBar;
