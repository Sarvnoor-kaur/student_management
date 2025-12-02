# 🚀 Quick Start Guide - ERP Student Management System

## System Overview

A complete ERP system for managing student education with 3 roles:
- **Admin**: Create courses and assign teachers
- **Teacher**: Manage students and create timetables  
- **Student**: Select teacher and view timetable

---

## 🎯 Quick Navigation

### **For Admin**
```
URL: /admin/courses
→ Manage courses and assign teachers to them
→ View teacher-course assignments
```

### **For Teacher**
```
URL: /teacher/dashboard
→ View all students who selected you
→ Create personalized timetables
→ View student details
```

### **For Student**
```
URL: /register-flow → Register
URL: /student/dashboard → Select teacher & view timetable
```

---

## 📝 Complete Workflow (5 Minutes)

### **Step 1: Admin Creates Course (1 min)**
```
1. Login as admin
2. Click "Courses" in sidebar
3. View courses list
4. For each course, click "Assign Teachers"
5. Select teacher(s) and save
```

### **Step 2: Student Registers (1 min)**
```
1. Go to /register-flow (or click "Register" on landing)
2. Step 1: Enter personal info
3. Step 2: Select course
4. Step 3: Enter parent/guardian info
5. Step 4: Review and submit
6. Get confirmation email
```

### **Step 3: Student Selects Teacher (1 min)**
```
1. Login with registered credentials
2. Dashboard opens with "Select Teacher" tab
3. See all teachers for your course
4. Click "Select" on preferred teacher
5. Confirm selection
```

### **Step 4: Teacher Views Student (1 min)**
```
1. Teacher logs in
2. Dashboard shows assigned students
3. Teacher sees the student who selected them
```

### **Step 5: Teacher Creates Timetable (1 min)**
```
1. In dashboard, find student
2. Click "Timetable" button
3. Add schedule:
   - Day: Monday
   - Subject: Data Structures
   - Time: 10:00 - 11:00
   - Classroom: Room 101
4. Click "Add Another Slot" for more
5. Save timetable
```

### **Step 6: Student Views Timetable**
```
1. Student goes to "My Timetable" tab
2. Sees complete schedule created by teacher
3. Can see by day or table format
```

---

## 🔑 Key Features

### **Admin Portal - /admin/courses**
| Feature | Description |
|---------|-------------|
| Course List | See all available courses |
| Assign Teachers | Add multiple teachers to a course |
| View Assignments | See who teaches which course |
| Remove Teachers | Unassign teachers from courses |

### **Teacher Portal - /teacher/dashboard**
| Feature | Description |
|---------|-------------|
| Student List | See all assigned students |
| Student Details | View complete student info |
| Create Timetable | Add personalized schedule |
| Edit Timetable | Update existing timetables |
| Multiple Slots | Add many schedule slots |

### **Student Portal - /student/dashboard**
| Feature | Description |
|---------|-------------|
| Teacher Selection | Browse & select teacher |
| Teacher Details | View teacher info |
| My Timetable | See assigned schedule |
| Weekly View | View by day breakdown |

---

## 📊 Data Relationships

```
Course → Assigned Many Teachers
         ↓
Teacher → Assigned Many Students
         ↓
Student → Has 1 Preferred Teacher
         ↓
         → Assigned 1 Timetable
```

---

## 🎯 Common Tasks

### **As Admin: Assign Teacher to Course**
```javascript
POST /admin/teacher/assign-course
{
  "teacherId": "teacher_id",
  "courseId": "course_id"
}
```

### **As Student: Select Teacher**
```javascript
POST /student/select-teacher
{
  "teacherId": "teacher_id"
}
```

### **As Teacher: Create Timetable**
```javascript
POST /teacher/create-student-timetable
{
  "studentId": "student_id",
  "courseId": "course_id",
  "schedule": [
    {
      "day": "Monday",
      "startTime": "10:00",
      "endTime": "11:00",
      "subject": "Data Structures",
      "classroom": "Room 101"
    }
  ]
}
```

---

## 🧪 Test Flow

### **Setup Test Data**
1. Create admin account
2. Create course: "Computer Science"
3. Create teacher: "Dr. John Smith"
4. Assign teacher to course

### **Run Test Flow**
1. Student registers for "Computer Science"
2. Student selects "Dr. John Smith"
3. Teacher sees student in dashboard
4. Teacher creates 3-slot timetable:
   - Mon 10-11 Data Structures
   - Wed 14-15 Database
   - Fri 10-11 Data Structures
5. Student views timetable and sees schedule

### **Verify**
- ✅ Student sees teacher
- ✅ Teacher sees student  
- ✅ Timetable saved correctly
- ✅ Student can view timetable

---

## 📱 UI Components

### **Admin Courses Page**
- **Course List Table**: Shows all courses
- **Assign Modal**: Multi-select teachers
- **Assignments Table**: Shows teacher-course pairs
- **Action Buttons**: Assign, Remove, View

### **Teacher Dashboard**
- **Stats Card**: Shows student count
- **Student Table**: Lists all assigned students
- **Timetable Modal**: Add/edit schedule
- **Student Details Drawer**: Full student info

### **Student Dashboard - Tab 1**
- **Teacher Cards**: Browsable teacher list
- **Select Button**: One-click selection
- **View Details**: See teacher info
- **Confirmation Modal**: Confirm selection

### **Student Dashboard - Tab 2**
- **Schedule Table**: Formatted timetable
- **Weekly Breakdown**: Day-wise view
- **Time Display**: Start-end times
- **Location Info**: Classroom details

---

## 🚀 Running the System

### **Backend**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### **Frontend**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### **Database**
```bash
# Ensure MongoDB is running
# Connection: mongodb://localhost:27017/ums
```

---

## 🔐 Login Credentials

### **Admin**
- Email: `admin@ums.edu`
- Password: `admin123`

### **Teacher** 
- Email: Created during teacher registration
- Password: Generated by admin

### **Student**
- Email: Self-provided during registration
- Password: Self-set during registration

---

## 🎓 Example Flow

```
ADMIN CREATES DATA
  ├─ Course: "Computer Science" (Code: CS101)
  ├─ Teacher: "Dr. John Smith"
  └─ Assigns Teacher → Course

STUDENT REGISTERS
  ├─ Name: "Alice Johnson"
  ├─ Email: "alice@email.com"
  ├─ Course: "Computer Science"
  ├─ Password: "MyPass123"
  └─ Registration complete

STUDENT LOGS IN & SELECTS TEACHER
  ├─ Dashboard opens
  ├─ Sees "Dr. John Smith" available
  ├─ Clicks "Select"
  └─ Selection confirmed

TEACHER LOGS IN & CREATES TIMETABLE
  ├─ Dashboard shows "Alice Johnson"
  ├─ Clicks "Timetable"
  ├─ Adds Monday 10-11 Data Structures, Room 101
  ├─ Adds Wednesday 14-15 Database, Room 202
  ├─ Adds Friday 10-11 Data Structures, Room 101
  └─ Saves timetable

STUDENT VIEWS TIMETABLE
  ├─ Goes to "My Timetable" tab
  ├─ Sees Monday class at 10 AM
  ├─ Sees Wednesday class at 2 PM
  ├─ Sees Friday class at 10 AM
  └─ All with teacher name and location
```

---

## ❓ FAQ

**Q: How many teachers can be assigned to a course?**
A: Unlimited! Select multiple teachers when assigning.

**Q: Can a student have multiple teachers?**
A: No, currently students can select one preferred teacher.

**Q: Can a teacher have multiple students?**
A: Yes, many students can select the same teacher.

**Q: Can timetable be edited after creation?**
A: Yes, teacher can update at any time.

**Q: What if student hasn't selected a teacher?**
A: They'll see all available teachers in dashboard.

**Q: What if teacher hasn't created timetable?**
A: Student will see "No timetable assigned yet".

---

## 📞 Support

For detailed information:
- See **ERP_WORKFLOW_GUIDE.md** for complete workflows
- See **IMPLEMENTATION_COMPLETE.md** for technical details
- Check API endpoints in documentation
- Review component code for implementation details

---

## ✨ Features Summary

✅ Multi-role authentication (Admin, Teacher, Student)
✅ Course management and teacher assignment
✅ Student-teacher pairing workflow
✅ Personalized timetable per student
✅ Responsive UI design
✅ Complete API structure
✅ Error handling & validation
✅ Ready for production

---

**Ready? Start here: `/admin/courses` for Admin or `/student/dashboard` for Student**

🎓 **Happy Learning!**

