import { cn } from "@/lib/utils";

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
  valueStream: string; // e.g., "Patient Access", "Coding", "Claims"
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
    name: 'Autonomous Coding Agent',
    description: 'Deploying LLM-based agents to autonomously code ED and Radiology encounters, reducing reliance on outsourced vendors.',
    valueStream: 'Mid-Cycle / Coding',
    owner: 'Dr. Elena Rostova',
    status: {
      cost: 'green',
      benefit: 'green',
      timeline: 'yellow',
      scope: 'green'
    },
    kpis: [
      { label: 'Autonomous Coding Rate', value: '42%', target: '60%', trend: 'up' },
      { label: 'Coding Accuracy', value: '96.5%', target: '95.0%', trend: 'up' }
    ],
    milestones: [
      { id: 'm1', title: 'Model Fine-Tuning (ICD-10)', plannedDate: '2024-01-15', actualDate: '2024-01-20', status: 'completed' },
      { id: 'm2', title: 'EMR Integration (Epic)', plannedDate: '2024-03-01', actualDate: '2024-03-01', status: 'completed' },
      { id: 'm3', title: 'Shadow Mode Validation', plannedDate: '2024-05-15', actualDate: '2024-06-01', status: 'completed' },
      { id: 'm4', title: 'Go-Live: Radiology', plannedDate: '2024-08-01', status: 'on-track' },
      { id: 'm5', title: 'Go-Live: ED', plannedDate: '2024-11-01', status: 'pending' }
    ],
    financials: {
      budget: 2500000,
      actualCost: 1200000,
      projectedBenefit: 8500000,
      actualBenefit: 150000,
      currency: 'USD'
    }
  },
  {
    id: '2',
    name: 'Prior Auth "Concierge" Bot',
    description: 'Agentic workflow to scrape payer portals, verify clinical guidelines, and submit prior authorization requests automatically.',
    valueStream: 'Pre-Service / Access',
    owner: 'Marcus Thorne',
    status: {
      cost: 'yellow',
      benefit: 'green',
      timeline: 'red',
      scope: 'yellow'
    },
    kpis: [
      { label: 'Touchless Auth Rate', value: '28%', target: '45%', trend: 'up' },
      { label: 'Auth Turnaround', value: '4.5 hrs', target: '2.0 hrs', trend: 'down' }
    ],
    milestones: [
      { id: 'm1', title: 'Payer Policy Ingestion', plannedDate: '2024-02-01', actualDate: '2024-01-28', status: 'completed' },
      { id: 'm2', title: 'Portal Scraping Agents', plannedDate: '2024-04-01', actualDate: '2024-04-20', status: 'completed' },
      { id: 'm3', title: 'Clinical NLP Engine', plannedDate: '2024-06-15', status: 'delayed' },
      { id: 'm4', title: 'Pilot: Oncology', plannedDate: '2024-09-01', status: 'pending' },
      { id: 'm5', title: 'Full Rollout', plannedDate: '2024-12-01', status: 'pending' }
    ],
    financials: {
      budget: 1800000,
      actualCost: 1100000,
      projectedBenefit: 6200000,
      actualBenefit: 0,
      currency: 'USD'
    }
  },
  {
    id: '3',
    name: 'Denial Defense Swarm',
    description: 'Multi-agent system that analyzes denial root causes, generates appeal letters, and predicts recovery likelihood.',
    valueStream: 'Back-Office / Claims',
    owner: 'Sarah Jenkins',
    status: {
      cost: 'green',
      benefit: 'yellow',
      timeline: 'green',
      scope: 'green'
    },
    kpis: [
      { label: 'Appeal Success Rate', value: '64%', target: '55%', trend: 'up' },
      { label: 'Recovery Yield', value: '$2.1M', target: '$3.5M', trend: 'neutral' }
    ],
    milestones: [
      { id: 'm1', title: 'Historical Data Analysis', plannedDate: '2024-03-01', actualDate: '2024-03-01', status: 'completed' },
      { id: 'm2', title: 'Appeal Gen (LLM)', plannedDate: '2024-05-01', actualDate: '2024-04-25', status: 'completed' },
      { id: 'm3', title: 'Payer API Connect', plannedDate: '2024-07-01', status: 'on-track' },
      { id: 'm4', title: 'Automated Resubmission', plannedDate: '2024-10-01', status: 'pending' }
    ],
    financials: {
      budget: 950000,
      actualCost: 450000,
      projectedBenefit: 12000000,
      actualBenefit: 2100000,
      currency: 'USD'
    }
  },
  {
    id: '4',
    name: 'Patient Financial Guide',
    description: 'Conversational AI voice and chat agent to handle patient billing questions, payment plans, and estimation explanation.',
    valueStream: 'Patient Experience',
    owner: 'David Kim',
    status: {
      cost: 'red',
      benefit: 'red',
      timeline: 'yellow',
      scope: 'red'
    },
    kpis: [
      { label: 'Call Deflection', value: '15%', target: '40%', trend: 'neutral' },
      { label: 'Patient CSAT', value: '3.8/5', target: '4.5/5', trend: 'down' }
    ],
    milestones: [
      { id: 'm1', title: 'Voice Synthesis Config', plannedDate: '2024-04-01', actualDate: '2024-04-15', status: 'completed' },
      { id: 'm2', title: 'Knowledge Base Setup', plannedDate: '2024-06-01', status: 'delayed' },
      { id: 'm3', title: 'Sentiment Analysis', plannedDate: '2024-08-15', status: 'pending' },
      { id: 'm4', title: 'Beta Launch', plannedDate: '2024-11-01', status: 'pending' }
    ],
    financials: {
      budget: 1200000,
      actualCost: 900000,
      projectedBenefit: 3000000,
      actualBenefit: 0,
      currency: 'USD'
    }
  }
];
