# Crops.AI Beta Testing Guide

Complete guide for setting up and managing the beta testing program for Crops.AI.

## Beta Testing Overview

### Objectives
- **Validate core features** with real agricultural use cases
- **Gather user feedback** on functionality and usability
- **Identify bugs and performance issues** in production environment
- **Test scalability** with multiple concurrent users
- **Validate data accuracy** for weather and satellite features

### Target Beta Users
- **Small-scale farmers** (1-100 acres)
- **Farm managers** and agricultural consultants
- **Agricultural students** and researchers
- **Tech-savvy early adopters** in farming

## Beta Program Setup

### Phase 1: Limited Beta (10-15 users)
**Duration**: 2-3 weeks
**Focus**: Core functionality and critical bug identification

#### User Selection Criteria
- Agricultural background or experience
- Willingness to provide detailed feedback
- Access to farmland for testing GPS/mapping features
- Tech comfort level (can navigate web apps)

#### Features to Test
- [ ] User registration and authentication
- [ ] Farm creation and management
- [ ] Field mapping and boundaries
- [ ] Weather data accuracy and relevance
- [ ] Satellite imagery and NDVI analysis
- [ ] Mobile app sync (if available)

### Phase 2: Extended Beta (25-50 users)
**Duration**: 4-6 weeks
**Focus**: Scalability, advanced features, and user experience

#### Additional Features
- [ ] AI-powered recommendations
- [ ] Historical data analysis
- [ ] Multi-user farm collaboration
- [ ] Export and reporting features
- [ ] Integration with existing farm management tools

## User Onboarding Process

### 1. Beta Invitation System

Create beta invite codes in the database:

```sql
-- Create beta_invites table
CREATE TABLE beta_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  created_by UUID REFERENCES users(id)
);

-- Generate invite codes
INSERT INTO beta_invites (email, invite_code) VALUES
('farmer1@example.com', 'BETA-FARM-001'),
('farmer2@example.com', 'BETA-FARM-002'),
-- Add more invite codes as needed
```

### 2. Beta Registration Flow

Update the registration page to require invite codes:

```typescript
// apps/web/src/app/register/page.tsx
const BetaRegistration = () => {
  const [inviteCode, setInviteCode] = useState('')
  
  const validateInvite = async (code: string) => {
    const response = await fetch('/api/auth/validate-invite', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: code })
    })
    return response.ok
  }
  
  // Registration form with invite code validation
}
```

### 3. Welcome Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Crops.AI Beta</title>
</head>
<body>
    <h1>Welcome to Crops.AI Beta Program!</h1>
    
    <p>Hi {{userName}},</p>
    
    <p>Thank you for joining our beta testing program. You're among the first to experience the future of agricultural technology.</p>
    
    <h2>Getting Started</h2>
    <ol>
        <li><strong>Login</strong>: <a href="{{appUrl}}">{{appUrl}}</a></li>
        <li><strong>Create your first farm</strong>: Add your farm location and basic details</li>
        <li><strong>Map your fields</strong>: Use our GPS tools to define field boundaries</li>
        <li><strong>Explore weather data</strong>: Check current and forecast weather for your location</li>
        <li><strong>View satellite imagery</strong>: Analyze crop health with NDVI data</li>
    </ol>
    
    <h2>Beta Testing Focus Areas</h2>
    <ul>
        <li>Accuracy of weather data for your location</li>
        <li>Ease of field mapping and boundary definition</li>
        <li>Relevance of satellite crop health data</li>
        <li>Mobile app functionality (if testing mobile)</li>
        <li>Overall user experience and navigation</li>
    </ul>
    
    <h2>Providing Feedback</h2>
    <p>We value your input! Please share feedback through:</p>
    <ul>
        <li><strong>In-app feedback</strong>: Click the feedback button in the app</li>
        <li><strong>Email</strong>: <a href="mailto:beta@crops.ai">beta@crops.ai</a></li>
        <li><strong>Weekly survey</strong>: We'll send a short survey each week</li>
    </ul>
    
    <h2>Support</h2>
    <p>Need help? Contact our beta support team:</p>
    <ul>
        <li>Email: <a href="mailto:support@crops.ai">support@crops.ai</a></li>
        <li>Response time: Within 24 hours</li>
    </ul>
    
    <h2>Known Limitations</h2>
    <ul>
        <li>Satellite data may be 1-2 days old</li>
        <li>Weather forecasts limited to 7 days</li>
        <li>Mobile app in early testing phase</li>
        <li>Some features may be slow during peak testing</li>
    </ul>
    
    <p>Happy farming!</p>
    <p>The Crops.AI Team</p>
</body>
</html>
```

## Feedback Collection System

### 1. In-App Feedback Widget

```typescript
// apps/web/src/components/FeedbackWidget.tsx
import { useState } from 'react'

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(5)
  
  const submitFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback,
        rating,
        page: window.location.pathname,
        userAgent: navigator.userAgent
      })
    })
    
    setIsOpen(false)
    setFeedback('')
    // Show success message
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          💬 Feedback
        </button>
      )}
      
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-xl w-80">
          <h3 className="font-bold mb-2">Beta Feedback</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating:</label>
            <div className="flex space-x-1">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`text-2xl ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts, report bugs, or suggest improvements..."
            className="w-full h-24 p-2 border rounded resize-none"
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={submitFeedback}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. Weekly Survey System

Use tools like Typeform, Google Forms, or build custom surveys:

**Week 1 Survey Questions:**
- How easy was it to sign up and create your first farm?
- Rate the accuracy of weather data for your location (1-10)
- Did you successfully map your field boundaries?
- What's the most confusing part of the interface?
- What feature would you like to see added?

**Week 2-3 Survey Questions:**
- How often are you using the platform?
- Which features do you find most valuable?
- Have you encountered any bugs or errors?
- How does the satellite data compare to your field observations?
- Would you recommend this to other farmers?

### 3. Feedback API Endpoint

```typescript
// apps/web/src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { feedback, rating, page, userAgent } = await request.json()
    
    await prisma.betaFeedback.create({
      data: {
        userId: session?.user?.id,
        feedback,
        rating,
        page,
        userAgent,
        createdAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
```

## Monitoring & Analytics

### 1. User Behavior Tracking

```typescript
// Track key user actions
const trackEvent = (event: string, properties?: Record<string, any>) => {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      }
    })
  })
}

// Key events to track:
// - User registration
// - Farm creation
// - Field mapping completion
// - Weather data views
// - Satellite image requests
// - Feature usage frequency
```

### 2. Error Monitoring

Set up error tracking with Sentry or similar:

```typescript
// apps/web/src/lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Add beta user context
    if (event.user) {
      event.tags = {
        ...event.tags,
        betaUser: true
      }
    }
    return event
  }
})
```

### 3. Performance Monitoring

Track key performance metrics:
- Page load times
- API response times
- Database query performance
- Weather API response times
- Satellite processing times

## Beta Testing Checklist

### Pre-Launch Checklist
- [ ] Beta invite system implemented
- [ ] User onboarding flow tested
- [ ] Feedback collection system working
- [ ] Welcome emails configured
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled
- [ ] Support email address configured
- [ ] Beta user documentation updated

### Week 1 (First 5-10 users)
- [ ] Send welcome emails
- [ ] Monitor user registrations
- [ ] Check for critical errors
- [ ] Response to initial feedback within 24h
- [ ] Send first survey after 3 days

### Week 2-3 (Expand to 15 users)
- [ ] Invite additional users
- [ ] Weekly feedback review meetings
- [ ] Bug fixes for critical issues
- [ ] Send weekly surveys
- [ ] Monitor user engagement metrics

### Week 4+ (Extended beta)
- [ ] Analyze usage patterns
- [ ] Prioritize feature improvements
- [ ] Plan next development iteration
- [ ] Prepare for public launch

## Success Metrics

### User Engagement
- **Daily Active Users**: Target 70%+ of beta users
- **Feature Adoption**: 80%+ users create farms and map fields
- **Session Duration**: Average 10+ minutes per session
- **Return Rate**: 60%+ users return within 7 days

### Feedback Quality
- **Response Rate**: 80%+ complete weekly surveys
- **Bug Reports**: Clear, actionable bug reports
- **Feature Requests**: Practical, farmland-relevant requests
- **Overall Satisfaction**: 4+ stars average rating

### Technical Performance
- **Uptime**: 99%+ availability
- **Page Load Time**: <3 seconds average
- **API Response Time**: <500ms for critical endpoints
- **Error Rate**: <1% of requests result in errors

## Feedback Analysis & Iteration

### Weekly Review Process
1. **Collect all feedback** from surveys, in-app feedback, and support emails
2. **Categorize feedback** by type (bug, feature request, usability issue)
3. **Prioritize issues** by frequency and impact
4. **Plan fixes** for critical bugs within 48 hours
5. **Update roadmap** based on user needs

### Common Beta Issues & Solutions

**Issue**: Users confused about field mapping
**Solution**: Add interactive tutorial and help tooltips

**Issue**: Weather data doesn't match local observations
**Solution**: Allow users to report discrepancies and improve data sources

**Issue**: Satellite images are outdated
**Solution**: Add data freshness indicators and improve sync frequency

**Issue**: Mobile app performance issues
**Solution**: Optimize image loading and implement offline caching

## Post-Beta Launch Preparation

### User Migration Plan
- Convert beta users to regular accounts
- Preserve all user data and settings
- Send thank you emails with special early adopter benefits
- Offer beta users free premium features for 3 months

### Feature Improvements
- Implement top-requested features from beta feedback
- Fix all critical bugs identified during beta
- Improve user onboarding based on beta user experience
- Enhance mobile app based on usage patterns

### Documentation Updates
- Update user guides based on beta feedback
- Create video tutorials for common tasks
- Improve error messages and help text
- Add FAQ section based on common support questions

---

**Beta Testing Guide Version**: 1.0  
**Last Updated**: August 2, 2025  
**Next Review**: After Phase 1 completion