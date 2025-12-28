import { jsonResponse, parseJson, emptyResponse } from "./_helpers.js";

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { contentType: match[1], base64: match[2] };
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return emptyResponse();
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  }

  try {
    const payload = await parseJson(request);
    let contentType = payload.content_type || "";
    let base64 = payload.base64 || "";

    if (payload.data_url) {
      const parsed = parseDataUrl(payload.data_url);
      if (!parsed) {
        return jsonResponse(400, { error: "data_url نامعتبر است." });
      }
      contentType = parsed.contentType;
      base64 = parsed.base64;
    }

    if (!contentType || !base64) {
      return jsonResponse(400, { error: "content_type و داده تصویر الزامی است." });
    }

    const id = crypto.randomUUID();
    const bytes = base64ToBytes(base64);

    await env.IMAGES.put(id, bytes, {
      httpMetadata: { contentType },
      customMetadata: {
        filename: payload.filename || "",
        created_at: new Date().toISOString(),
      },
    });

    return jsonResponse(201, {
      id,
      url: `/api/image?id=${id}`,
    });
  } catch (error) {
    return jsonResponse(500, { error: "خطای سرور", details: error.message });
  }
}
