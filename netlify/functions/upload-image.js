const { randomUUID } = require("crypto");
const { createStore, wrapBlobError } = require("./_store");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { contentType: match[1], base64: match[2] };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
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

    const store = createStore("panel-images");
    const id = randomUUID();

    await store.set(id, {
      contentType,
      base64,
      filename: payload.filename || null,
      created_at: new Date().toISOString(),
    });

    return jsonResponse(201, {
      id,
      url: `/.netlify/functions/image?id=${id}`,
    });
  } catch (error) {
    const safeError = wrapBlobError(error);
    return jsonResponse(500, { error: "خطای سرور", details: safeError.message });
  }
};
