import { corsHeaders, jsonResponse, parseJson, emptyResponse } from "./_helpers.js";

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return emptyResponse();
  }

  try {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, title_fa, title_en, category_id, image_key, created_at, updated_at FROM prompts ORDER BY created_at DESC"
      ).all();
      return jsonResponse(200, { items: results || [] });
    }

    const payload = await parseJson(request);

    if (request.method === "POST") {
      if (!payload.title_fa || !payload.title_en || !payload.image_key) {
        return jsonResponse(400, { error: "title_fa، title_en و image_key الزامی است." });
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const categoryId = payload.category_id || null;

      await env.DB.prepare(
        "INSERT INTO prompts (id, title_fa, title_en, category_id, image_key, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(id, payload.title_fa.trim(), payload.title_en.trim(), categoryId, payload.image_key, createdAt)
        .run();

      return jsonResponse(201, {
        item: {
          id,
          title_fa: payload.title_fa.trim(),
          title_en: payload.title_en.trim(),
          category_id: categoryId,
          image_key: payload.image_key,
          created_at: createdAt,
        },
      });
    }

    if (request.method === "PUT") {
      if (!payload.id || !payload.title_fa || !payload.title_en) {
        return jsonResponse(400, { error: "id، title_fa و title_en الزامی است." });
      }

      const updatedAt = new Date().toISOString();
      const categoryId = payload.category_id || null;
      const imageKey = payload.image_key || null;

      const result = await env.DB.prepare(
        "UPDATE prompts SET title_fa = ?, title_en = ?, category_id = ?, image_key = COALESCE(?, image_key), updated_at = ? WHERE id = ?"
      )
        .bind(payload.title_fa.trim(), payload.title_en.trim(), categoryId, imageKey, updatedAt, payload.id)
        .run();

      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse(404, { error: "پرامپت پیدا نشد." });
      }

      return jsonResponse(200, {
        item: {
          id: payload.id,
          title_fa: payload.title_fa.trim(),
          title_en: payload.title_en.trim(),
          category_id: categoryId,
          image_key: imageKey,
          updated_at: updatedAt,
        },
      });
    }

    if (request.method === "DELETE") {
      if (!payload.id) {
        return jsonResponse(400, { error: "id الزامی است." });
      }

      const result = await env.DB.prepare("DELETE FROM prompts WHERE id = ?")
        .bind(payload.id)
        .run();

      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse(404, { error: "پرامپت پیدا نشد." });
      }

      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: "روش پشتیبانی نمی‌شود." });
  } catch (error) {
    return jsonResponse(500, { error: "خطای سرور", details: error.message });
  }
}
