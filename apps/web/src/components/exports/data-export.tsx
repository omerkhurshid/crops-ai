'use client'

import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Download, FileText, FileSpreadsheet, FileImage, Calendar,
  Filter, Settings, CheckCircle2, AlertCircle, Clock,
  BarChart3, TrendingUp, DollarSign, Activity
} from 'lucide-react'

interface ExportFormat {
  id: string
  label: string
  description: string
  extension: string
  icon: React.ReactNode
  mimeType: string
  supportsCharts?: boolean
  fileSize?: string
}

interface ExportOptions {
  format: string
  dateRange?: {
    start: string
    end: string
  }
  includeCharts?: boolean
  includeMetadata?: boolean
  includeRawData?: boolean
  filters?: string[]
}

interface DataExportProps {
  dataType: 'financial' | 'health' | 'weather' | 'farms' | 'reports'
  data: any[]
  title: string
  onExport?: (options: ExportOptions) => Promise<void>
  customFormats?: ExportFormat[]
  className?: string
}

const defaultFormats: ExportFormat[] = [
  {
    id: 'xlsx',
    label: 'Excel Spreadsheet',
    description: 'Comprehensive data with charts and formatting',
    extension: 'xlsx',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    supportsCharts: true,
    fileSize: '2-5 MB'
  },
  {
    id: 'csv',
    label: 'CSV File',
    description: 'Raw data for analysis and import into other tools',
    extension: 'csv',
    icon: <FileText className="h-5 w-5" />,
    mimeType: 'text/csv',
    supportsCharts: false,
    fileSize: '500 KB - 2 MB'
  },
  {
    id: 'pdf',
    label: 'PDF Report',
    description: 'Professional report with charts and summaries',
    extension: 'pdf',
    icon: <FileText className="h-5 w-5" />,
    mimeType: 'application/pdf',
    supportsCharts: true,
    fileSize: '1-3 MB'
  },
  {
    id: 'json',
    label: 'JSON Data',
    description: 'Structured data for developers and APIs',
    extension: 'json',
    icon: <FileText className="h-5 w-5" />,
    mimeType: 'application/json',
    supportsCharts: false,
    fileSize: '100-500 KB'
  }
]

export function DataExport({
  dataType,
  data,
  title,
  onExport,
  customFormats = [],
  className = ""
}: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(defaultFormats[0])
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: defaultFormats[0].id,
    includeCharts: true,
    includeMetadata: true,
    includeRawData: true,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    }
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const formats = [...defaultFormats, ...customFormats]

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format)
    setExportOptions(prev => ({
      ...prev,
      format: format.id,
      includeCharts: format.supportsCharts ? prev.includeCharts : false
    }))
  }

  const handleExport = async () => {
    if (!onExport) {
      // Default export implementation
      await downloadData()
      return
    }

    setIsExporting(true)
    setExportStatus('idle')

    try {
      await onExport(exportOptions)
      setExportStatus('success')
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadData = async () => {
    // Default implementation for client-side export
    setIsExporting(true)
    
    try {
      let content: string
      let filename: string
      let mimeType: string

      switch (selectedFormat.id) {
        case 'csv':
          content = convertToCSV(data)
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
          mimeType = selectedFormat.mimeType
          break
        case 'json':
          content = JSON.stringify({
            title,
            exportDate: new Date().toISOString(),
            dataType,
            options: exportOptions,
            data
          }, null, 2)
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
          mimeType = selectedFormat.mimeType
          break
        default:
          throw new Error(`Format ${selectedFormat.id} requires server-side processing`)
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const getDataTypeIcon = () => {
    switch (dataType) {
      case 'financial': return <DollarSign className="h-5 w-5" />
      case 'health': return <Activity className="h-5 w-5" />
      case 'weather': return <BarChart3 className="h-5 w-5" />
      case 'reports': return <TrendingUp className="h-5 w-5" />
      default: return <Download className="h-5 w-5" />
    }
  }

  return (
    <div className={className}>
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            {getDataTypeIcon()}
            Export {title}
            <Badge variant="secondary">{data.length} records</Badge>
          </ModernCardTitle>
          <ModernCardDescription>
            Export your data in various formats for analysis, reporting, or backup
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="p-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-sage-800 mb-3">Export Format</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatSelect(format)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedFormat.id === format.id
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-sage-200 hover:border-sage-300 hover:bg-sage-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${selectedFormat.id === format.id ? 'text-sage-600' : 'text-sage-500'}`}>
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sage-800 text-sm">{format.label}</div>
                        <div className="text-xs text-sage-600 mt-1">{format.description}</div>
                        {format.fileSize && (
                          <div className="text-xs text-sage-500 mt-1">~{format.fileSize}</div>
                        )}
                      </div>
                      {selectedFormat.id === format.id && (
                        <CheckCircle2 className="h-4 w-4 text-sage-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-sm font-medium text-sage-800 mb-3">Export Options</h3>
              <div className="space-y-3">
                {/* Date Range */}
                <div>
                  <label className="text-sm text-sage-700 mb-2 block">Date Range</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={exportOptions.dateRange?.start || ''}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange!, start: e.target.value }
                      }))}
                      className="flex-1 p-2 border border-sage-200 rounded-lg text-sm focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                    <span className="text-sage-500">to</span>
                    <input
                      type="date"
                      value={exportOptions.dateRange?.end || ''}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange!, end: e.target.value }
                      }))}
                      className="flex-1 p-2 border border-sage-200 rounded-lg text-sm focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Include Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 border border-sage-200 rounded-lg hover:bg-sage-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked
                      }))}
                      className="rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-sage-800">Include Metadata</div>
                      <div className="text-xs text-sage-600">Export date, filters, etc.</div>
                    </div>
                  </label>

                  {selectedFormat.supportsCharts && (
                    <label className="flex items-center gap-2 p-3 border border-sage-200 rounded-lg hover:bg-sage-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeCharts: e.target.checked
                        }))}
                        className="rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-sage-800">Include Charts</div>
                        <div className="text-xs text-sage-600">Graphs and visualizations</div>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center gap-2 p-3 border border-sage-200 rounded-lg hover:bg-sage-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRawData}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeRawData: e.target.checked
                      }))}
                      className="rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-sage-800">Include Raw Data</div>
                      <div className="text-xs text-sage-600">Detailed records and values</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Status */}
            {exportStatus !== 'idle' && (
              <div className="mt-4">
                {exportStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Export completed successfully! Your file should download automatically.
                    </AlertDescription>
                  </Alert>
                )}
                {exportStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Export failed. Please try again or contact support if the problem persists.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Export Button */}
            <div className="flex items-center justify-between pt-4 border-t border-sage-200">
              <div className="text-sm text-sage-600">
                Ready to export {data.length} records as {selectedFormat.label.toLowerCase()}
              </div>
              <InlineFloatingButton
                icon={isExporting ? <Clock className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                label={isExporting ? 'Exporting...' : 'Export Data'}
                variant="primary"
                showLabel={true}
                disabled={isExporting || data.length === 0}
                onClick={handleExport}
              />
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}

// Hook for easy export functionality
export function useDataExport() {
  const exportData = async (
    data: any[],
    filename: string,
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ): Promise<void> => {
    let content: string
    let mimeType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        content = convertArrayToCSV(data)
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'json':
        content = JSON.stringify(data, null, 2)
        mimeType = 'application/json'
        fileExtension = 'json'
        break
      default:
        throw new Error(`Format ${format} not supported in client-side export`)
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { exportData }
}

function convertArrayToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}