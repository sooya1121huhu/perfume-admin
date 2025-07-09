import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Typography,
  Card,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// 환경변수에서 API 주소를 읽어오고, 없으면 기본값 사용
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  return (
    <Router>
      <AdminLayout />
    </Router>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [form] = Form.useForm();
  const [perfumeSummary, setPerfumeSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [pwForm] = Form.useForm();

  // 탭-URL 매핑
  const tabKeyToPath = {
    dashboard: '/dashboard',
    perfumes: '/perfumes',
    users: '/users'
  };
  const pathToTabKey = {
    '/dashboard': 'dashboard',
    '/perfumes': 'perfumes',
    '/users': 'users'
  };
  // 현재 탭 결정
  const currentTab = pathToTabKey[location.pathname] || 'dashboard';

  useEffect(() => {
    if (currentTab === 'perfumes') {
    fetchPerfumes();
    } else if (currentTab === 'dashboard') {
      fetchPerfumeSummary();
    } else if (currentTab === 'users') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [currentTab]);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/perfumes`);
      if (!response.ok) {
        throw new Error('향수 데이터를 불러오는데 실패했습니다.');
      }
      const result = await response.json();
      setPerfumes(result.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 향수별 보유 유저 수 집계 fetch
  const fetchPerfumeSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user-perfumes/summary`);
      if (!response.ok) throw new Error('향수별 보유 유저 수 집계 실패');
      const result = await response.json();
      setPerfumeSummary(result.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // 사용자 리스트 fetch
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) throw new Error('사용자 리스트 조회 실패');
      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPerfume(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPerfume(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleToggleStatus = async (record) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    try {
      const response = await fetch(`${API_BASE_URL}/api/perfumes/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...record,
          status: nextStatus
        })
      });
      if (!response.ok) throw new Error('상태 변경에 실패했습니다.');
      message.success(nextStatus === 1 ? '향수가 노출되었습니다.' : '향수가 감춰졌습니다.');
      fetchPerfumes();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPerfume
        ? `${API_BASE_URL}/api/perfumes/${editingPerfume.id}`
        : `${API_BASE_URL}/api/perfumes`;
      const method = editingPerfume ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }
      message.success(editingPerfume ? '향수가 수정되었습니다.' : '향수가 추가되었습니다.');
      setModalVisible(false);
      fetchPerfumes();
    } catch (err) {
      message.error(err.message);
    }
  };

  // 비밀번호 재설정 모달 열기
  const openPwModal = (user) => {
    setPwUser(user);
    pwForm.resetFields();
    setPwModalVisible(true);
  };

  // 비밀번호 재설정 저장
  const handlePwReset = async () => {
    try {
      const values = await pwForm.validateFields();
      if (values.password !== values.passwordConfirm) {
        pwForm.setFields([
          { name: 'passwordConfirm', errors: ['비밀번호가 일치하지 않습니다.'] }
        ]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/users/${pwUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password })
      });
      if (!response.ok) throw new Error('비밀번호 변경 실패');
      message.success('비밀번호가 변경되었습니다.');
      setPwModalVisible(false);
      fetchUsers();
    } catch (err) {
      if (err.errorFields) return; // 유효성 검사 에러
      message.error(err.message);
    }
  };

  // 사용자 삭제
  const handleUserDelete = async (user) => {
    if (!window.confirm(`${user.username} 사용자를 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('사용자 삭제 실패');
      message.success('사용자가 삭제되었습니다.');
      fetchUsers();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: '주요 노트',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => Array.isArray(notes) ? notes.join(', ') : notes,
      ellipsis: true,
    },
    {
      title: '어울리는 계절',
      dataIndex: 'season_tags',
      key: 'season_tags',
      render: (season_tags) => Array.isArray(season_tags) ? season_tags.join(', ') : season_tags,
    },
    {
      title: '어울리는 날씨',
      dataIndex: 'weather_tags',
      key: 'weather_tags',
      render: (weather_tags) => Array.isArray(weather_tags) ? weather_tags.join(', ') : weather_tags,
    },
    {
      title: '분석 이유',
      dataIndex: 'analysis_reason',
      key: 'analysis_reason',
      ellipsis: true,
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Button
            type={record.status === 1 ? 'default' : 'primary'}
            danger={record.status === 1}
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '감추기' : '노출하기'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          mode="inline"
          selectedKeys={[currentTab]}
          onClick={e => navigate(tabKeyToPath[e.key])}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>대시보드</Menu.Item>
          <Menu.Item key="perfumes" icon={<ShoppingOutlined />}>향수 관리</Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>사용자 관리</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: 0, lineHeight: '64px' }}>
            🎭 향수 관리 시스템
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardTab perfumeSummary={perfumeSummary} summaryLoading={summaryLoading} />} />
            <Route path="/perfumes" element={<PerfumeTab perfumes={perfumes} loading={loading} modalVisible={modalVisible} setModalVisible={setModalVisible} editingPerfume={editingPerfume} setEditingPerfume={setEditingPerfume} form={form} fetchPerfumes={fetchPerfumes} handleAdd={handleAdd} handleEdit={handleEdit} handleToggleStatus={handleToggleStatus} handleSubmit={handleSubmit} />} />
            <Route path="/users" element={<UserTab users={users} userLoading={userLoading} openPwModal={openPwModal} handleUserDelete={handleUserDelete} pwModalVisible={pwModalVisible} setPwModalVisible={setPwModalVisible} pwUser={pwUser} pwForm={pwForm} handlePwReset={handlePwReset} />} />
            <Route path="*" element={<DashboardTab perfumeSummary={perfumeSummary} summaryLoading={summaryLoading} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function DashboardTab({ perfumeSummary, summaryLoading }) {
  return (
    <>
      <Title level={4}>고객 보유 향수 현황</Title>
      <Table
        columns={[
          { title: '향수명', dataIndex: 'perfume_name', key: 'perfume_name' },
          { title: '보유 중인 유저 수', dataIndex: 'user_count', key: 'user_count' }
        ]}
        dataSource={perfumeSummary}
        rowKey="perfume_id"
        loading={summaryLoading}
        pagination={false}
      />
    </>
  );
}

function PerfumeTab({ perfumes, loading, modalVisible, setModalVisible, editingPerfume, setEditingPerfume, form, fetchPerfumes, handleAdd, handleEdit, handleToggleStatus, handleSubmit }) {
  // 테이블 컬럼 정의 추가
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '브랜드', dataIndex: 'brand', key: 'brand' },
    { title: '주요 노트', dataIndex: 'notes', key: 'notes', render: notes => notes?.join(', ') },
    { title: '계절', dataIndex: 'season_tags', key: 'season_tags', render: tags => tags?.join(', ') },
    { title: '날씨', dataIndex: 'weather_tags', key: 'weather_tags', render: tags => tags?.join(', ') },
    { title: '상태', dataIndex: 'status', key: 'status', render: status => status === 1 ? '노출' : '숨김' },
    {
      title: '액션',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>수정</Button>
          <Button size="small" onClick={() => handleToggleStatus(record)}>
            {record.status === 1 ? '숨기기' : '노출'}
          </Button>
        </Space>
      )
    }
  ];
  return (
    <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="총 향수 수"
                  value={perfumes.length}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="총 브랜드 수"
                  value={perfumes.length > 0 ? new Set(perfumes.map(p => p.brand)).size : 0}
                  suffix="개"
                />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              향수 추가
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={perfumes}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
      <Modal
        title={editingPerfume ? '향수 수정' : '향수 추가'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="향수 이름"
            rules={[{ required: true, message: '향수 이름을 입력해주세요!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="url"
            label="상세 정보 URL"
            rules={[]}
          >
            <Input placeholder="https://www.fragrantica.fr/..." />
          </Form.Item>
          
          <Form.Item
            name="brand"
            label="브랜드"
            rules={[{ required: true, message: '브랜드를 입력해주세요!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="주요 노트"
            rules={[{ required: true, message: '주요 노트를 입력해주세요!' }]}
          >
            <Select
              mode="tags"
              placeholder="주요 노트를 입력하세요 (예: 알데하이드, 장미, 자스민)"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="season_tags"
            label="어울리는 계절"
            rules={[{ required: true, message: '어울리는 계절을 선택해주세요!' }]}
          >
            <Select
              mode="multiple"
              placeholder="어울리는 계절을 선택하세요"
              style={{ width: '100%' }}
            >
              <Option value="봄">봄</Option>
              <Option value="여름">여름</Option>
              <Option value="가을">가을</Option>
              <Option value="겨울">겨울</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="weather_tags"
            label="어울리는 날씨"
            rules={[{ required: true, message: '어울리는 날씨를 선택해주세요!' }]}
          >
            <Select
              mode="multiple"
              placeholder="어울리는 날씨를 선택하세요"
              style={{ width: '100%' }}
            >
              <Option value="맑음">맑음</Option>
              <Option value="흐림">흐림</Option>
              <Option value="비">비</Option>
              <Option value="눈">눈</Option>
              <Option value="더움">더움</Option>
              <Option value="추움">추움</Option>
              <Option value="선선함">선선함</Option>
              <Option value="습함">습함</Option>
              <Option value="따뜻함">따뜻함</Option>
              <Option value="쌀쌀함">쌀쌀함</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="analysis_reason"
            label="분석 이유"
            rules={[{ required: true, message: '분석 이유를 입력해주세요!' }]}
          >
            <Input.TextArea rows={4} placeholder="향수의 특징과 분석 이유를 입력하세요" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPerfume ? '수정' : '추가'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function UserTab({ users, userLoading, openPwModal, handleUserDelete, pwModalVisible, setPwModalVisible, pwUser, pwForm, handlePwReset }) {
  return (
    <>
      <Title level={4}>사용자 관리</Title>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: '사용자명', dataIndex: 'username', key: 'username' },
          { title: '비밀번호 재설정', key: 'pwreset', render: (_, user) => (
            <Button size="small" onClick={() => openPwModal(user)}>비밀번호 재설정</Button>
          ) },
          { title: '삭제', key: 'delete', render: (_, user) => (
            <Button size="small" danger onClick={() => handleUserDelete(user)}>삭제</Button>
          ) }
        ]}
        dataSource={users}
        rowKey="id"
        loading={userLoading}
        pagination={false}
      />
      <Modal
        title={`비밀번호 재설정: ${pwUser?.username}`}
        open={pwModalVisible}
        onCancel={() => setPwModalVisible(false)}
        onOk={handlePwReset}
        okText="변경"
        cancelText="취소"
      >
        <Form form={pwForm} layout="vertical">
          <Form.Item
            name="password"
            label="새 비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="passwordConfirm"
            label="비밀번호 확인"
            dependencies={["password"]}
            rules={[{ required: true, message: '비밀번호를 한 번 더 입력하세요.' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default App;
