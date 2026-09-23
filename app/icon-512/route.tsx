import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111214", borderRadius: 112 }}>
      <div style={{ width: 256, height: 256, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 32, background: "#007aff", color: "white" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M20 28h24M20 36h24M28 20v24M36 20v24" stroke="white" strokeWidth="6" strokeLinecap="round"/>
          <path d="M16 48 24 40M48 16 40 24" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>
    </div>,
    { width: 512, height: 512 }
  );
}
