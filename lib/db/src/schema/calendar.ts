import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const calendarEventTypeEnum = pgEnum("calendar_event_type", [
  "publish",
  "draft",
  "review",
  "idea",
  "milestone",
]);
export const calendarEventStatusEnum = pgEnum("calendar_event_status", [
  "pending",
  "completed",
  "cancelled",
]);

export const calendarTable = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id"),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  type: calendarEventTypeEnum("type").notNull(),
  status: calendarEventStatusEnum("status").notNull().default("pending"),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertCalendarSchema = createInsertSchema(calendarTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCalendarEvent = z.infer<typeof insertCalendarSchema>;
export type CalendarEvent = typeof calendarTable.$inferSelect;
