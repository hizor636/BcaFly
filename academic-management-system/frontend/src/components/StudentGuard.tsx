import React, { useEffect, useState } from "react";
import { getSession, StudentSession } from "../lib/local-db";

type StudentGuardProps = {
  children: (session: StudentSession) => React.ReactNode;
  onUnauthorized?: () => void;
};

export default function StudentGuard({ children, onUnauthorized }: StudentGuardProps) {
  const [session, setSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession || currentSession.role !== "student") {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (typeof window !== "undefined") {
        window.location.href = "/student-login";
      }
      return;
    }

    setSession(currentSession as StudentSession);
  }, [onUnauthorized]);

  if (!session) {
    return <p className="p-8 text-center font-mono text-sm text-[var(--slate)]">Verifying student access...</p>;
  }

  return <>{children(session)}</>;
}
