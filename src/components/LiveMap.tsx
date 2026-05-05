import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to auto-center the map when location changes
const RecenterMap = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position]);
  return null;
};

const LiveMap = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPath = async () => {
      const { data } = await supabase
        .from("user_locations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      
      if (data) setLocations(data.reverse());
    };

    fetchPath();

    const channel = supabase
      .channel("live-location-map")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_locations",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setLocations((prev) => [...prev.slice(-29), payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const latestPos: [number, number] = locations.length > 0 
    ? [locations[locations.length - 1].latitude, locations[locations.length - 1].longitude] 
    : [20.5937, 78.9629]; // Default to India center if no data

  const polylinePositions = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);

  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-3 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Navigation className="w-3 h-3 text-primary" /> Live Movement Path
        </h3>
        {locations.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
            <span className="text-[9px] font-bold text-safe uppercase">Active</span>
          </div>
        )}
      </div>

      <div className="h-52 w-full rounded-xl overflow-hidden border border-border/50 relative z-0">
        <MapContainer 
          center={latestPos} 
          zoom={15} 
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locations.length > 0 && (
            <>
              <Polyline positions={polylinePositions} color="#8b5cf6" weight={3} opacity={0.7} />
              <Marker position={latestPos} />
              <RecenterMap position={latestPos} />
            </>
          )}
        </MapContainer>

        {locations.length === 0 && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
            <Navigation className="w-8 h-8 text-muted-foreground opacity-20 mb-2" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Awaiting GPS Signal...</p>
          </div>
        )}
      </div>
      
      {locations.length > 0 && (
        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-[9px] text-muted-foreground font-medium">
            Last update: {new Date(locations[locations.length-1].created_at).toLocaleTimeString()}
          </p>
          <p className="text-[9px] font-mono text-primary">
            {latestPos[0].toFixed(4)}, {latestPos[1].toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
