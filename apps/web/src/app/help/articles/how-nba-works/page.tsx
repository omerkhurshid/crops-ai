'use client'
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
} from "../../../../components/ui/modern-card";
import { Badge } from "../../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  Brain,
  Zap,
  Target,
  Clock,
  Shield,
  TrendingUp,
  CloudRain,
  Bug,
  DollarSign,
  Droplets,
  CheckCircle,
} from "lucide-react";
export default function HowNBAWorksPage() {
  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-sage-700" />
            <span className="text-sage-600">AI Recommendations</span>
          </div>
          <h1 className="text-3xl font-bold text-sage-800 mb-4">
            How Your AI Farm Assistant Works (NBA Engine)
          </h1>
          <div className="flex items-center gap-4 text-sm text-sage-600">
            <Badge variant="outline">10 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>
        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-sage-700 leading-relaxed mb-4">
              NBA stands for "Next Best Action" - it's like having an
              experienced farm advisor who knows your fields, watches the
              weather 24/7, monitors your crops, and tells you exactly what
              needs attention today.
            </p>
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Benefit:</strong> Instead of wondering "What should
                I do today?", NBA gives you a prioritized list of actions that
                will have the biggest impact on your farm's success.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>
        {/* How NBA Works */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              How NBA Makes Decisions
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Every 15 minutes, our NBA engine analyzes dozens of factors
                about your farm to determine what actions will give you the best
                return on your time and investment:
              </p>
              <div className="space-y-4">
                <div className="bg-sage-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sage-800 mb-3">
                    1. Data Collection Phase
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sage-700 mb-2">
                        Real-Time Inputs
                      </h5>
                      <ul className="text-sm text-sage-600 space-y-1">
                        <li>• Current weather conditions</li>
                        <li>• 7-day weather forecast</li>
                        <li>• Satellite crop health data</li>
                        <li>• Soil moisture levels</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sage-700 mb-2">
                        Farm Context
                      </h5>
                      <ul className="text-sm text-sage-600 space-y-1">
                        <li>• Your crop types & growth stages</li>
                        <li>• Field-specific history</li>
                        <li>• Recent activities logged</li>
                        <li>• Financial constraints</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-earth-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-earth-800 mb-3">
                    2. Analysis Phase
                  </h4>
                  <p className="text-earth-700 mb-2">
                    Our AI models evaluate thousands of scenarios to identify:
                  </p>
                  <ul className="text-sm text-earth-600 space-y-1">
                    <li>
                      • Risk of crop stress or disease in the next 7-14 days
                    </li>
                    <li>• Optimal timing windows for field operations</li>
                    <li>• Cost-benefit analysis of each possible action</li>
                    <li>• Resource availability and constraints</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">
                    3. Recommendation Phase
                  </h4>
                  <p className="text-green-700">
                    NBA ranks all possible actions by their impact score and
                    presents the top priorities with clear, actionable
                    instructions.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Scoring System */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How Actions Are Scored and Prioritized
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Each potential action is scored on multiple factors:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sage-800">
                      Urgency Score (0-10)
                    </h4>
                    <p className="text-sage-700 text-sm">
                      How time-sensitive is this action? Missing the window
                      could mean significant losses.
                    </p>
                    <div className="mt-2 text-sm text-sage-600">
                      <span className="font-medium">Example:</span> "Spray
                      fungicide before rain" might score 9/10 if rain is coming
                      in 48 hours.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sage-800">
                      ROI Score (0-10)
                    </h4>
                    <p className="text-sage-700 text-sm">
                      Expected return on investment. Higher scores mean bigger
                      financial impact.
                    </p>
                    <div className="mt-2 text-sm text-sage-600">
                      <span className="font-medium">Example:</span> "Harvest
                      Field 3" might score 10/10 if crop is at peak value and
                      storms are forecast.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sage-800">
                      Feasibility Score (0-10)
                    </h4>
                    <p className="text-sage-700 text-sm">
                      How practical is this action given current conditions and
                      resources?
                    </p>
                    <div className="mt-2 text-sm text-sage-600">
                      <span className="font-medium">Example:</span> "Irrigate
                      Field 7" scores low if soil is already saturated.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-sage-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sage-800 mb-2">
                  Total Impact Score
                </h4>
                <p className="text-sage-700 text-sm mb-2">
                  Actions are ranked by their total score:
                </p>
                <code className="text-sm bg-white px-2 py-1 rounded">
                  Total Score = (Urgency × 3) + (ROI × 2) + (Feasibility × 1)
                </code>
                <p className="text-sage-600 text-sm mt-2">
                  This weighting ensures urgent actions appear first, followed
                  by high-value opportunities.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Types of Recommendations */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Types of Recommendations You'll See
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-sage-800">
                    Irrigation Decisions
                  </h4>
                </div>
                <ul className="text-sm text-sage-700 space-y-2">
                  <li>• "Irrigate Field 5 in next 2 days"</li>
                  <li>• "Skip irrigation - rain expected"</li>
                  <li>• "Check Field 3 for water stress"</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-sage-800">
                    Pest & Disease Management
                  </h4>
                </div>
                <ul className="text-sm text-sage-700 space-y-2">
                  <li>• "Scout for aphids in Field 2"</li>
                  <li>• "Apply fungicide before rain"</li>
                  <li>• "Disease risk high - inspect wheat"</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CloudRain className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-sage-800">
                    Weather-Based Actions
                  </h4>
                </div>
                <ul className="text-sm text-sage-700 space-y-2">
                  <li>• "Harvest window: Next 3 days"</li>
                  <li>• "Delay planting - soil too wet"</li>
                  <li>• "Frost warning - protect crops"</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-sage-800">
                    Growth & Nutrition
                  </h4>
                </div>
                <ul className="text-sm text-sage-700 space-y-2">
                  <li>• "Apply nitrogen to Field 8"</li>
                  <li>• "Growth stage: Ready for topdress"</li>
                  <li>• "Soil test recommended"</li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Confidence Levels */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Understanding Confidence Levels
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <p className="text-sage-700 mb-4">
              Each recommendation comes with a confidence level to help you
              decide when to rely on AI vs. your experience:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">
                    85-100% Confidence
                  </Badge>
                </div>
                <p className="text-sage-700 text-sm">
                  <strong>Very Reliable:</strong> Based on clear data patterns
                  and proven models. Follow these recommendations with
                  confidence.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800">
                    70-84% Confidence
                  </Badge>
                </div>
                <p className="text-sage-700 text-sm">
                  <strong>Generally Reliable:</strong> Good recommendations but
                  verify with field conditions. Your local knowledge may refine
                  the timing.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">
                    Below 70% Confidence
                  </Badge>
                </div>
                <p className="text-sage-700 text-sm">
                  <strong>Use Your Judgment:</strong> Limited data or unusual
                  conditions. These are suggestions to investigate, not firm
                  recommendations.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Tips for Success */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle>
              Tips for Getting the Most from NBA
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-sage-400">1.</span>
                <div>
                  <h4 className="font-semibold text-sage-800">
                    Log Your Actions
                  </h4>
                  <p className="text-sage-700 text-sm">
                    When you complete a recommended action, mark it done. NBA
                    learns from your patterns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sage-400">2.</span>
                <div>
                  <h4 className="font-semibold text-sage-800">
                    Provide Feedback
                  </h4>
                  <p className="text-sage-700 text-sm">
                    Use thumbs up/down on recommendations. This helps NBA
                    understand your specific preferences.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sage-400">3.</span>
                <div>
                  <h4 className="font-semibold text-sage-800">
                    Check Multiple Times Daily
                  </h4>
                  <p className="text-sage-700 text-sm">
                    Conditions change. Morning recommendations might differ from
                    afternoon ones.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sage-400">4.</span>
                <div>
                  <h4 className="font-semibold text-sage-800">
                    Customize Your Preferences
                  </h4>
                  <p className="text-sage-700 text-sm">
                    In Settings, adjust your risk tolerance and operational
                    constraints.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Final Note */}
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>Remember:</strong> NBA is your assistant, not your boss. It
            provides data-driven recommendations, but your experience and local
            knowledge are irreplaceable. Use NBA to save time and catch things
            you might miss, while trusting your farming instincts when something
            doesn't seem right.
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  );
}
