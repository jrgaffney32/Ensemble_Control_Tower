export interface Milestone {
  id: string;
  title: string;
  plannedDate: string;
  actualDate?: string;
  status: 'completed' | 'delayed' | 'on-track' | 'pending';
}

export interface KPI {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  target: string;
}

export interface Financials {
  budget: number;
  actualCost: number;
  projectedBenefit: number;
  actualBenefit: number;
  currency: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  valueStream: string; // e.g., "Supply Chain", "Customer Experience"
  owner: string;
  
  // Status (Red, Yellow, Green)
  status: {
    cost: 'red' | 'yellow' | 'green';
    benefit: 'red' | 'yellow' | 'green';
    timeline: 'red' | 'yellow' | 'green';
    scope: 'red' | 'yellow' | 'green';
  };

  kpis: KPI[];
  milestones: Milestone[];
  financials: Financials;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Global ERP Migration',
    description: 'Consolidating 4 legacy ERP systems into a single cloud instance to unify financial reporting.',
    valueStream: 'Enterprise Infrastructure',
    owner: 'Sarah Jenkins',
    status: {
      cost: 'yellow',
      benefit: 'green',
      timeline: 'red',
      scope: 'green'
    },
    kpis: [
      { label: 'Report Gen Time', value: '4 hrs', target: '< 30 mins', trend: 'down' },
      { label: 'System Uptime', value: '99.9%', target: '99.99%', trend: 'up' }
    ],
    milestones: [
      { id: 'm1', title: 'Requirements Gathered', plannedDate: '2024-01-15', actualDate: '2024-01-20', status: 'completed' },
      { id: 'm2', title: 'Vendor Selection', plannedDate: '2024-03-01', actualDate: '2024-03-01', status: 'completed' },
      { id: 'm3', title: 'Architecture Review', plannedDate: '2024-05-15', actualDate: '2024-06-01', status: 'completed' },
      { id: 'm4', title: 'Data Migration Phase 1', plannedDate: '2024-08-01', status: 'delayed' },
      { id: 'm5', title: 'UAT Testing', plannedDate: '2024-11-01', status: 'pending' },
      { id: 'm6', title: 'Go Live (NA)', plannedDate: '2025-01-01', status: 'pending' },
    ],
    financials: {
      budget: 5000000,
      actualCost: 2800000,
      projectedBenefit: 12000000,
      actualBenefit: 0,
      currency: 'USD'
    }
  },
  {
    id: '2',
    name: 'Customer 360 Platform',
    description: 'Implementing a unified customer data platform to drive personalized marketing and support.',
    valueStream: 'Customer Experience',
    owner: 'Michael Chen',
    status: {
      cost: 'green',
      benefit: 'green',
      timeline: 'green',
      scope: 'yellow'
    },
    kpis: [
      { label: 'Customer Retention', value: '88%', target: '92%', trend: 'up' },
      { label: 'CAC Reduction', value: '12%', target: '15%', trend: 'up' }
    ],
    milestones: [
      { id: 'm1', title: 'Platform Setup', plannedDate: '2024-02-01', actualDate: '2024-01-28', status: 'completed' },
      { id: 'm2', title: 'Data Ingestion', plannedDate: '2024-04-01', actualDate: '2024-04-05', status: 'completed' },
      { id: 'm3', title: 'Identity Resolution', plannedDate: '2024-06-15', status: 'on-track' },
      { id: 'm4', title: 'Marketing Integration', plannedDate: '2024-09-01', status: 'on-track' },
      { id: 'm5', title: 'Support Dashboard', plannedDate: '2024-10-15', status: 'pending' }
    ],
    financials: {
      budget: 1500000,
      actualCost: 650000,
      projectedBenefit: 4500000,
      actualBenefit: 800000,
      currency: 'USD'
    }
  },
  {
    id: '3',
    name: 'Supply Chain AI Optimization',
    description: 'Deploying predictive models to optimize inventory levels and reduce logistics costs.',
    valueStream: 'Supply Chain',
    owner: 'Priya Patel',
    status: {
      cost: 'red',
      benefit: 'yellow',
      timeline: 'yellow',
      scope: 'red'
    },
    kpis: [
      { label: 'Inventory Turns', value: '4.2', target: '6.0', trend: 'neutral' },
      { label: 'Stockout Rate', value: '3.5%', target: '1.0%', trend: 'down' }
    ],
    milestones: [
      { id: 'm1', title: 'Model Training', plannedDate: '2024-03-01', actualDate: '2024-04-15', status: 'completed' },
      { id: 'm2', title: 'Pilot: Region A', plannedDate: '2024-06-01', status: 'delayed' },
      { id: 'm3', title: 'Pilot Evaluation', plannedDate: '2024-08-01', status: 'pending' },
      { id: 'm4', title: 'Full Rollout', plannedDate: '2025-01-01', status: 'pending' }
    ],
    financials: {
      budget: 800000,
      actualCost: 950000,
      projectedBenefit: 3000000,
      actualBenefit: 200000,
      currency: 'USD'
    }
  }
];
