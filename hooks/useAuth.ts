import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  isChecking: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsChecking(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isChecking,
  };
}
