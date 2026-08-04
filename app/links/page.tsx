import { getAllLinks, MAX_LISTED_LINKS } from "@/lib/kv";

export const dynamic = "force-dynamic";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function truncate(value: string, max = 60) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default async function LinksPage() {
  const links = await getAllLinks();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-wire" />
              <span className="font-mono text-xs tracking-[0.2em] text-ink/60 uppercase">
                Splice · Riwayat
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-semibold">
              Semua tautan yang pernah dibuat
            </h1>
          </div>
          <a
            href="/"
            className="font-mono text-sm font-medium bg-ink text-paper rounded-lg px-4 py-2 hover:bg-wire transition-colors whitespace-nowrap"
          >
            + Buat baru
          </a>
        </div>

        <p className="font-mono text-xs text-ink/40 mb-6">
          Menampilkan {links.length} link terbaru (maks {MAX_LISTED_LINKS}).
          Daftar ini publik — siapa pun yang membuka halaman ini bisa melihat
          semua link, bukan hanya milik Anda.
        </p>

        {links.length === 0 ? (
          <div className="border-2 border-dashed border-ink/15 rounded-lg px-6 py-12 text-center">
            <p className="font-mono text-sm text-ink/40">
              Belum ada link yang dibuat.
            </p>
          </div>
        ) : (
          <div className="border-2 border-ink/10 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-ink/5 border-b border-ink/10">
                  <th className="font-mono text-xs font-medium text-ink/50 uppercase tracking-wide px-4 py-3">
                    Kode
                  </th>
                  <th className="font-mono text-xs font-medium text-ink/50 uppercase tracking-wide px-4 py-3">
                    Tujuan
                  </th>
                  <th className="font-mono text-xs font-medium text-ink/50 uppercase tracking-wide px-4 py-3 text-right">
                    Klik
                  </th>
                  <th className="font-mono text-xs font-medium text-ink/50 uppercase tracking-wide px-4 py-3 text-right">
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr
                    key={link.code}
                    className="border-b border-ink/5 last:border-0 hover:bg-wireLight/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-medium text-wire hover:underline"
                      >
                        /{link.code}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.target}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-ink/60 hover:text-ink"
                        title={link.target}
                      >
                        {truncate(link.target)}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink/60">
                      {link.clicks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink/40 whitespace-nowrap">
                      {formatDate(link.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
