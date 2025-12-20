import { useState, useMemo } from "react";
import { groupedInitiatives, formatCurrency, type GroupedInitiative } from "@/lib/initiatives";
import { ChevronDown, ChevronRight, Building2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";

interface CostCenterData {
  name: string;
  totalFTEs: number;
  targetReduction: number;
  inYearReduction: number;
  fullRunRateReduction: number;
  initiatives: GroupedInitiative[];
}

const generateMockFTEData = (initiative: GroupedInitiative) => {
  const hash = initiative.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return {
    inYear: Math.round((hash % 30 + 5) / 10) / 10,
    fullRunRate: Math.round((hash % 50 + 10) / 10) / 10,
  };
};

export default function CostCenterBreakout() {
  const [expandedCostCenters, setExpandedCostCenters] = useState<Record<string, boolean>>({});

  const toggleCostCenter = (cc: string) => {
    setExpandedCostCenters(prev => ({ ...prev, [cc]: !prev[cc] }));
  };

  const costCenterData = useMemo(() => {
    const ccMap: Record<string, CostCenterData> = {};
    
    groupedInitiatives.forEach(init => {
      const cc = init.costCenter || 'Unassigned';
      if (!ccMap[cc]) {
        const hash = cc.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        ccMap[cc] = {
          name: cc,
          totalFTEs: 50 + (hash % 150),
          targetReduction: 5 + (hash % 20),
          inYearReduction: 0,
          fullRunRateReduction: 0,
          initiatives: [],
        };
      }
      const fteData = generateMockFTEData(init);
      ccMap[cc].inYearReduction += fteData.inYear;
      ccMap[cc].fullRunRateReduction += fteData.fullRunRate;
      ccMap[cc].initiatives.push(init);
    });

    return Object.values(ccMap).sort((a, b) => b.totalFTEs - a.totalFTEs);
  }, []);

  const totals = useMemo(() => {
    return costCenterData.reduce((acc, cc) => ({
      totalFTEs: acc.totalFTEs + cc.totalFTEs,
      targetReduction: acc.targetReduction + cc.targetReduction,
      inYearReduction: acc.inYearReduction + cc.inYearReduction,
      fullRunRateReduction: acc.fullRunRateReduction + cc.fullRunRateReduction,
    }), { totalFTEs: 0, targetReduction: 0, inYearReduction: 0, fullRunRateReduction: 0 });
  }, [costCenterData]);

  return (
    <AppLayout title="Cost Center Breakout">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Illustrative Data</Badge>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Total FTEs</p>
                <p className="text-3xl font-bold font-mono text-slate-700">{totals.totalFTEs.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">across all cost centers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Target Reduction</p>
                <p className="text-3xl font-bold font-mono text-[#2d8a6e]">{totals.targetReduction.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">FTEs to reduce</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">In-Year Impact</p>
                <p className="text-3xl font-bold font-mono text-[#2d4a7c]">{totals.inYearReduction.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">FTEs from initiatives</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Full Run Rate</p>
                <p className="text-3xl font-bold font-mono text-purple-600">{totals.fullRunRateReduction.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">FTEs at steady state</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Cost Center FTE Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costCenterData.map(cc => {
                const isExpanded = expandedCostCenters[cc.name];
                const inYearProgress = Math.min((cc.inYearReduction / cc.targetReduction) * 100, 100);
                const fullRunRateProgress = Math.min((cc.fullRunRateReduction / cc.targetReduction) * 100, 100);
                
                return (
                  <div key={cc.name} className="border rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleCostCenter(cc.name)}
                      data-testid={`row-cost-center-${cc.name}`}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <div>
                          <p className="font-semibold text-slate-700">{cc.name}</p>
                          <p className="text-xs text-slate-500">{cc.initiatives.length} initiatives</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Total FTEs</p>
                          <p className="text-lg font-mono font-bold">{cc.totalFTEs}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Target</p>
                          <p className="text-lg font-mono font-bold text-[#2d8a6e]">-{cc.targetReduction.toFixed(1)}</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-xs text-slate-500 uppercase font-semibold">In-Year</p>
                          <p className="text-lg font-mono font-bold text-[#2d4a7c]">-{cc.inYearReduction.toFixed(1)}</p>
                          <Progress value={inYearProgress} className="h-1 mt-1" />
                        </div>
                        <div className="text-right w-24">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Run Rate</p>
                          <p className="text-lg font-mono font-bold text-purple-600">-{cc.fullRunRateReduction.toFixed(1)}</p>
                          <Progress value={fullRunRateProgress} className="h-1 mt-1" />
                        </div>
                        <div className="w-20 text-center">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Gap</p>
                          {cc.fullRunRateReduction >= cc.targetReduction ? (
                            <Badge className="bg-[#e8f5f0] text-[#2d8a6e] border-0 text-xs">On Track</Badge>
                          ) : (
                            <p className="text-sm font-mono font-bold text-[#c45850]">-{(cc.targetReduction - cc.fullRunRateReduction).toFixed(1)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t bg-white">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50/50">
                              <th className="text-left py-2 px-4 font-semibold text-slate-600">Initiative</th>
                              <th className="text-left py-2 px-4 font-semibold text-slate-600">Value Stream</th>
                              <th className="text-center py-2 px-4 font-semibold text-slate-600">L-Gate</th>
                              <th className="text-right py-2 px-4 font-semibold text-slate-600">In-Year FTE</th>
                              <th className="text-right py-2 px-4 font-semibold text-slate-600">Run Rate FTE</th>
                              <th className="text-right py-2 px-4 font-semibold text-slate-600">Budget</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cc.initiatives.map(init => {
                              const fteData = generateMockFTEData(init);
                              return (
                                <tr key={init.ids[0]} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-4">
                                    <Link href={`/project/${init.ids[0]}`}>
                                      <span className="text-[#2d4a7c] hover:underline cursor-pointer flex items-center gap-1">
                                        {init.name}
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                    </Link>
                                  </td>
                                  <td className="py-2 px-4 text-slate-600">{init.valueStream}</td>
                                  <td className="py-2 px-4 text-center">
                                    <Badge variant="outline" className="text-xs">{init.lGate}</Badge>
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono text-[#2d4a7c]">-{fteData.inYear.toFixed(1)}</td>
                                  <td className="py-2 px-4 text-right font-mono text-purple-600">-{fteData.fullRunRate.toFixed(1)}</td>
                                  <td className="py-2 px-4 text-right font-mono">{formatCurrency(init.budgetedCost)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
