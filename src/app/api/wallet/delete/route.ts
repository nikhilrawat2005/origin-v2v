import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary server credentials are not configured." },
        { status: 500 }
      );
    }

    const deleteFromCloudinary = async (resourceType: "image" | "raw") => {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", publicId);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
        { method: "POST", body: formData }
      );
      return res.json();
    };

    // Try deleting as an image (PDFs and images default to image under auto upload)
    let data = await deleteFromCloudinary("image");

    // If it's a raw file (e.g. .docx, .txt), it won't be found as an image. Try raw deletion.
    if (data.result !== "ok") {
      const rawData = await deleteFromCloudinary("raw");
      if (rawData.result === "ok" || rawData.result === "not found") {
        data = rawData;
      }
    }

    if (data.result !== "ok" && data.result !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary delete failed: ${data.result}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result: data.result });
  } catch (err: any) {
    console.error("Wallet delete API error:", err);
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
