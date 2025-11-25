import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { resumeAPI, matchingAPI } from '../api/services';
import type { ResumeDetail, MatchingResponse } from '../types';
import Navigation from '../components/Navigation';
import '../styles/ResumeDetailPage.css';

const ResumeDetailPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const showMatching = searchParams.get('tab') === 'matching';
  
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [matchingResults, setMatchingResults] = useState<MatchingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumeDetail();
  }, [resumeId]);

  useEffect(() => {
    if (showMatching) {
      fetchMatchingResults();
    }
  }, [showMatching]);

  const fetchResumeDetail = async () => {
    try {
      setLoading(true);
      const data = await resumeAPI.getResumeDetail(Number(resumeId));
      setResume(data);
    } catch (err: any) {
      console.error('이력서 상세 조회 실패:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('이력서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingResults = async () => {
    try {
      setMatchingLoading(true);
      const data = await matchingAPI.getMatchingResults(Number(resumeId));
      setMatchingResults(data);
    } catch (err: any) {
      console.error('매칭 결과 조회 실패:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="loading">이력서를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="error-state">
            <p>{error || '이력서를 찾을 수 없습니다.'}</p>
            <button onClick={() => navigate('/resumes')} className="btn-back">
              이력서 목록으로
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
        <div className="resume-detail-container">
          {/* 헤더 */}
          <div className="detail-header">
            <button onClick={() => navigate('/resumes')} className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              돌아가기
            </button>
            <h1>{resume.title}</h1>
          </div>

          {/* 조건부 렌더링 */}
          {!showMatching ? (
            // 이력서 미리보기
            <div className="preview-section">
              {resume.pdfViewUrl ? (
                <iframe
                  src={resume.pdfViewUrl}
                  className="pdf-viewer"
                  title="Resume Preview"
                />
              ) : (
                <div className="no-preview">
                  <p>미리보기를 사용할 수 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            // 매칭 결과
            <div className="matching-section">
              {matchingLoading ? (
                <div className="loading">매칭 결과를 불러오는 중...</div>
              ) : matchingResults.length === 0 ? (
                <div className="empty-matching">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <h3>매칭 결과가 없습니다</h3>
                  <p>AI 매칭하기를 통해 이력서에 맞는 채용공고를 찾아보세요.</p>
                  <button onClick={() => navigate('/resumes')} className="btn-primary">
                    이력서 목록으로
                  </button>
                </div>
              ) : (
                <>
                  {/* 매칭 통계 */}
                  <div className="matching-stats">
                    <div className="stat-card total">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-numberB">{matchingResults.length}</div>
                        <div className="stat-labelB">총 매칭 공고</div>
                      </div>
                    </div>
                    
                    <div className="stat-card suitable">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-numberB">
                          {matchingResults.filter(r => r.matchType === 'SUITABLE').length}
                        </div>
                        <div className="stat-labelB">즉시 지원 가능</div>
                      </div>
                    </div>
                    
                    <div className="stat-card growth">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="20" x2="12" y2="10"/>
                          <line x1="18" y1="20" x2="18" y2="4"/>
                          <line x1="6" y1="20" x2="6" y2="16"/>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-numberB">
                          {matchingResults.filter(r => r.matchType === 'GROWTH_TRACK').length}
                        </div>
                        <div className="stat-labelB">성장 후 지원</div>
                      </div>
                    </div>
                  </div>

                  {/* 매칭 결과 리스트 */}
                  <div className="results-container">
                    <h2 className="results-title">매칭된 채용공고</h2>
                    <div className="matching-results">
                      {matchingResults.map((result, index) => (
                        <div key={index} className="job-card">
                          {/* 상단: 회사 정보 */}
                          <div className="job-header">
                            <div className="company-section">
                              <div className="company-logo">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                </svg>
                              </div>
                              <div className="company-details">
                                <h3 className="company-name">
                                  {result.jobPosition?.companyName || '회사명 없음'}
                                </h3>
                                <h4 className="position-name">
                                  {result.jobPosition?.positionName || '포지션명 없음'}
                                </h4>
                              </div>
                            </div>
                            <span className={`match-type ${result.matchType === 'SUITABLE' ? 'suitable' : 'growth'}`}>
                              {result.matchType === 'SUITABLE' ? '즉시 지원 가능' : '성장 후 지원'}
                            </span>
                          </div>

                          {/* 중단: 채용 정보 */}
                          <div className="job-details">
                            <div className="detail-item">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              <span>{result.jobPosition?.workPlace || '위치 정보 없음'}</span>
                            </div>
                            <div className="detail-item">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                              </svg>
                              <span>{result.jobPosition?.employmentType || '고용 형태 정보 없음'}</span>
                            </div>
                          </div>

                          {/* 하단: AI 분석 */}
                          <div className="ai-analysis">
                            <div className="analysis-header">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              <span>AI 분석</span>
                            </div>
                            <p className="analysis-text">{result.comment || 'AI 분석 정보가 없습니다.'}</p>
                          </div>

                          {/* 버튼 */}
                          <button
                            onClick={() => {
                              if (result.jobPosition?.id) {
                                navigate(`/job-positions/${result.jobPosition.id}`);
                              }
                            }}
                            className="view-job-btn"
                            disabled={!result.jobPosition?.id}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            채용공고 상세보기
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailPage;