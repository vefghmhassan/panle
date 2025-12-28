export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function emptyResponse(status = 204) {
  return new Response("", { status, headers: corsHeaders });
}
