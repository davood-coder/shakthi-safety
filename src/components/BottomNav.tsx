import { Home, Users, Phone, Shield } from "lucide-react";

type Tab = "home" | "contacts" | "helpline" | "safety";

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "contacts", icon: Users, label: "Contacts" },
  { id: "helpline", icon: Phone, label: "Helpline" },
  { id: "safety", icon: Shield, label: "Safety" },
];

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/80 backdrop-blur-xl border-t border-border px-2 pb-2 pt-1 z-50">
    <div className="flex items-center justify-around">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {active && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
