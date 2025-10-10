This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## API Integration & CORS

Untuk mengaktifkan fetch data dari backend Laravel:

1. Jalankan backend di: `http://localhost:8000`
2. Tambahkan / edit file `.env.local` di frontend:

```
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```
3. Backend `config/cors.php` contoh (ringkas):

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [
	'http://localhost:3000',
	'http://127.0.0.1:3000',
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

4. Bersihkan cache config setelah perubahan:

```bash
php artisan config:clear
php artisan cache:clear
```

5. Restart server Next.js setelah ubah `.env.local`.

### Troubleshooting

| Gejala | Kemungkinan Penyebab | Solusi Singkat |
|--------|----------------------|----------------|
| `TypeError: Failed to fetch` | Server mati / CORS / URL salah | Pastikan backend up, cek Network tab, validasi env URL |
| HTTP 401 / 419 | Auth / CSRF / Sanctum | Tambah Authorization header / set SANCTUM_STATEFUL_DOMAINS |
| Preflight OPTIONS gagal | CORS config kurang | Pastikan origin & method diizinkan |
| Format JSON tak sesuai | Struktur respons beda | Sesuaikan parser di `services/applicants.ts` |

Jika butuh integrasi status update / interview endpoint, tambahkan detail endpoint lalu sesuaikan service.

### Auth Token (Bearer)

Jika backend mengembalikan JWT saat login perusahaan, simpan token:

```ts
import { setAuthToken } from '@/lib/authToken';

// setelah login sukses
setAuthToken(response.token); // asumsi field token
```

Logout:
```ts
import { clearAuthToken } from '@/lib/authToken';
clearAuthToken();
```

Service otomatis menambahkan header:

```text
Authorization: Bearer <token>
```

Jika backend memakai session Sanctum (bukan JWT), Anda bisa abaikan helper ini dan pastikan cookies diterima (supports_credentials=true & SANCTUM_STATEFUL_DOMAINS terkonfigurasi).

