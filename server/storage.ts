import { userRoles, initiativeStatuses, type UserRole, type UserRoleRecord, type InitiativeStatusRecord, type StatusValue } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUserRole(userId: string): Promise<UserRoleRecord | undefined>;
  upsertUserRole(data: { userId: string; role: UserRole; valueStream: string | null }): Promise<UserRoleRecord>;
  getAllUserRoles(): Promise<UserRoleRecord[]>;
  countUserRoles(): Promise<number>;
  getInitiativeStatus(initiativeId: string): Promise<InitiativeStatusRecord | undefined>;
  upsertInitiativeStatus(data: { initiativeId: string; costStatus: StatusValue; benefitStatus: StatusValue; timelineStatus: StatusValue; scopeStatus: StatusValue }): Promise<InitiativeStatusRecord>;
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
}

export const storage = new DatabaseStorage();
