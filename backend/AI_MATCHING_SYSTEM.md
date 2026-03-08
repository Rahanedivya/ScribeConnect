# AI-Powered Volunteer Matching System

## Overview

ScribeConnect now includes an intelligent AI-powered matching engine that automatically matches students with the most suitable volunteers based on multiple criteria. This system enhances the user experience by:

- ⚡ Reducing manual volunteer selection time
- 🎯 Improving matching accuracy based on expertise and availability
- 📊 Providing transparency through detailed match scores
- 🚀 Enabling automatic allocation for last-minute requests

## Architecture

### Components

1. **AIMatchingEngine** (`backend/utils/aiMatchingEngine.js`)
   - Core matching algorithm
   - Scoring calculation logic
   - Volunteer ranking system

2. **AIMatchingController** (`backend/controllers/aiMatchingController.js`)
   - API endpoints for matching functionality
   - Request handling and validation
   - Analytics and reporting

3. **Matching Routes** (`backend/routes/matching.js`)
   - RESTful endpoints for frontend integration
   - Authentication and authorization

4. **MatchingService** (`frontend/src/services/matchingService.js`)
   - Frontend API client
   - Token management
   - Error handling

## Matching Algorithm

### Scoring System (0-100 Points)

The AI engine evaluates volunteers across **5 key dimensions**:

#### 1. Subject Expertise (0-30 points)
- **Exact match**: 30 points
- **Partial match**: 20 points
- **Related category**: 10 points
- **No match**: 0 points

**Supported Subject Categories:**
- Mathematics (Math, Calculus, Algebra, Geometry, Statistics)
- Science (Physics, Chemistry, Biology)
- Language (English, Hindi, Spanish, French)
- Social Studies (History, Geography, Economics, Political Science)

#### 2. Availability Alignment (0-20 points)
- **Exact time slot available**: 20 points
- **Available different time**: 10 points
- **Available different day**: 5 points
- **Not available**: 0 points

**Time Slots:**
- Morning: 6:00 AM - 12:00 PM
- Afternoon: 12:00 PM - 5:00 PM
- Evening: 5:00 PM - 12:00 AM

#### 3. Rating & Performance (0-25 points)
- **Base score**: Rating / 5 × 20 points
- **Completion bonus**:
  - 50+ assignments: +5 bonus
  - 20+ assignments: +3 bonus
  - 10+ assignments: +1 bonus

#### 4. Workload Balance (0-15 points)
- Volunteers with lighter current workloads score higher
- Scales from 0 active requests (15 points) to 5+ requests (0 points)
- Prevents overloading dedicated volunteers

#### 5. Location & Preferences (0-10 points)
- **Same city**: 10 points
- **Remote available**: 7 points
- **Different city**: 0 points

### Total Score Formula

```
Total Score = Subject Expertise + Availability + Performance + Workload + Location
Match Percentage = (Total Score / 100) × 100%
```

## API Endpoints

### 1. Get Smart Volunteer Matches
```
GET /api/v1/matching/smart-volunteers
Query Parameters:
  - subject (required): Exam subject
  - examDate (required): Exam date (YYYY-MM-DD)
  - examTime (required): Exam start time (HH:MM)
  - duration (optional): Exam duration (default: "2 hours")
  - city (optional): Student's city for location matching

Response:
{
  "success": true,
  "message": "Found X suitable volunteers",
  "students": [
    {
      "_id": "volunteer_id",
      "fullName": "John Doe",
      "rating": 4.8,
      "subjects": ["Mathematics", "Physics"],
      "totalScore": 87.5,
      "matchPercentage": 87.5,
      "scoreBreakdown": {
        "subjectExpertise": 30,
        "availability": 20,
        "performance": 25,
        "workload": 10,
        "location": 2.5
      }
    }
  ]
}
```

### 2. Get Top 5 Recommendations
```
GET /api/v1/matching/top-recommendations
Query Parameters:
  - subject (required)
  - examDate (required)
  - examTime (required)
  - duration (optional)
  - limit (optional): Number of recommendations (default: 5)

Response: Returns top N ranked volunteers
```

### 3. Auto-Allocate Volunteer
```
POST /api/v1/matching/auto-allocate
Body: {
  "requestId": "request_id"
}

Response:
{
  "success": true,
  "message": "Volunteer automatically allocated based on AI matching",
  "allocatedVolunteer": {
    "_id": "volunteer_id",
    "fullName": "John Doe",
    "rating": 4.8,
    "matchScore": 87.5,
    "matchPercentage": 87.5
  }
}
```

### 4. Get Volunteer Compatibility
```
GET /api/v1/matching/volunteer-compatibility
Query Parameters:
  - volunteerId (required)
  - subject (required)
  - examDate (required)
  - examTime (required)

Response:
{
  "success": true,
  "compatibilityScore": 85.3,
  "message": "This volunteer is 85.3% compatible with your request"
}
```

### 5. Get Matching Analytics
```
GET /api/v1/matching/analytics

Response:
{
  "success": true,
  "analytics": {
    "totalCompletedRequests": 150,
    "averageRating": 4.6,
    "matchSuccessRate": 92.5,
    "lastMinuteStats": {
      "total": 45,
      "completed": 42,
      "completionRate": "93.33%"
    }
  }
}
```

## Frontend Integration Examples

### Example 1: Display Ranked Volunteers

```javascript
import matchingService from '../services/matchingService';

// In your component
const handleGetMatches = async () => {
  try {
    const matches = await matchingService.getSmartVolunteerMatches({
      subject: 'Mathematics',
      examDate: '2024-03-15',
      examTime: '09:00',
      duration: '2 hours'
    });

    // matches.volunteers contains ranked list with scores
    console.log('Top volunteer:', matches.volunteers[0]);
  } catch (error) {
    console.error('Error fetching matches:', error);
  }
};
```

### Example 2: Auto-Allocate for Emergency Request

```javascript
const handleEmergencyAllocation = async (requestId) => {
  try {
    const result = await matchingService.autoAllocateVolunteer(requestId);
    
    console.log('Allocated volunteer:', result.allocatedVolunteer);
    // Shows automatic selection with match percentage
  } catch (error) {
    if (error.message.includes('No suitable volunteers')) {
      alert('No volunteers available at this time');
    }
  }
};
```

### Example 3: Show Volunteer Compatibility

```javascript
const handleCheckCompatibility = async (volunteerId, requestDetails) => {
  try {
    const compatibility = await matchingService.getVolunteerCompatibility({
      volunteerId: volunteerId,
      subject: requestDetails.subject,
      examDate: requestDetails.examDate,
      examTime: requestDetails.examTime
    });

    console.log(`Compatibility: ${compatibility.compatibilityScore}%`);
  } catch (error) {
    console.error('Error checking compatibility:', error);
  }
};
```

## Database Queries Optimized for AI Matching

The system uses MongoDB indexes for fast matching:

```javascript
// Indexed fields for quick filtering
volunteerSchema.index({ lastMinuteAvailable: 1 });
volunteerSchema.index({ isVerified: 1 });

requestSchema.index({ volunteerId: 1, status: 1 });
requestSchema.index({ status: 1, examDate: 1 });
```

## Performance Considerations

1. **Caching**: Consider caching volunteer availability updates
2. **Async Operations**: Matching calculations run asynchronously
3. **Database Indexing**: Critical for fast candidate filtering
4. **Rate Limiting**: Applied to matching endpoints (500 req/15min)

## Matching Quality Metrics

Monitor these metrics to evaluate matching performance:

- **Average Match Score**: Should be 75%+ for accepted matches
- **Volunteer Acceptance Rate**: % of matched requests accepted by volunteers
- **Request Completion Rate**: % of matched requests completed successfully
- **User Satisfaction**: Average rating after completion

## Future Enhancements

1. **Machine Learning Model**
   - Learn from historical match success rates
   - Improve scoring weights over time
   - Predict volunteer no-shows

2. **Advanced Preferences**
   - Student learning style preferences
   - Volunteer specialization in disability types
   - Language preferences matching

3. **Real-Time Optimization**
   - Dynamic weighting based on time of day
   - Surge pricing detection
   - Peak hour volunteer distribution

4. **Predictive Analytics**
   - Forecast volunteer availability during exam seasons
   - Predict request success rates before allocation
   - Identify at-risk matches early

## Testing the AI Matching System

### Manual Testing

1. Create test volunteers with different subjects and availability
2. Create test requests for various subjects and times
3. Call smart-volunteers endpoint and verify rankings
4. Check that top-ranked volunteer has highest match score

### Sample Test Data

```bash
# Create volunteer with Mathematics expertise
POST /api/v1/auth/register/volunteer
{
  "email": "mathtutor@test.com",
  "password": "password123",
  "fullName": "Mathematics Expert",
  "city": "Mumbai",
  "subjects": ["Mathematics", "Physics"],
  "lastMinuteAvailable": true
}

# Request Mathematics help
GET /api/v1/matching/smart-volunteers?subject=Mathematics&examDate=2024-03-15&examTime=09:00
```

## Troubleshooting

### No Volunteers Found
- Check if any volunteers have `lastMinuteAvailable: true`
- Verify volunteer is marked as `isVerified: true`
- Ensure at least one subject matches in volunteers list

### Low Match Scores
- Add more subjects to volunteer profiles
- Update availability schedules
- Ensure volunteers have ratings from completed requests

### Performance Issues
- Check database indexes are created
- Monitor request.volunteerId query performance
- Consider implementing pagination for large result sets

## References

- [Scoring Algorithm Details](./ALGORITHM.md)
- [API Documentation](./API.md)
- [Database Schema](../models/)
