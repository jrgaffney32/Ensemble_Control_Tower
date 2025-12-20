import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real } from "drizzle-orm/pg-core";
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

export type PriorityCategory = 'Shipped' | 'Now' | 'Next' | 'Later' | 'New' | 'Kill' | 'Hold for clarification';

export const initiatives = pgTable("initiatives", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  valueStream: text("value_stream").notNull(),
  lGate: text("l_gate").notNull().default('L0'),
  priorityCategory: text("priority_category").$type<PriorityCategory>().notNull().default('New'),
  priorityRank: integer("priority_rank").notNull().default(999),
  budgetedCost: real("budgeted_cost").notNull().default(0),
  targetedBenefit: real("targeted_benefit").notNull().default(0),
  costCenter: text("cost_center").notNull().default(''),
  milestones: text("milestones").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInitiativeSchema = createInsertSchema(initiatives).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertInitiative = z.infer<typeof insertInitiativeSchema>;
export type InitiativeRecord = typeof initiatives.$inferSelect;

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'missed' | 'on_hold';

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").$type<MilestoneStatus>().notNull().default('not_started'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type MilestoneRecord = typeof milestones.$inferSelect;

export type CapabilityStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'change_requested';
export type CapabilityHealthStatus = 'green' | 'yellow' | 'red';

export const capabilities = pgTable("capabilities", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  healthStatus: text("health_status").$type<CapabilityHealthStatus>().notNull().default('green'),
  approvalStatus: text("approval_status").$type<CapabilityStatus>().notNull().default('draft'),
  estimatedEffort: integer("estimated_effort").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCapabilitySchema = createInsertSchema(capabilities).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertCapability = z.infer<typeof insertCapabilitySchema>;
export type CapabilityRecord = typeof capabilities.$inferSelect;

export type RequestType = 'budget' | 'capacity' | 'resource' | 'timeline';
export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'change_requested';

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  type: text("type").$type<RequestType>().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  requestedAmount: real("requested_amount"),
  justification: text("justification"),
  status: text("status").$type<RequestStatus>().notNull().default('draft'),
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type RequestRecord = typeof requests.$inferSelect;

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_review' | 'resolved' | 'escalated' | 'closed';

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").$type<IssueSeverity>().notNull().default('medium'),
  status: text("status").$type<IssueStatus>().notNull().default('open'),
  reportedBy: varchar("reported_by"),
  reportedAt: timestamp("reported_at"),
  assignedTo: varchar("assigned_to"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type IssueRecord = typeof issues.$inferSelect;
