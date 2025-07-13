import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Progress, Alert, Typography, message, Upload, Space, Divider } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const BulkPerfumeScraping = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [brandItems, setBrandItems] = useState([{ id: 1, file: null, brandName: '' }]);
  const [form] = Form.useForm();

  const handleCancel = () => {
    setLoading(false);
    setProgress(0);
    setJobId(null);
    setResults(null);
    setBrandItems([{ id: 1, file: null, brandName: '' }]);
    form.resetFields();
  };

  const addBrandItem = () => {
    const newId = Math.max(...brandItems.map(item => item.id)) + 1;
    setBrandItems([...brandItems, { id: newId, file: null, brandName: '' }]);
  };

  const removeBrandItem = (id) => {
    if (brandItems.length > 1) {
      setBrandItems(brandItems.filter(item => item.id !== id));
    }
  };

  // 파일명에서 브랜드명 추출 (확장자 제거)
  const extractBrandName = (filename) => {
    if (!filename) return '';
    
    // 확장자 제거
    const dotIdx = filename.lastIndexOf('.');
    const nameWithoutExt = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
    
    // 일반적인 접미사 제거
    const suffixes = [
      '-perfumes', '-perfume', '-fragrances', '-fragrance',
      '-links', '-urls', '-list', '-collection'
    ];
    
    let brandName = nameWithoutExt;
    for (const suffix of suffixes) {
      if (brandName.toLowerCase().endsWith(suffix.toLowerCase())) {
        brandName = brandName.slice(0, -suffix.length);
        break;
      }
    }
    
    // 하이픈을 공백으로 변환
    brandName = brandName.replace(/-/g, ' ');
    
    // 각 단어의 첫 글자를 대문자로
    brandName = brandName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return brandName;
  };

  const updateBrandItem = (id, field, value) => {
    setBrandItems(brandItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileUpload = (id, file) => {
    const brandName = extractBrandName(file.name);
    setBrandItems(brandItems.map(item => 
      item.id === id ? { ...item, file, brandName } : item
    ));
    return false; // Prevent default upload behavior
  };

  const validateForm = () => {
    for (const item of brandItems) {
      if (!item.file) {
        message.error('모든 파일을 업로드해주세요.');
        return false;
      }
    }
    return true;
  };

  const parseFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          // JSON 배열 형태인지 확인
          let urls = [];
          if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
            try {
              const jsonData = JSON.parse(content);
              if (Array.isArray(jsonData)) {
                urls = jsonData.filter(url => url.startsWith('https://www.fragrantica.com/perfume/'));
              }
            } catch (error) {
              console.log('JSON 파싱 실패, 다른 방식 시도');
            }
          }
          if (urls.length === 0) {
            let lines = [];
            if (content.includes('\n')) {
              lines = content.split('\n');
            } else if (content.includes('\\n')) {
              lines = content.split('\\n');
            } else if (content.includes('/n')) {
              lines = content.split('/n');
            } else {
              lines = content.split(/\s+/);
            }
            urls = lines
              .map(line => line.trim())
              .filter(line => line.startsWith('https://www.fragrantica.com/perfume/'))
              .filter((url, index, arr) => arr.indexOf(url) === index);
          }
          resolve(urls);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      // 각 브랜드별로 파일 내용 파싱
      const brandData = [];
      for (const item of brandItems) {
        const links = await parseFileContent(item.file);
        brandData.push({
          brandName: item.brandName,
          perfumeLinks: links
        });
      }

      const response = await axios.post(`${API_BASE_URL}/api/scrape/bulk-perfumes`, {
        brands: brandData
      });

      if (response.data.success) {
        setJobId(response.data.job_id);
        setProgress(10);
        message.success('스크래핑 작업이 시작되었습니다.');
      }
    } catch (error) {
      console.error('향수 가져오기 오류:', error);
      const errorMessage = error.response?.data?.message || '향수 가져오기에 실패했습니다.';
      message.error(errorMessage);
      setLoading(false);
    }
  };

  // 작업 상태 모니터링 (생략, 기존과 동일)
  useEffect(() => {
    let interval;
    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/scrape/bulk-status/${jobId}`);
          if (response.data.success) {
            setProgress(response.data.progress || 0);
            setStatusMessage(response.data.message || '');
            
            if (response.data.status === 'completed') {
              setLoading(false);
              setResults(response.data);
              message.success('향수 가져오기가 완료되었습니다!');
              if (onSuccess) onSuccess();
            } else if (response.data.status === 'failed') {
              setLoading(false);
              message.error('향수 가져오기에 실패했습니다.');
            }
          }
        } catch (error) {
          console.error('상태 확인 오류:', error);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, loading, onSuccess]);

  return (
    <Card title="브랜드별 향수 일괄 가져오기" style={{ height: '100%' }}>
      <Form form={form} layout="vertical">
        {brandItems.map((item, index) => (
          <div key={item.id}>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text strong>브랜드 {index + 1}</Text>
              {brandItems.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeBrandItem(item.id)}
                  disabled={loading}
                />
              )}
            </Space>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Upload
                beforeUpload={(file) => handleFileUpload(item.id, file)}
                accept=".txt,.json"
                showUploadList={{
                  showRemoveIcon: false,
                  showPreviewIcon: false,
                  showDownloadIcon: false
                }}
                disabled={loading}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  향수 링크 파일 업로드 (.txt, .json)
                </Button>
              </Upload>
              {item.file && (
                <Text type="secondary">
                  선택된 파일: {item.file.name} → 브랜드명: {item.brandName}
                </Text>
              )}
            </Space>
            {index < brandItems.length - 1 && <Divider />}
          </div>
        ))}
        <Button
          type="dashed"
          onClick={addBrandItem}
          icon={<PlusOutlined />}
          block
          size="large"
          style={{ marginBottom: 16 }}
          disabled={loading}
        >
          브랜드 추가
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={<DownloadOutlined />}
          block
          size="large"
          style={{ marginBottom: 8 }}
        >
          {loading ? '가져오는 중...' : '향수 일괄 가져오기'}
        </Button>
        {loading && (
          <Button
            onClick={handleCancel}
            block
            size="large"
          >
            취소
          </Button>
        )}
      </Form>
      {loading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status="active" />
          <Text type="secondary">
            {statusMessage || 
             (progress < 30 ? '브랜드 정보를 확인하는 중입니다...' : 
              progress < 60 ? '향수 페이지들을 분석하는 중입니다...' : 
              '향수 데이터를 저장하는 중입니다...')}
          </Text>
        </div>
      )}
      {results && !loading && (
        <Alert
          message="향수 일괄 가져오기 완료"
          description={
            <div>
              <p>총 {results.totalProcessed || 0}개의 향수를 처리했습니다.</p>
              {results.summary && (
                <div>
                  <p>성공: {results.summary.success || 0}개</p>
                  <p>중복: {results.summary.duplicate || 0}개</p>
                  <p>실패: {results.summary.failed || 0}개</p>
                </div>
              )}
            </div>
          }
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default BulkPerfumeScraping; 