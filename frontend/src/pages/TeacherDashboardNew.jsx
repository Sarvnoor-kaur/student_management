import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  TimePicker,
  Collapse,
  Divider,
  Drawer,
  Avatar,
  Typography,
  Breadcrumb
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';

const { Title, Text } = Typography;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherDashboardNew = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [studentsError, setStudentsError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [formData, setFormData] = useState([]);
  const [form] = Form.useForm();
  const [studentDetailsVisible, setStudentDetailsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchTeacherProfile();
    fetchAssignedStudents();
  }, [user?.id]);

  const fetchTeacherProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      console.log('Fetching teacher profile from /teacher/profile');
      
      const response = await api.get('/teachers/profile');
      
      console.log('API Response:', {
        status: response.status,
        success: response.data?.success,
        teacher: response.data?.teacher
      });
      
      if (response.data?.success && response.data?.teacher) {
        console.log('✓ Teacher Profile Loaded Successfully');
        console.log('Teacher Name:', `${response.data.teacher.personalDetails?.firstName} ${response.data.teacher.personalDetails?.lastName}`);
        console.log('Courses Assigned:', response.data.teacher.coursesAssigned?.length || 0);
        console.log('Subjects Assigned:', response.data.teacher.subjectsAssigned?.length || 0);
        setProfile(response.data.teacher);
        setProfileError(null);
      } else {
        const err = 'Invalid response from server';
        console.error('✗ Invalid response format', response.data);
        setProfileError(err);
        message.error(err);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load teacher profile';
      console.error('✗ Error fetching teacher profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        fullError: errorMsg
      });
      
      setProfileError(errorMsg);
      
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        message.error('Teacher profile not found');
      } else if (error.response?.status === 500) {
        message.error('Server error: ' + errorMsg);
      } else {
        message.error('Failed to load teacher profile: ' + errorMsg);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      setStudentsError(null);
      console.log('Fetching assigned students...');
      const response = await api.get('/teachers/assigned-students');
      
      if (response.data?.success && response.data?.students !== undefined) {
        console.log('✓ Students loaded:', response.data.students?.length || 0);
        setStudents(response.data.students || []);
        setStudentsError(null);
      } else {
        const err = response.data?.message || 'Invalid response format';
        console.error('✗ Invalid response:', response.data);
        setStudentsError(err);
        message.error(err);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load assigned students';
      console.error('✗ Error fetching students:', {
        status: error.response?.status,
        message: errorMsg,
        fullError: error
      });
      
      setStudentsError(errorMsg);
      
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        message.error('Teacher not found');
      } else if (error.response?.status === 500) {
        message.error('Server error: ' + errorMsg);
      } else {
        message.error('Failed to load students: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (profile) {
      editForm.setFieldsValue({
        firstName: profile.personalDetails?.firstName,
        lastName: profile.personalDetails?.lastName,
        phone: profile.personalDetails?.phone,
        gender: profile.personalDetails?.gender,
        department: profile.department,
        designation: profile.designation,
        specialization: profile.specialization?.join(', ')
      });
      setPhotoPreview(profile.personalDetails?.photo);
      setEditProfileVisible(true);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setUpdateLoading(true);
      const formDataObj = new FormData();
      
      const personalDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        gender: values.gender
      };

      const specializations = values.specialization
        ? values.specialization.split(',').map(s => s.trim()).filter(s => s)
        : [];

      formDataObj.append('personalDetails', JSON.stringify(personalDetails));
      formDataObj.append('department', values.department);
      formDataObj.append('specialization', JSON.stringify(specializations));

      if (photoFile) {
        formDataObj.append('photo', photoFile);
      }

      console.log('Sending update request with FormData');
      const response = await api.put('/teachers/profile', formDataObj);

      if (response.data.success) {
        console.log('Profile updated successfully');
        setProfile(response.data.teacher);
        setPhotoFile(null);
        setEditProfileVisible(false);
        message.success('Profile updated successfully');
        fetchTeacherProfile();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      message.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateTimetable = async (student) => {
    setSelectedStudent(student);
    setFormData([{ day: 'Monday', startTime: '', endTime: '', subject: '', classroom: '' }]);
    setIsModalOpen(true);
  };

  const handleAddSlot = () => {
    setFormData([...formData, { day: 'Monday', startTime: '', endTime: '', subject: '', classroom: '' }]);
  };

  const handleRemoveSlot = (index) => {
    const newData = formData.filter((_, i) => i !== index);
    setFormData(newData);
  };

  const handleSlotChange = (index, field, value) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  const handleSaveTimetable = async () => {
    try {
      if (!formData || formData.length === 0) {
        message.warning('Please add at least one timetable slot');
        return;
      }

      const schedule = formData.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject,
        classroom: slot.classroom,
        description: `${slot.subject} - ${slot.classroom}`
      }));

      const response = await api.post('/teachers/create-student-timetable', {
        studentId: selectedStudent._id,
        courseId: selectedStudent.academicDetails?.course,
        schedule
      });

      if (response.data.success) {
        message.success('Timetable created successfully');
        setIsModalOpen(false);
        setFormData([]);
        setSelectedStudent(null);
        fetchAssignedStudents();
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      message.error(error.response?.data?.message || 'Failed to save timetable');
    }
  };

  const studentsColumns = [
    {
      title: 'Student Name',
      dataIndex: 'personalDetails',
      key: 'name',
      render: (personalDetails) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{personalDetails?.firstName} {personalDetails?.lastName}</span>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Admission Number',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber'
    },
    {
      title: 'Course',
      dataIndex: ['academicDetails', 'course'],
      key: 'course',
      render: (course) => course?.courseName || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: ['academicDetails', 'enrollmentStatus'],
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            size="small"
            onClick={() => handleCreateTimetable(record)}
          >
            Timetable
          </Button>
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => {
              setSelectedStudent(record);
              setStudentDetailsVisible(true);
            }}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Row gutter={[24, 24]}>
        {/* Teacher Header */}
        <Col xs={24}>
          {profileLoading ? (
            <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
              <Spin tip="Loading profile..." />
            </Card>
          ) : profile ? (
            <Card style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px' }}>
              <Row align="middle" justify="space-between">
                <Col flex="auto">
                  <Row align="middle">
                    <Col>
                      <Avatar 
                        size={80} 
                        src={profile?.personalDetails?.photo}
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#fff', fontSize: '40px', color: '#667eea', marginRight: '20px', border: '3px solid white' }} 
                      />
                    </Col>
                    <Col flex="auto">
                      <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                        {profile?.personalDetails?.firstName} {profile?.personalDetails?.lastName}
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: '500' }}>
                        {profile?.designation || 'Faculty'} • {profile?.department || 'Department'}
                      </Text>
                      <br />
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                        Employee ID: {profile?.employeeId}
                      </Text>
                      {profile?.specialization && profile.specialization.length > 0 && (
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '6px', display: 'block', fontStyle: 'italic' }}>
                          Specialization: {profile.specialization.join(', ')}
                        </Text>
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="primary" 
                      ghost 
                      icon={<EditOutlined />}
                      onClick={handleOpenEditProfile}
                      style={{ borderColor: 'white', color: 'white' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      type="primary" 
                      ghost 
                      onClick={fetchTeacherProfile}
                      style={{ borderColor: 'white', color: 'white' }}
                    >
                      Refresh
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ) : profileError ? (
            <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '40px', background: '#fff2e8', borderColor: '#ffbb96' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4} style={{ color: '#d46b08', margin: 0 }}>⚠️ Error Loading Profile</Title>
                <Text style={{ color: '#d46b08' }}>{profileError}</Text>
                <Button 
                  type="primary" 
                  onClick={fetchTeacherProfile}
                  style={{ marginTop: '16px' }}
                >
                  Try Again
                </Button>
              </Space>
            </Card>
          ) : (
            <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
              <Empty description="No profile data available" />
            </Card>
          )}
        </Col>

        {/* Stats */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: '12px', 
              textAlign: 'center', 
              padding: '24px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <TeamOutlined style={{ fontSize: '40px', color: '#667eea' }} />
            <Title level={2} style={{ margin: '16px 0 4px', color: '#1f2937' }}>
              {students.length}
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>Students Assigned</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: '12px', 
              textAlign: 'center', 
              padding: '24px',
              background: 'linear-gradient(135deg, #10b98115 0%, #059e6815 100%)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <BookOutlined style={{ fontSize: '40px', color: '#10b981' }} />
            <Title level={2} style={{ margin: '16px 0 4px', color: '#1f2937' }}>
              {profile?.coursesAssigned?.length || 0}
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>Courses Assigned</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: '12px', 
              textAlign: 'center', 
              padding: '24px',
              background: 'linear-gradient(135deg, #f59e0b15 0%, #d9751615 100%)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <BookOutlined style={{ fontSize: '40px', color: '#f59e0b' }} />
            <Title level={2} style={{ margin: '16px 0 4px', color: '#1f2937' }}>
              {profile?.subjectsAssigned?.length || 0}
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>Subjects Teaching</Text>
          </Card>
        </Col>

        {/* Courses & Subjects */}
        <Col xs={24}>
          <Card
            title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}><BookOutlined /> Assigned Courses & Subjects</span>}
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
            extra={<Tag color="blue">({profile?.coursesAssigned?.length || 0} courses)</Tag>}
          >
            <Row gutter={[16, 16]}>
              {profile?.coursesAssigned && profile.coursesAssigned.length > 0 ? (
                profile.coursesAssigned.map((course, idx) => (
                  <Col xs={24} sm={12} md={8} key={idx}>
                    <Card 
                      hoverable
                      style={{ 
                        borderRadius: '8px', 
                        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f2ff 100%)',
                        borderColor: '#1890ff',
                        border: '1px solid #91caff',
                        boxShadow: '0 2px 4px rgba(24, 144, 255, 0.1)'
                      }}
                    >
                      <Title level={5} style={{ color: '#1890ff', marginBottom: '12px', fontWeight: '600' }}>
                        {course.courseName || course.name || `Course ${idx + 1}`}
                      </Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                        <strong>Code:</strong> {course.courseCode}
                      </Text>
                      {course.description && (
                        <Text style={{ fontSize: '12px', display: 'block', marginBottom: '8px', color: '#666' }}>
                          {course.description.substring(0, 60)}...
                        </Text>
                      )}
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={24}>
                  <Empty description="No courses assigned yet" />
                </Col>
              )}
            </Row>

            {profile?.subjectsAssigned && profile.subjectsAssigned.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Subjects</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.subjectsAssigned.map((subject, idx) => (
                    <Tag key={idx} color="blue" style={{ padding: '4px 12px', fontSize: '12px' }}>
                      {subject.subjectName || subject.name || `Subject ${idx + 1}`}
                    </Tag>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Assigned Students Table */}
        <Col xs={24}>
          <Card
            title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}><TeamOutlined /> Assigned Students</span>}
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
            extra={<Tag color="cyan">({students.length} students)</Tag>}
          >
            {loading ? (
              <Spin tip="Loading students..." />
            ) : studentsError ? (
              <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <Title level={5} style={{ color: '#d46b08' }}>⚠️ Error Loading Students</Title>
                <Text style={{ color: '#d46b08' }}>{studentsError}</Text>
                <Button 
                  type="primary" 
                  onClick={fetchAssignedStudents}
                  style={{ marginTop: '16px' }}
                >
                  Retry
                </Button>
              </Space>
            ) : students.length > 0 ? (
              <Table
                columns={studentsColumns}
                dataSource={students}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="No students assigned yet" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Timetable Modal */}
      <Modal
        title={`Create Timetable for ${selectedStudent?.personalDetails?.firstName} ${selectedStudent?.personalDetails?.lastName}`}
        open={isModalOpen}
        onOk={handleSaveTimetable}
        onCancel={() => {
          setIsModalOpen(false);
          setFormData([]);
          setSelectedStudent(null);
        }}
        width={800}
        okText="Save Timetable"
      >
        <Form layout="vertical">
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {formData.map((slot, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: '16px' }}
                extra={
                  formData.length > 1 && (
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveSlot(index)}
                    >
                      Remove
                    </Button>
                  )
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Day" style={{ marginBottom: 0 }}>
                      <Select
                        value={slot.day}
                        onChange={(value) => handleSlotChange(index, 'day', value)}
                        options={days.map(d => ({ label: d, value: d }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Subject" style={{ marginBottom: 0 }}>
                      <Input
                        placeholder="e.g., Data Structures"
                        value={slot.subject}
                        onChange={(e) => handleSlotChange(index, 'subject', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Start Time" style={{ marginBottom: 0 }}>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="End Time" style={{ marginBottom: 0 }}>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Classroom" style={{ marginBottom: 0 }}>
                      <Input
                        placeholder="e.g., Room 101"
                        value={slot.classroom}
                        onChange={(e) => handleSlotChange(index, 'classroom', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddSlot}
            style={{ marginTop: '16px' }}
          >
            Add Another Slot
          </Button>
        </Form>
      </Modal>

      {/* Student Details Drawer */}
      <Drawer
        title="Student Details"
        placement="right"
        onClose={() => setStudentDetailsVisible(false)}
        open={studentDetailsVisible}
        width={400}
      >
        {selectedStudent && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '12px' }}>
                {selectedStudent.personalDetails?.firstName} {selectedStudent.personalDetails?.lastName}
              </Title>
            </div>

            <Divider />

            <div>
              <Text strong>Email:</Text>
              <div>{selectedStudent.email}</div>
            </div>

            <div>
              <Text strong>Admission Number:</Text>
              <div>{selectedStudent.admissionNumber}</div>
            </div>

            <div>
              <Text strong>Date of Birth:</Text>
              <div>{selectedStudent.personalDetails?.dob ? new Date(selectedStudent.personalDetails.dob).toLocaleDateString() : 'N/A'}</div>
            </div>

            <div>
              <Text strong>Gender:</Text>
              <div>{selectedStudent.personalDetails?.gender || 'N/A'}</div>
            </div>

            <div>
              <Text strong>Phone:</Text>
              <div>{selectedStudent.personalDetails?.phone || 'N/A'}</div>
            </div>

            <Divider />

            <div>
              <Text strong>Course:</Text>
              <div>{selectedStudent.academicDetails?.course?.courseName || 'N/A'}</div>
            </div>

            <div>
              <Text strong>Roll Number:</Text>
              <div>{selectedStudent.academicDetails?.rollNumber || 'N/A'}</div>
            </div>

            <div>
              <Text strong>Batch:</Text>
              <div>{selectedStudent.academicDetails?.batch || 'N/A'}</div>
            </div>

            <div>
              <Text strong>CGPA:</Text>
              <div>{selectedStudent.academicDetails?.cgpa || '0.00'}</div>
            </div>

            <Divider />

            <div>
              <Text strong>Father Name:</Text>
              <div>{selectedStudent.guardianDetails?.fatherName || 'N/A'}</div>
            </div>

            <div>
              <Text strong>Guardian Phone:</Text>
              <div>{selectedStudent.guardianDetails?.guardianPhone || 'N/A'}</div>
            </div>
          </Space>
        )}
      </Drawer>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editProfileVisible}
        onCancel={() => {
          setEditProfileVisible(false);
          setPhotoFile(null);
          setPhotoPreview(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          style={{ marginTop: '24px' }}
        >
          {/* Photo Upload */}
          <Form.Item label="Profile Photo">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar
                size={120}
                src={photoPreview}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#667eea', marginBottom: '16px' }}
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-input"
                />
                <label htmlFor="photo-input">
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={() => document.getElementById('photo-input').click()}
                  >
                    Change Photo
                  </Button>
                </label>
              </div>
            </div>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Phone Number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Gender"
              >
                <Select placeholder="Select Gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please enter department' }]}
              >
                <Input placeholder="Department" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="designation"
                label="Designation"
              >
                <Input placeholder="Designation" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="specialization"
            label="Specialization (comma separated)"
          >
            <Input.TextArea 
              placeholder="e.g., Mathematics, Advanced Calculus" 
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditProfileVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
              >
                Update Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherDashboardNew;
