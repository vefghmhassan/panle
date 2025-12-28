const { createStore, wrapBlobError } = require("./_store");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS_HEADERS, body: "" };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, headers: CORS_HEADERS, body: "missing id" };
  }

  try {
    const store = createStore("panel-images");
    const entry = await store.get(id, { type: "json" });

    if (!entry) {
      return { statusCode: 404, headers: CORS_HEADERS, body: "not found" };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": entry.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
        ...CORS_HEADERS,
      },
      body: entry.base64,
      isBase64Encoded: true,
    };
  } catch (error) {
    const safeError = wrapBlobError(error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: safeError.message,
    };
  }
};
