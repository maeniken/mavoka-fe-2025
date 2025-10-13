
//"use client";
//import { useState, useEffect } from "react";
//import AkunHeader from "@/app/components/pengaturan-profil/akun/AkunHeader";
//import AkunView from "@/app/components/pengaturan-profil/akun/AkunView";
//import ChangePasswordFlow from "@/app/components/pengaturan-profil/akun/ChangePasswordFlow";
//import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

//export default function AkunPage() {
//  const [activeTab, setActiveTab] = useState("akun");
//  const [isEditing, setIsEditing] = useState(false);

//  const [form, setForm] = useState({
//    username: "SMK Negeri 1 Yogyakarta",
//    email: "smk1yogyakarta@gmail.com",
//    password: "",
//  });

//  // start loading false so initial client render matches the server HTML
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState<string | null>(null);

//  useEffect(() => {
//    const storedUser = localStorage.getItem("user");
//    let parsed: any = null;
//    if (storedUser) {
//      try {
//        parsed = JSON.parse(storedUser);
//      } catch (e) {
//        console.error("Failed to parse user:", e);
//      }
//    }

//    (async () => {
//      await fetchAccount(parsed);
//    })();
//  }, []);

//  async function fetchAccount(parsedUser?: any) {
//    setLoading(true);
//    setError(null);

//    const API_BASE =
//      (process.env.NEXT_PUBLIC_API_BASE as string) ||
//      (process.env.NEXT_PUBLIC_API_URL as string) ||
//      "http://localhost:8000";
//    const apiRoot = `${API_BASE.replace(/\/+$/, "")}/api`;

//    const tokenCandidates = [
//      localStorage.getItem("token"),
//      localStorage.getItem("access_token"),
//      localStorage.getItem("auth_token"),
//      parsedUser?.token,
//      parsedUser?.access_token,
//    ];
//    const token = tokenCandidates.find((t) => typeof t === "string" && t?.length > 0) || null;

//    if (!parsedUser || !parsedUser.id) {
//      setLoading(false);
//      setError("User id not found in localStorage. Please login so the app can fetch your account.");
//      return;
//    }

//    // backend route for getting account by role/id: GET /api/user/{role}/{id}
//    const endpoints: string[] = [
//      `${apiRoot}/user/sekolah/${parsedUser.id}`,
//      `${apiRoot}/user/${parsedUser.id}`,
//    ];

//    let lastErr: any = null;
//    for (const url of endpoints) {
//      try {
//        const finalUrl = url.startsWith("http") ? url : `${apiRoot.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
//        const res = await fetch(finalUrl, {
//          headers: token
//            ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
//            : { Accept: "application/json" },
//        });
//        if (!res.ok) {
//          const txt = await res.text().catch(() => "");
//          lastErr = new Error(`Request to ${finalUrl} failed: ${res.status} ${res.statusText} ${txt.slice(0,200)}`);
//          continue;
//        }

//        const contentType = res.headers.get("content-type") || "";
//        if (!contentType.includes("application/json")) {
//          const txt = await res.text().catch(() => "(unable to read response)");
//          lastErr = new Error(`Non-JSON response from ${finalUrl}: ${txt.slice(0,200)}`);
//          continue;
//        }

//        let data: any;
//        try {
//          data = await res.json();
//        } catch (err) {
//          lastErr = err;
//          continue;
//        }
//        // API may return different shapes: either the model object directly, or { success: true, data: { ... } }
//        const payload = data?.data ?? data;
//        const mapped = {
//          username: payload.username || payload.name || payload.nama_sekolah || payload.user?.username || "",
//          email: payload.email || payload.user?.email || "",
//          password: "",
//        };

//        setForm((prev) => ({ ...prev, ...mapped }));
//        setLoading(false);
//        return;
//      } catch (err) {
//        lastErr = err;
//      }
//    }

//    setLoading(false);
//    setError(lastErr ? String(lastErr) : "Failed to fetch account");
//  }

//  return (
//    <>
//      {activeTab === "akun" && (
//        <>
//          <AkunHeader />
//          {loading ? (
//            <FullPageLoader label="Memuat akun..." variant="primary" styleType="dashed" />
//          ) : error ? (
//            <div className="p-6 text-red-600">Error loading account: {error}</div>
//          ) : (
//            <>
//              {!isEditing && (
//                <AkunView
//                  form={form}
//                  setForm={setForm}
//                  onChangePassword={() => setIsEditing(true)}
//                />
//              )}
//              {isEditing && (
//                <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
//              )}
//            </>
//          )}
//        </>
//      )}
//    </>
//  );
//}


"use client";
import { useState, useEffect } from "react";
import AkunHeader from "@/app/components/pengaturan-profil/akun/AkunHeader";
import AkunView from "@/app/components/pengaturan-profil/akun/AkunView";
import ChangePasswordFlow from "@/app/components/pengaturan-profil/akun/ChangePasswordFlow";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { getAccount } from "@/services/account";
import { extractUsernameFromAny } from "@/lib/extractUsername";

export default function AkunPage() {
  const [activeTab] = useState("akun");
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "••••••••", // placeholder saja
  });

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Ambil userId dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const idCandidate = u?.id ?? u?.user?.id ?? u?.user_id ?? null;
        if (idCandidate) setUserId(Number(idCandidate));
      }
    } catch (e) {
      console.error("[AkunSekolah] gagal parse localStorage user:", e);
    }
  }, []);

  // Fetch akun via service getAccount
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getAccount("sekolah", userId);

        // coba ekstrak username dari payload variatif
        let apiUsername = extractUsernameFromAny(data);
        // fallback: coba field user di payload
        if (!apiUsername && (data as any).user) {
          apiUsername = extractUsernameFromAny((data as any).user);
        }

        // fallback: cache di localStorage
        let cached: string | null = null;
        try {
          cached = localStorage.getItem("sekolah_username");
        } catch {}

        // fallback: user object di localStorage
        if (!apiUsername) {
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const u = JSON.parse(raw);
              apiUsername = u?.username || apiUsername;
            }
          } catch {}
        }

        const normalizedUsername =
          typeof apiUsername === "string"
            ? apiUsername
            : (apiUsername && typeof (apiUsername as any).username === "string"
                ? (apiUsername as any).username
                : "");
        const finalUsername = (normalizedUsername || "").trim() || cached || "Belum diatur";

        // cache-kan jika valid
        if (finalUsername && finalUsername !== "Belum diatur") {
          try {
            localStorage.setItem("sekolah_username", finalUsername);
          } catch {}
        }

        if (!cancelled) {
          setForm(prev => ({
            ...prev,
            username: finalUsername,
            email: (data as any)?.email || (data as any)?.user?.email || "",
            password: "••••••••",
          }));
        }
      } catch (err: any) {
        console.error("[AkunSekolah] fetch account error:", err);
        if (!cancelled) showToast(err?.message || "Gagal memuat data akun", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Loading card
  if (loading) {
    return (
      <>
        <div className="bg-white p-6 rounded-lg">
          <AkunHeader />
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner
              size={48}
              label="Memuat data akun..."
              labelPosition="below"
              variant="primary"
              styleType="dashed"
            />
          </div>
        </div>

        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`px-4 py-2 rounded shadow-md text-white ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </>
    );
  }

  // Konten normal (bg putih + props tambahan)
  return (
    <>
      <div className="bg-white p-6 rounded-lg">
        <AkunHeader />

        {activeTab === "akun" && (
          <>
            {!isEditing ? (
              <AkunView
                form={form}
                setForm={setForm}
                onChangePassword={() => setIsEditing(true)}
                onShowToast={showToast}
                userId={userId}
                role="sekolah"
              />
            ) : (
              <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded shadow-md text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
