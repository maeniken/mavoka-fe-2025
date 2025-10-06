# Proteksi Dashboard & Auto Logout

Dokumen ini menjelaskan mekanisme proteksi halaman dashboard/pengaturan dan sistem sesi (auto logout) yang telah diterapkan.

## Ringkasan Cepat

- Semua halaman dashboard & pengaturan hanya bisa diakses setelah login.
- Token disimpan di cookie (`auth_token`) + localStorage untuk kebutuhan client.
- Middleware memblokir akses langsung (URL ditembak) dan redirect ke `/login`.
- Sesi otomatis berakhir setelah 60 menit (sesuai `JWT_TTL` backend) → user dipaksa login ulang + toast.
- Logout manual & auto logout menampilkan toast berbeda.

## Fitur Utama

1. **Server-side guard (Middleware)**: File `middleware.ts` mengecek path yang dilindungi. Jika token tidak ada / expired → redirect.
2. **AuthProvider (Client Context)**: Menyediakan state token, toast global, auto scheduling logout, broadcast antar tab.
3. **Auto Logout** terjadi saat:
   - Waktu sesi (60 menit) habis.
   - Tab ditutup (trigger broadcast ke tab lain agar konsisten).
4. **Logout Manual** melalui sidebar pakai context `logout('manual')`.
5. **Utility**: `src/lib/auth-session.ts` (cookie + timer + broadcast), `src/lib/auth-storage.ts` (legacy helpers + pembersihan).

## Alur Login

1. User submit form login (`formLogin.tsx`).
2. Backend mengembalikan `token`, `user`, `role`.
3. Token diset via `setSessionToken(token, 60*60*1000)` →
   - Cookie: `auth_token`
   - LocalStorage: `token`, `access_token_<role>`, `login_at`, `actor`, dll.
4. Middleware mengizinkan akses dashboard setelah cookie tersedia.

## Alur Logout

| Jenis | Pemicu | Efek | Toast |
|-------|--------|------|-------|
| Manual | Klik "Keluar" | Hapus cookie + localStorage + broadcast | "Berhasil logout." |
| Expired | Timer 60 menit | Hapus data + paksa login ulang | "Sesi Anda telah berakhir. Silakan login kembali." |
| Window Closed | Tutup tab (event) | Broadcast ke tab lain (tanpa toast khusus) | - |

## Komponen & File Penting

| File | Peran |
|------|------|
| `middleware.ts` | Proteksi SSR path dashboard/pengaturan |
| `src/app/layout.tsx` | Membungkus tree dengan `<AuthProvider>` |
| `src/app/components/auth/AuthProvider.tsx` | Context + toast + auto logout |
| `src/lib/auth-session.ts` | Token cookie + expiry scheduling + broadcast |
| `src/app/components/auth/RequireAuth.tsx` | Guard client tambahan (fallback) |
| `src/app/login/formLogin.tsx` | Set token saat login |
| `src/app/components/dashboard/sidebar.tsx` | Logout manual via context |

## Penggunaan di Layout

Pastikan root layout sudah dibungkus (SUDAH dilakukan):

```tsx

// app/layout.tsx
import { AuthProvider } from '@/app/components/auth/AuthProvider';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Konfigurasi TTL

- Backend: `config/jwt.php` → `ttl = 60` (menit).
- Frontend: `auth-session.ts` → ubah konstanta `ONE_HOUR_MS` jika perlu.
- Jika diubah, samakan keduanya untuk pengalaman konsisten.

Edit array `PROTECTED_PREFIXES` di `middleware.ts`.

Edit array `PROTECTED_PREFIXES` di `middleware.ts`.

```ts
const PROTECTED_PREFIXES = [
  '/dashboard-admin',
  '/dashboard-siswa',
  // Tambah di sini
];
```

## Toast Pesan (Default)

| Kejadian | Pesan |
|----------|-------|
| Sesi Expired | Sesi Anda telah berakhir. Silakan login kembali. |
| Logout Manual | Berhasil logout. |

Kustomisasi: ubah di `AuthProvider.tsx` bagian `showToast` / kondisi `reason`.

Jika backend ingin mem-blacklist token saat logout:

1. Tambah endpoint (misal `POST /api/user/logout`).

1. Di fungsi `logout` (AuthProvider) sebelum `clearAuth()` panggil fetch:

```ts
await fetch('/api/user/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
```

## Troubleshooting

| Masalah | Penyebab Umum | Solusi |
|---------|----------------|--------|
| Selalu redirect ke /login | Cookie tidak terset | Cek domain/path; pastikan login sukses memanggil `setSessionToken` |
| Auto logout terlalu cepat | Waktu sistem device maju / TTL mismatch | Samakan jam & periksa `ONE_HOUR_MS` |
| Tidak muncul toast | Root tidak dibungkus `<AuthProvider>` | Pastikan layout.tsx sudah benar |
| Akses masih lolos tanpa login | Path belum masuk `PROTECTED_PREFIXES` | Tambahkan prefix path |

## Checklist Implementasi (Verifikasi)

- [x] Middleware aktif dan mencegah akses tanpa token.
- [x] Token disimpan cookie + localStorage.
- [x] Auto logout setelah 60 menit teruji (bisa uji dengan kurangi TTL sementara).
- [x] Logout manual menampilkan toast.
- [x] Redirect ke `/login` saat belum login.

---
Jika butuh tambahan seperti refresh token, multi-role simultaneous session, atau integrasi blacklist backend—silakan beri tahu.
