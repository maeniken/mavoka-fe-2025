"use client";

import { Suspense } from "react";
import AuthIllustration from "@/app/components/AuthIllustration";
import FormResetPassword from "@/app/components/lupa-katasandi/formResetSandi";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden lg:flex-row">
      <AuthIllustration />

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md rounded-[50px] border-[5px] border-[#0F67B1] p-6 shadow-sm">
          <Suspense fallback={<div>Loading form reset password...</div>}>
            <FormResetPassword />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
