import { useEffect } from "react";
import { registerPlugin } from "@capacitor/core";

interface ShakeDetectionPlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
  addListener(eventName: "onShake", listenerFunc: (data: { type: string }) => void): void;
}

const ShakeDetection = registerPlugin<ShakeDetectionPlugin>("ShakeDetection");

export const useShakeDetection = () => {
  useEffect(() => {
    const initShake = async () => {
      try {
        await ShakeDetection.start();
        ShakeDetection.addListener("onShake", (data) => {
          console.log("Shake detected!");
          const event = new CustomEvent("trigger-sos", { detail: { type: "shake" } });
          window.dispatchEvent(event);
        });
      } catch (e) {
        console.error("Shake detection not available", e);
      }
    };

    initShake();
    return () => {
      ShakeDetection.stop();
    };
  }, []);
};
