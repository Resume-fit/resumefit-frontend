import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/services';
import { ResumeDetail } from '../types';
import '../styles/Detail.css';

const ResumeDetailPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumeDetail();
  }, [resumeId]);

  const loadResumeDetail = async () => {
    if (!resumeId) return;

    try {
      const data = await resumeAPI.getResumeDetail(parseInt(resumeId));
      setResume(data);
    } catch (err: any) {
      setError('이력서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/resumes');
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="detail-container">
        <div className="error-message">{error || '이력서를 찾을 수 없습니다.'}</div>
        <button onClick={handleGoBack} className="back-button">
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <header className="detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← 목록으로
        </button>
        <h1>{resume.title}</h1>
        <div className="detail-meta">
          <span>생성: {new Date(resume.createdAt).toLocaleString()}</span>
          <span>수정: {new Date(resume.updatedAt).toLocaleString()}</span>
        </div>
      </header>

      <div className="pdf-viewer">
        {resume.pdfViewUrl ? (
          <iframe
            src={resume.pdfViewUrl}
            title="이력서 미리보기"
            width="100%"
            height="800px"
          />
        ) : (
          <div className="no-preview">
            <p>미리보기를 사용할 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDetailPage;
