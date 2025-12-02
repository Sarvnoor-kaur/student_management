# Debugging Guide - Teacher Profile & Courses Issue

## Problem Summary
Teacher profile and assigned courses not displaying on teacher dashboard

## Root Cause Found
The **Teacher model was not imported** in `teacherController.js`

## Fixes Applied

### 1. Backend - Teacher Controller
**File**: `backend/controllers/teacherController.js`

#### Issue:
- Teacher model was missing from imports
- Course model was missing from imports
- No logging for debugging

#### Solution:
- Added Teacher model import
- Added Course model import
- Added comprehensive logging to track:
  - API request reception
  - Teacher ID from authentication
  - Database query results
  - Course and subject counts
  - Success/failure status

### 2. Frontend - Teacher Dashboard
**File**: `frontend/src/pages/TeacherDashboardNew.jsx`

#### Improvements:
- Added detailed console logging
- Better error messages with specific HTTP status handling
- Loading state with spinner
- Refresh button to reload profile
- Course count display in card header

### 3. Frontend - Student Dashboard
**File**: `frontend/src/pages/StudentDashboardNew.jsx`

#### Improvements:
- Added logging for student profile fetch
- Better error handling
- More robust course validation

## Testing Steps

### Step 1: Verify Backend is Running
```bash
cd c:\Users\sarvn\OneDrive\Desktop\ums\backend
npm run dev
```
Watch for console logs showing requests being handled.

### Step 2: Login as Teacher
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login with teacher credentials
4. Watch for logs:
   - `=== getTeacherProfile Called ===`
   - `Teacher ID from auth: <ID>`
   - `Courses Assigned: <COUNT>`
   - `SUCCESS: Returning teacher profile`

### Step 3: Check Student Profile
1. Login as student
2. Open DevTools console
3. Look for:
   - `✓ Student Profile Loaded:`
   - `hasCourse: true/false`

### Step 4: Verify Admin Assignment
1. Login as admin
2. Go to Courses Management
3. Assign a course to teacher "Pranjali Sharma"
4. Wait for success message
5. Go back to student
6. Logout and login again as teacher
7. Check if courses appear

## Console Logging Guide

### Teacher Profile API Call
Expected logs:
```
Fetching teacher profile from /teacher/profile
=== getTeacherProfile Called ===
Teacher ID from auth: <MongoDB_ID>
Teacher found: YES
Courses Assigned: 2
SUCCESS: Returning teacher profile {
  id: "...",
  name: "Pranjali Sharma",
  coursesCount: 2,
  subjectsCount: 0
}
✓ Teacher Profile Loaded Successfully
Teacher Name: Pranjali Sharma
Courses Assigned: 2
```

### Troubleshooting

#### Logs show "Teacher ID from auth: undefined"
- **Issue**: Authentication middleware not setting req.user.id
- **Solution**: Check that token is being sent with Authorization header

#### Logs show "Teacher found: NO"
- **Issue**: Teacher document not in database or using wrong ID
- **Solution**: Check MongoDB to verify teacher exists

#### Logs show "Courses Assigned: 0"
- **Issue**: Admin didn't properly assign courses
- **Solution**: 
  1. Go to Admin Dashboard
  2. Click "Assign Teachers" on a course
  3. Select teacher
  4. Wait for success message
  5. Verify in database

#### Error: "Session expired"
- **Issue**: Token is invalid or expired
- **Solution**: Clear localStorage and login again

## Quick Verification

### Check Teacher in Database
```javascript
// Open MongoDB Compass or mongo shell
db.teachers.findOne({email: "pranjali@school.com"})

// Should show:
{
  _id: ObjectId(...),
  personalDetails: {
    firstName: "Pranjali",
    lastName: "Sharma"
  },
  coursesAssigned: [ObjectId(...), ObjectId(...)]  // Should have course IDs
}
```

### Check Course Assignment
```javascript
db.courses.findOne({courseName: "Computer Science"})

// Teachers assigned to this course can be found:
db.teachers.find({coursesAssigned: ObjectId(courseId)})
```

## Next Steps if Still Not Working

1. **Clear Cache**: 
   - Browser: Ctrl+Shift+Delete, clear all data
   - Backend: Restart npm run dev

2. **Fresh Login**:
   - Logout completely
   - Close browser
   - Login again

3. **Check Response in Network Tab**:
   - DevTools → Network tab
   - Filter: XHR
   - Click on `/teacher/profile`
   - Check Response tab for full data

4. **Verify Assignment Actually Worked**:
   - Admin assigns teacher to course
   - Check MongoDB for teacher.coursesAssigned array
   - If empty, assignment failed

## API Endpoints to Test

### Teacher Profile
```
GET /api/teachers/profile
Headers: Authorization: Bearer <token>
Expected Response:
{
  success: true,
  teacher: {
    _id: "...",
    personalDetails: {...},
    coursesAssigned: [{_id, courseName, ...}],
    subjectsAssigned: [...]
  }
}
```

### Assign Course to Teacher
```
POST /api/admin/teacher/assign-course
Headers: Authorization: Bearer <admin-token>
Body: {
  teacherId: "...",
  courseId: "..."
}
Expected Response:
{
  success: true,
  message: "Teacher assigned to course successfully",
  teacher: {
    coursesAssigned: [...]
  }
}
```

### Get Teachers for Course
```
GET /api/student/teachers/by-course/<courseId>
Headers: Authorization: Bearer <student-token>
Expected Response:
{
  success: true,
  teachers: [{_id, personalDetails, coursesAssigned, ...}],
  courseName: "..."
}
```
