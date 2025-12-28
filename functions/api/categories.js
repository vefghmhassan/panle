import { corsHeaders, jsonResponse, parseJson, emptyResponse } from "./_helpers.js";

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return emptyResponse();
  }

  try {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, name_fa, name_en, created_at, updated_at FROM categories ORDER BY created_at DESC"
      ).all();
      return jsonResponse(200, { items: results || [] });
    }

    const payload = await parseJson(request);

    if (request.method === "POST") {
      if (!payload.name_fa || !payload.name_en) {
        return jsonResponse(400, { error: "name_fa و name_en الزامی است." });
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO categories (id, name_fa, name_en, created_at) VALUES (?, ?, ?, ?)"
      )
        .bind(id, payload.name_fa.trim(), payload.name_en.trim(), createdAt)
        .run();

      return jsonResponse(201, {
        item: { id, name_fa: payload.name_fa.trim(), name_en: payload.name_en.trim(), created_at: createdAt },
      });
    }

    if (request.method === "PUT") {
      if (!payload.id || !payload.name_fa || !payload.name_en) {
        return jsonResponse(400, { error: "id، name_fa و name_en الزامی است." });
      }

      const updatedAt = new Date().toISOString();
      const result = await env.DB.prepare(
        "UPDATE categories SET name_fa = ?, name_en = ?, updated_at = ? WHERE id = ?"
      )
        .bind(payload.name_fa.trim(), payload.name_en.trim(), updatedAt, payload.id)
        .run();

      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse(404, { error: "دسته‌بندی پیدا نشد." });
      }

      return jsonResponse(200, {
        item: { id: payload.id, name_fa: payload.name_fa.trim(), name_en: payload.name_en.trim(), updated_at: updatedAt },
      });
    }

    if (request.method === "DELETE") {
      if (!payload.id) {
        return jsonResponse(400, { error: "id الزامی است." });
      }

      const result = await env.DB.prepare("DELETE FROM categories WHERE id = ?")
        .bind(payload.id)
        .run();

      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse(404, { error: "دسته‌بندی پیدا نشد." });
      }

      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  } catch (error) {
    return jsonResponse(500, { error: "خطای سرور", details: error.message });
  }
}
