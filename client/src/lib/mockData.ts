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
  history: { date: string; value: number }[];
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
    id: 'ACA-001',
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
      { 
        label: 'Autonomous Coding Rate', 
        value: '42%', 
        target: '60%', 
        trend: 'up',
        history: [
          { date: 'W1', value: 15 },
          { date: 'W2', value: 18 },
          { date: 'W3', value: 22 },
          { date: 'W4', value: 25 },
          { date: 'W5', value: 28 },
          { date: 'W6', value: 32 },
          { date: 'W7', value: 38 },
          { date: 'W8', value: 42 }
        ]
      },
      { 
        label: 'Coding Accuracy', 
        value: '96.5%', 
        target: '95.0%', 
        trend: 'up',
        history: [
          { date: 'W1', value: 88.0 },
          { date: 'W2', value: 89.5 },
          { date: 'W3', value: 91.0 },
          { date: 'W4', value: 92.5 },
          { date: 'W5', value: 94.0 },
          { date: 'W6', value: 95.2 },
          { date: 'W7', value: 96.0 },
          { date: 'W8', value: 96.5 }
        ]
      }
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
    id: 'PAB-002',
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
      { 
        label: 'Touchless Auth Rate', 
        value: '28%', 
        target: '45%', 
        trend: 'up',
        history: [
          { date: 'W1', value: 5 },
          { date: 'W2', value: 8 },
          { date: 'W3', value: 12 },
          { date: 'W4', value: 15 },
          { date: 'W5', value: 18 },
          { date: 'W6', value: 22 },
          { date: 'W7', value: 25 },
          { date: 'W8', value: 28 }
        ]
      },
      { 
        label: 'Auth Turnaround (Hrs)', 
        value: '4.5', 
        target: '2.0', 
        trend: 'down',
        history: [
          { date: 'W1', value: 24.0 },
          { date: 'W2', value: 18.5 },
          { date: 'W3', value: 12.0 },
          { date: 'W4', value: 8.5 },
          { date: 'W5', value: 6.0 },
          { date: 'W6', value: 5.2 },
          { date: 'W7', value: 4.8 },
          { date: 'W8', value: 4.5 }
        ]
      }
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
    id: 'DDS-003',
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
      { 
        label: 'Appeal Success Rate', 
        value: '64%', 
        target: '55%', 
        trend: 'up',
        history: [
          { date: 'W1', value: 45 },
          { date: 'W2', value: 48 },
          { date: 'W3', value: 52 },
          { date: 'W4', value: 50 },
          { date: 'W5', value: 55 },
          { date: 'W6', value: 58 },
          { date: 'W7', value: 61 },
          { date: 'W8', value: 64 }
        ]
      },
      { 
        label: 'Recovery Yield ($M)', 
        value: '2.1', 
        target: '3.5', 
        trend: 'neutral',
        history: [
          { date: 'W1', value: 0.5 },
          { date: 'W2', value: 0.8 },
          { date: 'W3', value: 1.1 },
          { date: 'W4', value: 1.3 },
          { date: 'W5', value: 1.5 },
          { date: 'W6', value: 1.8 },
          { date: 'W7', value: 1.9 },
          { date: 'W8', value: 2.1 }
        ]
      }
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
    id: 'PFG-004',
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
      { 
        label: 'Call Deflection', 
        value: '15%', 
        target: '40%', 
        trend: 'neutral',
        history: [
          { date: 'W1', value: 5 },
          { date: 'W2', value: 8 },
          { date: 'W3', value: 12 },
          { date: 'W4', value: 11 },
          { date: 'W5', value: 13 },
          { date: 'W6', value: 14 },
          { date: 'W7', value: 15 },
          { date: 'W8', value: 15 }
        ]
      },
      { 
        label: 'Patient CSAT', 
        value: '3.8', 
        target: '4.5', 
        trend: 'down',
        history: [
          { date: 'W1', value: 4.2 },
          { date: 'W2', value: 4.1 },
          { date: 'W3', value: 4.0 },
          { date: 'W4', value: 4.0 },
          { date: 'W5', value: 3.9 },
          { date: 'W6', value: 3.9 },
          { date: 'W7', value: 3.8 },
          { date: 'W8', value: 3.8 }
        ]
      }
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
