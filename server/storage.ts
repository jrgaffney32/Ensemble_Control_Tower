import { userRoles, initiativeStatuses, gateForms, users, type UserRole, type UserRoleRecord, type InitiativeStatusRecord, type StatusValue, type GateFormRecord, type FormStatus, type User, type AppUserRole, type UserStatus } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
