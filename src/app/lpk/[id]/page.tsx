"use client";

import HeaderHome from "@/app/components/homePage/headerHomepage";
import "aos/dist/aos.css";
import Footer from "@/app/components/homePage/footer";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLpkById } from "@/services/lpk";
import { Lpk } from "@/types/lpk"; 

// Cache stamp untuk bust caching jika logo diganti
const CACHE_STAMP = Date.now();

function buildLogoCandidates(raw: any): string[] {
  if (!raw) return [];
  let val = raw.logoRaw || raw.logo_lembaga || raw.logo_url || raw.logoUrl || raw.logo || null;
  if (!val) return [];
  val = String(val).trim();
  const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const out: string[] = [];
  const push = (u: string) => { if (u && !out.includes(u)) out.push(u); };
  const withCache = (u: string) => /[?&](v|cb|t)=/i.test(u) ? u : `${u}${u.includes('?') ? '&' : '?'}v=${CACHE_STAMP}`;
  if (/^https?:\/\//i.test(val)) {
    if (/\/lpk\/logo\//i.test(val) && !/\/storage\/lpk\/logo\//i.test(val)) {
      const alt = val.replace(/\/lpk\/logo\//i, '/storage/lpk/logo/');
      push(withCache(alt));
      push(withCache(val));
    } else {
      push(withCache(val));
    }
    return out;
  }
  let rel = val.replace(/^\//,'');
  if (/^lpk\/logo\//i.test(rel)) {
    push(withCache(`${base}/storage/${rel}`));
    push(withCache(`${base}/storage/lpk/logo/${rel.replace(/^lpk\/logo\//i,'')}`));
    push(withCache(`${base}/${rel}`));
    return out;
  }
  if (/^storage\/lpk\/logo\//i.test(rel)) { push(withCache(`${base}/${rel}`)); return out; }
  if (/^logos\//i.test(rel)) { push(withCache(`${base}/${rel}`)); push(withCache(`${base}/storage/${rel}`)); }
  else { push(withCache(`${base}/storage/logos/${rel}`)); }
  if (!/^storage\//i.test(rel)) push(withCache(`${base}/storage/${rel}`));
  push(withCache(`${base}/${rel}`));
  return out;
}
import DetailDescription from "@/app/components/homePage/detail-role/DetailDescription";
import DetailHeader from "@/app/components/homePage/detail-role/DetailHeader";
import BidangPelatihan from "@/app/components/homePage/listLpk/detail-lpk/BidangPelatihan";
import { Container } from "@/app/components/Container";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

export default function DetailLPKPage() {
  const { id } = useParams();
  const [lpk, setLpk] = useState<Lpk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const fetched = await getLpkById(id as string);
        if (fetched) {
          const candidates = buildLogoCandidates(fetched);
          (fetched as any)._logoCandidates = candidates;
          fetched.logoUrl = candidates[0] || fetched.logoUrl;
        }
        setLpk(fetched);
      } catch (error) {
        console.error("Gagal fetch data LPK:", error);
        setLpk(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <>
      <HeaderHome />
      <main>
        <FullPageLoader label="Memuat detail LPK" />
      </main>
      <Footer />
    </>
  );
  if (!lpk)
    return (
      <p className="text-center py-10">
        Data lembaga pelatihan tidak ditemukan
      </p>
    );

  return (
    <>
      <HeaderHome />
      <main>
        <Container className="py-6">
          <DetailHeader
            name={lpk.name}
            logo={lpk.logoUrl ?? "/assets/img/placeholder-logo.png"}
            _logoCandidates={(lpk as any)._logoCandidates}
          />
          <DetailDescription
            type="organisasi"
            title="Deskripsi Lembaga Pelatihan"
            description={lpk.deskripsi_lembaga ?? "-"}
            email={lpk.email ?? "-"}
            address={lpk.address ?? "-"}
          />
          <BidangPelatihan bidang_pelatihan={lpk.bidang_pelatihan ?? "-"} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
