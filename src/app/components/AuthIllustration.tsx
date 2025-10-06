"use client";

import { useRouter } from "next/navigation";

export default function AuthIllustration() {
  const router = useRouter();

  return (
    <>
      {/* Mobile & Tablet */}
      <div className="lg:hidden w-full flex items-center justify-center py-5">
        <button onClick={() => router.push("/")} className="shadow-none">
          <img
            src="/img/logo-mavoka.png"
            alt="Mavoka"
            className="object-contain max-w-[260px] w-[260px] h-auto cursor-pointer"
          />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-6 relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 shadow-none"
        >
          <img
            src="/img/logo-mavoka.png"
            alt="Mavoka"
            className="object-contain w-[209px] h-[50px] cursor-pointer"
          />
        </button>

        <img
          src="/img/login&register.png"
          alt="Magang Vokasi"
          className="object-contain w-[739px] h-[708px] max-w-full max-h-[90vh]"
        />
      </div>
    </>
  );
}
