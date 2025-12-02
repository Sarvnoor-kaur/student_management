const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/profile', authMiddleware, roleMiddleware(['teacher']), teacherController.getTeacherProfile);
router.put('/profile', authMiddleware, roleMiddleware(['teacher']), upload.single('photo'), teacherController.updateTeacherProfile);
router.post('/mark-attendance', authMiddleware, roleMiddleware(['teacher']), teacherController.markAttendance);
router.get('/attendance', authMiddleware, roleMiddleware(['teacher']), teacherController.getAttendanceBySubject);
router.post('/enter-marks', authMiddleware, roleMiddleware(['teacher']), teacherController.enterMarks);
router.get('/timetable', authMiddleware, roleMiddleware(['teacher']), teacherController.getTeacherTimetable);
router.post('/upload-lms', authMiddleware, roleMiddleware(['teacher']), upload.single('file'), teacherController.uploadLMS);
router.get('/assigned-students', authMiddleware, roleMiddleware(['teacher']), teacherController.getAssignedStudents);
router.post('/create-student-timetable', authMiddleware, roleMiddleware(['teacher']), teacherController.createStudentTimetable);
router.get('/student-timetable/:studentId', authMiddleware, roleMiddleware(['teacher']), teacherController.getStudentTimetable);
router.put('/student-timetable/:studentId', authMiddleware, roleMiddleware(['teacher']), teacherController.updateStudentTimetable);

router.get('/', authMiddleware, roleMiddleware(['admin']), teacherController.getAllTeachers);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.getTeacherById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.deleteTeacher);

module.exports = router;
