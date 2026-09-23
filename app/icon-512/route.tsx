import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111214", borderRadius: 112 }}>
      <div style={{ width: 256, height: 256, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 72, background: "#007aff", color: "white", fontSize: 196, fontWeight: 800 }}>S</div>
    </div>,
    { width: 512, height: 512 }
  );
}
