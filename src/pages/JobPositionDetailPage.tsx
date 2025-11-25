import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPositionAPI } from '../api/services';
import type { JobPositionDetail } from '../types';
import Navigation from '../components/Navigation';
import '../styles/JobPositionDetailPage.css';

const JobPositionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobPosition, setJobPosition] = useState<JobPositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobPositionDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJobPositionDetail = async () => {
    try {
      setLoading(true);
      const data = await jobPositionAPI.getJobPositionDetail(Number(id));
      setJobPosition(data);
    } catch (err: any) {
      console.error('채용공고 조회 실패:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('채용공고를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="loading">채용공고를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error || !jobPosition) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="error-state">
            <p>{error || '채용공고를 찾을 수 없습니다.'}</p>
            <button onClick={() => navigate('/job-positions')} className="btn-back">
              채용공고 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const requiredItems = jobPosition.requirements?.filter(req => req.type === 'REQUIRED') || [];
  const preferredItems = jobPosition.requirements?.filter(req => req.type === 'PREFERRED') || [];

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="job-detail-container">
          {/* 헤더 */}
          <div className="detail-header">
            <button onClick={() => navigate(-1)} className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              돌아가기
            </button>
          </div>

          {/* 메인 정보 카드 */}
          <div className="main-info-card">
            <div className="company-header">
              <div className="company-info">
                <h1>{jobPosition.positionName}</h1>
                <h2>{jobPosition.companyName}</h2>
              </div>
              {jobPosition.url && (
                <a 
                  href={jobPosition.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-external"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  원본 공고 보기
                </a>
              )}
            </div>

            <div className="info-grid">
              {/* 근무지 */}
              <div className="info-item">
                <div className="info-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  근무지
                </div>
                <div className="info-value">{jobPosition.workPlace || '정보 없음'}</div>
              </div>

              {/* 고용 형태 */}
              <div className="info-item">
                <div className="info-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  고용 형태
                </div>
                <div className="info-value">{jobPosition.employmentType || '정보 없음'}</div>
              </div>

              {/* 직무 분야 */}
              {jobPosition.jobCategory && (
                <div className="info-item">
                  <div className="info-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    직무 분야
                  </div>
                  <div className="info-value">{jobPosition.jobCategory}</div>
                </div>
              )}
            </div>
          </div>

          {/* 주요 업무 */}
          {jobPosition.mainJob && (
            <div className="section-card">
              <h3>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                주요 업무
              </h3>
              <div className="content-box">
                <p>{jobPosition.mainJob}</p>
              </div>
            </div>
          )}

          {/* 자격 요건 (필수) */}
          {requiredItems.length > 0 && (
            <div className="section-card">
              <h3>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                자격 요건 (필수)
              </h3>
              <ul className="requirement-list required">
                {requiredItems.map((req, index) => (
                  <li key={index}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {req.content}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 우대 사항 */}
          {preferredItems.length > 0 && (
            <div className="section-card">
              <h3>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                우대 사항
              </h3>
              <ul className="requirement-list preferred">
                {preferredItems.map((req, index) => (
                  <li key={index}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {req.content}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 추가 정보가 없을 경우 안내 */}
          {!jobPosition.mainJob && requiredItems.length === 0 && preferredItems.length === 0 && (
            <div className="section-card">
              <div className="no-detail-info">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>상세 정보가 제공되지 않습니다.</p>
                <p>원본 공고에서 자세한 내용을 확인해주세요.</p>
              </div>
            </div>
          )}

          {/* 하단 액션 */}
          <div className="bottom-actions">
            {jobPosition.url && (
              <a 
                href={jobPosition.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-apply"
              >
                원본 사이트에서 지원하기
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPositionDetailPage;