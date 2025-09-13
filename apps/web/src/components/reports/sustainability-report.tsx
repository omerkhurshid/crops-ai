'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Leaf, Droplets, Download, RefreshCw, AlertTriangle, 
  Zap, Recycle, TreePine, Wind, Sun, Sprout,
  TrendingDown, TrendingUp, Target, Shield,
  Award, CheckCircle, AlertCircle
} from 'lucide-react';

interface SustainabilityData {
  overview: {
    sustainabilityScore: number;
    carbonFootprint: number;
    carbonReduction: number;
    waterEfficiency: number;
    soilHealth: number;
    biodiversityIndex: number;
    renewableEnergy: number;
    wasteReduction: number;
  };
  environmental: {
    waterUsage: {
      total: number;
      perAcre: number;
      efficiency: number;
      savings: number;
    };
    carbon: {
      emissions: number;
      sequestration: number;
      netEmissions: number;
      offsetTarget: number;
    };
    soil: {
      organicMatter: number;
      erosionRate: number;
      compaction: number;
      phBalance: number;
    };
  };
  practices: {
    implemented: Array<{
      name: string;
      category: string;
      impact: number;
      status: 'active' | 'planned' | 'completed';
      description: string;
    }>;
    recommendations: Array<{
      practice: string;
      potentialImpact: number;
      priority: 'high' | 'medium' | 'low';
      timeline: string;
    }>;
  };
  certifications: {
    current: Array<{ name: string; expiry: string; status: string }>;
    eligible: Array<{ name: string; requirements: string; benefit: string }>;
  };
  benchmarks: {
    regional: { score: number; rank: string };
    national: { score: number; percentile: number };
    industry: { score: number; rating: string };
  };
}

interface SustainabilityReportProps {
  farmId: string;
}

export function SustainabilityReport({ farmId }: SustainabilityReportProps) {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSustainabilityData();
  }, [farmId]);

  const fetchSustainabilityData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/sustainability?farmId=${farmId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setData(getMockSustainabilityData());
      }
    } catch (error) {
      console.error('Error fetching sustainability data:', error);
      setData(getMockSustainabilityData());
    } finally {
      setLoading(false);
    }
  };

  const getMockSustainabilityData = (): SustainabilityData => ({
    overview: {
      sustainabilityScore: 87.5,
      carbonFootprint: -12.3,
      carbonReduction: 18.7,
      waterEfficiency: 92.1,
      soilHealth: 84.2,
      biodiversityIndex: 78.9,
      renewableEnergy: 45.3,
      wasteReduction: 76.8
    },
    environmental: {
      waterUsage: {
        total: 125000,
        perAcre: 1180,
        efficiency: 92.1,
        savings: 15600
      },
      carbon: {
        emissions: 45.2,
        sequestration: 67.8,
        netEmissions: -22.6,
        offsetTarget: 30.0
      },
      soil: {
        organicMatter: 4.8,
        erosionRate: 0.3,
        compaction: 15.2,
        phBalance: 6.7
      }
    },
    practices: {
      implemented: [
        { name: 'Cover Cropping', category: 'Soil Health', impact: 85, status: 'active', description: 'Year-round soil cover with nitrogen-fixing legumes' },
        { name: 'Precision Irrigation', category: 'Water Conservation', impact: 78, status: 'active', description: 'Smart irrigation system with soil moisture sensors' },
        { name: 'Integrated Pest Management', category: 'Chemical Reduction', impact: 72, status: 'active', description: 'Biological pest control reducing pesticide use by 45%' },
        { name: 'No-Till Farming', category: 'Carbon Sequestration', impact: 89, status: 'active', description: 'Minimal soil disturbance preserving soil structure' },
        { name: 'Crop Rotation', category: 'Biodiversity', impact: 68, status: 'active', description: '4-year rotation cycle enhancing soil nutrients' },
        { name: 'Solar Energy System', category: 'Renewable Energy', impact: 65, status: 'completed', description: '50kW solar array powering farm operations' }
      ],
      recommendations: [
        { practice: 'Agroforestry Integration', potentialImpact: 92, priority: 'high', timeline: '6-12 months' },
        { practice: 'Biogas Production', potentialImpact: 78, priority: 'medium', timeline: '12-18 months' },
        { practice: 'Pollinator Habitat Creation', potentialImpact: 71, priority: 'medium', timeline: '3-6 months' },
        { practice: 'Composting System', potentialImpact: 65, priority: 'low', timeline: '6-9 months' }
      ]
    },
    certifications: {
      current: [
        { name: 'USDA Organic', expiry: '2025-08-15', status: 'Active' },
        { name: 'Carbon Trust Standard', expiry: '2024-12-31', status: 'Renewal Needed' }
      ],
      eligible: [
        { name: 'Regenerative Organic Certified', requirements: 'Enhanced soil health practices', benefit: 'Premium pricing +15%' },
        { name: 'Rainforest Alliance', requirements: 'Biodiversity conservation', benefit: 'Market access expansion' }
      ]
    },
    benchmarks: {
      regional: { score: 87.5, rank: 'Top 15%' },
      national: { score: 87.5, percentile: 88 },
      industry: { score: 87.5, rating: 'Excellent' }
    }
  });

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          type: 'sustainability',
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sustainability-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Unable to load sustainability data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Sustainability Assessment Report</h3>
          <p className="text-sm text-gray-600">Environmental impact analysis and sustainable farming practices evaluation</p>
        </div>
        <Button onClick={generateReport} disabled={generating} size="sm">
          {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {generating ? 'Generating...' : 'Download Report'}
        </Button>
      </div>

      {/* Overall Sustainability Score */}
      <div className={`p-6 rounded-lg border-2 ${getScoreBg(data.overview.sustainabilityScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold ${getScoreColor(data.overview.sustainabilityScore)}">
              {data.overview.sustainabilityScore.toFixed(1)}/100
            </h4>
            <p className="text-sm text-gray-600">Overall Sustainability Score</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{data.benchmarks.industry.rating}</span>
              <span className="text-sm text-gray-500">• {data.benchmarks.regional.rank} regionally</span>
            </div>
          </div>
          <div className="text-right">
            <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Certified Sustainable</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-600">{data.overview.waterEfficiency.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">Water Efficiency</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <TreePine className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">{data.overview.carbonReduction.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">Carbon Reduction</p>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
          <Sprout className="h-6 w-6 text-amber-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-amber-600">{data.overview.soilHealth.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">Soil Health</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <Sun className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-600">{data.overview.renewableEnergy.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">Renewable Energy</p>
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
          <TabsTrigger value="practices">Practices</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Water Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Usage:</span>
                    <span className="font-semibold">{data.environmental.waterUsage.total.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Per Acre:</span>
                    <span className="font-semibold">{data.environmental.waterUsage.perAcre.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Efficiency:</span>
                    <span className="font-semibold text-green-600">{data.environmental.waterUsage.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Savings:</span>
                    <span className="font-semibold text-blue-600">{data.environmental.waterUsage.savings.toLocaleString()} L</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <Wind className="h-5 w-5" />
                  Carbon Footprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Emissions:</span>
                    <span className="font-semibold text-red-600">{data.environmental.carbon.emissions} tCO₂</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sequestration:</span>
                    <span className="font-semibold text-green-600">{data.environmental.carbon.sequestration} tCO₂</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Impact:</span>
                    <span className="font-semibold text-green-600">{data.environmental.carbon.netEmissions} tCO₂</span>
                  </div>
                  <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                    Carbon negative! Exceeding offset target by {Math.abs(data.environmental.carbon.netEmissions + data.environmental.carbon.offsetTarget).toFixed(1)} tCO₂
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Soil Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Organic Matter:</span>
                    <span className="font-semibold">{data.environmental.soil.organicMatter.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Erosion Rate:</span>
                    <span className="font-semibold text-green-600">{data.environmental.soil.erosionRate} t/ha/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Compaction:</span>
                    <span className="font-semibold">{data.environmental.soil.compaction.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">pH Balance:</span>
                    <span className="font-semibold">{data.environmental.soil.phBalance.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Implemented Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.practices?.implemented || []).map((practice, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{practice.name}</span>
                          <div className="text-sm text-gray-600">{practice.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{practice.impact}%</div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{practice.description}</p>
                      <Progress value={practice.impact} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.practices?.recommendations || []).map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{rec.practice}</span>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Potential Impact: {rec.potentialImpact}%</span>
                        <span>Timeline: {rec.timeline}</span>
                      </div>
                      <Progress value={rec.potentialImpact} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Current Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.certifications?.current || []).map((cert, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{cert.name}</span>
                        <div className="text-sm text-gray-600">Expires: {cert.expiry}</div>
                      </div>
                      <Badge className={cert.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {cert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Eligible Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.certifications?.eligible || []).map((cert, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{cert.name}</span>
                      <div className="text-sm text-gray-600 mt-1">
                        Requirements: {cert.requirements}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Benefit: {cert.benefit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Regional Ranking</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data.benchmarks.regional.rank}
                  </div>
                  <p className="text-sm text-gray-600">Among regional farms</p>
                  <div className="mt-4 text-lg font-semibold">
                    Score: {data.benchmarks.regional.score}/100
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">National Percentile</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data.benchmarks.national.percentile}th
                  </div>
                  <p className="text-sm text-gray-600">Percentile nationally</p>
                  <div className="mt-4 text-lg font-semibold">
                    Score: {data.benchmarks.national.score}/100
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Industry Rating</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {data.benchmarks.industry.rating}
                  </div>
                  <p className="text-sm text-gray-600">Industry classification</p>
                  <div className="mt-4 text-lg font-semibold">
                    Score: {data.benchmarks.industry.score}/100
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Sustainability Summary:</strong> Your farm demonstrates exceptional commitment to sustainable practices, 
                ranking in the top 15% regionally and 88th percentile nationally. The implementation of cover cropping, 
                precision irrigation, and no-till farming has resulted in carbon-negative operations while maintaining 
                high productivity levels.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}