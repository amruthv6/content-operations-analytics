import { Router } from "express";
import { db } from "@workspace/db";
import { contentTable } from "@workspace/db";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import {
  GetMonthlyTrendsQueryParams,
  GetUploadConsistencyQueryParams,
  GetTopContentQueryParams,
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

router.get("/summary", async (req, res) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [totals] = await db
    .select({
      totalContent: sql<number>`count(*)::int`,
      publishedContent: sql<number>`count(*) filter (where status = 'published')::int`,
      scheduledContent: sql<number>`count(*) filter (where status = 'scheduled')::int`,
      draftContent: sql<number>`count(*) filter (where status = 'draft')::int`,
      totalViews: sql<number>`coalesce(sum(views), 0)::int`,
      totalLikes: sql<number>`coalesce(sum(likes), 0)::int`,
      totalComments: sql<number>`coalesce(sum(comments), 0)::int`,
      totalShares: sql<number>`coalesce(sum(shares), 0)::int`,
      avgRetentionRate: sql<number>`coalesce(avg(retention_rate), 0)::float`,
      avgEngagementRate: sql<number>`coalesce(avg(engagement_rate), 0)::float`,
      avgViewsPerContent: sql<number>`coalesce(avg(views), 0)::float`,
    })
    .from(contentTable);

  const [thisMonthStats] = await db
    .select({
      uploads: sql<number>`count(*)::int`,
      views: sql<number>`coalesce(sum(views), 0)::int`,
    })
    .from(contentTable)
    .where(gte(contentTable.createdAt, thisMonthStart));

  const [lastMonthStats] = await db
    .select({
      uploads: sql<number>`count(*)::int`,
      views: sql<number>`coalesce(sum(views), 0)::int`,
    })
    .from(contentTable)
    .where(and(gte(contentTable.createdAt, lastMonthStart), lte(contentTable.createdAt, lastMonthEnd)));

  res.json({
    totalContent: totals.totalContent,
    publishedContent: totals.publishedContent,
    scheduledContent: totals.scheduledContent,
    draftContent: totals.draftContent,
    totalViews: totals.totalViews,
    totalLikes: totals.totalLikes,
    totalComments: totals.totalComments,
    totalShares: totals.totalShares,
    avgRetentionRate: Number(totals.avgRetentionRate.toFixed(2)),
    avgEngagementRate: Number(totals.avgEngagementRate.toFixed(2)),
    avgViewsPerContent: Number(totals.avgViewsPerContent.toFixed(0)),
    uploadsThisMonth: thisMonthStats.uploads,
    uploadsLastMonth: lastMonthStats.uploads,
    viewsThisMonth: thisMonthStats.views,
    viewsLastMonth: lastMonthStats.views,
  });
});

router.get("/trends", async (req, res) => {
  const query = GetMonthlyTrendsQueryParams.parse(req.query);
  const months = Number(query.months ?? 6);

  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(date_trunc('month', created_at), 'Mon') as month,
      EXTRACT(YEAR FROM created_at)::int as year,
      TO_CHAR(date_trunc('month', created_at), 'Mon YYYY') as label,
      COALESCE(SUM(views), 0)::int as views,
      COALESCE(SUM(likes), 0)::int as likes,
      COALESCE(SUM(comments), 0)::int as comments,
      COALESCE(SUM(shares), 0)::int as shares,
      COUNT(*)::int as uploads,
      COALESCE(AVG(retention_rate), 0)::float as "avgRetentionRate",
      COALESCE(AVG(engagement_rate), 0)::float as "avgEngagementRate"
    FROM content
    WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '1 month' * ${months - 1}
    GROUP BY date_trunc('month', created_at)
    ORDER BY date_trunc('month', created_at) ASC
  `);

  res.json(
    (rows as any[]).map((r) => ({
      month: r.month,
      year: r.year,
      label: r.label,
      views: r.views,
      likes: r.likes,
      comments: r.comments,
      shares: r.shares,
      uploads: r.uploads,
      avgRetentionRate: Number(Number(r.avgRetentionRate).toFixed(2)),
      avgEngagementRate: Number(Number(r.avgEngagementRate).toFixed(2)),
    }))
  );
});

router.get("/categories", async (req, res) => {
  const rows = await db.execute(sql`
    SELECT
      COALESCE(category, 'Uncategorized') as category,
      COUNT(*)::int as "contentCount",
      COALESCE(SUM(views), 0)::int as "totalViews",
      COALESCE(SUM(likes), 0)::int as "totalLikes",
      COALESCE(SUM(comments), 0)::int as "totalComments",
      COALESCE(AVG(retention_rate), 0)::float as "avgRetentionRate",
      COALESCE(AVG(engagement_rate), 0)::float as "avgEngagementRate"
    FROM content
    GROUP BY COALESCE(category, 'Uncategorized')
    ORDER BY "totalViews" DESC
  `);

  res.json(
    (rows as any[]).map((r) => ({
      category: r.category,
      contentCount: r.contentCount,
      totalViews: r.totalViews,
      totalLikes: r.totalLikes,
      totalComments: r.totalComments,
      avgRetentionRate: Number(Number(r.avgRetentionRate).toFixed(2)),
      avgEngagementRate: Number(Number(r.avgEngagementRate).toFixed(2)),
    }))
  );
});

router.get("/consistency", async (req, res) => {
  const query = GetUploadConsistencyQueryParams.parse(req.query);
  const weeks = Number(query.weeks ?? 12);

  const rows = await db.execute(sql`
    WITH week_series AS (
      SELECT generate_series(
        date_trunc('week', NOW()) - INTERVAL '1 week' * ${weeks - 1},
        date_trunc('week', NOW()),
        INTERVAL '1 week'
      ) AS week_start
    ),
    uploads_per_week AS (
      SELECT
        date_trunc('week', created_at) AS week_start,
        COUNT(*)::int AS uploads_count
      FROM content
      WHERE created_at >= date_trunc('week', NOW()) - INTERVAL '1 week' * ${weeks - 1}
      GROUP BY date_trunc('week', created_at)
    )
    SELECT
      TO_CHAR(ws.week_start, 'Mon DD') AS "weekLabel",
      ws.week_start::text AS "weekStart",
      COALESCE(upw.uploads_count, 0)::int AS "uploadsCount",
      2::int AS "targetUploads",
      LEAST(COALESCE(upw.uploads_count, 0)::float / 2.0 * 100, 100)::float AS "consistencyScore"
    FROM week_series ws
    LEFT JOIN uploads_per_week upw ON ws.week_start = upw.week_start
    ORDER BY ws.week_start ASC
  `);

  res.json(
    (rows as any[]).map((r) => ({
      weekLabel: r.weekLabel,
      weekStart: r.weekStart,
      uploadsCount: r.uploadsCount,
      targetUploads: r.targetUploads,
      consistencyScore: Number(Number(r.consistencyScore).toFixed(1)),
    }))
  );
});

router.get("/top-content", async (req, res) => {
  const query = GetTopContentQueryParams.parse(req.query);
  const metric = (query.metric ?? "views") as string;
  const limit = Number(query.limit ?? 10);

  const orderCol =
    metric === "engagement"
      ? contentTable.engagementRate
      : metric === "retention"
      ? contentTable.retentionRate
      : contentTable.views;

  const rows = await db
    .select()
    .from(contentTable)
    .where(eq(contentTable.status, "published"))
    .orderBy(desc(orderCol))
    .limit(limit);

  res.json(rows.map(toContentItem));
});

export default router;
