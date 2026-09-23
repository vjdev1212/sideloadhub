import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111214", borderRadius: 38 }}>
      <div style={{ width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 26, background: "#007aff", color: "white", fontSize: 68, fontWeight: 800 }}>S</div>
    </div>,
    { width: 180, height: 180 }
  );
}
