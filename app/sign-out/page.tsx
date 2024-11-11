'use client'

import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export default function Page() {
  const { signOut } = useClerk();

  useEffect(() => {
    // 清理本地缓存
    localStorage.removeItem("userId");
    localStorage.removeItem("extId");

    signOut().then(() => {
      window.location.href = "/";
    });

  }, [signOut]);

  return null;
}