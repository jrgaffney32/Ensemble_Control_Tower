import { initiatives, type Initiative } from './initiatives';

export type PriorityCategory = 'shipped' | 'now' | 'next' | 'later' | 'new' | 'kill';

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
  budgetedCost: number;
  targetedBenefit: number;
  costCenter: string;
  milestones: Initiative['milestones'];
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

function mapPriorityCategory(cat: string): PriorityCategory {
  const normalized = cat.toLowerCase().trim();
  if (normalized === 'shipped') return 'shipped';
  if (normalized === 'now') return 'now';
  if (normalized === 'next') return 'next';
  if (normalized === 'later') return 'later';
  if (normalized === 'new') return 'new';
  if (normalized === 'kill') return 'kill';
  return 'later';
}

export const mockPriorityItems: PriorityItem[] = initiatives.map(init => ({
  id: init.id,
  name: init.name,
  type: 'initiative' as const,
  valueStream: init.valueStream,
  priorityCategory: mapPriorityCategory(init.priorityCategory),
  rankWithinCategory: init.priorityRank,
  stageGate: init.lGate,
  description: `${init.name} - ${init.valueStream}`,
  owner: 'Clinical Value Stream',
  budgetedCost: init.budgetedCost,
  targetedBenefit: init.targetedBenefit,
  costCenter: init.costCenter,
  milestones: init.milestones
}));

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
    case 'new': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'kill': return 'bg-red-100 text-red-700 border-red-200';
  }
}

export function getCategoryLabel(category: PriorityCategory): string {
  if (category === 'kill') return 'Kill';
  if (category === 'new') return 'New';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}
