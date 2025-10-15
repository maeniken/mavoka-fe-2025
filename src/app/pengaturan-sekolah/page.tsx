"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import ProfileHeader from "@/app/components/pengaturan-profil/data-akun/ProfileHeader";
import ProfileAvatar from "@/app/components/pengaturan-profil/data-akun/ProfileAvatar";
import TampilProfil from "@/app/components/pengaturan-profil/data-akun/TampilProfil";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

type Role = "sekolah" | "perusahaan" | "lpk" | "siswa";

export default function ProfilePage() {
  const [role, setRole] = useState<Role>("sekolah");
  const [isDirty, setIsDirty] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );

  const [form, setForm] = useState({
    nama_sekolah: "SMK Negeri 1 Yogyakarta",
    npsn: "20404180",
    email: "smk1yogyakarta@gmail.com",
    phone: "08123456789",
    website: "https://mail.smk1yogyayess.sch.id",
    address:
      "Jl. Kemetiran Kidul 35, Kecamatan Gedongtengen, Kota Yogyakarta, D.I. Yogyakarta.",
    profilePic: "",
  });

  // start `loading` as false so initial client render matches server HTML and avoids hydration mismatch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const notifTimer = useRef<number | null>(null);

  // helper to show notification temporarily
  const showNotification = (
    type: "success" | "error",
    message: string,
    ttl = 4000
  ) => {
    setNotification({ type, message });
    try {
      if (notifTimer.current) window.clearTimeout(notifTimer.current);
    } catch (e) {}
    notifTimer.current = window.setTimeout(
      () => setNotification(null),
      ttl
    ) as unknown as number;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let parsedUser: any = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        if (parsedUser.role) setRole(parsedUser.role as Role);
      } catch (e) {
        console.error("Gagal parse user:", e);
      }
    }

    (async () => {
      await fetchProfile(parsedUser);
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  // Save a single field to the account update endpoint (per-field save)
  const saveField = async (name: string, value: string) => {
    setLoading(true);
    setError(null);

    const API_BASE =
      (process.env.NEXT_PUBLIC_API_BASE as string) ||
      (process.env.NEXT_PUBLIC_API_URL as string) ||
      "http://localhost:8000";
    const apiRoot = `${API_BASE.replace(/\/+$/, "")}/api`;

    const stored = localStorage.getItem("user");
    let parsed: any = null;
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (e) {
        /* ignore */
      }
    }
    const tokenCandidates = [
      localStorage.getItem("access_token_sekolah"),
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      parsed?.token,
      parsed?.access_token,
    ];
    const token =
      tokenCandidates.find((t) => typeof t === "string" && t?.length > 0) ||
      null;

    try {
      if (!parsed?.id) throw new Error("User id not found in localStorage");
      // Endpoint: /api/user/update-akun/{role}/{id}
      const roleName = parsed.role ?? "sekolah";
      const url = `${apiRoot}/user/update-akun/${roleName}/${parsed.id}`;

      // map frontend field names to backend column names when needed
      const mapField = (k: string, v: any) => {
        if (roleName === "sekolah") {
          const map: Record<string, string> = {
            phone: "kontak",
            address: "alamat",
            website: "web_sekolah",
            profile_pic: "logo_sekolah",
            profilePic: "logo_sekolah",
          };
          const target = map[k] ?? k;
          return { [target]: v };
        }
        return { [k]: v };
      };

      const payload: any = mapField(name, value);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Update field failed: ${res.status} ${res.statusText} ${txt}`
        );
      }

      // update local form state
      setForm((prev) => ({ ...prev, [name]: value }));
      setIsDirty(false);
      // also update stored user so other parts read updated values
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) || {};
          // set both frontend-friendly and backend keys
          parsedUser[name] = value;
          if (roleName === "sekolah") {
            if (name === "phone") parsedUser.kontak = value;
            if (name === "address") parsedUser.alamat = value;
            if (name === "website") parsedUser.web_sekolah = value;
            if (name === "profile_pic" || name === "profilePic")
              parsedUser.logo_sekolah = value;
          }
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
      } catch (e) {}
      showNotification("success", `${name} berhasil diperbarui.`);
    } catch (err: any) {
      console.error("saveField error", err);
      const msg = err?.message ? String(err.message) : String(err);
      showNotification("error", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save profile to backend: upload avatar first (if a file selected), then save profile data
  const saveProfile = async () => {
    setLoading(true);
    setError(null);

    // determine API root
    const API_BASE =
      (process.env.NEXT_PUBLIC_API_BASE as string) ||
      (process.env.NEXT_PUBLIC_API_URL as string) ||
      "http://localhost:8000";
    const apiRoot = `${API_BASE.replace(/\/+$/, "")}/api`;

    // read user from localStorage for id and token
    const stored = localStorage.getItem("user");
    let parsed: any = null;
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (e) {
        /* ignore */
      }
    }
    const tokenCandidates = [
      localStorage.getItem("access_token_sekolah"),
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      parsed?.token,
      parsed?.access_token,
    ];
    const token =
      tokenCandidates.find((t) => typeof t === "string" && t?.length > 0) ||
      null;

    try {
      let avatarPath = form.profilePic;

      // Upload avatar if a File is selected
      if (selectedAvatarFile) {
        // Use sekolah upload endpoint which exists: POST /api/sekolah/{sekolah_id}/upload-logo
        const roleName = parsed?.role ?? "sekolah";
        // Only sekolah has dedicated upload-logo route in backend
        const uploadUrl = `${apiRoot}/sekolah/${parsed?.id}/upload-logo`;
        const fd = new FormData();
        // backend expects field name 'logo'
        fd.append("logo", selectedAvatarFile);

        const upRes = await fetch(uploadUrl, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });

        if (!upRes.ok) {
          // Try to parse JSON error body for user-friendly message
          const errJson = await upRes.json().catch(() => null);
          const friendly =
            errJson?.errors?.logo?.[0] ??
            errJson?.message ??
            `${upRes.status} ${upRes.statusText}`;
          // show toast and stop saving so user can fix avatar (do not set global error which hides the form)
          showNotification("error", `Avatar upload failed: ${friendly}`);
          setLoading(false);
          return; // abort saveProfile so user can correct avatar
        }

        const upData = await upRes.json().catch(() => null);
        // backend returns { message, logo_url }
        avatarPath =
          upData?.data?.path ??
          upData?.path ??
          upData?.logo_url ??
          upData?.data?.logo_url ??
          avatarPath;
      }

      // Prepare payload with fields we want to save and map frontend names
      const payload: any = {
        nama_sekolah: form.nama_sekolah,
        npsn: form.npsn,
        email: form.email,
      } as any;
      // map phone/address/website to backend columns for sekolah
      if (form.phone) payload.kontak = form.phone;
      if (form.address) payload.alamat = form.address;
      if (form.website) payload.web_sekolah = form.website;
      if (avatarPath) payload.logo_sekolah = avatarPath;

      // Decide endpoint — use central update-akun endpoint that accepts role+id
      if (!parsed?.id) throw new Error("User id not found in localStorage");
      const roleName = parsed.role ?? "sekolah";
      const saveUrl = `${apiRoot}/user/update-akun/${roleName}/${parsed.id}`;

      const res = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Save profile failed: ${res.status} ${res.statusText} ${txt}`
        );
      }

      // success
      setIsDirty(false);
      // sync updated fields into localStorage.user if present (both frontend and backend keys)
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) || {};
          parsedUser.nama_sekolah = form.nama_sekolah;
          parsedUser.npsn = form.npsn;
          parsedUser.email = form.email;
          parsedUser.phone = form.phone;
          parsedUser.website = form.website;
          parsedUser.address = form.address;
          // backend keys
          if (form.phone) parsedUser.kontak = form.phone;
          if (form.address) parsedUser.alamat = form.address;
          if (form.website) parsedUser.web_sekolah = form.website;
          if (avatarPath) {
            parsedUser.profile_pic = avatarPath;
            parsedUser.logo_sekolah = avatarPath;
          }
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
      } catch (e) {}
      showNotification("success", "Perubahan berhasil disimpan.");
    } catch (err: any) {
      // Non-fatal UI: show toast only and keep the form visible. Keep a console error for debugging.
      console.error("Save profile error", err);
      const msg = err?.message ? String(err.message) : String(err);
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarEdit = () => {
    // open file picker and keep File object in state
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        // revoke previous object URL (if we created one)
        try {
          const prev = (selectedAvatarFile as any)?._previewUrl;
          if (prev) URL.revokeObjectURL(prev);
        } catch (err) {}

        const url = URL.createObjectURL(file);
        // store preview URL on file object so we can revoke it later
        (file as any)._previewUrl = url;
        setForm((prev) => ({ ...prev, profilePic: url }));
        setSelectedAvatarFile(file);
        setIsDirty(true);
      }
    };
    input.click();
  };

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      try {
        if (selectedAvatarFile && (selectedAvatarFile as any)._previewUrl) {
          URL.revokeObjectURL((selectedAvatarFile as any)._previewUrl);
        }
      } catch (e) {}
    };
  }, [selectedAvatarFile]);

  async function fetchProfile(parsedUser?: any) {
    setLoading(true);
    setError(null);

    // prefer NEXT_PUBLIC_API_BASE, then NEXT_PUBLIC_API_URL, fallback localhost
    const API_BASE =
      (process.env.NEXT_PUBLIC_API_BASE as string) ||
      (process.env.NEXT_PUBLIC_API_URL as string) ||
      "http://localhost:8000";
    const apiRoot = `${API_BASE.replace(/\/+$/, "")}/api`;

    const tokenCandidates = [
      localStorage.getItem("access_token_sekolah"),
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      parsedUser?.token,
      parsedUser?.access_token,
    ];
    const token =
      tokenCandidates.find((t) => typeof t === "string" && t?.length > 0) ||
      null;

    // require an id from parsedUser — backend routes expect role+id
    if (!parsedUser || !parsedUser.id) {
      setLoading(false);
      setError(
        "User id not found in localStorage. Please login so the app can fetch your profile."
      );
      return;
    }

    const endpoints: string[] = [
      `${apiRoot}/user/sekolah/${parsedUser.id}`,
      `${apiRoot}/sekolah/detail/${parsedUser.id}`,
      `${apiRoot}/sekolah/${parsedUser.id}`,
    ];

    let lastErr: any = null;
    for (const path of endpoints) {
      try {
        const finalUrl = path.startsWith("http")
          ? path
          : `${apiRoot}${path.startsWith("/") ? path : "/" + path}`;

        const res = await fetch(finalUrl, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              }
            : { Accept: "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          lastErr = new Error(
            `Request to ${finalUrl} failed: ${res.status} ${
              res.statusText
            } ${txt.slice(0, 200)}`
          );
          continue;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const txt = await res.text().catch(() => "(unable to read response)");
          lastErr = new Error(
            `Non-JSON response from ${finalUrl}: ${txt.slice(0, 200)}`
          );
          continue;
        }

        const data = await res.json();

        const payload = data?.data ?? data;
        // Normalize a bunch of possible field names from different backend shapes
        const pickString = (v: any) => (v == null ? "" : String(v));
        const mapped = {
          username: pickString(
            payload.username ??
              payload.user?.username ??
              payload.user?.nama ??
              ""
          ),
          nama_sekolah: pickString(
            payload.nama_sekolah ??
              payload.name ??
              payload.school_name ??
              payload.sekolah?.nama ??
              payload.sekolah_name ??
              payload.nama ??
              payload.nama_sekolah_alt ??
              payload.sekolah?.nama_sekolah ??
              ""
          ),
          npsn: pickString(
            payload.npsn ??
              payload.npsn_number ??
              payload.sekolah?.npsn ??
              payload.npsn_sekolah ??
              ""
          ),
          email: pickString(
            payload.email ??
              payload.sekolah?.email ??
              payload.email_sekolah ??
              payload.email_contact ??
              payload.sekolah?.email_sekolah ??
              ""
          ),
          phone: pickString(
            payload.phone ??
              payload.telepon ??
              payload.no_hp ??
              payload.phone_number ??
              payload.sekolah?.phone ??
              payload.kontak ??
              payload.kontak_sekolah ??
              payload.kontak ??
              payload.contact ??
              payload.sekolah?.kontak ??
              ""
          ),
          website: pickString(
            payload.website ??
              payload.website_url ??
              payload.sekolah?.website ??
              payload.web_sekolah ??
              payload.web_sekolah_url ??
              payload.web ??
              payload.url ??
              payload.sekolah?.web_sekolah ??
              ""
          ),
          address: pickString(
            payload.address ??
              payload.alamat ??
              payload.sekolah?.address ??
              payload.alamat_sekolah ??
              payload.sekolah?.alamat ??
              ""
          ),
          profilePic: pickString(
            payload.profile_pic ??
              payload.avatar ??
              payload.foto ??
              payload.sekolah?.profile_pic ??
              payload.foto_profil ??
              payload.image ??
              payload.foto_profil_sekolah ??
              payload.sekolah?.foto ??
              payload.logo_sekolah ??
              payload.sekolah?.logo_sekolah ??
              payload.logo ??
              ""
          ),
        };

        setForm((prev) => ({ ...prev, ...mapped }));
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
      }
    }

    setLoading(false);
    setError(lastErr ? String(lastErr) : "Failed to fetch profile");
  }

  return (
     <Suspense fallback={<div className="p-6">Loading…</div>}>
    <div className="bg-white p-6 rounded-lg shadow">
      <ProfileHeader role={role} />

      {notification && (
        <div
          className={`p-3 rounded mb-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-sm underline"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <FullPageLoader
          label="Memuat profil..."
          variant="primary"
          styleType="dashed"
        />
      ) : error ? (
        <div className="p-6 text-red-600">Error loading profile: {error}</div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <ProfileAvatar
              src={form.profilePic}
              name={form.nama_sekolah}
              onEdit={handleAvatarEdit}
            />
          </div>

          <TampilProfil
            form={form}
            handleChange={handleChange}
            isDirty={isDirty}
            setIsDirty={setIsDirty}
            onSaveAll={saveProfile}
          />
        </>
      )}
    </div>
    </Suspense>
  );
}
