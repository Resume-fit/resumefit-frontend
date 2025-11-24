import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/services';
import { ResumeSummary } from '../types';
import Navigation from '../components/Navigation';
import MatchingModal from '../components/MatchingModal';
import '../styles/Resumes.css';

const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);

  useEffect(() => {
    loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeAPI.getAllResumes();
      setResumes(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('이력서 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = (resumeId: number) => {
    navigate(`/resumes/${resumeId}`);
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!window.confirm('이력서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      setResumes(resumes.filter(r => r.id !== resumeId));
      alert('이력서가 삭제되었습니다.');
    } catch (err) {
      alert('이력서 삭제에 실패했습니다.');
    }
  };

  const handleMatchResume = (resumeId: number) => {
    setSelectedResumeId(resumeId);
    setShowMatchingModal(true);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="resumes-container">
          <div className="page-title-section">
            <h1>내 이력서</h1>
            <p>등록된 이력서를 관리하고 AI 매칭을 시작하세요</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {resumes.length === 0 ? (
            <div className="empty-state">
              <p>등록된 이력서가 없습니다.</p>
              <div className="empty-actions">
                <button onClick={() => navigate('/resumes/create')} className="action-btn primary">
                  이력서 작성하기
                </button>
                <button onClick={() => navigate('/resumes/upload')} className="action-btn secondary">
                  PDF 업로드하기
                </button>
              </div>
            </div>
          ) : (
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <h3>{resume.title}</h3>
                  <div className="resume-dates">
                    <p>생성: {new Date(resume.createdAt).toLocaleDateString()}</p>
                    <p>수정: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="resume-actions">
                    <button
                      onClick={() => handleViewResume(resume.id)}
                      className="view-button"
                    >
                      상세보기
                    </button>
                    <button
                      onClick={() => handleMatchResume(resume.id)}
                      className="match-button"
                    >
                      매칭하기
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showMatchingModal && selectedResumeId && (
        <MatchingModal
          resumeId={selectedResumeId}
          onClose={() => {
            setShowMatchingModal(false);
            setSelectedResumeId(null);
          }}
        />
      )}
    </div>
  );
};

export default ResumesPage;