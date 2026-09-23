import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111214", borderRadius: 40 }}>
      <div style={{ width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 28, background: "#007aff", color: "white", fontSize: 76, fontWeight: 800 }}>S</div>
    </div>,
    { width: 192, height: 192 }
  );
}
