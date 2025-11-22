'use client'
import { useState, useRef } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Droplets, 
  Sprout,
  Bug,
  Mic,
  MapPin,
  ArrowLeft,
  Upload
} from 'lucide-react'
import Link from 'next/link'
export default function FieldCheckPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setCapturedImage(imageData)
      // Stop camera stream
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
      // Simulate AI analysis
      analyzeImage(imageData)
    }
  }
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }
  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Mock analysis results
    const mockAnalysis = {
      confidence: 92,
      condition: 'Healthy Growth',
      issues: [],
      recommendations: [
        'Crops are developing well',
        'Consider side-dressing with nitrogen in 1-2 weeks',
        'Monitor for pest pressure in warm weather'
      ],
      pestRisk: 'Low',
      diseaseRisk: 'Low',
      nutritionStatus: 'Good'
    }
    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }
  const retakePhoto = () => {
    setCapturedImage(null)
    setAnalysis(null)
    startCamera()
  }
  const quickActions = [
    { icon: Droplets, label: 'Watered', color: 'bg-blue-500' },
    { icon: Sprout, label: 'Fertilized', color: 'bg-[#8FBF7F]' },
    { icon: Bug, label: 'Sprayed', color: 'bg-red-500' },
    { icon: CheckCircle, label: 'Harvested', color: 'bg-amber-500' }
  ]
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F5F5F5] p-4 flex items-center gap-4 z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Field Check</h1>
            <div className="flex items-center gap-2 text-sm text-[#555555]">
              <MapPin className="h-3 w-3" />
              <span>North Field • Corn</span>
            </div>
          </div>
        </div>
        {/* Camera/Photo Section */}
        <div className="p-4">
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="bg-black rounded-2xl overflow-hidden aspect-[4/3] relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedMetadata={startCamera}
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Camera overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white/30 rounded-lg w-64 h-48"></div>
                </div>
              </div>
              {/* Camera Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-[#7A8F78] hover:bg-[#5E6F5A] rounded-full w-16 h-16 p-0"
                >
                  <Camera className="h-8 w-8" />
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg" 
                  className="rounded-full w-16 h-16 p-0"
                >
                  <Upload className="h-6 w-6" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-center text-[#555555]">
                Point camera at your crops for instant AI analysis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Captured Photo */}
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Field photo" 
                  className="w-full rounded-2xl"
                />
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="absolute top-4 right-4"
                >
                  Retake
                </Button>
              </div>
              {/* Analysis Results */}
              {isAnalyzing ? (
                <div className="bg-[#FAFAF7] rounded-xl p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78] mx-auto mb-4"></div>
                  <p className="text-[#555555]">Analyzing your crops...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {/* Confidence Score */}
                  <div className="bg-[#F8FAF8] rounded-xl p-4 border border-[#DDE4D8]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#7A8F78]">Analysis Complete</span>
                      <Badge variant="outline" className="bg-[#F8FAF8] text-[#7A8F78]">
                        {analysis.confidence}% confident
                      </Badge>
                    </div>
                    <p className="text-[#7A8F78] font-medium">{analysis.condition}</p>
                  </div>
                  {/* Risk Assessment */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <Bug className="h-5 w-5 mx-auto mb-1 text-[#555555]" />
                      <p className="text-xs text-[#555555]">Pest Risk</p>
                      <p className="font-semibold text-sm text-[#7A8F78]">{analysis.pestRisk}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-[#555555]" />
                      <p className="text-xs text-[#555555]">Disease Risk</p>
                      <p className="font-semibold text-sm text-[#7A8F78]">{analysis.diseaseRisk}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <Sprout className="h-5 w-5 mx-auto mb-1 text-[#555555]" />
                      <p className="text-xs text-[#555555]">Nutrition</p>
                      <p className="font-semibold text-sm text-[#7A8F78]">{analysis.nutritionStatus}</p>
                    </div>
                  </div>
                  {/* Recommendations */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Recommendations:</h3>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
        {/* Quick Action Logging */}
        <div className="border-t border-[#F5F5F5] p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Log Field Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col gap-2 hover:bg-[#FAFAF7]"
                onClick={() => {
                  // Log activity to database
                }}
              >
                <action.icon className={`h-6 w-6 text-white rounded-full p-1 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
        {/* Voice Notes */}
        <div className="border-t border-[#F5F5F5] p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Voice Notes</h3>
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500' : 'text-[#555555]'}`} />
            {isRecording ? 'Stop Recording' : 'Record Voice Note'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}