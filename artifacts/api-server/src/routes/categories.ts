import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, contentTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      color: categoriesTable.color,
      createdAt: categoriesTable.createdAt,
      contentCount: sql<number>`(
        SELECT COUNT(*)::int FROM content
        WHERE content.category = ${categoriesTable.name}
      )`,
    })
    .from(categoriesTable)
    .orderBy(categoriesTable.name);

  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color ?? undefined,
      contentCount: r.contentCount,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const body = CreateCategoryBody.parse(req.body);
  const [row] = await db
    .insert(categoriesTable)
    .values({ name: body.name, color: body.color })
    .returning();
  res.status(201).json({
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    contentCount: 0,
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteCategoryParams.parse({ id: Number(req.params.id) });
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).send();
});

export default router;
