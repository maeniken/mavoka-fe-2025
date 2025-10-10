"use client";

import Image from "next/image";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { RiPencilLine } from "react-icons/ri";
import { Menu } from "lucide-react";
import * as React from "react";

type TopNavbarProps = {
  variant: "siswa" | "welcome";
  fullName?: string;
  orgName?: string;
  profilePic?: string | null;
  settingsHref: string;
  hasNotification?: boolean;
  onBellClick?: () => void;
  className?: string;
  onMobileOpen?: () => void;
};

type AnyUser = Record<string, any>;

// Event sederhana untuk mem-broadcast perubahan profil (mis: foto profil diperbarui)
// Komponen form update profil dapat memanggil: window.dispatchEvent(new CustomEvent('profile-updated', { detail: { at: Date.now() }}))
// Lalu TopNavbar akan menangkap dan memaksa reload avatar.

const PROFILE_UPDATED_EVENT = 'profile-updated';

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const API_ROOT = API_BASE.replace(/\/?api\/?$/i, "");

function buildAvatarCandidates(raw?: string | null): string[] {
  if (!raw) return [];
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return [raw];
  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const url = new URL(raw, API_ROOT);
      const root = new URL(API_ROOT);
      if (url.host === root.host) {
        const pathname = url.pathname.replace(/^\/+/, '');
        const c1 = `${root.origin}/storage/${pathname}`;
        const c2 = `${root.origin}/${pathname}`;
        return Array.from(new Set([c1, c2]));
      }
    } catch (e) {
      return [raw];
    }
  }
  const cleaned = raw.replace(/^\//, ''); // strip leading slash for consistency
  const candidates: string[] = [];
  const root = API_ROOT.replace(/\/$/, '');
  // If already begins with storage/ just use it
  if (cleaned.startsWith('storage/')) {
    candidates.push(`${root}/${cleaned}`);
  } else {
    // try storage first (Laravel typical after storage:link)
    candidates.push(`${root}/storage/${cleaned}`);
    // Raw path as-is (maybe served directly if user exposed folder publicly)
    candidates.push(`${root}/${cleaned}`);
  }
  // storage + cleaned may duplicate if cleaned already includes storage
  return Array.from(new Set(candidates));
}

function Avatar({ name, src, size = 36 }: { name?: string; src?: string | null; size?: number; }) {
  // Pastikan container bulat & gambar dicrop di dalamnya
  const dimensionClass = `w-9 h-9`; // size 36px default
  const candidates = React.useMemo(() => buildAvatarCandidates(src), [src]);
  const [idx, setIdx] = React.useState(0);
  const current = candidates[idx];
  // Untuk paksa refresh (cache bust) ketika profile-updated dipancarkan
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    const handler = () => {
      // Reset index supaya mencoba ulang candidate pertama, dan bump version untuk ubah key (cache bust)
      setIdx(0);
      setVersion(v => v + 1);
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, handler as EventListener);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler as EventListener);
  }, []);

  return (
    <div
      className={`${dimensionClass} rounded-full border overflow-hidden flex items-center justify-center bg-gray-200 text-gray-700 font-semibold relative`}
      style={{ width: size, height: size }}
    >
      {current ? (
        <Image
          key={version + '-' + current} // ubah key agar Next Image re-render & fetch ulang
          src={current + (current.includes('?') ? `&v=${version}` : `?v=${version}`)}
          alt={name ? `${name} avatar` : 'User avatar'}
          fill
          sizes="36px"
          onError={() => setIdx(i => (i + 1 < candidates.length ? i + 1 : i))}
          className="object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function deriveFullName(user: AnyUser | null, role?: string) {
  const r = (role ?? "").toLowerCase();
  const u = user || {};
  switch (r) {
    case "siswa":
      return u.nama_lengkap ?? u.name ?? u.username ?? "Siswa";
    case "sekolah":
      return (
        u.nama_kepala_sekolah ??
        u.penanggung_jawab ??
        u.name ??
        u.username ??
        "Pengguna Sekolah"
      );
    case "perusahaan":
      return (
        u.penanggung_jawab ??
        u.pic ??
        u.name ??
        u.username ??
        "Pengguna Perusahaan"
      );
    case "lpk":
      return u.penanggung_jawab ?? u.name ?? u.username ?? "Pengguna LPK";
    case "admin":
      return u.name ?? u.username ?? "Admin";
    default:
      return u.name ?? u.username ?? "Pengguna";
  }
}

function deriveOrgName(user: AnyUser | null, role?: string) {
  const r = (role ?? "").toLowerCase();
  const u = user || {};
  switch (r) {
    case "siswa":
      return u.sekolah?.nama ?? u.nama_sekolah ?? "Siswa";
    case "sekolah":
      return (
        u.nama_sekolah ??
        u.orgName ??
        u.nama_instansi ??
        u.sekolah?.nama ??
        "Sekolah"
      );
    case "perusahaan":
      return u.nama_perusahaan ?? u.company?.nama_perusahaan ?? "Perusahaan";
    case "lpk":
      return (
        u.nama_lpk ?? u.nama_lembaga ?? u.lembaga?.nama ?? "Lembaga Pelatihan"
      );
    case "admin":
      return "Administrator";
    default:
      return u.orgName ?? "MAVOKA";
  }
}

function deriveAvatar(user: AnyUser | null, profilePic?: string | null) {
  const u = user || {};
  // Prioritaskan prop lalu foto_profil (backend) kemudian variasi lain
  // Also accept various school logo fields set by the backend
  return (
    profilePic ??
    u.logo_sekolah ??
    u.logo ??
    u.logo_url ??
    u.foto_profil ??
    u.foto_profil_url ??
    u.avatar ??
    u.foto ??
    // nested sekolah object sometimes carries the logo
    u.sekolah?.logo_sekolah ??
    u.sekolah?.logo ??
    null
  );
}

export default function TopNavbar({
  variant,
  fullName,
  orgName,
  profilePic,
  settingsHref = "/pengaturan",
  hasNotification = true,
  onBellClick,
  className = "",
  onMobileOpen,
}: TopNavbarProps) {
  const [loadedUser, setLoadedUser] = React.useState<AnyUser | null>(null);
  const [loadedRole, setLoadedRole] = React.useState<string | null>(null);
  const [profileVersion, setProfileVersion] = React.useState(0); // untuk memicu re-hit deriveAvatar saat profile diupdate

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const r = localStorage.getItem("role");
      if (raw) setLoadedUser(JSON.parse(raw));
      if (r) setLoadedRole(r);
    } catch {}
  }, []);

  // Dengarkan event profile-updated untuk ambil ulang user dari localStorage (diasumsikan form update sudah menimpa localStorage 'user')
  React.useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setLoadedUser(JSON.parse(raw));
        setProfileVersion(v => v + 1);
      } catch {}
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, handler as EventListener);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler as EventListener);
  }, []);

  const displayFullName =
    fullName ?? deriveFullName(loadedUser, loadedRole ?? undefined);
  const displayOrgName =
    orgName ?? deriveOrgName(loadedUser, loadedRole ?? undefined);
  const displayAvatar = React.useMemo(() => deriveAvatar(loadedUser, profilePic ?? null), [loadedUser, profilePic, profileVersion]);

  return (
    // Tinggi fix 84px agar sejajar dengan header Sidebar (yang juga h-[84px])
    <div
      className={`flex justify-between
              h-auto sm:h-[84px]
              py-3 sm:py-0
              items-start sm:items-center
              px-4 md:px-6 border-b bg-white ${className}`}
    >
      {/* Left area + hamburger */}
      {variant === "siswa" ? (
        <div className="min-w-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onMobileOpen}
            className="-ml-2 p-2 rounded-md hover:bg-gray-100 sm:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 leading-tight">
            <h3 className="font-semibold text-gray-900 truncate">
              {displayFullName}
            </h3>
            <small className="text-sm text-gray-500 truncate">
              {displayOrgName}
            </small>
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileOpen}
            className="-ml-2 p-2 rounded-md hover:bg-gray-100 sm:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="leading-tight">
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#0F67B1]">
              SELAMAT DATANG
            </h1>
            <p className="text-sm text-gray-500">
              Hi, {displayOrgName}. Selamat datang kembali di MAVOKA!
            </p>
          </div>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-4 self-center">
        <button
          type="button"
          onClick={onBellClick}
          className="relative rounded-none shadow-none p-0 self-center"
          aria-label="Notifikasi"
        >
          <FaBell className="w-6 h-6 text-[#0F67B1]" />
          {hasNotification && (
            <span className="absolute top-1 right-0 block w-2 h-2 bg-[#28A745] rounded-full" />
          )}
        </button>

        <div className="w-px h-10 sm:h-8 bg-gray-300 self-center" />

        <Link
          href={settingsHref}
          aria-label="Buka pengaturan profil"
          className="self-center"
        >
          <div className="relative w-9 h-9">
            <Avatar name={displayFullName} src={displayAvatar ?? undefined} />
            <div className="absolute -bottom-1 -right-2">
              <RiPencilLine className="text-black w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
