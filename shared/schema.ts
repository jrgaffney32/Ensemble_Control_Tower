import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export type UserRole = 'control_tower' | 'sto' | 'slt';

export const userRoles = pgTable("user_roles", {
  userId: varchar("user_id").primaryKey(),
  role: text("role").$type<UserRole>().notNull().default('slt'),
  valueStream: text("value_stream"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRoleRecord = typeof userRoles.$inferSelect;

export type StatusValue = 'green' | 'yellow' | 'red';

export const initiativeStatuses = pgTable("initiative_statuses", {
  initiativeId: varchar("initiative_id").primaryKey(),
  costStatus: text("cost_status").$type<StatusValue>().notNull().default('green'),
  benefitStatus: text("benefit_status").$type<StatusValue>().notNull().default('green'),
  timelineStatus: text("timeline_status").$type<StatusValue>().notNull().default('green'),
  scopeStatus: text("scope_status").$type<StatusValue>().notNull().default('green'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInitiativeStatusSchema = createInsertSchema(initiativeStatuses).omit({
  updatedAt: true,
});

export type InsertInitiativeStatus = z.infer<typeof insertInitiativeStatusSchema>;
export type InitiativeStatusRecord = typeof initiativeStatuses.$inferSelect;
