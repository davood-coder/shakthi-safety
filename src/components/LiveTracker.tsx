import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LiveTracker = () => {
  const { user } = useAuth();
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        // Update every 15 seconds to save battery/data
        if (now - lastUpdate.current > 15000) {
          lastUpdate.current = now;
          
          await supabase.from("user_locations").insert({
            user_id: user.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
          });
          
          console.log("Location updated:", position.coords.latitude, position.coords.longitude);
        }
      },
      (error) => {
        console.error("Tracking error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  return null; // Silent component
};

export default LiveTracker;
