const { randomUUID } = require("crypto");
const { readJson, writeJson } = require("./_data");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    if (event.httpMethod === "GET") {
      const prompts = await readJson("prompts", []);
      return jsonResponse(200, { items: prompts });
    }

    const payload = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === "POST") {
      if (!payload.title_fa || !payload.title_en || !payload.image_id) {
        return jsonResponse(400, { error: "title_fa، title_en و image_id الزامی است." });
      }

      const prompts = await readJson("prompts", []);
      const prompt = {
        id: randomUUID(),
        title_fa: payload.title_fa.trim(),
        title_en: payload.title_en.trim(),
        category_id: payload.category_id || null,
        image_id: payload.image_id,
        created_at: new Date().toISOString(),
      };

      prompts.push(prompt);
      await writeJson("prompts", prompts);
      return jsonResponse(201, { item: prompt });
    }

    if (event.httpMethod === "PUT") {
      if (!payload.id || !payload.title_fa || !payload.title_en) {
        return jsonResponse(400, { error: "id، title_fa و title_en الزامی است." });
      }

      const prompts = await readJson("prompts", []);
      const index = prompts.findIndex((item) => item.id === payload.id);
      if (index === -1) {
        return jsonResponse(404, { error: "پرامپت پیدا نشد." });
      }

      prompts[index] = {
        ...prompts[index],
        title_fa: payload.title_fa.trim(),
        title_en: payload.title_en.trim(),
        category_id: payload.category_id || null,
        image_id: payload.image_id || prompts[index].image_id,
        updated_at: new Date().toISOString(),
      };

      await writeJson("prompts", prompts);
      return jsonResponse(200, { item: prompts[index] });
    }

    if (event.httpMethod === "DELETE") {
      if (!payload.id) {
        return jsonResponse(400, { error: "id الزامی است." });
      }

      const prompts = await readJson("prompts", []);
      const next = prompts.filter((item) => item.id !== payload.id);
      if (next.length === prompts.length) {
        return jsonResponse(404, { error: "پرامپت پیدا نشد." });
      }

      await writeJson("prompts", next);
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  } catch (error) {
    return jsonResponse(500, { error: "خطای سرور", details: error.message });
  }
};
