import type { Metadata } from "next";
import { UploadForm } from "@/components/studio/UploadForm";
import { isAuthConfigured } from "@/lib/auth/config";
import { isR2Configured } from "@/lib/storage/r2";

export const metadata: Metadata = { title: "Ingestion" };
export const dynamic = "force-dynamic";

/**
 * Ingestion admin (D8/D36) — même pipeline que le Studio (upload présigné →
 * encodage → modération), mais accessible aux admins quel que soit l'état de
 * l'interrupteur UGC (D11). Sans quota.
 */
export default function AdminIngestionPage() {
  const r2 = isR2Configured();

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Ingestion vidéo</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Téléversez un film ou une vidéo dans le catalogue (D8) : encodage HLS multi-qualités
        automatique, puis passage en modération avant publication. L&apos;interrupteur UGC ne
        s&apos;applique pas aux administrateurs (D11), et les admins n&apos;ont pas de quota.
      </p>

      {r2 ? (
        <div className="mt-6 max-w-2xl rounded-(--radius-l) bg-surface-raised p-6">
          <UploadForm authEnabled={isAuthConfigured()} />
        </div>
      ) : (
        <div className="mt-6 max-w-2xl rounded-(--radius-l) bg-surface-raised p-6 text-sm leading-relaxed text-secondary">
          Le stockage vidéo n&apos;est pas encore raccordé : renseignez les variables
          <code className="mx-1 rounded bg-surface-overlay px-1.5 py-0.5 text-xs">R2_*</code>
          (voir <code className="rounded bg-surface-overlay px-1.5 py-0.5 text-xs">.env.example</code> et la doc du Lot 3),
          puis rechargez cette page.
        </div>
      )}
    </>
  );
}
