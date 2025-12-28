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

export type FormStatus = 'not_started' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'change_requested';

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
  rejectionReason: text("rejection_reason"),
  rejectedBy: varchar("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
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

export type ArtifactCategory = 'requirements' | 'design' | 'uat_results' | 'compliance' | 'sign_off' | 'evidence' | 'other';

export const gateFormArtifacts = pgTable("gate_form_artifacts", {
  id: varchar("id").primaryKey(),
  gateFormId: varchar("gate_form_id").notNull(),
  initiativeId: varchar("initiative_id").notNull(),
  gate: text("gate").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: text("category").$type<ArtifactCategory>().notNull().default('other'),
  uploadedBy: varchar("uploaded_by"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGateFormArtifactSchema = createInsertSchema(gateFormArtifacts).omit({
  createdAt: true,
});

export type InsertGateFormArtifact = z.infer<typeof insertGateFormArtifactSchema>;
export type GateFormArtifactRecord = typeof gateFormArtifacts.$inferSelect;

export const GATE_DEFINITIONS = {
  L0: {
    name: 'Problem Definition',
    description: 'Define the problem and initial scope',
    formFields: [
      { key: 'problemStatement', label: 'Problem Statement', type: 'textarea', required: true },
      { key: 'businessCase', label: 'Business Case', type: 'textarea', required: true },
      { key: 'targetBenefit', label: 'Target Benefit ($)', type: 'number', required: true },
      { key: 'estimatedEffort', label: 'Estimated Effort (weeks)', type: 'number', required: false },
    ],
    requiredArtifacts: [],
    optionalArtifacts: ['requirements'],
  },
  L1: {
    name: 'Feasibility & Compliance',
    description: 'Assess feasibility and compliance requirements',
    formFields: [
      { key: 'feasibilityAssessment', label: 'Feasibility Assessment', type: 'textarea', required: true },
      { key: 'complianceRequirements', label: 'Compliance Requirements', type: 'textarea', required: true },
      { key: 'riskAssessment', label: 'Risk Assessment', type: 'textarea', required: true },
      { key: 'resourceRequirements', label: 'Resource Requirements', type: 'textarea', required: false },
    ],
    requiredArtifacts: ['compliance'],
    optionalArtifacts: ['requirements'],
  },
  L2: {
    name: 'Design & Architecture',
    description: 'Complete design and architecture review',
    formFields: [
      { key: 'solutionDesign', label: 'Solution Design Summary', type: 'textarea', required: true },
      { key: 'technicalApproach', label: 'Technical Approach', type: 'textarea', required: true },
      { key: 'integrationPoints', label: 'Integration Points', type: 'textarea', required: true },
    ],
    requiredArtifacts: ['design', 'requirements'],
    optionalArtifacts: ['compliance'],
  },
  L3: {
    name: 'Build & Development',
    description: 'Development complete and ready for testing',
    formFields: [
      { key: 'developmentSummary', label: 'Development Summary', type: 'textarea', required: true },
      { key: 'testingPlan', label: 'Testing Plan', type: 'textarea', required: true },
      { key: 'knownIssues', label: 'Known Issues', type: 'textarea', required: false },
    ],
    requiredArtifacts: ['design'],
    optionalArtifacts: ['evidence'],
  },
  L4: {
    name: 'Validation & UAT',
    description: 'User acceptance testing and validation',
    formFields: [
      { key: 'uatSummary', label: 'UAT Summary', type: 'textarea', required: true },
      { key: 'defectsResolved', label: 'Defects Resolved', type: 'textarea', required: true },
      { key: 'userApproval', label: 'User Approval Status', type: 'select', required: true, options: ['Approved', 'Conditionally Approved', 'Pending'] },
    ],
    requiredArtifacts: ['uat_results'],
    optionalArtifacts: ['evidence', 'sign_off'],
  },
  L5: {
    name: 'Deployment & Go-Live',
    description: 'Production deployment and go-live',
    formFields: [
      { key: 'deploymentPlan', label: 'Deployment Plan', type: 'textarea', required: true },
      { key: 'rollbackPlan', label: 'Rollback Plan', type: 'textarea', required: true },
      { key: 'goLiveDate', label: 'Go-Live Date', type: 'date', required: true },
    ],
    requiredArtifacts: ['sign_off', 'uat_results'],
    optionalArtifacts: ['evidence'],
  },
  L6: {
    name: 'Benefit Realization',
    description: 'Measure and verify expected benefits',
    formFields: [
      { key: 'actualBenefit', label: 'Actual Benefit Realized ($)', type: 'number', required: true },
      { key: 'benefitAnalysis', label: 'Benefit Analysis', type: 'textarea', required: true },
      { key: 'lessonsLearned', label: 'Lessons Learned', type: 'textarea', required: false },
    ],
    requiredArtifacts: ['evidence'],
    optionalArtifacts: ['sign_off'],
  },
} as const;

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

// FTE Snapshots - tracks FTE allocation per initiative over time
export const fteSnapshots = pgTable("fte_snapshots", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  snapshotDate: timestamp("snapshot_date").notNull(),
  fteCommitted: real("fte_committed").notNull().default(0),
  fteActual: real("fte_actual").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFteSnapshotSchema = createInsertSchema(fteSnapshots).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertFteSnapshot = z.infer<typeof insertFteSnapshotSchema>;
export type FteSnapshotRecord = typeof fteSnapshots.$inferSelect;

// Initiative KPIs - tracks key performance indicators per initiative
export type KpiStatus = 'green' | 'yellow' | 'red' | 'offtrack';

export const initiativeKpis = pgTable("initiative_kpis", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  kpiKey: text("kpi_key").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  targetValue: real("target_value").notNull().default(0),
  actualValue: real("actual_value").notNull().default(0),
  status: text("status").$type<KpiStatus>().notNull().default('green'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInitiativeKpiSchema = createInsertSchema(initiativeKpis).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertInitiativeKpi = z.infer<typeof insertInitiativeKpiSchema>;
export type InitiativeKpiRecord = typeof initiativeKpis.$inferSelect;

// Pod Performance - tracks pod metrics per initiative
export const podPerformance = pgTable("pod_performance", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  podName: text("pod_name").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  velocity: real("velocity").notNull().default(0),
  qualityScore: real("quality_score").notNull().default(0),
  backlogHealth: real("backlog_health").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPodPerformanceSchema = createInsertSchema(podPerformance).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertPodPerformance = z.infer<typeof insertPodPerformanceSchema>;
export type PodPerformanceRecord = typeof podPerformance.$inferSelect;

// Inquiries - Control Tower sends inquiries to STO leaders
export type InquiryStatus = 'open' | 'pending' | 'closed';

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey(),
  initiativeId: varchar("initiative_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").$type<InquiryStatus>().notNull().default('open'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type InquiryRecord = typeof inquiries.$inferSelect;

// Inquiry Responses - STO leaders respond to inquiries
export const inquiryResponses = pgTable("inquiry_responses", {
  id: varchar("id").primaryKey(),
  inquiryId: varchar("inquiry_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInquiryResponseSchema = createInsertSchema(inquiryResponses).omit({
  createdAt: true,
});

export type InsertInquiryResponse = z.infer<typeof insertInquiryResponseSchema>;
export type InquiryResponseRecord = typeof inquiryResponses.$inferSelect;
