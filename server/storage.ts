import { userRoles, initiativeStatuses, gateForms, users, initiatives, milestones, capabilities, type UserRole, type UserRoleRecord, type InitiativeStatusRecord, type StatusValue, type GateFormRecord, type FormStatus, type User, type AppUserRole, type UserStatus, type InitiativeRecord, type InsertInitiative, type MilestoneRecord, type InsertMilestone, type CapabilityRecord, type InsertCapability, type CapabilityStatus } from "@shared/schema";
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
  countUsers(): Promise<number>;
  
  getAllInitiatives(): Promise<InitiativeRecord[]>;
  getInitiative(id: string): Promise<InitiativeRecord | undefined>;
  upsertInitiative(data: InsertInitiative): Promise<InitiativeRecord>;
  updateInitiative(id: string, data: Partial<InsertInitiative>): Promise<InitiativeRecord | undefined>;
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
}

export const storage = new DatabaseStorage();
