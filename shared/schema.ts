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

export type FormStatus = 'not_started' | 'draft' | 'submitted' | 'approved' | 'change_requested';

export const gateForms = pgTable("gate_forms", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  gate: text("gate").notNull(),
  status: text("status").$type<FormStatus>().notNull().default('not_started'),
  formData: text("form_data"),
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  changeRequestReason: text("change_request_reason"),
  changeRequestedBy: varchar("change_requested_by"),
  changeRequestedAt: timestamp("change_requested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGateFormSchema = createInsertSchema(gateForms).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertGateForm = z.infer<typeof insertGateFormSchema>;
export type GateFormRecord = typeof gateForms.$inferSelect;
