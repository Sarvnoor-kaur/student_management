# ERP Student Management System - Complete Workflow Guide

## System Overview

This is a complete ERP system for managing student education with 3 main roles:
- **Admin**: Manages courses and assigns teachers
- **Teacher**: Manages assigned students and creates timetables
- **Student**: Selects preferred teacher and views timetable

## System Architecture

### Database Models

1. **Course**
   - Course name, code, description
   - Department, duration, semesters
   - Admission capacity, fee

2. **Teacher**
   - Personal details (name, contact, qualifications)
   - Courses assigned
   - Students assigned
   - Subject assignments

3. **Student**
   - Personal and guardian details
   - Academic details (course, roll number, etc.)
   - Preferred teacher (selected by student)
   - Assigned timetable

4. **StudentTimetable** (NEW)
   - Teacher → Student schedule
   - Weekly schedule with day, time, subject, classroom
   - Notes and description

## Complete Workflow

### 1. Admin Portal Flow

#### Step 1: Create Courses
- Admin creates courses (e.g., Computer Science, Mathematics, Physics)
- Each course has code, duration, semesters, and fee

#### Step 2: Register Teachers
- Admin registers teachers with personal and professional details
- Teachers are created with initial credentials

#### Step 3: Assign Teachers to Courses
- **Page**: `AdminCoursesManagement.jsx`
- Admin goes to Courses Management page
- For each course, admin can assign multiple teachers
- Admin can view all teacher-course assignments
- Admin can remove teachers from courses

**API Endpoints Used:**
- `POST /admin/teacher/assign-course` - Assign teacher to course
- `POST /admin/teacher/remove-course` - Remove teacher from course
- `GET /admin/course-teacher-assignments` - View all assignments
- `GET /admin/teachers/by-course/:courseId` - Get teachers for a course

---

### 2. Student Portal Flow

#### Step 1: Student Registration
- **Page**: `StudentRegistrationFlow.jsx`
- Multi-step registration form:
  - **Step 1**: Personal Information (name, DOB, contact)
  - **Step 2**: Academic Information (select course)
  - **Step 3**: Guardian Information (parent details)
  - **Step 4**: Confirmation (review and submit)
- Student provides email and password during registration

**API Endpoints Used:**
- `GET /admin/courses` - Fetch available courses
- `POST /auth/student/register` - Submit registration

#### Step 2: Student Login
- Student logs in with email and password
- Dashboard shows courses and available teachers

#### Step 3: Select Preferred Teacher
- **Page**: `StudentDashboardNew.jsx` - Tab 1
- Student sees all teachers assigned to their course
- Shows teacher details:
  - Name, department, designation
  - Subjects taught
  - Contact information
- Student can select a teacher by clicking "Select" button
- Once selected, teacher can see student in their dashboard

**API Endpoints Used:**
- `GET /student/teachers/by-course/:courseId` - Get teachers for course
- `POST /student/select-teacher` - Select preferred teacher
- `GET /student/profile` - Get student profile

#### Step 4: View Assigned Timetable
- **Page**: `StudentDashboardNew.jsx` - Tab 2
- After teacher creates timetable, student can view it
- Shows:
  - Day of week
  - Subject
  - Time (start - end)
  - Classroom
  - Description/Notes

**API Endpoints Used:**
- `GET /student/timetable` - Fetch assigned timetable

---

### 3. Teacher Portal Flow

#### Step 1: Teacher Login
- Teacher logs in with email and credentials provided by admin
- Dashboard shows their profile and assigned students

#### Step 2: View Assigned Students
- **Page**: `TeacherDashboardNew.jsx`
- Main section shows table of all students who selected the teacher
- For each student shows:
  - Name
  - Email
  - Admission number
  - Course
  - Enrollment status

**API Endpoints Used:**
- `GET /teacher/assigned-students` - Get list of assigned students

#### Step 3: Create/Update Timetable for Student
- **Page**: `TeacherDashboardNew.jsx` - Timetable Modal
- Teacher clicks "Timetable" button for any student
- Opens modal to add schedule slots
- For each slot, teacher specifies:
  - Day (Monday - Saturday)
  - Subject name
  - Start time (HH:MM format)
  - End time (HH:MM format)
  - Classroom/Room number
- Teacher can add multiple slots
- Teacher can remove individual slots
- Save button updates the student's timetable

**API Endpoints Used:**
- `POST /teacher/create-student-timetable` - Create/update timetable
- `GET /teacher/student-timetable/:studentId` - Get student's timetable
- `PUT /teacher/student-timetable/:studentId` - Update timetable

#### Step 4: View Student Details
- **Page**: `TeacherDashboardNew.jsx` - Student Details Drawer
- Teacher can click "Details" for any student
- Shows comprehensive student information:
  - Personal details
  - Contact information
  - Academic information
  - Guardian information
  - Current performance (CGPA, etc.)

---

## API Endpoints Reference

### Admin APIs

```
POST   /admin/teacher/assign-course
Body: { teacherId, courseId }
Response: { success, message, teacher }

POST   /admin/teacher/remove-course
Body: { teacherId, courseId }
Response: { success, message, teacher }

GET    /admin/course-teacher-assignments
Response: { success, assignments[] }

GET    /admin/teachers/by-course/:courseId
Response: { success, teachers[] }

GET    /admin/courses
Response: { success, courses[] }

GET    /admin/teachers
Response: { success, teachers[] }
```

### Student APIs

```
GET    /student/profile
Response: { success, student }

GET    /student/teachers/by-course/:courseId
Response: { success, teachers[], courseId, courseName }

POST   /student/select-teacher
Body: { teacherId }
Response: { success, message, student }

GET    /student/timetable
Response: { success, timetable }
```

### Teacher APIs

```
GET    /teacher/profile
Response: { success, teacher }

GET    /teacher/assigned-students
Response: { success, students[], totalStudents }

POST   /teacher/create-student-timetable
Body: {
  studentId,
  courseId,
  schedule: [
    {
      day: "Monday",
      startTime: "10:00",
      endTime: "11:00",
      subject: "Data Structures",
      classroom: "Room 101"
    }
  ],
  notes: "Optional notes"
}
Response: { success, message, timetable }

GET    /teacher/student-timetable/:studentId
Response: { success, timetable }

PUT    /teacher/student-timetable/:studentId
Body: { schedule, notes }
Response: { success, message, timetable }
```

---

## Database Relationships

```
Course (1) ←→ (Many) Teacher
    ↓
Teacher (1) ←→ (Many) Student
    ↓
Student (1) ← (1) StudentTimetable
    ↓
StudentTimetable (1) → (1) Teacher
```

### Entity Relationships

**Course → Teacher**
- Teacher.coursesAssigned: [CourseId]

**Teacher → Student**
- Student.preferredTeacher: TeacherId
- Teacher.studentsAssigned: [StudentId]

**Student → StudentTimetable**
- Student.assignedTimetable: StudentTimetableId
- StudentTimetable.student: StudentId
- StudentTimetable.teacher: TeacherId
- StudentTimetable.course: CourseId

---

## Frontend Components

### New React Pages Created

1. **AdminCoursesManagement.jsx**
   - Admin dashboard for managing courses
   - Teacher assignment interface
   - Shows teacher-course assignments table
   - Allows multi-teacher assignment per course

2. **TeacherDashboardNew.jsx**
   - Enhanced teacher dashboard
   - Shows assigned students list
   - Timetable creation modal
   - Student details drawer
   - Comprehensive student information display

3. **StudentRegistrationFlow.jsx**
   - Multi-step student registration
   - Step 1: Personal information
   - Step 2: Course selection
   - Step 3: Guardian information
   - Step 4: Confirmation
   - Course details display

4. **StudentDashboardNew.jsx**
   - Student dashboard with two tabs
   - Tab 1: Select Teacher
   - Tab 2: View Timetable
   - Shows profile information
   - Teacher selection with confirmation
   - Displays assigned timetable in table and calendar view

---

## Data Flow Example

### Scenario: Complete Teaching Assignment Flow

1. **Admin Creates Data**
   ```
   Admin creates Course: "Computer Science"
   Admin creates Teacher: "Dr. John Smith"
   Admin assigns Teacher to Course
   ```

2. **Student Registers**
   ```
   Student fills registration form
   Student selects "Computer Science" course
   Student account created
   ```

3. **Student Selects Teacher**
   ```
   Student logs in
   Student sees "Dr. John Smith" in teacher list
   Student clicks "Select" button
   Teacher now sees student in dashboard
   ```

4. **Teacher Creates Timetable**
   ```
   Teacher logs in
   Teacher sees student in assigned list
   Teacher clicks "Timetable" button
   Teacher adds schedule:
     - Monday, 10:00-11:00, Data Structures, Room 101
     - Wednesday, 14:00-15:00, Database, Room 202
     - Friday, 10:00-11:00, Data Structures, Room 101
   Teacher saves timetable
   ```

5. **Student Views Timetable**
   ```
   Student logs in
   Student goes to "My Timetable" tab
   Student sees the schedule created by teacher
   Student can view by day or table format
   ```

---

## Installation & Running

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables Required
```
MONGODB_URI=mongodb://localhost:27017/ums
JWT_SECRET=your_secret_key
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## User Credentials Template

### Admin Login
```
Email: admin@ums.edu
Password: admin123
```

### Teacher Login
```
Email: [created by admin]
Password: [generated and sent to teacher]
```

### Student Login
```
Email: [provided during registration]
Password: [set during registration]
```

---

## Feature Highlights

✅ **Multi-role authentication** (Admin, Teacher, Student)
✅ **Course management** with capacity and fee tracking
✅ **Teacher assignment** to multiple courses
✅ **Student-teacher pairing** workflow
✅ **Personalized timetable** per student
✅ **Real-time updates** of assignments
✅ **Comprehensive student profiles**
✅ **Responsive UI** for all devices
✅ **Error handling** and validation
✅ **RESTful API** architecture

---

## Security Considerations

- All endpoints protected with JWT authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Email validation
- Phone number validation
- Protected routes in frontend

---

## Future Enhancements

1. Add attendance tracking per timetable
2. Performance analytics dashboard
3. Email notifications for schedule changes
4. Mobile app support
5. Video conferencing integration for online classes
6. Assignment and homework management
7. Parent portal for viewing student progress
8. SMS notifications
9. Timetable conflict detection
10. Analytics and reporting

