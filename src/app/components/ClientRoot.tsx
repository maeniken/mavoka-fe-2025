"use client";

import React from "react";
import SessionTimeout from "./SessionTimeout";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
}
