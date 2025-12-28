import { emptyResponse } from "./_helpers.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return emptyResponse();
  }

  if (request.method !== "GET") {
    return new Response("", { status: 405, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("missing id", { status: 400, headers: corsHeaders });
  }

  try {
    const object = await env.IMAGES.get(id);
    if (!object) {
      return new Response("not found", { status: 404, headers: corsHeaders });
    }

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000");

    return new Response(object.body, { status: 200, headers });
  } catch (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
}
