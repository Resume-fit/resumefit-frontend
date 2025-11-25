import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/services';
import type { ResumeSummary } from '../types';
import Navigation from '../components/Navigation';
import '../styles/MatchingResultsPage.css';

const MatchingResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeAPI.getAllResumes();
      setResumes(data);
    } catch (err: any) {
      console.error('이력서 목록 조회 실패:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('이력서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="loading">이력서 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchResumes} className="btn-retry">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="matching-results-container">
          <div className="page-header">
            <h1>매칭 결과</h1>
            <p>이력서별 AI 매칭 결과를 확인하세요</p>
          </div>

          {resumes.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3>등록된 이력서가 없습니다</h3>
              <p>이력서를 먼저 등록해주세요.</p>
              <button onClick={() => navigate('/resumes')} className="btn-primary">
                이력서 등록하기
              </button>
            </div>
          ) : (
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <div className="card-header">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  
                  <div className="card-content">
                    <h3>{resume.title}</h3>
                    <div className="resume-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {new Date(resume.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => navigate(`/resumes/${resume.id}?tab=matching`)}
                      className="btn-view-matching"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      매칭 결과 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingResultsPage;