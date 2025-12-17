import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";
import type { UserRole } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    }
  }
}

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return async (req, res, next) => {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userRole = await storage.getUserRole(userId);
    const role = userRole?.role || 'slt';
    
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/user/role", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      let userRole = await storage.getUserRole(userId);
      
      if (!userRole) {
        const userCount = await storage.countUserRoles();
        const isFirstUser = userCount === 0;
        
        userRole = await storage.upsertUserRole({
          userId,
          role: isFirstUser ? 'control_tower' : 'slt',
          valueStream: null,
        });
      }
      
      const user = await authStorage.getUser(userId);
      
      res.json({
        ...user,
        role: userRole.role,
        valueStream: userRole.valueStream,
      });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });
  
  app.put("/api/user/:userId/role", isAuthenticated, requireRole('control_tower'), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role, valueStream } = req.body;
      
      if (!['control_tower', 'sto', 'slt'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const userRole = await storage.upsertUserRole({
        userId,
        role,
        valueStream: valueStream || null,
      });
      
      res.json(userRole);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  app.get("/api/admin/users", isAuthenticated, requireRole('control_tower'), async (req, res) => {
    try {
      const allRoles = await storage.getAllUserRoles();
      
      const usersWithRoles = await Promise.all(
        allRoles.map(async (roleRecord) => {
          const user = await authStorage.getUser(roleRecord.userId);
          return {
            odisId: roleRecord.userId,
            email: user?.email || 'Unknown',
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
            profileImageUrl: user?.profileImageUrl || null,
            role: roleRecord.role,
            valueStream: roleRecord.valueStream,
          };
        })
      );
      
      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/initiatives/:initiativeId/status", isAuthenticated, async (req, res) => {
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

  app.put("/api/initiatives/:initiativeId/status", isAuthenticated, requireRole('control_tower', 'sto'), async (req, res) => {
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

  app.get("/api/initiatives/:initiativeId/forms", isAuthenticated, async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const forms = await storage.getGateFormsForInitiative(initiativeId);
      res.json(forms);
    } catch (error) {
      console.error("Error fetching gate forms:", error);
      res.status(500).json({ message: "Failed to fetch gate forms" });
    }
  });

  app.get("/api/initiatives/:initiativeId/forms/:gate", isAuthenticated, async (req, res) => {
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

  app.put("/api/initiatives/:initiativeId/forms/:gate", isAuthenticated, requireRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId, gate } = req.params;
      const userId = (req.user as any)?.claims?.sub;
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

  app.put("/api/initiatives/:initiativeId/forms/:gate/approve", isAuthenticated, requireRole('control_tower'), async (req, res) => {
    try {
      const { initiativeId, gate } = req.params;
      const userId = (req.user as any)?.claims?.sub;
      
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

  return httpServer;
}
