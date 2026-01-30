import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return { error: "Please confirm your email first. Check your inbox for the confirmation link." };
        }
        return { error: error.message };
      }
      
      setUser(data.user);
      return {};
    } catch (error: any) {
      return { error: error.message || "Failed to sign in" };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        setUser(data.user);
        return {};
      } else {
        return { needsConfirmation: true };
      }
    } catch (error: any) {
      return { error: error.message || "Failed to sign up" };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Redirect to /auth/callback which will handle the state machine routing
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message || "Failed to sign in with Google" };
    }
  };

  const signOut = async () => {
    try {
      console.log("🔓 [AuthContext] Signing out user...");
      
      // Sign out from Supabase (clears session from storage)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ [AuthContext] Signout error:", error);
        throw error;
      }
      
      // Clear user state
      setUser(null);
      
      console.log("✅ [AuthContext] User signed out successfully");
    } catch (error) {
      console.error("❌ [AuthContext] Failed to sign out:", error);
      // Still clear user state even if Supabase signout fails
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
