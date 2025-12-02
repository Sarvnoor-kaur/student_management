import { useState, useEffect } from 'react';
import { Card, Button, Form, Select, Table, Checkbox, DatePicker, message, Row, Col, Spin, Tag } from 'antd';
import { SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const TeacherAttendancePage = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [form] = Form.useForm();
  const [pastRecords, setPastRecords] = useState([]);

  useEffect(() => {
    fetchTeacherSubjects();
  }, [user?.id]);

  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers/profile');
      if (response.data.success) {
        const subjectsAssigned = response.data.teacher?.subjectsAssigned || [];
        setSubjects(subjectsAssigned);
      }
    } catch (error) {
      message.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId);
    setAttendance({});
    
    try {
      setLoading(true);
      const response = await api.get('/teachers/attendance-by-subject', {
        params: { subject: subjectId, batch: selectedDate.format('YYYY-MM') }
      });
      
      if (response.data.success) {
        setPastRecords(response.data.attendance || []);
      }
    } catch (error) {
      message.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedSubject) {
      message.warning('Please select a subject');
      return;
    }

    const attendanceRecords = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id] || 'absent',
      subjectName: student.subjectName
    }));

    if (attendanceRecords.length === 0) {
      message.warning('No students to mark attendance');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/teachers/mark-attendance', {
        students: attendanceRecords,
        date: selectedDate.format('YYYY-MM-DD'),
        subject: selectedSubject,
        batch: selectedDate.format('YYYY-MM')
      });

      message.success('Attendance marked successfully!');
      setAttendance({});
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const pastRecordsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => `${record.student?.personalDetails?.firstName} ${record.student?.personalDetails?.lastName}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'present' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Spin spinning={loading} tip="Loading...">
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Mark Attendance</h1>
          <p style={{ color: '#666' }}>Record student attendance for your subjects</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Mark Attendance</h2>
              
              <Form layout="vertical" form={form} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Select Subject"
                  name="subject"
                  rules={[{ required: true, message: 'Please select a subject' }]}
                >
                  <Select 
                    placeholder="Select subject taught by you"
                    onChange={handleSubjectChange}
                  >
                    {subjects.map(subject => (
                      <Select.Option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Select Date"
                  name="date"
                  initialValue={selectedDate}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                  />
                </Form.Item>
              </Form>

              {selectedSubject && students.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Students in {selectedSubject} - {students.length} total
                  </h3>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '12px' }}>
                    {students.map(student => (
                      <div 
                        key={student._id}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {student.personalDetails?.firstName} {student.personalDetails?.lastName}
                          <br />
                          <small style={{ color: '#999' }}>{student.admissionNumber}</small>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            size="small"
                            type={attendance[student._id] === 'present' ? 'primary' : 'default'}
                            onClick={() => handleAttendanceChange(student._id, 'present')}
                          >
                            Present
                          </Button>
                          <Button
                            size="small"
                            type={attendance[student._id] === 'absent' ? 'primary' : 'default'}
                            danger={attendance[student._id] === 'absent'}
                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                          >
                            Absent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    loading={submitting}
                    icon={<SaveOutlined />}
                    style={{ marginTop: '16px' }}
                    onClick={handleSubmitAttendance}
                  >
                    Submit Attendance
                  </Button>
                </div>
              )}

              {selectedSubject && students.length === 0 && (
                <div style={{ 
                  padding: '32px', 
                  textAlign: 'center', 
                  color: '#999',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  No students found for this subject
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Past Attendance Records</h2>
              
              {selectedSubject ? (
                <Table
                  columns={pastRecordsColumns}
                  dataSource={pastRecords}
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                  rowKey="_id"
                  size="small"
                />
              ) : (
                <div style={{ 
                  padding: '32px', 
                  textAlign: 'center', 
                  color: '#999'
                }}>
                  Select a subject to view attendance records
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default TeacherAttendancePage;
