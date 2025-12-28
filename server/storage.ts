import { userRoles, initiativeStatuses, gateForms, gateFormArtifacts, users, initiatives, milestones, capabilities, requests, issues, fteSnapshots, initiativeKpis, podPerformance, inquiries, inquiryResponses, type UserRole, type UserRoleRecord, type InitiativeStatusRecord, type StatusValue, type GateFormRecord, type FormStatus, type User, type AppUserRole, type UserStatus, type InitiativeRecord, type InsertInitiative, type MilestoneRecord, type InsertMilestone, type CapabilityRecord, type InsertCapability, type CapabilityStatus, type RequestRecord, type InsertRequest, type RequestStatus, type IssueRecord, type InsertIssue, type IssueStatus, type FteSnapshotRecord, type InsertFteSnapshot, type InitiativeKpiRecord, type InsertInitiativeKpi, type PodPerformanceRecord, type InsertPodPerformance, type InquiryRecord, type InsertInquiry, type InquiryStatus, type InquiryResponseRecord, type InsertInquiryResponse, type GateFormArtifactRecord, type InsertGateFormArtifact } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, isNull } from "drizzle-orm";

export interface IStorage {
  getUserRole(userId: string): Promise<UserRoleRecord | undefined>;
  upsertUserRole(data: { userId: string; role: UserRole; valueStream: string | null }): Promise<UserRoleRecord>;
  getAllUserRoles(): Promise<UserRoleRecord[]>;
  countUserRoles(): Promise<number>;
  getInitiativeStatus(initiativeId: string): Promise<InitiativeStatusRecord | undefined>;
  upsertInitiativeStatus(data: { initiativeId: string; costStatus: StatusValue; benefitStatus: StatusValue; timelineStatus: StatusValue; scopeStatus: StatusValue }): Promise<InitiativeStatusRecord>;
  getGateForm(initiativeId: string, gate: string): Promise<GateFormRecord | undefined>;
  getGateFormsForInitiative(initiativeId: string): Promise<GateFormRecord[]>;
  upsertGateForm(data: { id: string; initiativeId: string; gate: string; status: FormStatus; formData?: string; submittedBy?: string; submittedAt?: Date; approvedBy?: string; approvedAt?: Date; changeRequestReason?: string; changeRequestedBy?: string; changeRequestedAt?: Date }): Promise<GateFormRecord>;
  
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(data: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: AppUserRole): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  countUsers(): Promise<number>;
  
  getAllInitiatives(): Promise<InitiativeRecord[]>;
  getInitiative(id: string): Promise<InitiativeRecord | undefined>;
  createInitiative(data: InsertInitiative): Promise<InitiativeRecord>;
  upsertInitiative(data: InsertInitiative): Promise<InitiativeRecord>;
  updateInitiative(id: string, data: Partial<InsertInitiative>): Promise<InitiativeRecord | undefined>;
  deleteInitiative(id: string): Promise<boolean>;
  bulkUpdateInitiatives(updates: { id: string; data: Partial<InsertInitiative> }[]): Promise<void>;
  seedInitiatives(data: InsertInitiative[]): Promise<void>;
  
  getAllMilestones(): Promise<MilestoneRecord[]>;
  getMilestonesByInitiative(initiativeId: string): Promise<MilestoneRecord[]>;
  getMilestone(id: string): Promise<MilestoneRecord | undefined>;
  createMilestone(data: InsertMilestone): Promise<MilestoneRecord>;
  updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<MilestoneRecord | undefined>;
  deleteMilestone(id: string): Promise<boolean>;
  seedMilestones(data: InsertMilestone[]): Promise<void>;
  
  getAllCapabilities(): Promise<CapabilityRecord[]>;
  getCapabilitiesByInitiative(initiativeId: string): Promise<CapabilityRecord[]>;
  getCapability(id: string): Promise<CapabilityRecord | undefined>;
  createCapability(data: InsertCapability): Promise<CapabilityRecord>;
  updateCapability(id: string, data: Partial<InsertCapability>): Promise<CapabilityRecord | undefined>;
  deleteCapability(id: string): Promise<boolean>;
  approveCapability(id: string, approvedBy: string): Promise<CapabilityRecord | undefined>;
  rejectCapability(id: string, rejectionReason: string): Promise<CapabilityRecord | undefined>;
  getPendingCapabilities(): Promise<CapabilityRecord[]>;
  seedCapabilities(data: InsertCapability[]): Promise<void>;
  clearAllData(): Promise<void>;
  
  getAllRequests(): Promise<RequestRecord[]>;
  getRequest(id: string): Promise<RequestRecord | undefined>;
  createRequest(data: InsertRequest): Promise<RequestRecord>;
  updateRequest(id: string, data: Partial<InsertRequest>): Promise<RequestRecord | undefined>;
  deleteRequest(id: string): Promise<boolean>;
  getPendingRequests(): Promise<RequestRecord[]>;
  approveRequest(id: string, approvedBy: string): Promise<RequestRecord | undefined>;
  rejectRequest(id: string, rejectionReason: string): Promise<RequestRecord | undefined>;
  
  getAllIssues(): Promise<IssueRecord[]>;
  getIssue(id: string): Promise<IssueRecord | undefined>;
  createIssue(data: InsertIssue): Promise<IssueRecord>;
  updateIssue(id: string, data: Partial<InsertIssue>): Promise<IssueRecord | undefined>;
  deleteIssue(id: string): Promise<boolean>;
  getOpenIssues(): Promise<IssueRecord[]>;
  resolveIssue(id: string, resolvedBy: string, resolution: string): Promise<IssueRecord | undefined>;
  
  getPendingGateForms(): Promise<GateFormRecord[]>;
  approveGateForm(id: string, approvedBy: string): Promise<GateFormRecord | undefined>;
  rejectGateForm(id: string, reason: string, rejectedBy: string): Promise<GateFormRecord | undefined>;
  
  bulkUpsertFteSnapshots(data: InsertFteSnapshot[]): Promise<number>;
  bulkUpsertKpis(data: InsertInitiativeKpi[]): Promise<number>;
  bulkUpsertPodPerformance(data: InsertPodPerformance[]): Promise<number>;
  getFteSnapshotsByInitiative(initiativeId: string): Promise<FteSnapshotRecord[]>;
  getKpisByInitiative(initiativeId: string): Promise<InitiativeKpiRecord[]>;
  getPodPerformanceByInitiative(initiativeId: string): Promise<PodPerformanceRecord[]>;
  
  // Inquiries
  getAllInquiries(): Promise<InquiryRecord[]>;
  getOpenInquiries(): Promise<InquiryRecord[]>;
  getInquiry(id: string): Promise<InquiryRecord | undefined>;
  getInquiriesByInitiative(initiativeId: string): Promise<InquiryRecord[]>;
  createInquiry(data: InsertInquiry): Promise<InquiryRecord>;
  updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryRecord | undefined>;
  
  // Inquiry Responses
  getResponsesByInquiry(inquiryId: string): Promise<InquiryResponseRecord[]>;
  createInquiryResponse(data: InsertInquiryResponse): Promise<InquiryResponseRecord>;
  
  // Gate Form Artifacts
  getArtifactsByGateForm(gateFormId: string): Promise<GateFormArtifactRecord[]>;
  getArtifactsByInitiativeGate(initiativeId: string, gate: string): Promise<GateFormArtifactRecord[]>;
  createArtifact(data: InsertGateFormArtifact): Promise<GateFormArtifactRecord>;
  deleteArtifact(id: string): Promise<boolean>;
}

class DatabaseStorage implements IStorage {
  async getUserRole(userId: string): Promise<UserRoleRecord | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return role;
  }

  async upsertUserRole(data: { userId: string; role: UserRole; valueStream: string | null }): Promise<UserRoleRecord> {
    const [role] = await db
      .insert(userRoles)
      .values({
        userId: data.userId,
        role: data.role,
        valueStream: data.valueStream,
      })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: {
          role: data.role,
          valueStream: data.valueStream,
          updatedAt: new Date(),
        },
      })
      .returning();
    return role;
  }
  
  async getAllUserRoles(): Promise<UserRoleRecord[]> {
    return await db.select().from(userRoles);
  }
  
  async countUserRoles(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(userRoles);
    return Number(result[0]?.count || 0);
  }

  async getInitiativeStatus(initiativeId: string): Promise<InitiativeStatusRecord | undefined> {
    const [status] = await db.select().from(initiativeStatuses).where(eq(initiativeStatuses.initiativeId, initiativeId));
    return status;
  }

  async upsertInitiativeStatus(data: { initiativeId: string; costStatus: StatusValue; benefitStatus: StatusValue; timelineStatus: StatusValue; scopeStatus: StatusValue }): Promise<InitiativeStatusRecord> {
    const [status] = await db
      .insert(initiativeStatuses)
      .values({
        initiativeId: data.initiativeId,
        costStatus: data.costStatus,
        benefitStatus: data.benefitStatus,
        timelineStatus: data.timelineStatus,
        scopeStatus: data.scopeStatus,
      })
      .onConflictDoUpdate({
        target: initiativeStatuses.initiativeId,
        set: {
          costStatus: data.costStatus,
          benefitStatus: data.benefitStatus,
          timelineStatus: data.timelineStatus,
          scopeStatus: data.scopeStatus,
          updatedAt: new Date(),
        },
      })
      .returning();
    return status;
  }

  async getGateForm(initiativeId: string, gate: string): Promise<GateFormRecord | undefined> {
    const [form] = await db.select().from(gateForms).where(and(eq(gateForms.initiativeId, initiativeId), eq(gateForms.gate, gate)));
    return form;
  }

  async getGateFormsForInitiative(initiativeId: string): Promise<GateFormRecord[]> {
    return await db.select().from(gateForms).where(eq(gateForms.initiativeId, initiativeId));
  }

  async upsertGateForm(data: { id: string; initiativeId: string; gate: string; status: FormStatus; formData?: string; submittedBy?: string; submittedAt?: Date; approvedBy?: string; approvedAt?: Date; changeRequestReason?: string; changeRequestedBy?: string; changeRequestedAt?: Date }): Promise<GateFormRecord> {
    const [form] = await db
      .insert(gateForms)
      .values({
        id: data.id,
        initiativeId: data.initiativeId,
        gate: data.gate,
        status: data.status,
        formData: data.formData,
        submittedBy: data.submittedBy,
        submittedAt: data.submittedAt,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        changeRequestReason: data.changeRequestReason,
        changeRequestedBy: data.changeRequestedBy,
        changeRequestedAt: data.changeRequestedAt,
      })
      .onConflictDoUpdate({
        target: gateForms.id,
        set: {
          status: data.status,
          formData: data.formData,
          submittedBy: data.submittedBy,
          submittedAt: data.submittedAt,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt,
          changeRequestReason: data.changeRequestReason,
          changeRequestedBy: data.changeRequestedBy,
          changeRequestedAt: data.changeRequestedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return form;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(data: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        status: 'pending_role',
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, 'pending_role'));
  }

  async updateUserRole(userId: string, role: AppUserRole): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        role: role,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId)).returning();
    return result.length > 0;
  }

  async countUsers(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  }

  async getAllInitiatives(): Promise<InitiativeRecord[]> {
    return await db.select().from(initiatives);
  }

  async getInitiative(id: string): Promise<InitiativeRecord | undefined> {
    const [init] = await db.select().from(initiatives).where(eq(initiatives.id, id));
    return init;
  }

  async createInitiative(data: InsertInitiative): Promise<InitiativeRecord> {
    const [init] = await db
      .insert(initiatives)
      .values(data)
      .returning();
    return init;
  }

  async upsertInitiative(data: InsertInitiative): Promise<InitiativeRecord> {
    const [init] = await db
      .insert(initiatives)
      .values(data)
      .onConflictDoUpdate({
        target: initiatives.id,
        set: {
          name: data.name,
          valueStream: data.valueStream,
          lGate: data.lGate,
          priorityCategory: data.priorityCategory,
          priorityRank: data.priorityRank,
          budgetedCost: data.budgetedCost,
          targetedBenefit: data.targetedBenefit,
          costCenter: data.costCenter,
          milestones: data.milestones,
          updatedAt: new Date(),
        },
      })
      .returning();
    return init;
  }

  async deleteInitiative(id: string): Promise<boolean> {
    await db.delete(capabilities).where(eq(capabilities.initiativeId, id));
    await db.delete(milestones).where(eq(milestones.initiativeId, id));
    await db.delete(initiativeStatuses).where(eq(initiativeStatuses.initiativeId, id));
    await db.delete(gateForms).where(eq(gateForms.initiativeId, id));
    const result = await db.delete(initiatives).where(eq(initiatives.id, id)).returning();
    return result.length > 0;
  }

  async updateInitiative(id: string, data: Partial<InsertInitiative>): Promise<InitiativeRecord | undefined> {
    const [init] = await db
      .update(initiatives)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(initiatives.id, id))
      .returning();
    return init;
  }

  async bulkUpdateInitiatives(updates: { id: string; data: Partial<InsertInitiative> }[]): Promise<void> {
    for (const update of updates) {
      await this.updateInitiative(update.id, update.data);
    }
  }

  async seedInitiatives(data: InsertInitiative[]): Promise<void> {
    for (const init of data) {
      await this.upsertInitiative(init);
    }
  }

  async getAllMilestones(): Promise<MilestoneRecord[]> {
    return await db.select().from(milestones);
  }

  async getMilestonesByInitiative(initiativeId: string): Promise<MilestoneRecord[]> {
    return await db.select().from(milestones).where(eq(milestones.initiativeId, initiativeId));
  }

  async getMilestone(id: string): Promise<MilestoneRecord | undefined> {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone;
  }

  async createMilestone(data: InsertMilestone): Promise<MilestoneRecord> {
    const [milestone] = await db
      .insert(milestones)
      .values(data)
      .returning();
    return milestone;
  }

  async updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<MilestoneRecord | undefined> {
    const [milestone] = await db
      .update(milestones)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, id))
      .returning();
    return milestone;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const result = await db.delete(milestones).where(eq(milestones.id, id));
    return true;
  }

  async seedMilestones(data: InsertMilestone[]): Promise<void> {
    for (const m of data) {
      await db
        .insert(milestones)
        .values(m)
        .onConflictDoUpdate({
          target: milestones.id,
          set: {
            name: m.name,
            startDate: m.startDate,
            endDate: m.endDate,
            status: m.status,
            notes: m.notes,
            updatedAt: new Date(),
          },
        });
    }
  }

  async getAllCapabilities(): Promise<CapabilityRecord[]> {
    return await db.select().from(capabilities);
  }

  async getCapabilitiesByInitiative(initiativeId: string): Promise<CapabilityRecord[]> {
    return await db.select().from(capabilities).where(eq(capabilities.initiativeId, initiativeId));
  }

  async getCapability(id: string): Promise<CapabilityRecord | undefined> {
    const [cap] = await db.select().from(capabilities).where(eq(capabilities.id, id));
    return cap;
  }

  async createCapability(data: InsertCapability): Promise<CapabilityRecord> {
    const [cap] = await db
      .insert(capabilities)
      .values(data)
      .returning();
    return cap;
  }

  async updateCapability(id: string, data: Partial<InsertCapability>): Promise<CapabilityRecord | undefined> {
    const [cap] = await db
      .update(capabilities)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(capabilities.id, id))
      .returning();
    return cap;
  }

  async deleteCapability(id: string): Promise<boolean> {
    await db.delete(capabilities).where(eq(capabilities.id, id));
    return true;
  }

  async approveCapability(id: string, approvedBy: string): Promise<CapabilityRecord | undefined> {
    const [cap] = await db
      .update(capabilities)
      .set({
        approvalStatus: 'approved' as CapabilityStatus,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(capabilities.id, id))
      .returning();
    return cap;
  }

  async rejectCapability(id: string, rejectionReason: string): Promise<CapabilityRecord | undefined> {
    const [cap] = await db
      .update(capabilities)
      .set({
        approvalStatus: 'rejected' as CapabilityStatus,
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(capabilities.id, id))
      .returning();
    return cap;
  }

  async getPendingCapabilities(): Promise<CapabilityRecord[]> {
    return await db.select().from(capabilities).where(eq(capabilities.approvalStatus, 'submitted'));
  }

  async seedCapabilities(data: InsertCapability[]): Promise<void> {
    for (const cap of data) {
      await db
        .insert(capabilities)
        .values(cap)
        .onConflictDoUpdate({
          target: capabilities.id,
          set: {
            initiativeId: cap.initiativeId,
            name: cap.name,
            description: cap.description,
            healthStatus: cap.healthStatus,
            approvalStatus: cap.approvalStatus,
            estimatedEffort: cap.estimatedEffort,
            startDate: cap.startDate,
            endDate: cap.endDate,
            updatedAt: sql`NOW()`,
          },
        });
    }
  }

  async clearAllData(): Promise<void> {
    await db.delete(inquiryResponses);
    await db.delete(inquiries);
    await db.delete(issues);
    await db.delete(requests);
    await db.delete(capabilities);
    await db.delete(milestones);
    await db.delete(fteSnapshots);
    await db.delete(initiativeKpis);
    await db.delete(podPerformance);
    await db.delete(gateForms);
    await db.delete(initiativeStatuses);
    await db.delete(initiatives);
  }

  async requestCapabilityChanges(id: string, changeReason: string): Promise<CapabilityRecord | undefined> {
    const [cap] = await db
      .update(capabilities)
      .set({
        approvalStatus: 'change_requested' as CapabilityStatus,
        rejectionReason: changeReason,
        updatedAt: new Date(),
      })
      .where(eq(capabilities.id, id))
      .returning();
    return cap;
  }

  async resubmitCapability(id: string, submittedBy: string): Promise<CapabilityRecord | undefined> {
    const [cap] = await db
      .update(capabilities)
      .set({
        approvalStatus: 'submitted' as CapabilityStatus,
        submittedBy,
        submittedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(capabilities.id, id))
      .returning();
    return cap;
  }

  async getAllRequests(): Promise<RequestRecord[]> {
    return await db.select().from(requests);
  }

  async getRequest(id: string): Promise<RequestRecord | undefined> {
    const [req] = await db.select().from(requests).where(eq(requests.id, id));
    return req;
  }

  async createRequest(data: InsertRequest): Promise<RequestRecord> {
    const [req] = await db.insert(requests).values(data).returning();
    return req;
  }

  async updateRequest(id: string, data: Partial<InsertRequest>): Promise<RequestRecord | undefined> {
    const [req] = await db
      .update(requests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(requests.id, id))
      .returning();
    return req;
  }

  async deleteRequest(id: string): Promise<boolean> {
    await db.delete(requests).where(eq(requests.id, id));
    return true;
  }

  async getPendingRequests(): Promise<RequestRecord[]> {
    return await db.select().from(requests).where(eq(requests.status, 'submitted'));
  }

  async approveRequest(id: string, approvedBy: string): Promise<RequestRecord | undefined> {
    const [req] = await db
      .update(requests)
      .set({
        status: 'approved' as RequestStatus,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return req;
  }

  async rejectRequest(id: string, rejectionReason: string): Promise<RequestRecord | undefined> {
    const [req] = await db
      .update(requests)
      .set({
        status: 'rejected' as RequestStatus,
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
    return req;
  }

  async getAllIssues(): Promise<IssueRecord[]> {
    return await db.select().from(issues);
  }

  async getIssue(id: string): Promise<IssueRecord | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async createIssue(data: InsertIssue): Promise<IssueRecord> {
    const [issue] = await db.insert(issues).values(data).returning();
    return issue;
  }

  async updateIssue(id: string, data: Partial<InsertIssue>): Promise<IssueRecord | undefined> {
    const [issue] = await db
      .update(issues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return issue;
  }

  async deleteIssue(id: string): Promise<boolean> {
    await db.delete(issues).where(eq(issues.id, id));
    return true;
  }

  async getOpenIssues(): Promise<IssueRecord[]> {
    return await db.select().from(issues).where(eq(issues.status, 'open'));
  }

  async resolveIssue(id: string, resolvedBy: string, resolution: string): Promise<IssueRecord | undefined> {
    const [issue] = await db
      .update(issues)
      .set({
        status: 'resolved' as IssueStatus,
        resolvedBy,
        resolvedAt: new Date(),
        resolution,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();
    return issue;
  }

  async getPendingGateForms(): Promise<GateFormRecord[]> {
    return await db.select().from(gateForms).where(eq(gateForms.status, 'submitted'));
  }

  async approveGateForm(id: string, approvedBy: string): Promise<GateFormRecord | undefined> {
    const [form] = await db
      .update(gateForms)
      .set({
        status: 'approved' as FormStatus,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(gateForms.id, id))
      .returning();
    return form;
  }

  async rejectGateForm(id: string, reason: string, rejectedBy: string): Promise<GateFormRecord | undefined> {
    const [form] = await db
      .update(gateForms)
      .set({
        status: 'change_requested' as FormStatus,
        changeRequestReason: reason,
        changeRequestedBy: rejectedBy,
        changeRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(gateForms.id, id))
      .returning();
    return form;
  }

  async bulkUpsertFteSnapshots(data: InsertFteSnapshot[]): Promise<number> {
    if (data.length === 0) return 0;
    let count = 0;
    for (const item of data) {
      await db
        .insert(fteSnapshots)
        .values(item)
        .onConflictDoUpdate({
          target: fteSnapshots.id,
          set: {
            fteCommitted: item.fteCommitted,
            fteActual: item.fteActual,
            notes: item.notes,
            updatedAt: new Date(),
          },
        });
      count++;
    }
    return count;
  }

  async bulkUpsertKpis(data: InsertInitiativeKpi[]): Promise<number> {
    if (data.length === 0) return 0;
    let count = 0;
    for (const item of data) {
      await db
        .insert(initiativeKpis)
        .values(item)
        .onConflictDoUpdate({
          target: initiativeKpis.id,
          set: {
            targetValue: item.targetValue,
            actualValue: item.actualValue,
            status: item.status,
            notes: item.notes,
            updatedAt: new Date(),
          },
        });
      count++;
    }
    return count;
  }

  async bulkUpsertPodPerformance(data: InsertPodPerformance[]): Promise<number> {
    if (data.length === 0) return 0;
    let count = 0;
    for (const item of data) {
      await db
        .insert(podPerformance)
        .values(item)
        .onConflictDoUpdate({
          target: podPerformance.id,
          set: {
            velocity: item.velocity,
            qualityScore: item.qualityScore,
            backlogHealth: item.backlogHealth,
            notes: item.notes,
            updatedAt: new Date(),
          },
        });
      count++;
    }
    return count;
  }

  async getFteSnapshotsByInitiative(initiativeId: string): Promise<FteSnapshotRecord[]> {
    return await db.select().from(fteSnapshots).where(eq(fteSnapshots.initiativeId, initiativeId));
  }

  async getKpisByInitiative(initiativeId: string): Promise<InitiativeKpiRecord[]> {
    return await db.select().from(initiativeKpis).where(eq(initiativeKpis.initiativeId, initiativeId));
  }

  async getPodPerformanceByInitiative(initiativeId: string): Promise<PodPerformanceRecord[]> {
    return await db.select().from(podPerformance).where(eq(podPerformance.initiativeId, initiativeId));
  }

  // Inquiries
  async getAllInquiries(): Promise<InquiryRecord[]> {
    return await db.select().from(inquiries);
  }

  async getOpenInquiries(): Promise<InquiryRecord[]> {
    return await db.select().from(inquiries).where(
      sql`${inquiries.status} != 'closed'`
    );
  }

  async getInquiry(id: string): Promise<InquiryRecord | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async getInquiriesByInitiative(initiativeId: string): Promise<InquiryRecord[]> {
    return await db.select().from(inquiries).where(eq(inquiries.initiativeId, initiativeId));
  }

  async createInquiry(data: InsertInquiry): Promise<InquiryRecord> {
    const [inquiry] = await db.insert(inquiries).values(data).returning();
    return inquiry;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryRecord | undefined> {
    const [inquiry] = await db
      .update(inquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  }

  // Inquiry Responses
  async getResponsesByInquiry(inquiryId: string): Promise<InquiryResponseRecord[]> {
    return await db.select().from(inquiryResponses).where(eq(inquiryResponses.inquiryId, inquiryId));
  }

  async createInquiryResponse(data: InsertInquiryResponse): Promise<InquiryResponseRecord> {
    const [response] = await db.insert(inquiryResponses).values(data).returning();
    // Update inquiry status to pending when a response is added
    await db.update(inquiries).set({ status: 'pending', updatedAt: new Date() }).where(eq(inquiries.id, data.inquiryId));
    return response;
  }

  async getArtifactsByGateForm(gateFormId: string): Promise<GateFormArtifactRecord[]> {
    return await db.select().from(gateFormArtifacts).where(eq(gateFormArtifacts.gateFormId, gateFormId));
  }

  async getArtifactsByInitiativeGate(initiativeId: string, gate: string): Promise<GateFormArtifactRecord[]> {
    return await db.select().from(gateFormArtifacts).where(
      and(eq(gateFormArtifacts.initiativeId, initiativeId), eq(gateFormArtifacts.gate, gate))
    );
  }

  async createArtifact(data: InsertGateFormArtifact): Promise<GateFormArtifactRecord> {
    const [artifact] = await db.insert(gateFormArtifacts).values(data).returning();
    return artifact;
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const result = await db.delete(gateFormArtifacts).where(eq(gateFormArtifacts.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
