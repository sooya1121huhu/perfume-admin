import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, List, Button, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import BulkPerfumeScraping from '../components/BulkPerfumeScraping';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const { Title, Text } = Typography;

const ScrapePerfumePage = () => {
  const navigate = useNavigate();
  const [recentPerfumes, setRecentPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 최근 가져온 향수 목록 가져오기
  const fetchRecentPerfumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/perfumes?limit=10&sort=created_at&order=desc`);
      setRecentPerfumes(response.data.data || []);
    } catch (error) {
      console.error('최근 향수 목록 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentPerfumes();
  }, []);

  const recentColumns = [
    {
      title: '향수명',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>
    },
    {
      title: '브랜드',
      dataIndex: 'PerfumeBrand',
      key: 'brand',
      render: brand => brand?.name || '브랜드 없음'
    },
    {
      title: '등록일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-'
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '노출' : '숨김'}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>📥 향수 일괄 가져오기</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        브랜드별 향수 링크 파일을 업로드하여 일괄적으로 향수 데이터를 가져와 데이터베이스에 저장합니다.
      </Text>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24}>
          <BulkPerfumeScraping onSuccess={() => {
            fetchRecentPerfumes();
            navigate('/perfumes');
          }} />
        </Col>
      </Row>

      {/* 사용법 안내 */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>📖 사용법 안내</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Title level={5}>브랜드별 일괄 가져오기</Title>
            <List size="small">
              <List.Item>1. 브랜드 페이지에서 향수 링크 추출 (수동)</List.Item>
              <List.Item>2. 브랜드명 입력 (예: Acqua-di-Parma)</List.Item>
              <List.Item>3. 향수 링크 파일 업로드 (.txt, .json)</List.Item>
              <List.Item>4. "향수 일괄 가져오기" 버튼 클릭</List.Item>
              <List.Item>5. 여러 브랜드를 한 번에 처리 가능</List.Item>
            </List>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <Title level={5}>💡 팁</Title>
          <List size="small">
            <List.Item>• 브랜드 페이지에서 향수 링크 추출 시 브랜드명으로 필터링하세요 (예: /perfume/Acqua-di-Parma/)</List.Item>
            <List.Item>• 일괄 가져오기는 시간이 오래 걸릴 수 있으니 참고해주세요.</List.Item>
            <List.Item>• 가져온 향수는 자동으로 데이터베이스에 저장되며, 향수 관리 페이지에서 확인할 수 있습니다.</List.Item>
            <List.Item>• 스크래핑 중에는 페이지를 새로고침하지 마세요.</List.Item>
            <List.Item>• 중복된 향수는 자동으로 건너뛰어집니다.</List.Item>
          </List>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/perfumes')}
          >
            향수 관리 페이지로 이동
          </Button>
        </div>
      </Card>

      {/* 최근 가져온 향수 목록 */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>📋 최근 가져온 향수 목록</Title>
        <Table
          columns={recentColumns}
          dataSource={recentPerfumes}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ScrapePerfumePage; 