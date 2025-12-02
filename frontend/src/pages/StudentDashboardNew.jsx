import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Avatar,
  Typography,
  Tabs,
  Table,
  Divider,
  Modal,
  Badge
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const StudentDashboardNew = ({ user }) => {
  const [student, setStudent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [teacherDetailsVisible, setTeacherDetailsVisible] = useState(false);
  const [confirmTeacherVisible, setConfirmTeacherVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchStudentData();
  }, [user?.id]);

  useEffect(() => {
    if (student?.academicDetails?.course) {
      fetchTeachersList();
      fetchTimetable();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log('Fetching student profile...');
      const response = await api.get('/student/profile');
      
      if (response.data?.success && response.data?.student) {
        const studentData = response.data.student;
        console.log('✓ Student Profile Loaded:', {
          name: `${studentData.personalDetails?.firstName} ${studentData.personalDetails?.lastName}`,
          course: studentData.academicDetails?.course,
          hasCourse: !!studentData.academicDetails?.course
        });
        
        setStudent(studentData);
        if (studentData.preferredTeacher) {
          setSelectedTeacher(studentData.preferredTeacher);
        }
      } else {
        message.error('Failed to load student data');
      }
    } catch (error) {
      console.error('✗ Error fetching student data:', error);
      message.error(error.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersList = async () => {
    try {
      setTeacherLoading(true);
      
      if (!student?.academicDetails?.course) {
        console.warn('No course selected by student');
        setTeacherLoading(false);
        return;
      }
      
      let courseId = student.academicDetails.course;
      
      if (typeof courseId === 'object' && courseId !== null) {
        courseId = courseId._id;
      }
      
      if (!courseId) {
        console.warn('Course ID is invalid');
        setTeacherLoading(false);
        return;
      }
      
      console.log('Fetching teachers for course:', courseId);
      const response = await api.get(`/student/teachers/by-course/${courseId}`);
      
      if (response.data.success && response.data.teachers) {
        console.log('Teachers fetched:', response.data.teachers);
        setTeachers(response.data.teachers || []);
      } else {
        console.warn('No teachers found or invalid response');
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setTimetableLoading(true);
      const response = await api.get('/student/timetable');
      if (response.data.success) {
        setTimetable(response.data.timetable);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setTimetableLoading(false);
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setConfirmTeacherVisible(true);
  };

  const confirmTeacherSelection = async () => {
    try {
      const response = await api.post('/student/select-teacher', {
        teacherId: selectedTeacher._id
      });
      if (response.data.success) {
        message.success('Teacher selected successfully! They can now assign your timetable.');
        setConfirmTeacherVisible(false);
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error selecting teacher:', error);
      message.error(error.response?.data?.message || 'Failed to select teacher');
    }
  };

  const timetableColumns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      width: '15%'
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: '20%'
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: '15%'
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: '15%'
    },
    {
      title: 'Classroom',
      dataIndex: 'classroom',
      key: 'classroom',
      width: '15%'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '20%'
    }
  ];

  if (loading) {
    return <Spin spinning={loading} tip="Loading student data..." />;
  }

  const tabItems = [
    {
      key: '1',
      label: <span><TeamOutlined /> Select Teacher</span>,
      children: (
        <div>
          {student?.preferredTeacher && (
            <Card style={{ marginBottom: '16px', background: '#e6f7ff', borderColor: '#1890ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <Text strong>Teacher Already Selected</Text>
                </Space>
                <Paragraph>
                  You have already selected a teacher. They can now create your personalized timetable.
                </Paragraph>
              </Space>
            </Card>
          )}

          {teacherLoading ? (
            <Spin />
          ) : teachers.length > 0 ? (
            <Row gutter={[16, 16]}>
              {teachers.map((teacher) => (
                <Col xs={24} sm={12} md={8} key={teacher._id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: student?.preferredTeacher?._id === teacher._id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      background: student?.preferredTeacher?._id === teacher._id ? 'linear-gradient(135deg, #f0f5ff 0%, #e6f2ff 100%)' : 'white',
                      boxShadow: student?.preferredTeacher?._id === teacher._id ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Avatar 
                      size={80} 
                      src={teacher.personalDetails?.photo}
                      icon={<UserOutlined />} 
                      style={{ marginBottom: '12px', backgroundColor: '#667eea', fontSize: '40px' }} 
                    />
                    <Title level={5} style={{ marginBottom: '4px', color: '#1f2937' }}>
                      {teacher.personalDetails?.firstName} {teacher.personalDetails?.lastName}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                      {teacher.designation || 'Faculty'} • {teacher.department}
                    </Text>
                    {teacher.specialization && teacher.specialization.length > 0 && (
                      <Text style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: '#6b7280' }}>
                        {teacher.specialization.join(', ')}
                      </Text>
                    )}
                    <div style={{ marginBottom: '8px' }}>
                      <Tag color="blue" style={{ marginRight: '4px' }}>
                        {teacher.subjectsAssigned?.length || 0} Subject(s)
                      </Tag>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      {student?.preferredTeacher?._id === teacher._id ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Selected
                        </Tag>
                      ) : (
                        <Button
                          type="primary"
                          block
                          onClick={() => handleSelectTeacher(teacher)}
                          style={{ marginTop: '8px' }}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setTeacherDetailsVisible(true);
                      }}
                      style={{ marginTop: '8px' }}
                    >
                      View Details
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No teachers available for your course" />
          )}
        </div>
      )
    },
    {
      key: '2',
      label: <span><CalendarOutlined /> My Timetable</span>,
      children: (
        <div>
          {timetableLoading ? (
            <Spin />
          ) : timetable ? (
            <div>
              <Card style={{ marginBottom: '16px', background: '#f0f5ff' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Teacher:</Text>
                    <div>
                      {timetable.teacher?.personalDetails?.firstName} {timetable.teacher?.personalDetails?.lastName}
                    </div>
                  </div>
                  <div>
                    <Text strong>Course:</Text>
                    <div>{timetable.course?.courseName}</div>
                  </div>
                  {timetable.notes && (
                    <div>
                      <Text strong>Notes:</Text>
                      <div>{timetable.notes}</div>
                    </div>
                  )}
                </Space>
              </Card>

              <Table
                columns={timetableColumns}
                dataSource={timetable.schedule || []}
                rowKey={(_, index) => index}
                pagination={false}
              />

              <Divider />

              <Card title="Weekly Timetable View" style={{ marginTop: '24px' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                  const daySchedules = timetable.schedule?.filter(s => s.day === day) || [];
                  return (
                    daySchedules.length > 0 && (
                      <Card
                        key={day}
                        size="small"
                        style={{ marginBottom: '12px' }}
                        title={<strong>{day}</strong>}
                      >
                        {daySchedules.map((schedule, idx) => (
                          <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Space direction="vertical" size="small">
                                  <Text strong>{schedule.subject}</Text>
                                  <Space>
                                    <ClockCircleOutlined />
                                    <Text>{schedule.startTime} - {schedule.endTime}</Text>
                                  </Space>
                                  <Text type="secondary">Classroom: {schedule.classroom}</Text>
                                </Space>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Card>
                    )
                  );
                })}
              </Card>
            </div>
          ) : (
            <Empty description="No timetable assigned yet" />
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: '#667eea', fontSize: '48px', marginBottom: '16px' }} />
            <Title level={3}>
              {student?.personalDetails?.firstName} {student?.personalDetails?.lastName}
            </Title>
            <Text type="secondary" block style={{ marginBottom: '16px' }}>
              {student?.email}
            </Text>

            <Divider />

            <div style={{ textAlign: 'left' }}>
              <Paragraph>
                <Text strong>Admission Number:</Text>
                <div>{student?.admissionNumber}</div>
              </Paragraph>
              <Paragraph>
                <Text strong>Roll Number:</Text>
                <div>{student?.academicDetails?.rollNumber || 'N/A'}</div>
              </Paragraph>
              <Paragraph>
                <Text strong>Course:</Text>
                <div>{student?.academicDetails?.course?.courseName || 'N/A'}</div>
              </Paragraph>
              <Paragraph>
                <Text strong>Batch:</Text>
                <div>{student?.academicDetails?.batch || 'N/A'}</div>
              </Paragraph>
              <Paragraph>
                <Text strong>Status:</Text>
                <div>
                  <Tag color={student?.academicDetails?.enrollmentStatus === 'active' ? 'green' : 'red'}>
                    {student?.academicDetails?.enrollmentStatus}
                  </Tag>
                </div>
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>

      {/* Teacher Details Modal */}
      <Modal
        title="Teacher Details"
        open={teacherDetailsVisible}
        onCancel={() => setTeacherDetailsVisible(false)}
        footer={null}
        width={500}
      >
        {selectedTeacher && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={96} 
                src={selectedTeacher.personalDetails?.photo}
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#667eea', fontSize: '48px' }} 
              />
              <Title level={4} style={{ marginTop: '12px', marginBottom: '4px' }}>
                {selectedTeacher.personalDetails?.firstName} {selectedTeacher.personalDetails?.lastName}
              </Title>
              <Text type="secondary">
                {selectedTeacher.designation || 'Faculty'} • {selectedTeacher.department}
              </Text>
            </div>

            <Divider />

            <div>
              <Space>
                <MailOutlined />
                <Text strong>Email:</Text>
              </Space>
              <div>{selectedTeacher.email}</div>
            </div>

            <div>
              <Space>
                <PhoneOutlined />
                <Text strong>Phone:</Text>
              </Space>
              <div>{selectedTeacher.personalDetails?.phone || 'Not provided'}</div>
            </div>

            <div>
              <Space>
                <BookOutlined />
                <Text strong>Department:</Text>
              </Space>
              <div>{selectedTeacher.department || 'N/A'}</div>
            </div>

            <div>
              <Space>
                <UserOutlined />
                <Text strong>Designation:</Text>
              </Space>
              <div>{selectedTeacher.designation || 'N/A'}</div>
            </div>

            {selectedTeacher.specialization && selectedTeacher.specialization.length > 0 && (
              <div>
                <Text strong>Specialization:</Text>
                <div style={{ marginTop: '8px' }}>
                  {selectedTeacher.specialization.map((spec, idx) => (
                    <Tag key={idx} color="purple" style={{ marginBottom: '4px' }}>
                      {spec}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {selectedTeacher.subjectsAssigned && selectedTeacher.subjectsAssigned.length > 0 && (
              <div>
                <Text strong>Subjects:</Text>
                <div style={{ marginTop: '8px' }}>
                  {selectedTeacher.subjectsAssigned.map((subject, idx) => (
                    <Tag key={idx} color="blue" style={{ marginBottom: '4px' }}>
                      {subject.subjectName || subject.name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {student?.preferredTeacher?._id !== selectedTeacher._id && (
              <Button
                type="primary"
                block
                onClick={() => {
                  setConfirmTeacherVisible(true);
                  setTeacherDetailsVisible(false);
                }}
              >
                Select This Teacher
              </Button>
            )}
          </Space>
        )}
      </Modal>

      {/* Confirm Teacher Selection Modal */}
      <Modal
        title="Confirm Teacher Selection"
        open={confirmTeacherVisible}
        onOk={confirmTeacherSelection}
        onCancel={() => setConfirmTeacherVisible(false)}
        okText="Confirm"
      >
        <Paragraph>
          Are you sure you want to select <strong>{selectedTeacher?.personalDetails?.firstName} {selectedTeacher?.personalDetails?.lastName}</strong> as your teacher?
        </Paragraph>
        <Paragraph type="secondary">
          Once confirmed, this teacher will see you in their dashboard and can create your personalized timetable.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default StudentDashboardNew;
