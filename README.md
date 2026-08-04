# Splice — Pemendek Tautan

Web app pemendek URL, satu halaman, dibangun dengan Next.js (App Router) + Vercel KV.

## Cara kerja

- `app/page.tsx` — form input URL (client component)
- `app/api/shorten/route.ts` — API yang generate kode acak 6 karakter, simpan ke Vercel KV
- `app/[code]/route.ts` — route dinamis yang redirect `yourdomain.com/kode` ke URL asli
- `lib/kv.ts` — helper baca/tulis ke Vercel KV

## Setup lokal

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan kredensial KV (lihat langkah deploy di bawah)
npm run dev
```

## Setup storage — pilih salah satu

### Opsi A (disarankan): Upstash langsung, tanpa akun Vercel Storage

1. Daftar gratis di [upstash.com](https://upstash.com) (login GitHub/Google, tanpa kartu kredit).
2. Buat 1 database **Redis** baru, region terdekat dengan pengguna Anda.
3. Di halaman database, salin **REST URL** dan **REST TOKEN**.
4. Isi env var (lokal di `.env.local`, atau di Vercel → Project → Settings → Environment Variables):
   ```
   KV_REST_API_URL=<REST URL dari Upstash>
   KV_REST_API_TOKEN=<REST TOKEN dari Upstash>
   ```
   Nama env var **harus** persis `KV_REST_API_URL` / `KV_REST_API_TOKEN` karena `@vercel/kv` membacanya dengan nama itu — isinya boleh dari Upstash langsung, tidak harus lewat marketplace Vercel.

### Opsi B: Vercel KV lewat tab Storage

1. Push folder ini ke repo GitHub baru.
2. Di [vercel.com](https://vercel.com) → **Add New Project** → import repo tersebut → deploy (akan error karena KV belum ada, itu wajar).
3. Buka project → tab **Storage** → **Create Database** → pilih **KV**.
4. Klik **Connect Project**, pilih project ini → Vercel otomatis menambahkan env var yang dibutuhkan.
5. Buka tab **Deployments** → **Redeploy** deployment terakhir supaya env var baru terbaca.

## Deploy ke Vercel via GitHub

1. Push folder ini ke repo GitHub baru.
2. Di [vercel.com](https://vercel.com) → **Add New Project** → import repo tersebut.
3. Sebelum/sesudah deploy pertama, tambahkan env var storage (lihat Opsi A/B di atas).
4. Biarkan framework preset terdeteksi otomatis sebagai **Next.js**, deploy/redeploy.
5. Buka domain project Anda, coba pendekkan URL.

## Rate limiting

Sudah aktif di `lib/rate-limit.ts`: maksimal **20 link baru per IP per jam**, dihitung pakai counter di KV yang sama (key `ratelimit:shorten:{ip}`, TTL 1 jam). Kalau limit terlampaui, API mengembalikan status `429` dengan pesan sisa waktu tunggu. Angka `MAX_REQUESTS` dan `WINDOW_SECONDS` di file itu bisa diubah sesuai kebutuhan. IP diambil dari header `x-forwarded-for` — di belakang Vercel ini terisi otomatis, tapi kalau di-deploy di belakang proxy lain, pastikan header ini diteruskan dengan benar (kalau tidak, IP-nya akan selalu terbaca `unknown` dan rate limit jadi berlaku global untuk semua orang, bukan per-IP).

## Batasan versi ini (v0.1)

- Kode pendek selalu auto-generate (belum ada custom alias).
- Tidak ada halaman riwayat/daftar link yang pernah dibuat.
- Tidak ada autentikasi — siapa pun yang punya akses ke URL bisa membuat short link.
- Klik dihitung (`clicks:{code}` di KV) tapi belum ditampilkan di UI.
- Rate limit berbasis IP saja — bisa dilewati dengan ganti IP/VPN. Cukup untuk mencegah spam kasual, bukan proteksi tingkat produksi.

Semua poin di atas adalah kandidat untuk fase upscale berikutnya.
