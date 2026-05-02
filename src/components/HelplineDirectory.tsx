import { motion } from "framer-motion";
import { Phone, MapPin, ExternalLink } from "lucide-react";

const helplines = [
  { name: "Women Helpline", number: "181", description: "National Commission for Women" },
  { name: "Police", number: "100", description: "Emergency Police Control" },
  { name: "SHE Teams", number: "100", description: "Women Safety Wing" },
  { name: "Domestic Violence", number: "181", description: "Protection from Domestic Violence" },
  { name: "Child Helpline", number: "1098", description: "Child Protection Services" },
  { name: "Emergency", number: "112", description: "Unified Emergency Number" },
];

const HelplineDirectory = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pt-2">
    <h2 className="text-xl font-display font-bold text-foreground">Helpline Directory</h2>
    <p className="text-xs text-muted-foreground">One-tap access to emergency services and helplines.</p>

    <div className="space-y-3">
      {helplines.map((h, i) => (
        <motion.a
          key={h.name}
          href={`tel:${h.number}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 rounded-2xl bg-gradient-card border border-border p-4 hover:border-primary/30 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-foreground">{h.name}</p>
            <p className="text-[10px] text-muted-foreground">{h.description}</p>
          </div>
          <span className="text-lg font-display font-bold text-primary">{h.number}</span>
        </motion.a>
      ))}
    </div>

    <div className="rounded-2xl bg-gradient-card border border-border p-4 flex items-center gap-3">
      <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-display font-semibold text-foreground">Nearby Police Station</p>
        <p className="text-[10px] text-muted-foreground">Location-based — Enable GPS for nearest station</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    </div>
  </motion.div>
);

export default HelplineDirectory;
