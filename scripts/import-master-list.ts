import XLSX from 'xlsx';
import { db } from '../server/db';
import { initiatives, capabilities, inquiries, inquiryResponses, issues, requests, milestones, fteSnapshots, initiativeKpis, podPerformance, gateForms, initiativeStatuses } from '../shared/schema';

async function importMasterList() {
  const workbook = XLSX.readFile('attached_assets/replit_upload_1766950623637.xlsx');
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet);
  
  // Collect unique initiatives
  const initiativeMap = new Map<string, {
    name: string;
    valueStream: string;
    lGate: string;
    priorityCategory: string;
    fundingLane: string;
  }>();
  
  const capabilitiesList: any[] = [];
  
  for (const row of data as any[]) {
    const initiativeName = row['Initiative name'] || '';
    const initiativeId = initiativeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    if (initiativeName && !initiativeMap.has(initiativeId)) {
      const priorityCalc = row['Now/Next/Later Calculated'] || 'New';
      let priorityCategory = 'New';
      if (priorityCalc === 'Now') priorityCategory = 'Now';
      else if (priorityCalc === 'Next') priorityCategory = 'Next';
      else if (priorityCalc === 'Later') priorityCategory = 'Later';
      else if (priorityCalc === 'Kill') priorityCategory = 'Later';
      else if (priorityCalc === 'Need Timeframe') priorityCategory = 'New';
      
      initiativeMap.set(initiativeId, {
        name: initiativeName,
        valueStream: row['Value Stream'] || 'Platform',
        lGate: row['Initiative LGate'] || 'L0',
        priorityCategory,
        fundingLane: row['Funding Lane'] || 'Strategic',
      });
    }
    
    // Create capability
    const capabilityId = row['Capability reference #'] || `cap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const capabilityName = row['Capability Name'] || '';
    const capabilityStatus = row['Capability status Aha'] || '';
    
    // Map Aha status to health status
    let healthStatus = 'green';
    if (capabilityStatus === 'At Risk' || capabilityStatus === 'Blocked') healthStatus = 'red';
    else if (capabilityStatus === 'Validating') healthStatus = 'yellow';
    
    // Map status to approval status
    let approvalStatus = 'draft';
    if (capabilityStatus === 'Shipped') approvalStatus = 'approved';
    else if (capabilityStatus === 'Validating' || capabilityStatus === 'Building') approvalStatus = 'submitted';
    
    // Parse dates
    let startDate = null;
    let endDate = null;
    if (row['Capability start date']) {
      startDate = new Date(row['Capability start date']);
    }
    if (row['Capability end date']) {
      endDate = new Date(row['Capability end date']);
    }
    
    // Map size to effort
    let estimatedEffort = 5;
    const size = row['Size'] || '';
    if (size === 'XL' || size === 'Extra Large') estimatedEffort = 13;
    else if (size === 'Large') estimatedEffort = 8;
    else if (size === 'Medium') estimatedEffort = 5;
    else if (size === 'Small') estimatedEffort = 3;
    
    if (capabilityName) {
      capabilitiesList.push({
        id: capabilityId,
        initiativeId,
        name: capabilityName,
        healthStatus,
        approvalStatus,
        startDate,
        endDate,
        estimatedEffort,
      });
    }
  }
  
  console.log('Clearing existing data...');
  await db.delete(inquiryResponses);
  await db.delete(inquiries);
  await db.delete(issues);
  await db.delete(requests);
  await db.delete(capabilities);
  await db.delete(milestones);
  await db.delete(fteSnapshots);
  await db.delete(initiativeKpis);
  await db.delete(podPerformance);
  await db.delete(gateForms);
  await db.delete(initiativeStatuses);
  await db.delete(initiatives);
  
  console.log('Inserting initiatives...');
  const initiativesData = Array.from(initiativeMap.entries()).map(([id, init], index) => ({
    id,
    name: init.name,
    valueStream: init.valueStream,
    lGate: init.lGate,
    priorityCategory: init.priorityCategory as any,
    priorityRank: index + 1,
    budgetedCost: 0,
    targetedBenefit: 0,
    costCenter: init.fundingLane,
  }));
  
  for (const init of initiativesData) {
    await db.insert(initiatives).values(init).onConflictDoNothing();
  }
  
  console.log('Inserting capabilities...');
  for (const cap of capabilitiesList) {
    await db.insert(capabilities).values(cap).onConflictDoNothing();
  }
  
  console.log(`Import complete: ${initiativesData.length} initiatives, ${capabilitiesList.length} capabilities`);
}

importMasterList().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
