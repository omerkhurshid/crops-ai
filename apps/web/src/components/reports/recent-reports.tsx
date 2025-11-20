'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Eye, RefreshCw, Calendar } from 'lucide-react';
interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
}
interface RecentReportsProps {
  farmId: string;
}
export function RecentReports({ farmId }: RecentReportsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchReports();
  }, [farmId]);
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?farmId=${farmId}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  const downloadReport = (reportId: string) => {
  };
  const viewReport = (reportId: string) => {
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#F8FAF8] text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-[#F5F5F5] text-[#1A1A1A]';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'weather': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-[#F8FAF8] text-green-800';
      case 'financial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-[#F5F5F5] text-[#1A1A1A]';
    }
  };
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-[#F5F5F5] rounded w-2/3"></div>
              <div className="h-3 bg-[#F5F5F5] rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  if (reports.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No Reports Generated Yet</h3>
        <p className="text-[#555555]">
          Generate your first report using one of the options above. Reports will appear here for easy access and download.
        </p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-[#1A1A1A]">{report.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <span className="text-xs text-[#555555] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-[#555555]">{report.size}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewReport(report.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => downloadReport(report.id)}
                disabled={report.status !== 'completed'}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}