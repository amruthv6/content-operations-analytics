import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentTypeEnum = pgEnum("content_type", [
  "video",
  "post",
  "reel",
  "story",
  "short",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
]);

export const contentTable = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: contentTypeEnum("type").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  category: text("category"),
  tags: text("tags").array(),
  thumbnailUrl: text("thumbnail_url"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  watchTimeSeconds: integer("watch_time_seconds").default(0).notNull(),
  retentionRate: real("retention_rate").default(0).notNull(),
  engagementRate: real("engagement_rate").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
