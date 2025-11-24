import React, { useState, useEffect } from 'react';
import { jobPositionAPI } from '../api/services';
import { JobPositionSummary } from '../types';
import Navigation from '../components/Navigation';
import '../styles/JobPositions.css';

const JobPositionsPage: React.FC = () => {
  const [jobPositions, setJobPositions] = useState<JobPositionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobPositions();
  }, []);

  const loadJobPositions = async () => {
    try {
      setLoading(true);
      const data = await jobPositionAPI.getAllJobPositions();
      console.log('전체 채용공고:', data.length, '개');
      setJobPositions(data);
    } catch (err) {
      console.error('채용공고 로드 실패:', err);
      setError('채용공고를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPositions = jobPositions.filter(position => 
    position.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="job-positions-container">
          <div className="page-title-section">
            <h1>채용공고</h1>
            <p>다양한 기업의 채용공고를 확인하세요</p>
          </div>

          <div className="search-section">
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="회사명 또는 포지션명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>채용공고를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadJobPositions} className="btn-retry">
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="results-info">
                총 <strong>{filteredPositions.length}</strong>개의 채용공고
              </div>

              {filteredPositions.length === 0 ? (
                <div className="empty-state">
                  <p>검색 결과가 없습니다.</p>
                  <button onClick={() => setSearchTerm('')} className="btn-secondary">
                    검색 초기화
                  </button>
                </div>
              ) : (
                <div className="job-positions-grid">
                  {filteredPositions.map((position) => (
                    <div key={position.id} className="job-card">
                      <div className="job-card-header">
                        <h3 className="position-name">{position.positionName}</h3>
                        <span className="company-name">{position.companyName}</span>
                      </div>

                      <div className="job-card-body">
                        <div className="job-info">
                          <span className="info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {position.workPlace}
                          </span>
                          <span className="info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                            {position.employmentType}
                          </span>
                        </div>
                      </div>

                      <div className="job-card-footer">
                        <a 
                          href={position.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-detail"
                        >
                          상세보기
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPositionsPage;