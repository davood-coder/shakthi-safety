import { Phone, MapPin, Navigation, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { icon: Phone, label: "Call 112", color: "bg-primary", action: () => window.open("tel:112") },
  { icon: MapPin, label: "Share Location", color: "bg-safe" },
  { icon: Navigation, label: "Track Ride", color: "bg-accent" },
  { icon: AlertTriangle, label: "Fake Call", color: "bg-warning" },
];

const QuickActions = () => (
  <div className="w-full grid grid-cols-4 gap-3">
    {actions.map((item, i) => (
      <motion.button
        key={item.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + i * 0.05 }}
        onClick={item.action}
        className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-gradient-card border border-border hover:border-primary/30 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
          <item.icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
      </motion.button>
    ))}
  </div>
);

export default QuickActions;
