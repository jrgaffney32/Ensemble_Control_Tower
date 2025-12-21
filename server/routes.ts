import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { AppUserRole, KpiStatus } from "@shared/schema";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import multer from "multer";
import * as XLSX from "xlsx";

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

  // Excel import for FTE, KPIs, and Pod Performance
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files are allowed'));
      }
    }
  });

  app.post("/api/admin/import-metrics", isSessionAuthenticated, requireAppRole('control_tower'), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const results = {
        fte: { processed: 0, errors: [] as string[] },
        kpis: { processed: 0, errors: [] as string[] },
        podPerformance: { processed: 0, errors: [] as string[] },
      };

      // Get all initiative IDs for validation
      const allInitiatives = await storage.getAllInitiatives();
      const initiativeIds = new Set(allInitiatives.map(i => i.id));

      // Process FTE sheet
      if (workbook.SheetNames.includes('FTE')) {
        const sheet = workbook.Sheets['FTE'];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];
        const fteData = [];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const initiativeId = String(row['InitiativeID'] || row['initiativeId'] || '');
          
          if (!initiativeId) {
            results.fte.errors.push(`Row ${i + 2}: Missing InitiativeID`);
            continue;
          }
          
          if (!initiativeIds.has(initiativeId)) {
            results.fte.errors.push(`Row ${i + 2}: Initiative ${initiativeId} not found`);
            continue;
          }

          const snapshotDate = row['SnapshotDate'] || row['snapshotDate'];
          let parsedDate: Date;
          if (typeof snapshotDate === 'number') {
            parsedDate = new Date((snapshotDate - 25569) * 86400 * 1000);
          } else if (snapshotDate) {
            parsedDate = new Date(snapshotDate);
          } else {
            parsedDate = new Date();
          }

          fteData.push({
            id: `fte-${initiativeId}-${parsedDate.toISOString().split('T')[0]}`,
            initiativeId,
            snapshotDate: parsedDate,
            fteCommitted: Number(row['FTECommitted'] || row['fteCommitted'] || 0),
            fteActual: Number(row['FTEActual'] || row['fteActual'] || 0),
            notes: String(row['Notes'] || row['notes'] || ''),
          });
        }
        
        if (fteData.length > 0) {
          results.fte.processed = await storage.bulkUpsertFteSnapshots(fteData);
        }
      }

      // Process KPIs sheet
      if (workbook.SheetNames.includes('KPIs')) {
        const sheet = workbook.Sheets['KPIs'];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];
        const kpiData = [];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const initiativeId = String(row['InitiativeID'] || row['initiativeId'] || '');
          
          if (!initiativeId) {
            results.kpis.errors.push(`Row ${i + 2}: Missing InitiativeID`);
            continue;
          }
          
          if (!initiativeIds.has(initiativeId)) {
            results.kpis.errors.push(`Row ${i + 2}: Initiative ${initiativeId} not found`);
            continue;
          }

          const kpiKey = String(row['KPIKey'] || row['kpiKey'] || '');
          if (!kpiKey) {
            results.kpis.errors.push(`Row ${i + 2}: Missing KPIKey`);
            continue;
          }

          const parseExcelDate = (val: any): Date => {
            if (typeof val === 'number') {
              return new Date((val - 25569) * 86400 * 1000);
            }
            return val ? new Date(val) : new Date();
          };

          const periodStart = parseExcelDate(row['PeriodStart'] || row['periodStart']);
          const periodEnd = parseExcelDate(row['PeriodEnd'] || row['periodEnd']);
          
          const statusRaw = String(row['Status'] || row['status'] || 'green').toLowerCase();
          const validStatuses: KpiStatus[] = ['green', 'yellow', 'red', 'offtrack'];
          const status = validStatuses.includes(statusRaw as KpiStatus) ? statusRaw as KpiStatus : 'green';

          kpiData.push({
            id: `kpi-${initiativeId}-${kpiKey}-${periodStart.toISOString().split('T')[0]}`,
            initiativeId,
            kpiKey,
            periodStart,
            periodEnd,
            targetValue: Number(row['TargetValue'] || row['targetValue'] || 0),
            actualValue: Number(row['ActualValue'] || row['actualValue'] || 0),
            status,
            notes: String(row['Notes'] || row['notes'] || ''),
          });
        }
        
        if (kpiData.length > 0) {
          results.kpis.processed = await storage.bulkUpsertKpis(kpiData);
        }
      }

      // Process PodPerformance sheet
      if (workbook.SheetNames.includes('PodPerformance')) {
        const sheet = workbook.Sheets['PodPerformance'];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];
        const podData = [];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const initiativeId = String(row['InitiativeID'] || row['initiativeId'] || '');
          
          if (!initiativeId) {
            results.podPerformance.errors.push(`Row ${i + 2}: Missing InitiativeID`);
            continue;
          }
          
          if (!initiativeIds.has(initiativeId)) {
            results.podPerformance.errors.push(`Row ${i + 2}: Initiative ${initiativeId} not found`);
            continue;
          }

          const podName = String(row['PodName'] || row['podName'] || '');
          if (!podName) {
            results.podPerformance.errors.push(`Row ${i + 2}: Missing PodName`);
            continue;
          }

          const parseExcelDate = (val: any): Date => {
            if (typeof val === 'number') {
              return new Date((val - 25569) * 86400 * 1000);
            }
            return val ? new Date(val) : new Date();
          };

          const periodStart = parseExcelDate(row['PeriodStart'] || row['periodStart']);
          const periodEnd = parseExcelDate(row['PeriodEnd'] || row['periodEnd']);

          podData.push({
            id: `pod-${initiativeId}-${podName}-${periodStart.toISOString().split('T')[0]}`,
            initiativeId,
            podName,
            periodStart,
            periodEnd,
            velocity: Number(row['Velocity'] || row['velocity'] || 0),
            qualityScore: Number(row['QualityScore'] || row['qualityScore'] || 0),
            backlogHealth: Number(row['BacklogHealth'] || row['backlogHealth'] || 0),
            notes: String(row['Notes'] || row['notes'] || ''),
          });
        }
        
        if (podData.length > 0) {
          results.podPerformance.processed = await storage.bulkUpsertPodPerformance(podData);
        }
      }

      const totalProcessed = results.fte.processed + results.kpis.processed + results.podPerformance.processed;
      const totalErrors = results.fte.errors.length + results.kpis.errors.length + results.podPerformance.errors.length;

      res.json({
        success: true,
        message: `Imported ${totalProcessed} records${totalErrors > 0 ? ` with ${totalErrors} errors` : ''}`,
        results,
      });
    } catch (error) {
      console.error("Error importing metrics:", error);
      res.status(500).json({ message: "Failed to import metrics" });
    }
  });

  // Download import template
  app.get("/api/admin/import-template", isSessionAuthenticated, requireAppRole('control_tower'), (req, res) => {
    const workbook = XLSX.utils.book_new();
    
    // FTE sheet
    const fteHeaders = [['InitiativeID', 'SnapshotDate', 'FTECommitted', 'FTEActual', 'Notes']];
    const fteSheet = XLSX.utils.aoa_to_sheet(fteHeaders);
    XLSX.utils.book_append_sheet(workbook, fteSheet, 'FTE');
    
    // KPIs sheet
    const kpiHeaders = [['InitiativeID', 'KPIKey', 'PeriodStart', 'PeriodEnd', 'TargetValue', 'ActualValue', 'Status', 'Notes']];
    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiHeaders);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');
    
    // PodPerformance sheet
    const podHeaders = [['InitiativeID', 'PodName', 'PeriodStart', 'PeriodEnd', 'Velocity', 'QualityScore', 'BacklogHealth', 'Notes']];
    const podSheet = XLSX.utils.aoa_to_sheet(podHeaders);
    XLSX.utils.book_append_sheet(workbook, podSheet, 'PodPerformance');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=import-template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
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

  // Capability CRUD routes
  app.get("/api/capabilities", isSessionAuthenticated, async (req, res) => {
    try {
      const allCapabilities = await storage.getAllCapabilities();
      res.json(allCapabilities);
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      res.status(500).json({ message: "Failed to fetch capabilities" });
    }
  });

  app.get("/api/capabilities/pending", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const pending = await storage.getPendingCapabilities();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending capabilities:", error);
      res.status(500).json({ message: "Failed to fetch pending capabilities" });
    }
  });

  app.get("/api/capabilities/by-initiative/:initiativeId", isSessionAuthenticated, async (req, res) => {
    try {
      const { initiativeId } = req.params;
      const caps = await storage.getCapabilitiesByInitiative(initiativeId);
      res.json(caps);
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      res.status(500).json({ message: "Failed to fetch capabilities" });
    }
  });

  app.post("/api/capabilities", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId, name, description, healthStatus, estimatedEffort, startDate, endDate } = req.body;
      const id = `cap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user = req.session?.user;
      
      const capability = await storage.createCapability({
        id,
        initiativeId,
        name: String(name),
        description: description || null,
        healthStatus: healthStatus || 'green',
        approvalStatus: 'submitted',
        estimatedEffort: estimatedEffort || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        submittedBy: user?.id || null,
        submittedAt: new Date(),
      });
      res.json(capability);
    } catch (error) {
      console.error("Error creating capability:", error);
      res.status(500).json({ message: "Failed to create capability" });
    }
  });

  app.put("/api/capabilities/:id", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, healthStatus, estimatedEffort, startDate, endDate } = req.body;
      
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = String(name);
      if (description !== undefined) updateData.description = description;
      if (healthStatus !== undefined) updateData.healthStatus = healthStatus;
      if (estimatedEffort !== undefined) updateData.estimatedEffort = estimatedEffort;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      
      const capability = await storage.updateCapability(id, updateData);
      if (!capability) {
        return res.status(404).json({ message: "Capability not found" });
      }
      res.json(capability);
    } catch (error) {
      console.error("Error updating capability:", error);
      res.status(500).json({ message: "Failed to update capability" });
    }
  });

  app.put("/api/capabilities/:id/approve", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session?.user;
      
      const existing = await storage.getCapability(id);
      if (!existing) {
        return res.status(404).json({ message: "Capability not found" });
      }
      if (existing.approvalStatus !== 'submitted') {
        return res.status(400).json({ message: "Only submitted capabilities can be approved" });
      }
      
      const capability = await storage.approveCapability(id, user?.id || 'unknown');
      res.json(capability);
    } catch (error) {
      console.error("Error approving capability:", error);
      res.status(500).json({ message: "Failed to approve capability" });
    }
  });

  app.put("/api/capabilities/:id/reject", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const existing = await storage.getCapability(id);
      if (!existing) {
        return res.status(404).json({ message: "Capability not found" });
      }
      if (existing.approvalStatus !== 'submitted') {
        return res.status(400).json({ message: "Only submitted capabilities can be rejected" });
      }
      
      const capability = await storage.rejectCapability(id, rejectionReason);
      res.json(capability);
    } catch (error) {
      console.error("Error rejecting capability:", error);
      res.status(500).json({ message: "Failed to reject capability" });
    }
  });

  app.delete("/api/capabilities/:id", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCapability(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting capability:", error);
      res.status(500).json({ message: "Failed to delete capability" });
    }
  });

  app.put("/api/capabilities/:id/request-changes", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { changeReason } = req.body;
      
      if (!changeReason) {
        return res.status(400).json({ message: "Change reason is required" });
      }
      
      const existing = await storage.getCapability(id);
      if (!existing) {
        return res.status(404).json({ message: "Capability not found" });
      }
      if (existing.approvalStatus !== 'submitted') {
        return res.status(400).json({ message: "Only submitted capabilities can have changes requested" });
      }
      
      const capability = await storage.requestCapabilityChanges(id, changeReason);
      res.json(capability);
    } catch (error) {
      console.error("Error requesting capability changes:", error);
      res.status(500).json({ message: "Failed to request capability changes" });
    }
  });

  app.put("/api/capabilities/:id/resubmit", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session?.user;
      
      const existing = await storage.getCapability(id);
      if (!existing) {
        return res.status(404).json({ message: "Capability not found" });
      }
      if (!['rejected', 'change_requested', 'draft'].includes(existing.approvalStatus)) {
        return res.status(400).json({ message: "Only rejected, change-requested, or draft capabilities can be resubmitted" });
      }
      
      const capability = await storage.resubmitCapability(id, user?.id || 'unknown');
      res.json(capability);
    } catch (error) {
      console.error("Error resubmitting capability:", error);
      res.status(500).json({ message: "Failed to resubmit capability" });
    }
  });

  // Request CRUD and approval routes
  app.get("/api/requests", isSessionAuthenticated, async (req, res) => {
    try {
      const allRequests = await storage.getAllRequests();
      res.json(allRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/pending", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const pending = await storage.getPendingRequests();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post("/api/requests", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId, type, title, description, requestedAmount, justification } = req.body;
      const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user = req.session?.user;
      
      const request = await storage.createRequest({
        id,
        initiativeId,
        type,
        title: String(title),
        description: description || null,
        requestedAmount: requestedAmount || null,
        justification: justification || null,
        status: 'submitted',
        submittedBy: user?.id || null,
        submittedAt: new Date(),
      });
      res.json(request);
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.put("/api/requests/:id/approve", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session?.user;
      
      const existing = await storage.getRequest(id);
      if (!existing) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (existing.status !== 'submitted') {
        return res.status(400).json({ message: "Only submitted requests can be approved" });
      }
      
      const request = await storage.approveRequest(id, user?.id || 'unknown');
      res.json(request);
    } catch (error) {
      console.error("Error approving request:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.put("/api/requests/:id/reject", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const existing = await storage.getRequest(id);
      if (!existing) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (existing.status !== 'submitted') {
        return res.status(400).json({ message: "Only submitted requests can be rejected" });
      }
      
      const request = await storage.rejectRequest(id, rejectionReason);
      res.json(request);
    } catch (error) {
      console.error("Error rejecting request:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  // Issue CRUD and resolution routes
  app.get("/api/issues", isSessionAuthenticated, async (req, res) => {
    try {
      const allIssues = await storage.getAllIssues();
      res.json(allIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.get("/api/issues/open", isSessionAuthenticated, async (req, res) => {
    try {
      const openIssues = await storage.getOpenIssues();
      res.json(openIssues);
    } catch (error) {
      console.error("Error fetching open issues:", error);
      res.status(500).json({ message: "Failed to fetch open issues" });
    }
  });

  app.post("/api/issues", isSessionAuthenticated, requireAppRole('control_tower', 'sto'), async (req, res) => {
    try {
      const { initiativeId, title, description, severity } = req.body;
      const id = `iss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user = req.session?.user;
      
      const issue = await storage.createIssue({
        id,
        initiativeId,
        title: String(title),
        description: description || null,
        severity: severity || 'medium',
        status: 'open',
        reportedBy: user?.id || null,
        reportedAt: new Date(),
      });
      res.json(issue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(500).json({ message: "Failed to create issue" });
    }
  });

  app.put("/api/issues/:id/resolve", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { resolution } = req.body;
      const user = req.session?.user;
      
      if (!resolution) {
        return res.status(400).json({ message: "Resolution is required" });
      }
      
      const issue = await storage.resolveIssue(id, user?.id || 'unknown', resolution);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Error resolving issue:", error);
      res.status(500).json({ message: "Failed to resolve issue" });
    }
  });

  // Gate form approval routes
  app.get("/api/gate-forms/pending", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const pending = await storage.getPendingGateForms();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending gate forms:", error);
      res.status(500).json({ message: "Failed to fetch pending gate forms" });
    }
  });

  app.put("/api/gate-forms/:id/approve", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session?.user;
      
      const form = await storage.approveGateForm(id, user?.id || 'unknown');
      if (!form) {
        return res.status(404).json({ message: "Gate form not found" });
      }
      res.json(form);
    } catch (error) {
      console.error("Error approving gate form:", error);
      res.status(500).json({ message: "Failed to approve gate form" });
    }
  });

  app.put("/api/gate-forms/:id/reject", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = req.session?.user;
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const form = await storage.rejectGateForm(id, reason, user?.id || 'unknown');
      if (!form) {
        return res.status(404).json({ message: "Gate form not found" });
      }
      res.json(form);
    } catch (error) {
      console.error("Error rejecting gate form:", error);
      res.status(500).json({ message: "Failed to reject gate form" });
    }
  });

  // Summary endpoint for pending counts
  app.get("/api/review/pending-counts", isSessionAuthenticated, requireAppRole('control_tower'), async (req, res) => {
    try {
      const [capabilities, reqs, gateForms, issuesList] = await Promise.all([
        storage.getPendingCapabilities(),
        storage.getPendingRequests(),
        storage.getPendingGateForms(),
        storage.getOpenIssues(),
      ]);
      
      res.json({
        capabilities: capabilities.length,
        requests: reqs.length,
        gateForms: gateForms.length,
        issues: issuesList.length,
        total: capabilities.length + reqs.length + gateForms.length + issuesList.length,
      });
    } catch (error) {
      console.error("Error fetching pending counts:", error);
      res.status(500).json({ message: "Failed to fetch pending counts" });
    }
  });

  return httpServer;
}
