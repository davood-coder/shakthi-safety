import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const password = searchParams.get("p");

  useEffect(() => {
    if (email && password) {
      const login = async () => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          toast.success("Login successful!");
          navigate("/", { replace: true });
        } catch (error: any) {
          console.error("Verification error:", error);
          toast.error("Invalid or expired login link.");
          navigate("/auth");
        }
      };
      login();
    } else {
      navigate("/auth");
    }
  }, [email, password, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-emergency flex items-center justify-center shadow-emergency mb-6 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Verifying Link</h1>
      <p className="text-muted-foreground">Please wait while we log you in...</p>
    </div>
  );
};

export default Verify;
