import { ImageResponse } from "next/og";

/** OG image par défaut (audit B6) — générée, zéro asset externe ; créas B7 la remplaceront. */

export const alt = "Ciné+ — Découvrez. Choisissez. Regardez.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #141118 0%, #241f2b 55%, #3a2d4d 100%)",
          color: "#f2eff5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 26,
              height: 84,
              borderRadius: 13,
              background: "#f5b83d",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 96, fontWeight: 700, display: "flex" }}>Ciné+</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 40, color: "#c9c3d1", display: "flex" }}>
          Découvrez. Choisissez. Regardez.
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#8f8999", display: "flex" }}>
          Des classiques à regarder gratuitement, légalement.
        </div>
      </div>
    ),
    size,
  );
}
