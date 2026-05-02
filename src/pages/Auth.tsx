import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Authentication failed. Please try again.";
  }

  if (error.message === "Failed to fetch" || error.message.includes("NetworkError")) {
    return "Cannot reach the Supabase server. Check your internet connection and VITE_SUPABASE_URL in .env.";
  }

  if (error.message.toLowerCase().includes("invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }

  if (error.message.toLowerCase().includes("user already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (error.message.toLowerCase().includes("email not confirmed")) {
    return "Please check your email and confirm your account before signing in.";
  }

  return error.message;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isMagicLink, setIsMagicLink] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedFullName = fullName.trim();

      // --- MAGIC LINK FLOW ---
      if (isMagicLink) {
        const { error } = await supabase.functions.invoke("send-magic-link", {
          body: { email: normalizedEmail, fullName: normalizedFullName, isSignUp: false },
        });
        if (error) throw error;
        toast.success("Magic link sent! Check your Gmail inbox.");
        return;
      }

      // --- SIGN UP FLOW (native Supabase auth) ---
      if (!isLogin) {
        if (!normalizedFullName) {
          throw new Error("Please enter your full name.");
        }
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: normalizedFullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setIsLogin(true);
        setPassword("");
        return;
      }

      // --- LOGIN FLOW ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error("Sign in succeeded but no session was returned.");
      }
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-emergency flex items-center justify-center shadow-emergency mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">SecureSakhi</h1>
          <p className="text-xs text-muted-foreground mt-1">Your Safety, Our Priority</p>
        </div>

        {/* Error Banner - only shown on real auth errors */}
        {authError && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {!isMagicLink && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isMagicLink}
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-emergency text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Please wait..." : isMagicLink ? "Send Magic Link" : isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col gap-3 mt-6">
          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setIsMagicLink(false);
              }}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <button
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="text-center text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isMagicLink ? "Back to Password Login" : "Or sign in with Magic Link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
