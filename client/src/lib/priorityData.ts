export type PriorityCategory = 'shipped' | 'now' | 'next' | 'later';

export interface PriorityItem {
  id: string;
  name: string;
  type: 'initiative' | 'capability';
  valueStream: string;
  priorityCategory: PriorityCategory;
  rankWithinCategory: number;
  stageGate: string;
  description: string;
  owner: string;
  targetDate?: string;
}

export interface ReprioritizationRequest {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'initiative' | 'capability';
  requestType: 'reprioritize' | 'kill';
  currentCategory: PriorityCategory;
  currentRank: number;
  targetCategory?: 'next' | 'later';
  targetRank?: number;
  justification: string;
  requestor: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockPriorityItems: PriorityItem[] = [
  // Shipped
  {
    id: 'ACA-001',
    name: 'Autonomous Coding Agent',
    type: 'initiative',
    valueStream: 'Mid-Cycle / Coding',
    priorityCategory: 'now',
    rankWithinCategory: 1,
    stageGate: 'L4',
    description: 'LLM-based agents for autonomous ED and Radiology coding',
    owner: 'Clinical Value Stream',
    targetDate: '2024-08-01'
  },
  {
    id: 'PAB-002',
    name: 'Prior Auth Concierge Bot',
    type: 'initiative',
    valueStream: 'Pre-Service / Access',
    priorityCategory: 'now',
    rankWithinCategory: 2,
    stageGate: 'L3',
    description: 'Agentic workflow for prior authorization automation',
    owner: 'Clinical Value Stream',
    targetDate: '2024-09-01'
  },
  {
    id: 'DDS-003',
    name: 'Denial Defense Swarm',
    type: 'initiative',
    valueStream: 'Back-Office / Claims',
    priorityCategory: 'now',
    rankWithinCategory: 3,
    stageGate: 'L3',
    description: 'Multi-agent denial analysis and appeal generation',
    owner: 'Clinical Value Stream',
    targetDate: '2024-10-01'
  },
  {
    id: 'PFG-004',
    name: 'Patient Financial Guide',
    type: 'initiative',
    valueStream: 'Patient Experience',
    priorityCategory: 'next',
    rankWithinCategory: 1,
    stageGate: 'L2',
    description: 'Conversational AI for patient billing and payment plans',
    owner: 'Clinical Value Stream',
    targetDate: '2024-11-01'
  },
  {
    id: 'CAP-001',
    name: 'Real-time Eligibility Verification',
    type: 'capability',
    valueStream: 'Pre-Service / Access',
    priorityCategory: 'next',
    rankWithinCategory: 2,
    stageGate: 'L1',
    description: 'Automated insurance eligibility checks during scheduling',
    owner: 'Clinical Value Stream',
    targetDate: '2025-Q1'
  },
  {
    id: 'CAP-002',
    name: 'Claims Reconciliation Agent',
    type: 'capability',
    valueStream: 'Back-Office / Claims',
    priorityCategory: 'next',
    rankWithinCategory: 3,
    stageGate: 'L0',
    description: 'Automated reconciliation between Epic and payer remittance',
    owner: 'Clinical Value Stream',
    targetDate: '2025-Q1'
  },
  {
    id: 'CAP-003',
    name: 'Payment Posting Automation',
    type: 'capability',
    valueStream: 'Back-Office / Claims',
    priorityCategory: 'later',
    rankWithinCategory: 1,
    stageGate: 'L0',
    description: 'ERA/EOB payment posting with exception handling',
    owner: 'Clinical Value Stream',
    targetDate: '2025-Q2'
  },
  {
    id: 'CAP-004',
    name: 'Charge Capture Assistant',
    type: 'capability',
    valueStream: 'Mid-Cycle / Coding',
    priorityCategory: 'later',
    rankWithinCategory: 2,
    stageGate: 'L0',
    description: 'AI-assisted charge capture for missed revenue',
    owner: 'Clinical Value Stream',
    targetDate: '2025-Q2'
  },
  {
    id: 'CAP-005',
    name: 'Payer Contract Analyzer',
    type: 'capability',
    valueStream: 'Back-Office / Claims',
    priorityCategory: 'later',
    rankWithinCategory: 3,
    stageGate: 'Ideation',
    description: 'NLP-based contract term extraction and compliance monitoring',
    owner: 'Clinical Value Stream',
    targetDate: '2025-Q3'
  },
  {
    id: 'INI-005',
    name: 'Clinical Documentation Improvement Bot',
    type: 'initiative',
    valueStream: 'Mid-Cycle / Coding',
    priorityCategory: 'shipped',
    rankWithinCategory: 1,
    stageGate: 'L6',
    description: 'AI-driven CDI queries for improved documentation accuracy',
    owner: 'Clinical Value Stream'
  },
  {
    id: 'INI-006',
    name: 'Scheduling Optimization Agent',
    type: 'initiative',
    valueStream: 'Pre-Service / Access',
    priorityCategory: 'shipped',
    rankWithinCategory: 2,
    stageGate: 'L6',
    description: 'Intelligent scheduling to optimize provider utilization',
    owner: 'Clinical Value Stream'
  }
];

export const mockReprioritizationRequests: ReprioritizationRequest[] = [
  {
    id: 'RPR-001',
    itemId: 'CAP-003',
    itemName: 'Payment Posting Automation',
    itemType: 'capability',
    requestType: 'reprioritize',
    currentCategory: 'later',
    currentRank: 1,
    targetCategory: 'next',
    targetRank: 2,
    justification: 'Cash flow issues require faster payment posting. Manual process causing 5-day delays.',
    requestor: 'Lisa Martinez',
    requestDate: '2024-12-10',
    status: 'pending'
  },
  {
    id: 'RPR-002',
    itemId: 'CAP-005',
    itemName: 'Payer Contract Analyzer',
    itemType: 'capability',
    requestType: 'kill',
    currentCategory: 'later',
    currentRank: 3,
    justification: 'Vendor solution identified that meets 90% of requirements at lower cost.',
    requestor: 'Robert Kim',
    requestDate: '2024-12-08',
    status: 'pending'
  }
];

export function getCategoryColor(category: PriorityCategory): string {
  switch (category) {
    case 'shipped': return 'bg-green-100 text-green-700 border-green-200';
    case 'now': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'next': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'later': return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getCategoryLabel(category: PriorityCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
