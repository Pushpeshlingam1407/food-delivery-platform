import crypto from "crypto";
import pool from "../config/db.js";

export async function getCmsPage(req, res) {
  const { slug } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM cms_pages WHERE slug = ? AND is_published = TRUE",
      [slug],
    );
    const pages = rows;
    if (pages.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Page not found" });
    }

    return res.status(200).json({ status: "success", data: pages[0] });
  } catch (error) {
    console.error("Get CMS page error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createCmsPage(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const {
    slug,
    title,
    content,
    meta_title,
    meta_description,
    is_published = false,
  } = req.body;

  if (!slug || !title || !content) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required CMS fields" });
  }

  try {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO cms_pages (id, slug, title, content, meta_title, meta_description, is_published) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        title,
        content,
        meta_title || null,
        meta_description || null,
        is_published ? 1 : 0,
      ],
    );

    return res
      .status(201)
      .json({
        status: "success",
        message: "CMS page created successfully",
        data: { id, slug },
      });
  } catch (error) {
    console.error("Create CMS page error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateCmsPage(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { id } = req.params;
  const { slug, title, content, meta_title, meta_description, is_published } =
    req.body;

  try {
    const updates = [];
    const params = [];

    if (slug) {
      updates.push("slug = ?");
      params.push(slug);
    }
    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (content) {
      updates.push("content = ?");
      params.push(content);
    }
    if (meta_title !== undefined) {
      updates.push("meta_title = ?");
      params.push(meta_title);
    }
    if (meta_description !== undefined) {
      updates.push("meta_description = ?");
      params.push(meta_description);
    }
    if (is_published !== undefined) {
      updates.push("is_published = ?");
      params.push(is_published ? 1 : 0);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields to update" });
    }

    params.push(id);
    await pool.query(
      `UPDATE cms_pages SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    return res
      .status(200)
      .json({ status: "success", message: "CMS page updated successfully" });
  } catch (error) {
    console.error("Update CMS page error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteCmsPage(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { id } = req.params;

  try {
    await pool.query("DELETE FROM cms_pages WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ status: "success", message: "CMS page deleted successfully" });
  } catch (error) {
    console.error("Delete CMS page error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
