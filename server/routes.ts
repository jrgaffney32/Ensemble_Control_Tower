import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { AppUserRole } from "@shared/schema";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

const MASTER_PASSWORD = "ENSB101$$";

declare module 'express-session' {
  interface SessionData {
    gatePassed?: boolean;
    userId?: string;
    userEmail?: string;
    userRole?: AppUserRole;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role?: AppUserRole;
      firstName?: string;
      lastName?: string;
    }
  }
}

const isSessionAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const requireAppRole = (...allowedRoles: AppUserRole[]): RequestHandler => {
  return async (req, res, next) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user || !user.role) {
      return res.status(403).json({ message: "Role not assigned" });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Master password gate check
  app.post("/api/auth/verify-gate", (req, res) => {
    const { password } = req.body;
    if (password === MASTER_PASSWORD) {
      req.session.gatePassed = true;
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Invalid access code" });
  });
  
  app.get("/api/auth/gate-status", (req, res) => {
    res.json({ gatePassed: !!req.session.gatePassed });
  });
  
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      if (!req.session.gatePassed) {
        return res.status(403).json({ message: "Access code required" });
      }
      
      const parsed = registerUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      
      const { email, password, firstName, lastName } = parsed.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      const userCount = await storage.countUsers();
      const isFirstUser = userCount === 0;
      
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });
      
      if (isFirstUser) {
        await storage.updateUserRole(user.id, 'control_tower');
      }
      
      res.json({ 
        success: true, 
        message: isFirstUser ? "Registration successful. You are the first user and have been assigned admin role." : "Registration successful. Please wait for an admin to assign your role."
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      if (!req.session.gatePassed) {
        return res.status(403).json({ message: "Access code required" });
      }
      
      const parsed = loginUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      
      const { email, password } = parsed.data;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (user.status === 'pending_role') {
        return res.status(403).json({ message: "Your account is pending role assignment. Please contact an administrator." });
      }
      
      if (user.status === 'inactive') {
        return res.status(403).json({ message: "Your account has been deactivated." });
      }
      
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userRole = user.role || undefined;
      
      res.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  
  // Get current session user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });
  });
  
  // Get user role (session-based)
  app.get("/api/user/role", isSessionAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });
  
  // Admin: Assign role to user
  app.put("/api/user/:userId/role", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['control_tower', 'sto', 'slt'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Admin: Get all users
  app.get("/api/admin/users", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      const usersResponse = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      }));
      
      res.json(usersResponse);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Admin: Get pending users
  app.get("/api/admin/pending-users", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      
      const usersResponse = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      }));
      
      res.json(usersResponse);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.get("/api/initiatives/:initiativeId/status", isSessionAuthenticated, async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const status = await storage.getInitiativeStatus(initiativeId);
      
      if (!status) {
        return res.json({
          initiativeId,
          costStatus: 'green',
          benefitStatus: 'green',
          timelineStatus: 'green',
          scopeStatus: 'green',
        });
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching initiative status:", error);
      res.status(500).json({ message: "Failed to fetch initiative status" });
    }
  });

  app.put("/api/initiatives/:initiativeId/status", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const { costStatus, benefitStatus, timelineStatus, scopeStatus } = req.body;
      
      const validStatuses = ['green', 'yellow', 'red'];
      if (!validStatuses.includes(costStatus) || !validStatuses.includes(benefitStatus) ||
          !validStatuses.includes(timelineStatus) || !validStatuses.includes(scopeStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const status = await storage.upsertInitiativeStatus({
        initiativeId,
        costStatus,
        benefitStatus,
        timelineStatus,
        scopeStatus,
      });
      
      res.json(status);
    } catch (error) {
      console.error("Error updating initiative status:", error);
      res.status(500).json({ message: "Failed to update initiative status" });
    }
  });

  app.get("/api/initiatives/:initiativeId/forms", isSessionAuthenticated, async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const forms = await storage.getGateFormsForInitiative(initiativeId);
      res.json(forms);
    } catch (error) {
      console.error("Error fetching gate forms:", error);
      res.status(500).json({ message: "Failed to fetch gate forms" });
    }
  });

  app.get("/api/initiatives/:initiativeId/forms/:gate", isSessionAuthenticated, async (req, res) => {
    try {
      const { initiativeId, gate } = req.params;
      const form = await storage.getGateForm(initiativeId, gate);
      if (!form) {
        return res.json({
          id: `${initiativeId}-${gate}`,
          initiativeId,
          gate,
          status: 'not_started',
          formData: null,
        });
      }
      res.json(form);
    } catch (error) {
      console.error("Error fetching gate form:", error);
      res.status(500).json({ message: "Failed to fetch gate form" });
    }
  });

  app.put("/api/initiatives/:initiativeId/forms/:gate", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId, gate } = req.params;
      const userId = req.session.userId;
      const { formData, status, changeRequestReason } = req.body;
      
      if (status === 'approved') {
        return res.status(403).json({ message: "Use the approve endpoint to approve forms" });
      }
      
      const existingForm = await storage.getGateForm(initiativeId, gate);
      
      if (existingForm?.status === 'approved' && status !== 'change_requested') {
        return res.status(400).json({ message: "Approved forms require a change request to modify" });
      }
      
      if (status === 'change_requested' && !changeRequestReason?.trim()) {
        return res.status(400).json({ message: "Change request reason is required" });
      }
      
      const allowedStatuses = ['draft', 'submitted', 'change_requested'];
      if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const formId = `${initiativeId}-${gate}`;
      const updateData: any = {
        id: formId,
        initiativeId,
        gate,
        status: status || (existingForm?.status === 'not_started' ? 'draft' : existingForm?.status),
        formData,
      };
      
      if (status === 'submitted') {
        updateData.submittedBy = userId;
        updateData.submittedAt = new Date();
      }
      
      if (status === 'change_requested') {
        updateData.changeRequestReason = changeRequestReason;
        updateData.changeRequestedBy = userId;
        updateData.changeRequestedAt = new Date();
      }
      
      const form = await storage.upsertGateForm(updateData);
      res.json(form);
    } catch (error) {
      console.error("Error updating gate form:", error);
      res.status(500).json({ message: "Failed to update gate form" });
    }
  });

  app.put("/api/initiatives/:initiativeId/forms/:gate/approve", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { initiativeId, gate } = req.params;
      const userId = req.session.userId;
      
      const existingForm = await storage.getGateForm(initiativeId, gate);
      if (!existingForm || existingForm.status !== 'submitted') {
        return res.status(400).json({ message: "Only submitted forms can be approved" });
      }
      
      const form = await storage.upsertGateForm({
        id: existingForm.id,
        initiativeId,
        gate,
        status: 'approved',
        formData: existingForm.formData || undefined,
        approvedBy: userId,
        approvedAt: new Date(),
      });
      res.json(form);
    } catch (error) {
      console.error("Error approving gate form:", error);
      res.status(500).json({ message: "Failed to approve gate form" });
    }
  });

  // Initiative CRUD routes - Control Tower only
  app.get("/api/initiatives", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const dbInitiatives = await storage.getAllInitiatives();
      const parsed = dbInitiatives.map(init => ({
        ...init,
        milestones: init.milestones ? JSON.parse(init.milestones) : [],
      }));
      res.json(parsed);
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      res.status(500).json({ message: "Failed to fetch initiatives" });
    }
  });

  app.get("/api/initiatives/:id", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const initiative = await storage.getInitiative(id);
      if (!initiative) {
        return res.status(404).json({ message: "Initiative not found" });
      }
      res.json({
        ...initiative,
        milestones: initiative.milestones ? JSON.parse(initiative.milestones) : [],
      });
    } catch (error) {
      console.error("Error fetching initiative:", error);
      res.status(500).json({ message: "Failed to fetch initiative" });
    }
  });

  app.put("/api/initiatives/:id", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const sanitizedData: Record<string, any> = {};
      if (updateData.name !== undefined) sanitizedData.name = String(updateData.name);
      if (updateData.valueStream !== undefined) sanitizedData.valueStream = String(updateData.valueStream);
      if (updateData.lGate !== undefined) sanitizedData.lGate = String(updateData.lGate);
      if (updateData.priorityCategory !== undefined) sanitizedData.priorityCategory = String(updateData.priorityCategory);
      if (updateData.priorityRank !== undefined) sanitizedData.priorityRank = Number(updateData.priorityRank) || 0;
      if (updateData.budgetedCost !== undefined) sanitizedData.budgetedCost = Number(updateData.budgetedCost) || 0;
      if (updateData.targetedBenefit !== undefined) sanitizedData.targetedBenefit = Number(updateData.targetedBenefit) || 0;
      if (updateData.costCenter !== undefined) sanitizedData.costCenter = String(updateData.costCenter);
      if (updateData.milestones !== undefined) {
        sanitizedData.milestones = typeof updateData.milestones === 'string' 
          ? updateData.milestones 
          : JSON.stringify(updateData.milestones);
      }
      
      const initiative = await storage.updateInitiative(id, sanitizedData);
      if (!initiative) {
        return res.status(404).json({ message: "Initiative not found" });
      }
      res.json({
        ...initiative,
        milestones: initiative.milestones ? JSON.parse(initiative.milestones) : [],
      });
    } catch (error) {
      console.error("Error updating initiative:", error);
      res.status(500).json({ message: "Failed to update initiative" });
    }
  });

  app.post("/api/initiatives/bulk-update", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Updates must be an array" });
      }
      
      const sanitizedUpdates = updates.map(({ id, data }) => {
        const sanitizedData: Record<string, any> = {};
        if (data.name !== undefined) sanitizedData.name = String(data.name);
        if (data.valueStream !== undefined) sanitizedData.valueStream = String(data.valueStream);
        if (data.lGate !== undefined) sanitizedData.lGate = String(data.lGate);
        if (data.priorityCategory !== undefined) sanitizedData.priorityCategory = String(data.priorityCategory);
        if (data.priorityRank !== undefined) sanitizedData.priorityRank = Number(data.priorityRank) || 0;
        if (data.budgetedCost !== undefined) sanitizedData.budgetedCost = Number(data.budgetedCost) || 0;
        if (data.targetedBenefit !== undefined) sanitizedData.targetedBenefit = Number(data.targetedBenefit) || 0;
        if (data.costCenter !== undefined) sanitizedData.costCenter = String(data.costCenter);
        if (data.milestones !== undefined) {
          sanitizedData.milestones = typeof data.milestones === 'string' 
            ? data.milestones 
            : JSON.stringify(data.milestones);
        }
        return { id, data: sanitizedData };
      });
      
      await storage.bulkUpdateInitiatives(sanitizedUpdates);
      res.json({ success: true, message: `Updated ${updates.length} initiatives` });
    } catch (error) {
      console.error("Error bulk updating initiatives:", error);
      res.status(500).json({ message: "Failed to bulk update initiatives" });
    }
  });

  app.post("/api/initiatives/seed", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { initiatives: initData } = req.body;
      if (!Array.isArray(initData)) {
        return res.status(400).json({ message: "Initiatives must be an array" });
      }
      
      await storage.seedInitiatives(initData);
      res.json({ success: true, message: `Seeded ${initData.length} initiatives` });
    } catch (error) {
      console.error("Error seeding initiatives:", error);
      res.status(500).json({ message: "Failed to seed initiatives" });
    }
  });

  // Milestone CRUD routes - Control Tower only
  app.get("/api/milestones", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const allMilestones = await storage.getAllMilestones();
      const now = new Date();
      const processedMilestones: typeof allMilestones = [];
      
      for (const m of allMilestones) {
        if (m.endDate && m.status !== 'completed' && m.status !== 'missed' && new Date(m.endDate) < now) {
          const updated = await storage.updateMilestone(m.id, { status: 'missed' });
          processedMilestones.push(updated || { ...m, status: 'missed' });
        } else {
          processedMilestones.push(m);
        }
      }
      
      res.json(processedMilestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.get("/api/milestones/by-initiative/:initiativeId", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const initMilestones = await storage.getMilestonesByInitiative(initiativeId);
      const now = new Date();
      const processedMilestones: typeof initMilestones = [];
      
      for (const m of initMilestones) {
        if (m.endDate && m.status !== 'completed' && m.status !== 'missed' && new Date(m.endDate) < now) {
          const updated = await storage.updateMilestone(m.id, { status: 'missed' });
          processedMilestones.push(updated || { ...m, status: 'missed' });
        } else {
          processedMilestones.push(m);
        }
      }
      
      res.json(processedMilestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/milestones", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { initiativeId, name, startDate, endDate, status, notes } = req.body;
      const id = `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const milestone = await storage.createMilestone({
        id,
        initiativeId,
        name: String(name),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'not_started',
        notes: notes || null,
      });
      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put("/api/milestones/:id", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, startDate, endDate, status, notes } = req.body;
      
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = String(name);
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      const milestone = await storage.updateMilestone(id, updateData);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.delete("/api/milestones/:id", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMilestone(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  app.post("/api/milestones/seed", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { milestones: milestoneData } = req.body;
      if (!Array.isArray(milestoneData)) {
        return res.status(400).json({ message: "Milestones must be an array" });
      }
      
      await storage.seedMilestones(milestoneData);
      res.json({ success: true, message: `Seeded ${milestoneData.length} milestones` });
    } catch (error) {
      console.error("Error seeding milestones:", error);
      res.status(500).json({ message: "Failed to seed milestones" });
    }
  });

  return httpServer;
}
