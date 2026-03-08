# AI Matching System - Setup & Testing Guide

## Quick Start

### 1. Backend Setup

The AI matching system is already integrated into your backend. No additional installation needed!

**Required Dependencies** (already in your package.json):
- express
- mongoose
- jsonwebtoken
- bcryptjs

### 2. Test the System

#### Step 1: Create Test Data

Use these scripts to create test volunteers with matching subjects:

```bash
# Navigate to backend folder
cd backend

# Create a volunteer with Mathematics expertise
node createTestVolunteer.js

# Follow prompts:
# - Email: mathtutor@test.com
# - Full Name: Math Expert
# - City: Mumbai (or your city)
# - Subjects: Mathematics, Algebra, Geometry
# - Last Minute Available: Yes (true)
```

Create multiple volunteers with different subjects:
- Mathematics Expert
- Physics Expert
- Chemistry Expert
- English Expert

#### Step 2: Test via API (Postman or cURL)

**Register a student first:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "fullName": "John Student",
    "city": "Mumbai",
    "university": "Test University",
    "course": "Engineering",
    "disabilityType": "Visual Impairment",
    "certificateNumber": "CERT123"
  }'
```

**Get AI-ranked volunteers:**
```bash
curl -X GET "http://localhost:5000/api/v1/matching/smart-volunteers?subject=Mathematics&examDate=2024-03-15&examTime=09:00" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Replace `YOUR_TOKEN` with the JWT token from student login response.

#### Step 3: Test in Frontend

**Option A: Using Smart Component**

Add the component to your request form:

```jsx
import SmartVolunteerMatcher from './components/SmartVolunteerMatcher';

function RequestScribe() {
  return (
    <div>
      {/* Your existing form */}
      
      {/* Add matcher component */}
      <SmartVolunteerMatcher 
        onSelectVolunteer={(volunteer) => {
          console.log('Selected volunteer:', volunteer);
          // Handle selection
        }}
      />
    </div>
  );
}
```

**Option B: Direct API Call**

```javascript
import matchingService from './services/matchingService';

// In your component
const handleFindBestVolunteer = async () => {
  try {
    const result = await matchingService.getSmartVolunteerMatches({
      subject: 'Mathematics',
      examDate: '2024-03-15',
      examTime: '09:00',
      duration: '2 hours'
    });

    console.log('Ranked volunteers:', result.volunteers);
    // result.volunteers[0] is the best match
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Understanding Match Scores

When you receive AI matches, each volunteer gets scored on 5 factors:

```text
Match Score Example
╭─────────────────────────────────────╮
│ Volunteer: John (Mathematics Expert)│
├─────────────────────────────────────┤
│ Subject Expertise:      30/30 ✓     │ (Has Mathematics!)
│ Availability:           20/20 ✓     │ (Free on that date & time)
│ Rating & Performance:   23/25 ✓     │ (4.8 rating, 50+ done)
│ Workload Balance:       12/15 ✓     │ (Has only 2 active requests)
│ Location & Preference:  10/10 ✓     │ (Same city)
├─────────────────────────────────────┤
│ TOTAL SCORE:           95/100 ⭐⭐⭐  │
│ Match Percentage:       95%          │
╰─────────────────────────────────────╯
```

## API Endpoints Reference

### 1. Get Smart Matches (Ranked List)
```
GET /api/v1/matching/smart-volunteers
Query: subject, examDate, examTime, duration(optional), city(optional)
Returns: List of all matching volunteers, ranked by score
```

### 2. Get Top 5 Recommendations
```
GET /api/v1/matching/top-recommendations
Query: subject, examDate, examTime, duration(optional), limit(optional)
Returns: Top N recommendation (default 5)
```

### 3. Auto-Allocate (For Emergency)
```
POST /api/v1/matching/auto-allocate
Body: { requestId: "..." }
Returns: Best-matched volunteer automatically assigned to request
```

### 4. Check Compatibility
```
GET /api/v1/matching/volunteer-compatibility
Query: volunteerId, subject, examDate, examTime
Returns: Compatibility percentage for specific volunteer-request pair
```

### 5. Get Analytics
```
GET /api/v1/matching/analytics
Returns: System-wide matching statistics and success rates
```

## Monitoring & Debugging

### Check Logs

Watch backend logs for matching algorithm output:

```bash
cd backend
npm run dev
# Look for logs like: "[AI] Ranked X volunteers for subject..."
```

### Verify Volunteer Data

Check if volunteers have required fields filled:

```javascript
// In checkDatabase.js or similar
db.volunteers.find({
  lastMinuteAvailable: true,
  isVerified: true,
  subjects: { $exists: true, $ne: [] }
})
```

### Common Issues & Solutions

**Problem:** No matches found

**Solutions:**
1. Verify volunteers have `lastMinuteAvailable: true`
2. Check volunteers are marked as `isVerified: true`
3. Ensure at least one volunteer has matching subject
4. Confirm volunteer availability includes requested date/time

**Problem:** Low match scores

**Solutions:**
1. Add more subjects to volunteer profiles
2. Update volunteer availability schedule
3. Ensure requests with ratings from completed assignments
4. Place volunteers and students in same city

**Problem:** Slow response times

**Solutions:**
1. Check MongoDB indexes are created:
   ```javascript
   db.volunteers.getIndexes()  // Should show lastMinuteAvailable, isVerified
   ```
2. Consider pagination for large result sets
3. Cache volunteer availability updates

## Advanced Configuration

### Customize Scoring Weights

Edit `backend/utils/aiMatchingEngine.js`:

```javascript
// Change point allocations (currently 30+20+25+15+10 = 100)
static calculateSubjectScore(volunteerSubjects, requestedSubject) {
  // Modify to change subject importance
  return 30; // Can adjust this value
}
```

### Add New Scoring Factors

Example: Add language matching

```javascript
// In scoreVolunteer method
const languageScore = this.calculateLanguageScore(
  volunteer.languages,
  student.preferredLanguages
);
scoreBreakdown.language = languageScore;
totalScore += languageScore;
```

### Adjust Availability Slots

```javascript
// In getTimeSlot method - modify time boundaries
static getTimeSlot(hour) {
  if (hour >= 6 && hour < 11) return 'morning';    // 6-11 AM
  if (hour >= 11 && hour < 17) return 'afternoon';  // 11 AM-5 PM
  return 'evening';                                  // 5 PM-12 AM
}
```

## Testing Checklist

- [ ] Create 5+ test volunteers with different subjects
- [ ] Test matching with subject that exists
- [ ] Test matching with subject that doesn't exist
- [ ] Verify top-ranked volunteer has highest match percentage
- [ ] Test auto-allocation assigns best match
- [ ] Check that same-city volunteers score higher
- [ ] Confirm unavailable time slots reduce scores
- [ ] Verify workload affects scoring (busy volunteers score lower)
- [ ] Test with volunteers having no availability
- [ ] Confirm ratings bonus works (50+ assignments get +5)

## Performance Benchmarks

Expected response times (on standard hardware):
- Smart volunteers list (0-100 volunteers): **< 200ms**
- Top 5 recommendations: **< 150ms**
- Auto-allocate: **< 300ms**
- Compatibility check: **< 100ms**
- Analytics: **< 500ms**

If slower, check:
1. Database indexes
2. Network latency
3. Server CPU/memory usage
4. MongoDB query performance

## Integration Checklist

- [ ] Backend routes registered in server.js
- [ ] AI matching controller created
- [ ] Matching utils/engine created
- [ ] Frontend matchingService created
- [ ] Example component created (SmartVolunteerMatcher.jsx)
- [ ] Volunteer model has all required fields
- [ ] Request model updated
- [ ] Database indexes created
- [ ] Documentation reviewed
- [ ] Test data created
- [ ] API endpoints tested

## Next Steps

1. **Integrate UI Component:**
   Add SmartVolunteerMatcher to your request pages

2. **Train on Historical Data:**
   Once you have completed requests, analyze match quality

3. **Implement ML Model:**
   Use historical data to improve scoring weights

4. **Add Notifications:**
   Alert volunteers when they're matched via AI system

5. **Monitor Metrics:**
   Track match quality over time

## Support & Troubleshooting

For issues:
1. Check MongoDB connection is active
2. Verify all volunteers have verified status
3. Ensure test data has all required fields
4. Review backend logs for error messages
5. Test individual scoring methods in isolation

---

**Status:** ✅ AI Matching System Fully Integrated
**Last Updated:** March 2024
**Version:** 1.0
