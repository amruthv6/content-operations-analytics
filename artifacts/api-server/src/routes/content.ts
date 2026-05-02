import { Router } from "express";
import { db } from "@workspace/db";
import { contentTable } from "@workspace/db";
import { eq, ilike, and, sql, desc, asc } from "drizzle-orm";
import {
  ListContentQueryParams,
  CreateContentBody,
  UpdateContentBody,
  UpdateContentMetricsBody,
  GetContentParams,
  UpdateContentParams,
  DeleteContentParams,
  UpdateContentMetricsParams,
} from "@workspace/api-zod";

const router = Router();

function toContentItem(row: typeof contentTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    status: row.status,
    category: row.category ?? undefined,
    tags: row.tags ?? [],
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    scheduledAt: row.scheduledAt?.toISOString() ?? undefined,
    publishedAt: row.publishedAt?.toISOString() ?? undefined,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    watchTimeSeconds: row.watchTimeSeconds,
    retentionRate: row.retentionRate,
    engagementRate: row.engagementRate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const query = ListContentQueryParams.parse(req.query);
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  const conditions = [];
  if (query.status) conditions.push(eq(contentTable.status, query.status as any));
  if (query.type) conditions.push(eq(contentTable.type, query.type as any));
  if (query.category) conditions.push(eq(contentTable.category, query.category));
  if (query.search) conditions.push(ilike(contentTable.title, `%${query.search}%`));
  if (query.tag) conditions.push(sql`${contentTable.tags} @> ARRAY[${query.tag}]::text[]`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ count }]] = await Promise.all([
    db
      .select()
      .from(contentTable)
      .where(where)
      .orderBy(desc(contentTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentTable)
      .where(where),
  ]);

  res.json({
    items: items.map(toContentItem),
    total: count,
    limit: Number(limit),
    offset: Number(offset),
  });
});

router.post("/", async (req, res) => {
  const body = CreateContentBody.parse(req.body);

  const [row] = await db
    .insert(contentTable)
    .values({
      title: body.title,
      description: body.description,
      type: body.type as any,
      status: (body.status ?? "draft") as any,
      category: body.category,
      tags: body.tags,
      thumbnailUrl: body.thumbnailUrl,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt as any) : undefined,
    })
    .returning();

  res.status(201).json(toContentItem(row));
});

router.get("/:id", async (req, res) => {
  const { id } = GetContentParams.parse({ id: Number(req.params.id) });
  const [row] = await db.select().from(contentTable).where(eq(contentTable.id, id));
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(toContentItem(row));
});

router.patch("/:id", async (req, res) => {
  const { id } = UpdateContentParams.parse({ id: Number(req.params.id) });
  const body = UpdateContentBody.parse(req.body);

  const updates: Partial<typeof contentTable.$inferInsert> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.type !== undefined) updates.type = body.type as any;
  if (body.status !== undefined) updates.status = body.status as any;
  if (body.category !== undefined) updates.category = body.category;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl;
  if (body.scheduledAt !== undefined)
    updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt as any) : null as any;
  if (body.publishedAt !== undefined)
    updates.publishedAt = body.publishedAt ? new Date(body.publishedAt as any) : null as any;
  updates.updatedAt = new Date();

  const [row] = await db
    .update(contentTable)
    .set(updates)
    .where(eq(contentTable.id, id))
    .returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(toContentItem(row));
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteContentParams.parse({ id: Number(req.params.id) });
  await db.delete(contentTable).where(eq(contentTable.id, id));
  res.status(204).send();
});

router.patch("/:id/metrics", async (req, res) => {
  const { id } = UpdateContentMetricsParams.parse({ id: Number(req.params.id) });
  const body = UpdateContentMetricsBody.parse(req.body);

  const updates: Partial<typeof contentTable.$inferInsert> = { updatedAt: new Date() };
  if (body.views !== undefined) updates.views = body.views;
  if (body.likes !== undefined) updates.likes = body.likes;
  if (body.comments !== undefined) updates.comments = body.comments;
  if (body.shares !== undefined) updates.shares = body.shares;
  if (body.watchTimeSeconds !== undefined) updates.watchTimeSeconds = body.watchTimeSeconds;
  if (body.retentionRate !== undefined) updates.retentionRate = body.retentionRate;

  const totalInteractions =
    (body.likes ?? 0) + (body.comments ?? 0) + (body.shares ?? 0);
  const views = body.views ?? 0;
  if (views > 0) updates.engagementRate = (totalInteractions / views) * 100;

  const [row] = await db
    .update(contentTable)
    .set(updates)
    .where(eq(contentTable.id, id))
    .returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(toContentItem(row));
});

export default router;
