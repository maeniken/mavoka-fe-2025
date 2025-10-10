
"use client";
import { useState, useEffect } from "react";
import AkunHeader from "@/app/components/pengaturan-profil/akun/AkunHeader";
import AkunView from "@/app/components/pengaturan-profil/akun/AkunView";
import ChangePasswordFlow from "@/app/components/pengaturan-profil/akun/ChangePasswordFlow";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

export default function AkunPage() {
  const [activeTab, setActiveTab] = useState("akun");
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    username: "SMK Negeri 1 Yogyakarta",
    email: "smk1yogyakarta@gmail.com",
    password: "",
  });

  // start loading false so initial client render matches the server HTML
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let parsed: any = null;
    if (storedUser) {
      try {
        parsed = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }

    (async () => {
      await fetchAccount(parsed);
    })();
  }, []);

  async function fetchAccount(parsedUser?: any) {
    setLoading(true);
    setError(null);

    const API_BASE =
      (process.env.NEXT_PUBLIC_API_BASE as string) ||
      (process.env.NEXT_PUBLIC_API_URL as string) ||
      "http://localhost:8000";
    const apiRoot = `${API_BASE.replace(/\/+$/, "")}/api`;

    const tokenCandidates = [
      localStorage.getItem("token"),
      localStorage.getItem("access_token"),
      localStorage.getItem("auth_token"),
      parsedUser?.token,
      parsedUser?.access_token,
    ];
    const token = tokenCandidates.find((t) => typeof t === "string" && t?.length > 0) || null;

    if (!parsedUser || !parsedUser.id) {
      setLoading(false);
      setError("User id not found in localStorage. Please login so the app can fetch your account.");
      return;
    }

    // backend route for getting account by role/id: GET /api/user/{role}/{id}
    const endpoints: string[] = [
      `${apiRoot}/user/sekolah/${parsedUser.id}`,
      `${apiRoot}/user/${parsedUser.id}`,
    ];

    let lastErr: any = null;
    for (const url of endpoints) {
      try {
        const finalUrl = url.startsWith("http") ? url : `${apiRoot.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
        const res = await fetch(finalUrl, {
          headers: token
            ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
            : { Accept: "application/json" },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          lastErr = new Error(`Request to ${finalUrl} failed: ${res.status} ${res.statusText} ${txt.slice(0,200)}`);
          continue;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const txt = await res.text().catch(() => "(unable to read response)");
          lastErr = new Error(`Non-JSON response from ${finalUrl}: ${txt.slice(0,200)}`);
          continue;
        }

        let data: any;
        try {
          data = await res.json();
        } catch (err) {
          lastErr = err;
          continue;
        }
        // API may return different shapes: either the model object directly, or { success: true, data: { ... } }
        const payload = data?.data ?? data;
        const mapped = {
          username: payload.username || payload.name || payload.nama_sekolah || payload.user?.username || "",
          email: payload.email || payload.user?.email || "",
          password: "",
        };

        setForm((prev) => ({ ...prev, ...mapped }));
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
      }
    }

    setLoading(false);
    setError(lastErr ? String(lastErr) : "Failed to fetch account");
  }

  return (
    <>
      {activeTab === "akun" && (
        <>
          <AkunHeader />
          {loading ? (
            <FullPageLoader label="Memuat akun..." variant="primary" styleType="dashed" />
          ) : error ? (
            <div className="p-6 text-red-600">Error loading account: {error}</div>
          ) : (
            <>
              {!isEditing && (
                <AkunView
                  form={form}
                  setForm={setForm}
                  onChangePassword={() => setIsEditing(true)}
                />
              )}
              {isEditing && (
                <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
