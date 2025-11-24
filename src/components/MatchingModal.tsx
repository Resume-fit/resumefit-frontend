import React, { useState, useEffect, useRef } from 'react';
import { resumeAPI, reviewAPI } from '../api/services';
import { MatchingResponse } from '../types';
import '../styles/Modal.css';

interface MatchingModalProps {
  resumeId: number;
  onClose: () => void;
}

const MatchingModal: React.FC<MatchingModalProps> = ({ resumeId, onClose }) => {
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchingResponse[]>([]);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canClose, setCanClose] = useState(true); // 닫기 가능 여부
  const hasStartedRef = useRef(false); // 중복 실행 방지

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startMatching();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 진행률 시뮬레이션
  useEffect(() => {
    if (matching && progress < 90) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [matching, progress]);

  const startMatching = async () => {
    setMatching(true);
    setError('');
    setProgress(10);
    setCanClose(false);
    setShowReview(false); // 명시적으로 false 설정

    try {
      console.log('🚀 매칭 시작 - Resume ID:', resumeId);
      
      const results = await resumeAPI.matchResume(resumeId);
      
      console.log('✅ 매칭 완료 - 결과:', results.length, '개');
      console.log('📊 매칭 데이터:', results);
      setProgress(100);
      setMatchResults(results);
      setCanClose(true);
    } catch (err: any) {
      console.error('❌ 매칭 실패:', err);
      
      let errorMessage = '매칭에 실패했습니다.';
      
      if (err.response?.status === 403) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 500) {
        errorMessage = 'AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCanClose(true); // 에러 발생 시 닫기 가능
    } finally {
      setMatching(false);
    }
  };

  const handleReviewSubmit = async (reviewType: 'LIKE' | 'RESUME_MISMATCH' | 'FIELD_MISMATCH' | 'COMPANY_MISMATCH') => {
    try {
      await reviewAPI.submitReview(resumeId, { reviewType });
      alert('리뷰가 제출되었습니다. 감사합니다!');
      onClose();
    } catch (err) {
      console.error('리뷰 제출 실패:', err);
      alert('리뷰 제출에 실패했습니다.');
    }
  };

  const handleForceClose = () => {
    if (matching && !canClose) {
      const confirmed = window.confirm(
        '매칭이 진행 중입니다. 정말 취소하시겠습니까?\n' +
        '취소하면 매칭 결과를 받을 수 없습니다.'
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // 적합/성장트랙 분류
  const suitableMatches = matchResults.filter(m => m.matchType === 'SUITABLE');
  const growthMatches = matchResults.filter(m => m.matchType === 'GROWTH_TRACK');

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        handleForceClose();
      }
    }}>
      <div className="modal-content matching-modal">
        <div className="modal-header">
          <h2>AI 매칭 분석</h2>
          <button 
            className="close-button" 
            onClick={handleForceClose}
            disabled={matching && !canClose}
            style={{ opacity: (matching && !canClose) ? 0.5 : 1 }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {matching && (
            <div className="matching-progress">
              <div className="spinner"></div>
              <p>AI가 귀하의 이력서를 분석하고 있습니다...</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">{progress}%</p>
              <p className="matching-warning">
                매칭에는 약 1분 정도 소요됩니다.<br/>
                {canClose ? (
                  <span style={{ color: '#666' }}>언제든지 닫기 버튼을 눌러 취소할 수 있습니다.</span>
                ) : (
                  <span style={{ color: '#e74c3c' }}>잠시만 기다려주세요...</span>
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={onClose} className="btn-secondary">
                닫기
              </button>
            </div>
          )}

          {!matching && !error && matchResults.length > 0 && (
            <div className="matching-results">
              {!showReview ? (
                <>
                  <div className="result-section">
                <h3>적합 (현재 지원 가능)</h3>
                {suitableMatches.length > 0 ? (
                  <div className="match-list">
                    {suitableMatches.map((match, index) => (
                      <div key={index} className="match-item suitable">
                        <div className="match-header">
                          <h4>{match.jobPosition.positionName}</h4>
                          <span className="company-name">
                            {match.jobPosition.companyName}
                          </span>
                        </div>
                        <p className="match-comment">{match.comment}</p>
                        <div className="match-details">
                          <span className="detail-badge">{match.jobPosition.employmentType}</span>
                          <span className="detail-badge">{match.jobPosition.workPlace}</span>
                          <a 
                            href={match.jobPosition.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-posting-link"
                          >
                            공고 보기 →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-matches">현재 적합한 포지션이 없습니다.</p>
                )}
              </div>

              <div className="result-section">
                <h3>성장 트랙 (역량 보충 필요)</h3>
                {growthMatches.length > 0 ? (
                  <div className="match-list">
                    {growthMatches.map((match, index) => (
                      <div key={index} className="match-item growth">
                        <div className="match-header">
                          <h4>{match.jobPosition.positionName}</h4>
                          <span className="company-name">
                            {match.jobPosition.companyName}
                          </span>
                        </div>
                        <p className="match-comment">{match.comment}</p>
                        <div className="match-details">
                          <span className="detail-badge">{match.jobPosition.employmentType}</span>
                          <span className="detail-badge">{match.jobPosition.workPlace}</span>
                          <a 
                            href={match.jobPosition.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-posting-link"
                          >
                            공고 보기 →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-matches">성장 트랙 포지션이 없습니다.</p>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowReview(true)} className="btn-primary">
                  리뷰 남기기
                </button>
                <button onClick={onClose} className="btn-secondary">
                  닫기
                </button>
              </div>
                </>
              ) : (
                <div className="review-section">
                  <h3>매칭 결과가 어떠셨나요?</h3>
                  <p>귀하의 피드백은 AI 개선에 큰 도움이 됩니다.</p>
                  
                  <div className="review-options">
                    <button 
                      onClick={() => handleReviewSubmit('LIKE')}
                      className="review-button satisfied"
                    >
                      <span>결과가 마음에 들어요</span>
                    </button>
                    
                    <button 
                      onClick={() => handleReviewSubmit('RESUME_MISMATCH')}
                      className="review-button mismatch"
                    >
                      <span>제 이력서와 맞지 않아요</span>
                    </button>
                    
                    <button 
                      onClick={() => handleReviewSubmit('FIELD_MISMATCH')}
                      className="review-button field"
                    >
                      <span>제 분야와 맞지 않아요</span>
                    </button>
                    
                    <button 
                      onClick={() => handleReviewSubmit('COMPANY_MISMATCH')}
                      className="review-button company"
                    >
                      <span>회사가 마음에 들지 않아요</span>
                    </button>
                  </div>

                  <button onClick={onClose} className="btn-secondary" style={{ marginTop: '20px' }}>
                    리뷰 없이 닫기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingModal;