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
    // ⭐ 이력서만 보기 (preview 탭)
    navigate(`/resumes/${resumeId}`);
  };

  const handleViewMatching = (resumeId: number) => {
    // ⭐ 매칭 결과 보기 (matching 탭으로 직접 이동)
    navigate(`/resumes/${resumeId}?tab=matching`);
  };

  const handleDeleteResume = async (resumeId: number) => {
  if (!window.confirm('이력서를 삭제하시겠습니까?')) {
    return;
  }

  try {
    await resumeAPI.deleteResume(resumeId);
    
    // 성공 시 목록에서 제거
    setResumes(resumes.filter(r => r.id !== resumeId));
    alert('이력서가 삭제되었습니다.');
    
  } catch (err: any) {
    console.error('이력서 삭제 실패:', err);
    
    let errorMessage = '이력서 삭제에 실패했습니다.';
    
    if (err.response) {
      const status = err.response.status;
      
      if (status === 403) {
        errorMessage = '이 이력서를 삭제할 권한이 없습니다.';
      } else if (status === 404) {
        errorMessage = '이미 삭제되었거나 존재하지 않는 이력서입니다.';
        // 404면 프론트에서도 목록에서 제거
        setResumes(resumes.filter(r => r.id !== resumeId));
      } else if (status === 500) {
        errorMessage = '서버 오류로 이력서 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    } else if (err.request) {
      errorMessage = '서버와 연결할 수 없습니다. 네트워크를 확인해주세요.';
    }
    
    alert(errorMessage);
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
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3>등록된 이력서가 없습니다</h3>
              <p>새로운 이력서를 작성하거나 업로드해주세요.</p>
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
                  {/* 카드 아이콘 */}
                  <div className="card-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>

                  {/* 카드 내용 */}
                  <div className="card-content">
                    <h3>{resume.title}</h3>
                    <div className="resume-dates">
                      <p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        생성: {new Date(resume.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        수정: {new Date(resume.updatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  {/* ⭐ 버튼들 - 이력서 보기와 매칭 결과 분리 */}
                  <div className="resume-actions">
                    <button
                      onClick={() => handleViewResume(resume.id)}
                      className="view-button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      이력서 보기
                    </button>
                    
                    <button
                      onClick={() => handleMatchResume(resume.id)}
                      className="match-button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      AI 매칭하기
                    </button>

                    <button
                      onClick={() => handleViewMatching(resume.id)}
                      className="matching-button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      매칭 결과
                    </button>
                    
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="delete-button"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
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