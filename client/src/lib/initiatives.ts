import initiativeData from './initiativeData.json';

export interface Milestone {
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: 'green' | 'yellow' | 'red';
  sourceId?: string;
}

export interface Initiative {
  id: string;
  name: string;
  valueStream: string;
  lGate: string;
  priorityCategory: 'Shipped' | 'Now' | 'Next' | 'Later' | 'New' | 'Kill' | 'Hold for clarification';
  priorityRank: number;
  budgetedCost: number;
  targetedBenefit: number;
  costCenter: string;
  milestones: Milestone[];
}

export const initiatives: Initiative[] = initiativeData as Initiative[];

export const getInitiativesByPriority = (category: string) => {
  return initiatives
    .filter(i => i.priorityCategory === category)
    .sort((a, b) => a.priorityRank - b.priorityRank);
};

export const getInitiativesByValueStream = (valueStream: string) => {
  return initiatives.filter(i => i.valueStream === valueStream);
};

export const getInitiativeById = (id: string) => {
  return initiatives.find(i => i.id === id);
};

export const getValueStreams = () => {
  const streams = new Set(initiatives.map(i => i.valueStream));
  return Array.from(streams).sort();
};

export const getPriorityCategories = () => {
  return ['Shipped', 'Now', 'Next', 'Later', 'New', 'Kill'];
};

export const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

export const getLGateProgress = (lgate: string) => {
  const gates = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  const index = gates.indexOf(lgate);
  return index >= 0 ? ((index + 1) / gates.length) * 100 : 0;
};

export interface GroupedInitiative {
  name: string;
  ids: string[];
  valueStream: string;
  lGate: string;
  priorityCategory: Initiative['priorityCategory'];
  priorityRank: number;
  budgetedCost: number;
  targetedBenefit: number;
  costCenter: string;
  milestones: Milestone[];
  subInitiatives: Initiative[];
}

export const getGroupedInitiatives = (): GroupedInitiative[] => {
  const grouped: Record<string, GroupedInitiative> = {};
  
  initiatives.forEach(init => {
    const key = `${init.name}__${init.valueStream}`;
    const milestonesWithSource = init.milestones.map(m => ({ ...m, sourceId: init.id }));
    if (!grouped[key]) {
      grouped[key] = {
        name: init.name,
        ids: [init.id],
        valueStream: init.valueStream,
        lGate: init.lGate,
        priorityCategory: init.priorityCategory,
        priorityRank: init.priorityRank,
        budgetedCost: init.budgetedCost,
        targetedBenefit: init.targetedBenefit,
        costCenter: init.costCenter,
        milestones: [...milestonesWithSource],
        subInitiatives: [init]
      };
    } else {
      grouped[key].ids.push(init.id);
      grouped[key].budgetedCost += init.budgetedCost;
      grouped[key].targetedBenefit += init.targetedBenefit;
      grouped[key].milestones.push(...milestonesWithSource);
      grouped[key].subInitiatives.push(init);
      if (init.priorityRank < grouped[key].priorityRank) {
        grouped[key].priorityRank = init.priorityRank;
        grouped[key].priorityCategory = init.priorityCategory;
        grouped[key].lGate = init.lGate;
      }
    }
  });
  
  return Object.values(grouped).sort((a, b) => a.priorityRank - b.priorityRank);
};

export const groupedInitiatives: GroupedInitiative[] = getGroupedInitiatives();

export const getGroupedInitiativeByName = (name: string, valueStream: string) => {
  return groupedInitiatives.find(g => g.name === name && g.valueStream === valueStream);
};

export const getGroupedInitiativeById = (id: string) => {
  return groupedInitiatives.find(g => g.ids.includes(id));
};
