import { Router } from "express";
import { db } from "@workspace/db";
import { calendarTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  ListCalendarEventsQueryParams,
  CreateCalendarEventBody,
  UpdateCalendarEventBody,
  UpdateCalendarEventParams,
  DeleteCalendarEventParams,
} from "@workspace/api-zod";

const router = Router();

function toCalendarEvent(row: typeof calendarTable.$inferSelect) {
  return {
    id: row.id,
    contentId: row.contentId ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date.toISOString(),
    type: row.type,
    status: row.status,
    color: row.color ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const query = ListCalendarEventsQueryParams.parse(req.query);
  const conditions = [];

  if (query.startDate) conditions.push(gte(calendarTable.date, new Date(query.startDate)));
  if (query.endDate) conditions.push(lte(calendarTable.date, new Date(query.endDate)));

  if (query.month !== undefined && query.year !== undefined) {
    const month = Number(query.month);
    const year = Number(query.year);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    conditions.push(gte(calendarTable.date, start));
    conditions.push(lte(calendarTable.date, end));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db.select().from(calendarTable).where(where).orderBy(calendarTable.date);
  res.json(rows.map(toCalendarEvent));
});

router.post("/", async (req, res) => {
  const body = CreateCalendarEventBody.parse(req.body);
  const [row] = await db
    .insert(calendarTable)
    .values({
      contentId: body.contentId,
      title: body.title,
      description: body.description,
      date: new Date(body.date as any),
      type: body.type as any,
      status: (body.status ?? "pending") as any,
      color: body.color,
    })
    .returning();
  res.status(201).json(toCalendarEvent(row));
});

router.patch("/:id", async (req, res) => {
  const { id } = UpdateCalendarEventParams.parse({ id: Number(req.params.id) });
  const body = UpdateCalendarEventBody.parse(req.body);

  const updates: Partial<typeof calendarTable.$inferInsert> = {};
  if (body.contentId !== undefined) updates.contentId = body.contentId;
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.date !== undefined) updates.date = new Date(body.date as any);
  if (body.type !== undefined) updates.type = body.type as any;
  if (body.status !== undefined) updates.status = body.status as any;
  if (body.color !== undefined) updates.color = body.color;

  const [row] = await db
    .update(calendarTable)
    .set(updates)
    .where(eq(calendarTable.id, id))
    .returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(toCalendarEvent(row));
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteCalendarEventParams.parse({ id: Number(req.params.id) });
  await db.delete(calendarTable).where(eq(calendarTable.id, id));
  res.status(204).send();
});

export default router;
