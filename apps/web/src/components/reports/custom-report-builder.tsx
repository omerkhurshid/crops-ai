'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { DatePicker } from '../ui/date-picker';
import { 
  Settings, Download, RefreshCw, Calendar, BarChart3, FileText,
  Plus, X, Copy, Eye, Filter, Layers, Target,
  PieChart, LineChart, TrendingUp, Database, Clock
} from 'lucide-react';
interface MetricOption {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  available: boolean;
}
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  format: string;
  schedule: string;
}
interface CustomReportConfig {
  name: string;
  description: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: string;
  };
  metrics: string[];
  format: string;
  groupBy: string;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  schedule: {
    enabled: boolean;
    frequency: string;
    time: string;
  };
}
interface CustomReportBuilderProps {
  farmId: string;
}
export function CustomReportBuilder({ farmId }: CustomReportBuilderProps) {
  const [config, setConfig] = useState<CustomReportConfig>({
    name: '',
    description: '',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      end: new Date(),
      preset: 'last-3-months'
    },
    metrics: [],
    format: 'pdf',
    groupBy: 'month',
    filters: [],
    schedule: {
      enabled: false,
      frequency: 'monthly',
      time: '08:00'
    }
  });
  const [availableMetrics, setAvailableMetrics] = useState<MetricOption[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [building, setBuilding] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  useEffect(() => {
    loadAvailableMetrics();
    loadTemplates();
  }, [farmId]);
  const loadAvailableMetrics = () => {
    const metrics: MetricOption[] = [
      // Financial Metrics
      { id: 'revenue', name: 'Total Revenue', category: 'Financial', description: 'Total income from all sources', unit: 'USD', available: true },
      { id: 'expenses', name: 'Total Expenses', category: 'Financial', description: 'All operational costs', unit: 'USD', available: true },
      { id: 'profit', name: 'Net Profit', category: 'Financial', description: 'Revenue minus expenses', unit: 'USD', available: true },
      { id: 'profit-margin', name: 'Profit Margin', category: 'Financial', description: 'Profit as percentage of revenue', unit: '%', available: true },
      { id: 'cost-per-acre', name: 'Cost per Acre', category: 'Financial', description: 'Average cost per cultivated acre', unit: 'USD/acre', available: true },
      // Production Metrics
      { id: 'yield', name: 'Crop Yield', category: 'Production', description: 'Total harvest quantity', unit: 'tonnes', available: true },
      { id: 'yield-per-acre', name: 'Yield per Acre', category: 'Production', description: 'Average yield per cultivated acre', unit: 'tonnes/acre', available: true },
      { id: 'quality-score', name: 'Crop Quality Score', category: 'Production', description: 'Overall quality assessment', unit: 'score', available: true },
      { id: 'harvest-efficiency', name: 'Harvest Efficiency', category: 'Production', description: 'Percentage of potential yield achieved', unit: '%', available: true },
      // Environmental Metrics
      { id: 'water-usage', name: 'Water Usage', category: 'Environmental', description: 'Total water consumption', unit: 'liters', available: true },
      { id: 'carbon-footprint', name: 'Carbon Footprint', category: 'Environmental', description: 'CO2 equivalent emissions', unit: 'tCO2e', available: true },
      { id: 'soil-health', name: 'Soil Health Index', category: 'Environmental', description: 'Composite soil health score', unit: 'index', available: true },
      { id: 'pesticide-usage', name: 'Pesticide Usage', category: 'Environmental', description: 'Total pesticide application', unit: 'kg', available: true },
      { id: 'biodiversity-index', name: 'Biodiversity Index', category: 'Environmental', description: 'Farm biodiversity assessment', unit: 'index', available: true },
      // Health Metrics
      { id: 'ndvi-avg', name: 'Average NDVI', category: 'Crop Health', description: 'Normalized Difference Vegetation Index', unit: 'index', available: true },
      { id: 'stress-events', name: 'Stress Events', category: 'Crop Health', description: 'Number of crop stress incidents', unit: 'count', available: true },
      { id: 'disease-incidents', name: 'Disease Incidents', category: 'Crop Health', description: 'Recorded disease occurrences', unit: 'count', available: true },
      { id: 'recovery-rate', name: 'Recovery Rate', category: 'Crop Health', description: 'Crop recovery from stress events', unit: '%', available: true },
      // Weather Metrics
      { id: 'rainfall', name: 'Total Rainfall', category: 'Weather', description: 'Precipitation received', unit: 'mm', available: true },
      { id: 'temperature-avg', name: 'Average Temperature', category: 'Weather', description: 'Mean temperature', unit: '°C', available: true },
      { id: 'extreme-events', name: 'Extreme Weather Events', category: 'Weather', description: 'Severe weather occurrences', unit: 'count', available: true }
    ];
    setAvailableMetrics(metrics);
  };
  const loadTemplates = () => {
    const templates: ReportTemplate[] = [
      {
        id: 'financial-summary',
        name: 'Financial Summary',
        description: 'Comprehensive financial performance overview',
        metrics: ['revenue', 'expenses', 'profit', 'profit-margin', 'cost-per-acre'],
        format: 'pdf',
        schedule: 'monthly'
      },
      {
        id: 'production-report',
        name: 'Production Report',
        description: 'Crop yield and quality analysis',
        metrics: ['yield', 'yield-per-acre', 'quality-score', 'harvest-efficiency'],
        format: 'excel',
        schedule: 'seasonal'
      },
      {
        id: 'sustainability-dashboard',
        name: 'Sustainability Dashboard',
        description: 'Environmental impact and sustainability metrics',
        metrics: ['water-usage', 'carbon-footprint', 'soil-health', 'biodiversity-index'],
        format: 'pdf',
        schedule: 'quarterly'
      },
      {
        id: 'health-monitoring',
        name: 'Crop Health Monitoring',
        description: 'Plant health and stress analysis',
        metrics: ['ndvi-avg', 'stress-events', 'disease-incidents', 'recovery-rate'],
        format: 'pdf',
        schedule: 'weekly'
      }
    ];
    setTemplates(templates);
  };
  const applyTemplate = (template: ReportTemplate) => {
    setConfig({
      ...config,
      name: template.name,
      description: template.description,
      metrics: template.metrics,
      format: template.format
    });
    setActiveStep(2);
  };
  const toggleMetric = (metricId: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };
  const addFilter = () => {
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: 'equals', value: '' }]
    }));
  };
  const removeFilter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };
  const updateFilter = (index: number, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };
  const previewReport = async () => {
    setPreviewing(true);
    try {
      const response = await fetch('/api/reports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          config
        })
      });
      if (response.ok) {
        const data = await response.json();
      }
    } catch (error) {
      console.error('Error previewing report:', error);
    } finally {
      setPreviewing(false);
    }
  };
  const buildReport = async () => {
    setBuilding(true);
    try {
      const response = await fetch('/api/reports/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          config
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `custom-report-${config.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${config.format}`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error building report:', error);
    } finally {
      setBuilding(false);
    }
  };
  const getMetricsByCategory = (category: string) => {
    return availableMetrics.filter(m => m.category === category);
  };
  const renderStepIndicator = () => (
    <div className="flex items-center space-x-4 mb-6">
      {[1, 2, 3, 4].map(step => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= activeStep ? 'bg-blue-600 text-white' : 'bg-[#F5F5F5] text-[#555555]'
          }`}>
            {step}
          </div>
          <div className={`ml-2 text-sm ${step <= activeStep ? 'text-[#7A8F78] font-medium' : 'text-[#555555]'}`}>
            {step === 1 ? 'Template' : step === 2 ? 'Metrics' : step === 3 ? 'Settings' : 'Review'}
          </div>
          {step < 4 && <div className="ml-4 w-8 h-px bg-gray-300" />}
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Custom Report Builder</h3>
          <p className="text-sm text-[#555555]">Create personalized reports with your choice of metrics and formats</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={previewReport} disabled={previewing || config.metrics.length === 0} variant="outline" size="sm">
            {previewing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Preview
          </Button>
          <Button onClick={buildReport} disabled={building || config.metrics.length === 0} size="sm">
            {building ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {building ? 'Building...' : 'Build Report'}
          </Button>
        </div>
      </div>
      {/* Step Indicator */}
      {renderStepIndicator()}
      {/* Step Content */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Choose a Template or Start from Scratch
              </CardTitle>
              <CardDescription>
                Select a pre-built template to get started quickly, or create your own custom configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors" onClick={() => applyTemplate(template)}>
                    <h4 className="font-semibold mb-2">{template.name}</h4>
                    <p className="text-sm text-[#555555] mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs text-[#555555]">
                      <span>{template.metrics.length} metrics</span>
                      <span>•</span>
                      <span>{template.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{template.schedule}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Button onClick={() => setActiveStep(2)} variant="outline">
                  Start from Scratch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {activeStep === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Select Metrics
              </CardTitle>
              <CardDescription>
                Choose the data points you want to include in your report. You can select multiple metrics from different categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Financial', 'Production', 'Environmental', 'Crop Health', 'Weather'].map(category => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 text-gray-900">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getMetricsByCategory(category).map(metric => (
                        <div key={metric.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-[#FAFAF7]">
                          <Checkbox 
                            checked={config.metrics.includes(metric.id)}
                            onCheckedChange={() => toggleMetric(metric.id)}
                            disabled={!metric.available}
                          />
                          <div className="flex-1">
                            <Label className={`font-medium ${!metric.available ? 'text-[#555555]' : ''}`}>
                              {metric.name}
                            </Label>
                            <p className={`text-sm ${!metric.available ? 'text-[#555555]' : 'text-[#555555]'}`}>
                              {metric.description}
                            </p>
                            <div className="text-xs text-[#555555] mt-1">
                              Unit: {metric.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={() => setActiveStep(1)} variant="outline">
                  Back
                </Button>
                <Button onClick={() => setActiveStep(3)} disabled={config.metrics.length === 0}>
                  Next: Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {activeStep === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>
                Configure your report settings including date range, format, and filters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input 
                    id="report-name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Report"
                  />
                </div>
                <div>
                  <Label htmlFor="report-format">Export Format</Label>
                  <Select value={config.format} onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="report-description">Description (Optional)</Label>
                <Input 
                  id="report-description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this report"
                />
              </div>
              {/* Date Range */}
              <div>
                <Label>Date Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-sm text-[#555555]">Start Date</Label>
                    <DatePicker 
                      date={config.dateRange.start}
                      onDateChange={(date) => setConfig(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: date }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-[#555555]">End Date</Label>
                    <DatePicker 
                      date={config.dateRange.end}
                      onDateChange={(date) => setConfig(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: date }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-[#555555]">Preset</Label>
                    <Select value={config.dateRange.preset} onValueChange={(value) => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, preset: value } }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                        <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {/* Group By */}
              <div>
                <Label>Group Data By</Label>
                <Select value={config.groupBy} onValueChange={(value) => setConfig(prev => ({ ...prev, groupBy: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Filters */}
              <div>
                <div className="flex justify-between items-center">
                  <Label>Filters</Label>
                  <Button onClick={addFilter} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {config.filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">Crop Type</SelectItem>
                          <SelectItem value="field">Field</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button onClick={() => removeFilter(index)} size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={() => setActiveStep(2)} variant="outline">
                  Back
                </Button>
                <Button onClick={() => setActiveStep(4)}>
                  Next: Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {activeStep === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Review & Generate
              </CardTitle>
              <CardDescription>
                Review your report configuration before generating.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Summary */}
              <div className="p-4 bg-[#FAFAF7] rounded-lg">
                <h4 className="font-semibold mb-2">{config.name || 'Untitled Report'}</h4>
                {config.description && (
                  <p className="text-sm text-[#555555] mb-3">{config.description}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#555555]">Metrics:</span>
                    <span className="ml-2 font-medium">{config.metrics.length} selected</span>
                  </div>
                  <div>
                    <span className="text-[#555555]">Format:</span>
                    <span className="ml-2 font-medium">{config.format.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[#555555]">Group by:</span>
                    <span className="ml-2 font-medium">{config.groupBy}</span>
                  </div>
                  <div>
                    <span className="text-[#555555]">Filters:</span>
                    <span className="ml-2 font-medium">{config.filters.length} applied</span>
                  </div>
                </div>
              </div>
              {/* Selected Metrics */}
              <div>
                <h4 className="font-semibold mb-3">Selected Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  {config.metrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId);
                    return metric ? (
                      <Badge key={metricId} variant="secondary">
                        {metric.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
              {/* Date Range */}
              <div>
                <h4 className="font-semibold mb-2">Date Range</h4>
                <p className="text-sm text-[#555555]">
                  {config.dateRange.start?.toLocaleDateString()} to {config.dateRange.end?.toLocaleDateString()}
                </p>
              </div>
              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button onClick={() => setActiveStep(3)} variant="outline">
                  Back to Settings
                </Button>
                <div className="flex gap-2">
                  <Button onClick={previewReport} disabled={previewing} variant="outline">
                    {previewing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                    Preview
                  </Button>
                  <Button onClick={buildReport} disabled={building}>
                    {building ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}