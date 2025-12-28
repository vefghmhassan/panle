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
      const categories = await readJson("categories", []);
      return jsonResponse(200, { items: categories });
    }

    const payload = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === "POST") {
      if (!payload.name_fa || !payload.name_en) {
        return jsonResponse(400, { error: "name_fa و name_en الزامی است." });
      }

      const categories = await readJson("categories", []);
      const category = {
        id: randomUUID(),
        name_fa: payload.name_fa.trim(),
        name_en: payload.name_en.trim(),
        created_at: new Date().toISOString(),
      };

      categories.push(category);
      await writeJson("categories", categories);
      return jsonResponse(201, { item: category });
    }

    if (event.httpMethod === "PUT") {
      if (!payload.id || !payload.name_fa || !payload.name_en) {
        return jsonResponse(400, { error: "id، name_fa و name_en الزامی است." });
      }

      const categories = await readJson("categories", []);
      const index = categories.findIndex((item) => item.id === payload.id);
      if (index === -1) {
        return jsonResponse(404, { error: "دسته‌بندی پیدا نشد." });
      }

      categories[index] = {
        ...categories[index],
        name_fa: payload.name_fa.trim(),
        name_en: payload.name_en.trim(),
        updated_at: new Date().toISOString(),
      };

      await writeJson("categories", categories);
      return jsonResponse(200, { item: categories[index] });
    }

    if (event.httpMethod === "DELETE") {
      if (!payload.id) {
        return jsonResponse(400, { error: "id الزامی است." });
      }

      const categories = await readJson("categories", []);
      const next = categories.filter((item) => item.id !== payload.id);
      if (next.length === categories.length) {
        return jsonResponse(404, { error: "دسته‌بندی پیدا نشد." });
      }

      await writeJson("categories", next);
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  } catch (error) {
    return jsonResponse(500, { error: "خطای سرور", details: error.message });
  }
};
