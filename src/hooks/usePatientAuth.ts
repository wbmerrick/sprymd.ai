import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/intake/persist";

const DEMO_PATIENT_KEY = "spry_demo_patient";

export interface PatientAuthState {
  user: User | null;
  email: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signInDemo: (email: string) => void;
  signOut: () => Promise<void>;
}

const readDemoEmail = (): string | null => {
  try {
    return localStorage.getItem(DEMO_PATIENT_KEY);
  } catch {
    return null;
  }
};

const writeDemoEmail = (email: string): void => {
  try {
    localStorage.setItem(DEMO_PATIENT_KEY, email);
  } catch {
    // ignore
  }
};

const clearDemoEmail = (): void => {
  try {
    localStorage.removeItem(DEMO_PATIENT_KEY);
  } catch {
    // ignore
  }
};

export const usePatientAuth = (): PatientAuthState => {
  const isDemoMode = !isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [demoEmail, setDemoEmail] = useState<string | null>(() => (isDemoMode ? readDemoEmail() : null));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setDemoEmail(readDemoEmail());
      setIsLoading(false);
      return;
    }

    let active = true;

    // Subscribe before the initial getSession so no auth event is missed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signInWithEmail = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      if (isDemoMode) {
        writeDemoEmail(email);
        setDemoEmail(email);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/portal` },
      });

      return { error: error?.message ?? null };
    },
    [isDemoMode],
  );

  const signInDemo = useCallback((email: string) => {
    writeDemoEmail(email);
    setDemoEmail(email);
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      clearDemoEmail();
      setDemoEmail(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, [isDemoMode]);

  const email = isDemoMode ? demoEmail : (user?.email ?? null);
  const isAuthenticated = isDemoMode ? Boolean(demoEmail) : Boolean(user);

  return {
    user,
    email,
    isLoading,
    isAuthenticated,
    isDemoMode,
    signInWithEmail,
    signInDemo,
    signOut,
  };
};
