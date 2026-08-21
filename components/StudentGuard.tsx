"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, StudentSession } from "@/lib/local-db";

type StudentGuardProps = {
  children: (session: StudentSession) => React.ReactNode;
};

export default function StudentGuard({ children }: StudentGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession || currentSession.role !== "student") {
      router.replace("/student-login");
      return;
    }

    setSession(currentSession as StudentSession);
  }, [router]);

  if (!session) {
    return <p>Verifying student access...</p>;
  }

  return <>{children(session)}</>;
}
