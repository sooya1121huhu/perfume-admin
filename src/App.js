import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import {
  PlusOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShopOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';
import ScrapePerfumePage from './pages/ScrapePerfume';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// 환경변수에서 API 주소를 읽어오고, 없으면 기본값 사용
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 미리 정의된 아코드 목록
const ACCORD_OPTIONS = [
  'vanilla', 'powdery', 'woody', 'floral', 'fresh', 'citrus', 'oriental', 
  'musk', 'amber', 'spicy', 'aquatic', 'green', 'fruity', 'gourmand',
  'leather', 'tobacco', 'smoky', 'herbal', 'earthy', 'metallic'
];

// 미리 정의된 노트 목록 (카테고리별로 정리)
const NOTE_OPTIONS = [
  // Top Notes (상단 노트)
  '알데하이드', '베르가못', '레몬', '오렌지', '라임', '만다린', '그레이프프루트', '베르가몯',
  '이리스', '네롤리', '오렌지블라썸', '피치', '플럼', '애플', '프루티',
  
  // Middle Notes (중간 노트)
  '장미', '재스민', '라벤더', '일랑일랑', '피오니', '튤립', '카모마일', '네롤리',
  '이리스', '재스민', '라벤더', '일랑일랑', '피오니', '튤립', '카모마일',
  
  // Base Notes (하단 노트)
  '바닐라', '파츌리', '베티버', '샌달우드', '시더우드', '오크모스', '머스크', '앰버',
  '토바코', '레더', '스모키', '스파이시', '시나몬', '초콜릿', '커피', '허니', '카라멜'
];

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
  const [brands, setBrands] = useState([]);

  // 탭-URL 매핑
  const tabKeyToPath = {
    dashboard: '/dashboard',
    perfumes: '/perfumes',
    brands: '/brands',
    scrape: '/scrape',
    users: '/users'
  };
  const pathToTabKey = {
    '/dashboard': 'dashboard',
    '/perfumes': 'perfumes',
    '/brands': 'brands',
    '/scrape': 'scrape',
    '/users': 'users'
  };
  // 현재 탭 결정
  const currentTab = pathToTabKey[location.pathname] || 'dashboard';

  useEffect(() => {
    if (currentTab === 'perfumes') {
      fetchPerfumes();
      fetchBrands();
    } else if (currentTab === 'dashboard') {
      fetchPerfumeSummary();
    } else if (currentTab === 'brands') {
      fetchBrands();
    } else if (currentTab === 'scrape') {
      // 향수 가져오기 페이지는 별도 데이터 로딩이 필요 없음
    } else if (currentTab === 'users') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [currentTab]);

  // 브랜드 목록 가져오기 (향수 수 포함)
  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/brands?include=perfume_count`);
      setBrands(response.data.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/perfumes`);
      setPerfumes(response.data.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 향수별 보유 유저 수 집계 fetch
  const fetchPerfumeSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/user-perfumes/summary`);
      setPerfumeSummary(response.data.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // 사용자 리스트 fetch
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(response.data.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
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
    form.setFieldsValue({
      brand_id: record.brand_id,
      name: record.name,
      top_notes: record.top_notes || [],
      middle_notes: record.middle_notes || [],
      base_notes: record.base_notes || [],
      fragrance_notes: record.fragrance_notes || [],
      accord_1_name: record.accord_1_name,
      accord_1_width: record.accord_1_width,
      accord_2_name: record.accord_2_name,
      accord_2_width: record.accord_2_width,
      accord_3_name: record.accord_3_name,
      accord_3_width: record.accord_3_width,
      accord_4_name: record.accord_4_name,
      accord_4_width: record.accord_4_width,
      accord_5_name: record.accord_5_name,
      accord_5_width: record.accord_5_width
    });
    setModalVisible(true);
  };

  const handleToggleStatus = async (record) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/perfumes/${record.id}`, {
        ...record,
        status: nextStatus
      });
      message.success(nextStatus === 1 ? '향수가 노출되었습니다.' : '향수가 감춰졌습니다.');
      fetchPerfumes();
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const perfumeData = {
        brand_id: values.brand_id,
        name: values.name,
        top_notes: values.top_notes || [],
        middle_notes: values.middle_notes || [],
        base_notes: values.base_notes || [],
        fragrance_notes: values.fragrance_notes || [],
        accord_1_name: values.accord_1_name || null,
        accord_1_width: values.accord_1_width ? parseFloat(values.accord_1_width) : null,
        accord_2_name: values.accord_2_name || null,
        accord_2_width: values.accord_2_width ? parseFloat(values.accord_2_width) : null,
        accord_3_name: values.accord_3_name || null,
        accord_3_width: values.accord_3_width ? parseFloat(values.accord_3_width) : null,
        accord_4_name: values.accord_4_name || null,
        accord_4_width: values.accord_4_width ? parseFloat(values.accord_4_width) : null,
        accord_5_name: values.accord_5_name || null,
        accord_5_width: values.accord_5_width ? parseFloat(values.accord_5_width) : null
      };

      if (editingPerfume) {
        await axios.put(`${API_BASE_URL}/api/perfumes/${editingPerfume.id}`, perfumeData);
      } else {
        await axios.post(`${API_BASE_URL}/api/perfumes`, perfumeData);
      }
      message.success(editingPerfume ? '향수가 수정되었습니다.' : '향수가 추가되었습니다.');
      setModalVisible(false);
      fetchPerfumes();
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
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
      await axios.put(`${API_BASE_URL}/api/users/${pwUser.id}/reset-password`, { 
        newPassword: values.password 
      });
      message.success('비밀번호가 변경되었습니다.');
      setPwModalVisible(false);
      fetchUsers();
    } catch (err) {
      if (err.errorFields) return; // 유효성 검사 에러
      message.error(err.response?.data?.message || err.message);
    }
  };

  // 사용자 삭제
  const handleUserDelete = async (user) => {
    if (!window.confirm(`${user.username} 사용자를 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${user.id}`);
      message.success('사용자가 삭제되었습니다.');
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

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
          <Menu.Item key="brands" icon={<ShopOutlined />}>브랜드 관리</Menu.Item>
          <Menu.Item key="scrape" icon={<DownloadOutlined />}>향수 가져오기</Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>사용자 관리</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardTab perfumeSummary={perfumeSummary} summaryLoading={summaryLoading} />} />
            <Route path="/perfumes" element={<PerfumeTab perfumes={perfumes} loading={loading} modalVisible={modalVisible} setModalVisible={setModalVisible} editingPerfume={editingPerfume} setEditingPerfume={setEditingPerfume} form={form} fetchPerfumes={fetchPerfumes} handleAdd={handleAdd} handleEdit={handleEdit} handleToggleStatus={handleToggleStatus} handleSubmit={handleSubmit} brands={brands} />} />
            <Route path="/brands" element={<BrandTab brands={brands} />} />
            <Route path="/scrape" element={<ScrapePerfumePage />} />
            <Route path="/users" element={<UserTab users={users} userLoading={userLoading} openPwModal={openPwModal} handleUserDelete={handleUserDelete} pwModalVisible={pwModalVisible} setPwModalVisible={setPwModalVisible} pwUser={pwUser} pwForm={pwForm} handlePwReset={handlePwReset} />} />
            <Route path="/" element={<DashboardTab perfumeSummary={perfumeSummary} summaryLoading={summaryLoading} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function DashboardTab({ perfumeSummary, summaryLoading }) {
  return (
    <>
      <Title level={2}>대시보드</Title>
      <Table
        columns={[
          { title: '향수명', dataIndex: 'perfume_name', key: 'perfume_name' },
          { title: '브랜드', dataIndex: 'brand_name', key: 'brand_name' },
          { title: '보유 유저 수', dataIndex: 'user_count', key: 'user_count' }
        ]}
        dataSource={perfumeSummary}
        rowKey="perfume_id"
        loading={summaryLoading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}

function PerfumeTab({ perfumes, loading, modalVisible, setModalVisible, editingPerfume, setEditingPerfume, form, fetchPerfumes, handleAdd, handleEdit, handleToggleStatus, handleSubmit, brands }) {
  const [searchText, setSearchText] = useState('');
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);

  // 검색 필터링
  useEffect(() => {
    if (searchText) {
      const filtered = perfumes.filter(perfume => 
        perfume.name.toLowerCase().includes(searchText.toLowerCase()) ||
        perfume.PerfumeBrand?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (perfume.top_notes && perfume.top_notes.some(note => note.toLowerCase().includes(searchText.toLowerCase()))) ||
        (perfume.middle_notes && perfume.middle_notes.some(note => note.toLowerCase().includes(searchText.toLowerCase()))) ||
        (perfume.base_notes && perfume.base_notes.some(note => note.toLowerCase().includes(searchText.toLowerCase()))) ||
        (perfume.accord_1_name && perfume.accord_1_name.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredPerfumes(filtered);
    } else {
      setFilteredPerfumes(perfumes);
    }
  }, [perfumes, searchText]);
  // 테이블 컬럼 정의 추가
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
      title: '향수명', 
      dataIndex: 'name', 
      key: 'name',
      width: 150,
      render: (name) => <strong>{name}</strong>,
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    { 
      title: '브랜드', 
      dataIndex: 'PerfumeBrand', 
      key: 'brand', 
      width: 100,
      render: brand => brand?.name || '브랜드 없음',
      sorter: (a, b) => (a.PerfumeBrand?.name || '').localeCompare(b.PerfumeBrand?.name || '')
    },
    { 
      title: 'Top Notes', 
      dataIndex: 'top_notes', 
      key: 'top_notes',
      width: 120,
      render: notes => notes?.length > 0 ? (
        <Space wrap>
          {notes.slice(0, 3).map((note, index) => (
            <Tag key={index} color="green" size="small">{note}</Tag>
          ))}
          {notes.length > 3 && <Tag size="small">+{notes.length - 3}</Tag>}
        </Space>
      ) : <span style={{ color: '#ccc' }}>없음</span>
    },
    { 
      title: 'Middle Notes', 
      dataIndex: 'middle_notes', 
      key: 'middle_notes',
      width: 120,
      render: notes => notes?.length > 0 ? (
        <Space wrap>
          {notes.slice(0, 3).map((note, index) => (
            <Tag key={index} color="blue" size="small">{note}</Tag>
          ))}
          {notes.length > 3 && <Tag size="small">+{notes.length - 3}</Tag>}
        </Space>
      ) : <span style={{ color: '#ccc' }}>없음</span>
    },
    { 
      title: 'Base Notes', 
      dataIndex: 'base_notes', 
      key: 'base_notes',
      width: 120,
      render: notes => notes?.length > 0 ? (
        <Space wrap>
          {notes.slice(0, 3).map((note, index) => (
            <Tag key={index} color="purple" size="small">{note}</Tag>
          ))}
          {notes.length > 3 && <Tag size="small">+{notes.length - 3}</Tag>}
        </Space>
      ) : <span style={{ color: '#ccc' }}>없음</span>
    },
    { 
      title: 'Main Accord', 
      dataIndex: 'accord_1_name', 
      key: 'accord_1',
      width: 100,
      render: (accord, record) => {
        if (!accord) return <span style={{ color: '#ccc' }}>없음</span>;
        const width = record.accord_1_width ? `${record.accord_1_width}%` : '';
        return (
          <Space>
            <Tag color="orange">{accord}</Tag>
            {width && <span style={{ fontSize: '12px', color: '#666' }}>({width})</span>}
          </Space>
        );
      }
    },
    { 
      title: 'Second Accord', 
      dataIndex: 'accord_2_name', 
      key: 'accord_2',
      width: 100,
      render: (accord, record) => {
        if (!accord) return <span style={{ color: '#ccc' }}>없음</span>;
        const width = record.accord_2_width ? `${record.accord_2_width}%` : '';
        return (
          <Space>
            <Tag color="cyan">{accord}</Tag>
            {width && <span style={{ fontSize: '12px', color: '#666' }}>({width})</span>}
          </Space>
        );
      }
    },
    { 
      title: 'Third Accord', 
      dataIndex: 'accord_3_name', 
      key: 'accord_3',
      width: 100,
      render: (accord, record) => {
        if (!accord) return <span style={{ color: '#ccc' }}>없음</span>;
        const width = record.accord_3_width ? `${record.accord_3_width}%` : '';
        return (
          <Space>
            <Tag color="magenta">{accord}</Tag>
            {width && <span style={{ fontSize: '12px', color: '#666' }}>({width})</span>}
          </Space>
        );
      }
    },
    { 
      title: 'Fourth Accord', 
      dataIndex: 'accord_4_name', 
      key: 'accord_4',
      width: 100,
      render: (accord, record) => {
        if (!accord) return <span style={{ color: '#ccc' }}>없음</span>;
        const width = record.accord_4_width ? `${record.accord_4_width}%` : '';
        return (
          <Space>
            <Tag color="lime">{accord}</Tag>
            {width && <span style={{ fontSize: '12px', color: '#666' }}>({width})</span>}
          </Space>
        );
      }
    },
    { 
      title: 'Fifth Accord', 
      dataIndex: 'accord_5_name', 
      key: 'accord_5',
      width: 100,
      render: (accord, record) => {
        if (!accord) return <span style={{ color: '#ccc' }}>없음</span>;
        const width = record.accord_5_width ? `${record.accord_5_width}%` : '';
        return (
          <Space>
            <Tag color="geekblue">{accord}</Tag>
            {width && <span style={{ fontSize: '12px', color: '#666' }}>({width})</span>}
          </Space>
        );
      }
    },
    { 
      title: '상태', 
      dataIndex: 'status', 
      key: 'status', 
      width: 80,
      render: status => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '노출' : '숨김'}
        </Tag>
      )
    },
    {
      title: '액션',
      key: 'action',
      width: 120,
      fixed: 'right',
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
                  value={brands.length}
                  suffix="개"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="노출 중인 향수"
                  value={perfumes.filter(p => p.status === 1).length}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="숨겨진 향수"
                  value={perfumes.filter(p => p.status === 0).length}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Input.Search
                placeholder="향수명, 브랜드, 노트, 아코드로 검색"
                allowClear
                enterButton
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                향수 추가
              </Button>
            </Col>
          </Row>
                      <Table
              columns={columns}
              dataSource={filteredPerfumes}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1400 }}
              size="small"
            />
      <Modal
        title={editingPerfume ? '향수 수정' : '향수 추가'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="향수 이름"
                rules={[{ required: true, message: '향수 이름을 입력해주세요!' }]}
              >
                <Input placeholder="예: Chanel N°5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand_id"
                label="브랜드"
                rules={[{ required: true, message: '브랜드를 선택해주세요!' }]}
              >
                <Select placeholder="브랜드 선택">
                  {brands.map(brand => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">향 노트</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="top_notes"
                label="Top Notes"
                rules={[{ required: true, message: 'Top Notes를 입력해주세요!' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Top Notes 입력 (예: 알데하이드, 베르가못)"
                  style={{ width: '100%' }}
                  options={NOTE_OPTIONS.map(note => ({ label: note, value: note }))}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="middle_notes"
                label="Middle Notes"
                rules={[{ required: true, message: 'Middle Notes를 입력해주세요!' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Middle Notes 입력 (예: 장미, 재스민)"
                  style={{ width: '100%' }}
                  options={NOTE_OPTIONS.map(note => ({ label: note, value: note }))}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="base_notes"
                label="Base Notes"
                rules={[{ required: true, message: 'Base Notes를 입력해주세요!' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Base Notes 입력 (예: 바닐라, 파츌리)"
                  style={{ width: '100%' }}
                  options={NOTE_OPTIONS.map(note => ({ label: note, value: note }))}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fragrance_notes"
            label="Fragrance Notes (전체 향 노트)"
          >
            <Select
              mode="tags"
              placeholder="전체 향 노트를 입력하세요 (선택사항)"
              style={{ width: '100%' }}
              options={NOTE_OPTIONS.map(note => ({ label: note, value: note }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Form.Item>

          <Divider orientation="left">아코드 (Accord)</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accord_1_name" label="Main Accord">
                <Select 
                  placeholder="Main Accord 선택" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {ACCORD_OPTIONS.map(accord => (
                    <Option key={accord} value={accord}>
                      {accord}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="accord_1_width" 
                label="Main Accord Width (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 사이의 값을 입력하세요' }
                ]}
              >
                <Input type="number" placeholder="예: 100" min="0" max="100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accord_2_name" label="Second Accord">
                <Select 
                  placeholder="Second Accord 선택" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {ACCORD_OPTIONS.map(accord => (
                    <Option key={accord} value={accord}>
                      {accord}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="accord_2_width" 
                label="Second Accord Width (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 사이의 값을 입력하세요' }
                ]}
              >
                <Input type="number" placeholder="예: 75" min="0" max="100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accord_3_name" label="Third Accord">
                <Select 
                  placeholder="Third Accord 선택" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {ACCORD_OPTIONS.map(accord => (
                    <Option key={accord} value={accord}>
                      {accord}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="accord_3_width" 
                label="Third Accord Width (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 사이의 값을 입력하세요' }
                ]}
              >
                <Input type="number" placeholder="예: 50" min="0" max="100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accord_4_name" label="Fourth Accord">
                <Select 
                  placeholder="Fourth Accord 선택" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {ACCORD_OPTIONS.map(accord => (
                    <Option key={accord} value={accord}>
                      {accord}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="accord_4_width" 
                label="Fourth Accord Width (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 사이의 값을 입력하세요' }
                ]}
              >
                <Input type="number" placeholder="예: 25" min="0" max="100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accord_5_name" label="Fifth Accord">
                <Select 
                  placeholder="Fifth Accord 선택" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {ACCORD_OPTIONS.map(accord => (
                    <Option key={accord} value={accord}>
                      {accord}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="accord_5_width" 
                label="Fifth Accord Width (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 사이의 값을 입력하세요' }
                ]}
              >
                <Input type="number" placeholder="예: 10" min="0" max="100" />
              </Form.Item>
            </Col>
          </Row>


          
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



function BrandTab({ brands }) {
  const [searchText, setSearchText] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);

  // 검색 필터링
  useEffect(() => {
    if (searchText) {
      const filtered = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  }, [brands, searchText]);
  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80 
    },
    { 
      title: '브랜드명', 
      dataIndex: 'name', 
      key: 'name',
      width: 200,
      render: (name) => <strong>{name}</strong>
    },
    { 
      title: '향수 수', 
      dataIndex: 'perfume_count', 
      key: 'perfume_count',
      width: 100,
      render: (count) => (
        <Tag color="blue">{count || 0}개</Tag>
      ),
      sorter: (a, b) => (a.perfume_count || 0) - (b.perfume_count || 0)
    },
    { 
      title: '상태', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: status => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '활성' : '비활성'}
        </Tag>
      )
    },
    { 
      title: '등록일', 
      dataIndex: 'created_at', 
      key: 'created_at',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-'
    }
  ];

  return (
    <>
      <Title level={2}>브랜드 관리</Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input.Search
            placeholder="브랜드명으로 검색"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 브랜드 수"
              value={brands.length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 향수 수"
              value={brands.reduce((sum, brand) => sum + (brand.perfume_count || 0), 0)}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
      </Row>
              <Table
          columns={columns}
          dataSource={filteredBrands}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
          size="small"
        />
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
