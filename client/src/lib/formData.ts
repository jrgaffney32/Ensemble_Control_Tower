// L-Gate Form Types and Mock Data

export type FormStatus = 'not_started' | 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
export type LGate = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

export interface IntakeForm {
  projectId: string;
  projectName: string;
  singleThreadedOwner: string;
  initiativeOwner: string;
  problemStatement: string;
  desiredBusinessOutcome: string;
  successKPIs: string;
  estimatedRevenueImpact: string;
  estimatedEfficiencyImpact: string;
  grossBenefit: number;
  netBenefit: number;
  redeploymentLocation: string;
  metricImprovement: string;
  slaDriver: boolean;
  slaDriverDescription?: string;
  complianceDriver: boolean;
  complianceDriverDescription?: string;
  reusePotential: boolean;
  reusePotentialScope?: string;
  timelinePeriod: string;
  approvalTarget?: string;
  designCompletionTarget?: string;
  pilotRolloutTarget?: string;
  scaleUpTarget?: string;
  dependency1?: string;
  dependency2?: string;
  risk: string;
  mitigation: string;
  status: FormStatus;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
}

export interface LGateRequirement {
  id: string;
  name: string;
  description?: string;
  type: 'Document' | 'Approval' | 'Checkpoint';
  completed: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
}

export interface LGateForm {
  projectId: string;
  gate: LGate;
  gateName: string;
  requirements: LGateRequirement[];
  status: FormStatus;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  approvalNotes?: string;
}

export interface ProjectGateAction {
  id: string;
  projectId: string;
  date: string;
  gate: LGate;
  actionType: 'Submission' | 'Review' | 'Approval' | 'Rejection' | 'Comment';
  decision?: 'Approved' | 'Rejected' | 'Pending';
  notes: string;
  enteredBy: string;
}

// L-Gate definitions with requirements
export const lgateDefinitions: Record<LGate, { name: string; requirements: Omit<LGateRequirement, 'id' | 'completed'>[] }> = {
  L0: {
    name: 'Ideation',
    requirements: [
      { name: 'Intake form completed', type: 'Document' }
    ]
  },
  L1: {
    name: 'Review and Approval',
    requirements: [
      { name: 'Base design agreement', type: 'Document' },
      { name: 'T-shirt size cost estimate', type: 'Document' },
      { name: 'Steerco approval with reason', type: 'Approval' }
    ]
  },
  L2: {
    name: 'Resource Scheduling',
    requirements: [
      { name: 'Team assignment and RACI', type: 'Document' },
      { name: 'Specific team members assigned', type: 'Document' },
      { name: 'Major milestones defined', type: 'Document' }
    ]
  },
  L3: {
    name: 'Design',
    requirements: [
      { name: 'Basic requirements document', type: 'Document' },
      { name: 'AI evaluation and governance form', type: 'Document' },
      { name: 'KPI movement plan', type: 'Document' },
      { name: 'Revised scope', type: 'Document' },
      { name: 'Success criteria', type: 'Document' },
      { name: 'Revised cost and benefit estimates', type: 'Document' }
    ]
  },
  L4: {
    name: 'Build and Release',
    requirements: [
      { name: 'UAT plan and results', type: 'Document' },
      { name: 'Change management and roll out plan', type: 'Document' },
      { name: 'Pilot goals and results', type: 'Document' },
      { name: 'Revised cost and benefits', type: 'Document' }
    ]
  },
  L5: {
    name: 'Full Scale Roll Out',
    requirements: [
      { name: 'Updated milestones', type: 'Document' },
      { name: 'Ongoing KPI monitoring', type: 'Checkpoint' },
      { name: 'Financial impact', type: 'Document' }
    ]
  },
  L6: {
    name: 'Value Realization',
    requirements: [
      { name: 'Ongoing KPI monitoring', type: 'Checkpoint' },
      { name: 'Financial impact', type: 'Document' }
    ]
  }
};

// Mock intake forms
export const mockIntakeForms: IntakeForm[] = [
  {
    projectId: 'ACA-001',
    projectName: 'Autonomous Coding Agent',
    singleThreadedOwner: 'Clinical Value Stream',
    initiativeOwner: 'Clinical Value Stream',
    problemStatement: 'Manual medical coding is slow and error-prone, leading to revenue leakage',
    desiredBusinessOutcome: 'Automate 80% of routine coding decisions with 95% accuracy',
    successKPIs: 'Current 65% auto-code rate to 85% target; Error rate from 8% to 2%',
    estimatedRevenueImpact: '$4.2M annual impact from faster coding and reduced denials',
    estimatedEfficiencyImpact: '12 FTEs saved, $840K cost reduction',
    grossBenefit: 4200000,
    netBenefit: 840000,
    redeploymentLocation: 'Reassigned to Complex Coding Review',
    metricImprovement: 'Auto-code rate from 65% to 85%, accuracy from 92% to 98%',
    slaDriver: true,
    slaDriverDescription: 'DNFB days reduction commitment',
    complianceDriver: true,
    complianceDriverDescription: 'OIG coding accuracy requirements',
    reusePotential: true,
    reusePotentialScope: 'Applicable across all clients',
    timelinePeriod: 'Q2 2025 - Q4 2025',
    approvalTarget: 'Jan 2025',
    designCompletionTarget: 'Mar 2025',
    pilotRolloutTarget: 'Jun 2025',
    scaleUpTarget: 'Oct 2025',
    dependency1: 'Epic EMR integration API access',
    dependency2: '3M encoder licensing',
    risk: 'Model accuracy degradation with new code sets',
    mitigation: 'Continuous training pipeline and human-in-loop validation',
    status: 'approved',
    submittedDate: '2024-11-15',
    reviewedBy: 'PMO Director',
    reviewedDate: '2024-11-22'
  },
  {
    projectId: 'PAB-002',
    projectName: 'Prior Auth "Concierge" Bot',
    singleThreadedOwner: 'Access Value Stream',
    initiativeOwner: 'Access Value Stream',
    problemStatement: 'Prior authorization is manual, time-consuming, and causes scheduling delays',
    desiredBusinessOutcome: 'Automate 70% of prior auth submissions with real-time status',
    successKPIs: 'Reduce auth turnaround from 5 days to 1 day; Auto-submit rate 70%',
    estimatedRevenueImpact: '$2.8M annual from reduced denials and faster scheduling',
    estimatedEfficiencyImpact: '8 FTEs saved, $560K cost reduction',
    grossBenefit: 2800000,
    netBenefit: 560000,
    redeploymentLocation: 'Reassigned to Complex Auth Cases',
    metricImprovement: 'Turnaround 5 days to 1 day, auto-submit 0% to 70%',
    slaDriver: true,
    slaDriverDescription: 'Patient scheduling SLA',
    complianceDriver: false,
    reusePotential: true,
    reusePotentialScope: 'Across 8 health system clients',
    timelinePeriod: 'Q1 2025 - Q4 2025',
    approvalTarget: 'Dec 2024',
    designCompletionTarget: 'Feb 2025',
    pilotRolloutTarget: 'May 2025',
    scaleUpTarget: 'Sep 2025',
    dependency1: 'Payer portal integrations',
    dependency2: 'Clinical NLP model training',
    risk: 'Payer portal changes breaking automation',
    mitigation: 'Adaptive scraping with fallback to manual queue',
    status: 'in_review',
    submittedDate: '2024-12-01'
  },
  {
    projectId: 'DDS-003',
    projectName: 'Denial Defense Swarm',
    singleThreadedOwner: 'Claims Value Stream',
    initiativeOwner: 'Claims Value Stream',
    problemStatement: 'Denial appeals are manual and inconsistent, leading to write-offs',
    desiredBusinessOutcome: 'Automate denial root cause analysis and appeal generation',
    successKPIs: 'Appeal success rate from 45% to 65%; Processing time from 14 days to 3 days',
    estimatedRevenueImpact: '$3.1M recovered from improved appeal success',
    estimatedEfficiencyImpact: '6 FTEs saved, $420K cost reduction',
    grossBenefit: 3100000,
    netBenefit: 420000,
    redeploymentLocation: 'Reassigned to Payer Negotiation',
    metricImprovement: 'Appeal success 45% to 65%, cycle time 14 to 3 days',
    slaDriver: false,
    complianceDriver: true,
    complianceDriverDescription: 'Timely filing requirements',
    reusePotential: true,
    reusePotentialScope: 'All RCM clients',
    timelinePeriod: 'Q1 2025 - Q3 2025',
    approvalTarget: 'Jan 2025',
    designCompletionTarget: 'Mar 2025',
    pilotRolloutTarget: 'Jun 2025',
    scaleUpTarget: 'Sep 2025',
    dependency1: 'Remittance data warehouse',
    dependency2: 'Payer contract terms database',
    risk: 'Appeal template quality issues',
    mitigation: 'Legal review of generated appeals',
    status: 'approved',
    submittedDate: '2024-11-20',
    reviewedBy: 'PMO Director',
    reviewedDate: '2024-11-28'
  },
  {
    projectId: 'PFG-004',
    projectName: 'Patient Financial Guide',
    singleThreadedOwner: 'Patient Experience Value Stream',
    initiativeOwner: 'Patient Experience Value Stream',
    problemStatement: 'Patients confused by bills, leading to payment delays and complaints',
    desiredBusinessOutcome: 'AI voice/chat assistant for billing questions and payment plans',
    successKPIs: 'Call deflection 40%, payment plan enrollment +30%, CSAT +15 pts',
    estimatedRevenueImpact: '$1.8M from improved collections and reduced bad debt',
    estimatedEfficiencyImpact: '10 FTEs saved, $700K cost reduction',
    grossBenefit: 1800000,
    netBenefit: 700000,
    redeploymentLocation: 'Reassigned to Complex Financial Counseling',
    metricImprovement: 'Call volume -40%, self-service +60%',
    slaDriver: true,
    slaDriverDescription: 'Call answer time SLA',
    complianceDriver: false,
    reusePotential: true,
    reusePotentialScope: 'All patient-facing clients',
    timelinePeriod: 'Q2 2025 - Q1 2026',
    approvalTarget: 'Feb 2025',
    designCompletionTarget: 'Apr 2025',
    pilotRolloutTarget: 'Jul 2025',
    scaleUpTarget: 'Dec 2025',
    dependency1: 'Voice AI platform selection',
    dependency2: 'EHR patient portal integration',
    risk: 'Patient sentiment issues with AI',
    mitigation: 'Human escalation path and sentiment detection',
    status: 'submitted',
    submittedDate: '2024-12-10'
  }
];

// Generate L-Gate forms for each project
function generateLGateForms(projectId: string, currentGate: number): LGateForm[] {
  const gates: LGate[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  
  return gates.map((gate, idx) => {
    const def = lgateDefinitions[gate];
    let status: FormStatus = 'not_started';
    
    if (idx < currentGate) status = 'approved';
    else if (idx === currentGate) status = 'in_review';
    else if (idx === currentGate + 1) status = 'draft';
    
    return {
      projectId,
      gate,
      gateName: def.name,
      requirements: def.requirements.map((req, reqIdx) => ({
        id: `${projectId}-${gate}-${reqIdx}`,
        ...req,
        completed: idx < currentGate || (idx === currentGate && reqIdx < 2)
      })),
      status,
      submittedDate: idx <= currentGate ? '2024-12-01' : undefined,
      reviewedBy: idx < currentGate ? 'PMO Director' : undefined,
      reviewedDate: idx < currentGate ? '2024-12-05' : undefined
    };
  });
}

export const mockLGateForms: Record<string, LGateForm[]> = {
  'ACA-001': generateLGateForms('ACA-001', 3),
  'PAB-002': generateLGateForms('PAB-002', 2),
  'DDS-003': generateLGateForms('DDS-003', 3),
  'PFG-004': generateLGateForms('PFG-004', 1)
};

// Mock actions history
export const mockProjectActions: ProjectGateAction[] = [
  {
    id: 'act-1',
    projectId: 'ACA-001',
    date: '2024-11-22',
    gate: 'L0',
    actionType: 'Approval',
    decision: 'Approved',
    notes: 'Intake approved - strong business case with clear ROI',
    enteredBy: 'PMO Director'
  },
  {
    id: 'act-2',
    projectId: 'ACA-001',
    date: '2024-12-01',
    gate: 'L1',
    actionType: 'Approval',
    decision: 'Approved',
    notes: 'Design approved by Steerco',
    enteredBy: 'VP Engineering'
  },
  {
    id: 'act-3',
    projectId: 'ACA-001',
    date: '2024-12-10',
    gate: 'L2',
    actionType: 'Approval',
    decision: 'Approved',
    notes: 'Resources allocated from Coding AI Pod',
    enteredBy: 'Resource Manager'
  },
  {
    id: 'act-4',
    projectId: 'ACA-001',
    date: '2024-12-15',
    gate: 'L3',
    actionType: 'Submission',
    decision: 'Pending',
    notes: 'Design documents submitted for review',
    enteredBy: 'Project Lead'
  },
  {
    id: 'act-5',
    projectId: 'PAB-002',
    date: '2024-12-01',
    gate: 'L1',
    actionType: 'Comment',
    notes: 'Need additional payer integration details',
    enteredBy: 'Technical Architect'
  },
  {
    id: 'act-6',
    projectId: 'DDS-003',
    date: '2024-12-12',
    gate: 'L3',
    actionType: 'Submission',
    decision: 'Pending',
    notes: 'Requirements document pending legal review',
    enteredBy: 'Project Lead'
  }
];

// Helper function to get status color
export function getFormStatusColor(status: FormStatus): string {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    case 'in_review': return 'bg-blue-100 text-blue-700';
    case 'submitted': return 'bg-purple-100 text-purple-700';
    case 'draft': return 'bg-amber-100 text-amber-700';
    case 'not_started': return 'bg-slate-100 text-slate-500';
  }
}

export function getFormStatusLabel(status: FormStatus): string {
  switch (status) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'in_review': return 'In Review';
    case 'submitted': return 'Submitted';
    case 'draft': return 'Draft';
    case 'not_started': return 'Not Started';
  }
}
