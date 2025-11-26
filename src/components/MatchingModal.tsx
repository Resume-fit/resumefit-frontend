import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [canClose, setCanClose] = useState(true);
  const hasStartedRef = useRef(false);
  
  // 기타 의견 입력 상태
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherComment, setOtherComment] = useState('');
  
  // 리뷰 존재 여부 상태 추가
  const [reviewExists, setReviewExists] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startMatching();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setShowReview(false);

    try {
      console.log('🚀 매칭 시작 - Resume ID:', resumeId);
      
      const results = await resumeAPI.matchResume(resumeId);
      
      console.log('✅ 매칭 완료 - 결과:', results.length, '개');
      console.log('📊 매칭 데이터:', results);
      
      // ✅ 매칭 성공 시
      setProgress(100);
      setMatchResults(results);
      setMatching(false); // 로딩 상태 종료
      setCanClose(true);
      
    } catch (err: any) {
      console.error('❌ 매칭 실패:', err);
      
      // ✅ 타임아웃 에러 감지 강화
      const isTimeout = err.code === 'ECONNABORTED' || 
                       err.message?.toLowerCase().includes('timeout') ||
                       err.message?.includes('초과');
      
      if (isTimeout) {
        console.log('⏱️ 타임아웃 발생 - 백그라운드에서 매칭 계속 진행 중');
        
        setProgress(100);
        setMatching(false); // 로딩 상태 종료
        setCanClose(true);
        
        // 타임아웃 안내 메시지
        alert(
          '⏱️ AI 분석에 시간이 걸리고 있습니다.\n\n' +
          '💡 매칭은 백그라운드에서 계속 진행되고 있습니다.\n' +
          '잠시 후 "매칭 결과" 탭에서 확인해주세요.\n\n' +
          '이 창을 닫습니다.'
        );
        
        onClose(); // 모달 자동으로 닫기
        return;
      }
      
      // 기타 에러 처리
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
      setMatching(false);
      setCanClose(true);
    }
  };

  // 리뷰 존재 여부 확인 함수
  const checkReviewStatus = async () => {
    setCheckingReview(true);
    try {
      const exists = await reviewAPI.checkReviewExists(resumeId);
      setReviewExists(exists);
    } catch (error) {
      console.error('리뷰 상태 확인 실패:', error);
      setReviewExists(false);
    } finally {
      setCheckingReview(false);
    }
  };

  // 리뷰 남기기 버튼 클릭 시
  const handleReviewButtonClick = async () => {
    await checkReviewStatus();
    setShowReview(true);
  };

  const handleReviewSubmit = async (reviewType: 'LIKE' | 'RESUME_MISMATCH' | 'FIELD_MISMATCH' | 'CRITERIA_UNCLEAR' | 'OTHER') => {
    // OTHER 타입이고 입력 화면이 아직 안 보이면 입력 화면 표시
    if (reviewType === 'OTHER' && !showOtherInput) {
      setShowOtherInput(true);
      return;
    }

    // OTHER 타입인데 코멘트가 비어있으면 경고
    if (reviewType === 'OTHER' && !otherComment.trim()) {
      alert('의견을 입력해주세요.');
      return;
    }

    try {
      const reviewData: any = { reviewType };
      if (reviewType === 'OTHER') {
        reviewData.otherComment = otherComment.trim();
      }
      
      await reviewAPI.submitReview(resumeId, reviewData);
      alert('리뷰가 제출되었습니다. 감사합니다!');
      setReviewExists(true);
      setShowReview(false);
      setShowOtherInput(false);
      setOtherComment('');
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

  // 기타 입력에서 뒤로가기
  const handleBackFromOther = () => {
    setShowOtherInput(false);
    setOtherComment('');
  };

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
                ⏱️ 매칭에는 약 1-2분 정도 소요됩니다.
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
                    <h3>✅ 적합 (현재 지원 가능)</h3>
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
                              <Link
                                to={`/job-positions/${match.jobPosition.id}`}
                                onClick={onClose}
                                className="view-posting-link"
                              >
                                공고 보기 →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-matches">현재 적합한 포지션이 없습니다.</p>
                    )}
                  </div>

                  <div className="result-section">
                    <h3>🌱 성장 트랙 (역량 보충 필요)</h3>
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
                              <Link
                                to={`/job-positions/${match.jobPosition.id}`}
                                onClick={onClose}
                                className="view-posting-link"
                              >
                                공고 보기 →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-matches">성장 트랙 포지션이 없습니다.</p>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button 
                      onClick={handleReviewButtonClick} 
                      className="btn-primary"
                      disabled={checkingReview}
                    >
                      {checkingReview ? '확인 중...' : '리뷰 남기기'}
                    </button>
                    <button onClick={onClose} className="btn-secondary">
                      닫기
                    </button>
                  </div>
                </>
              ) : (
                <div className="review-section">
                  <h3>매칭 결과가 어떠셨나요?</h3>
                  
                  {reviewExists ? (
                    <div className="review-already-submitted">
                      <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
                        ✅ 이미 이 이력서에 대한 리뷰를 작성하셨습니다.<br/>
                        소중한 의견 감사합니다!
                      </p>
                      <button onClick={() => setShowReview(false)} className="btn-primary">
                        매칭 결과로 돌아가기
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>귀하의 피드백은 AI 개선에 큰 도움이 됩니다.</p>
                      
                      {!showOtherInput ? (
                        <>
                          <div className="review-options">
                            <button 
                              onClick={() => handleReviewSubmit('LIKE')}
                              className="review-button"
                            >
                              <div className="review-icon">👍</div>
                              <span>결과가 마음에 들어요</span>
                            </button>
                            
                            <button 
                              onClick={() => handleReviewSubmit('RESUME_MISMATCH')}
                              className="review-button"
                            >
                              <div className="review-icon">📄</div>
                              <span>제 이력서와 잘 맞지 않아요</span>
                            </button>
                            
                            <button 
                              onClick={() => handleReviewSubmit('FIELD_MISMATCH')}
                              className="review-button"
                            >
                              <div className="review-icon">🎯</div>
                              <span>제 분야/직무와 맞지 않아요</span>
                            </button>
                            
                            <button 
                              onClick={() => handleReviewSubmit('CRITERIA_UNCLEAR')}
                              className="review-button"
                            >
                              <div className="review-icon">❓</div>
                              <span>추천 기준이 이해되지 않아요</span>
                            </button>
                            
                            <button 
                              onClick={() => handleReviewSubmit('OTHER')}
                              className="review-button"
                              style={{ gridColumn: 'span 2' }}
                            >
                              <div className="review-icon">✏️</div>
                              <span>기타 (직접 입력)</span>
                            </button>
                          </div>

                          <button 
                            onClick={() => setShowReview(false)} 
                            className="btn-secondary" 
                            style={{ marginTop: '20px', width: '100%' }}
                          >
                            매칭 결과로 돌아가기
                          </button>
                        </>
                      ) : (
                        <div className="other-input-section">
                          <textarea
                            value={otherComment}
                            onChange={(e) => setOtherComment(e.target.value)}
                            placeholder="어떤 점이 불편하셨나요? 의견을 자유롭게 작성해주세요."
                            className="other-textarea"
                            rows={5}
                            autoFocus
                          />
                          <div className="other-actions">
                            <button 
                              onClick={handleBackFromOther}
                              className="btn-secondary"
                            >
                              ← 뒤로가기
                            </button>
                            <button 
                              onClick={() => handleReviewSubmit('OTHER')}
                              className="btn-primary"
                              disabled={!otherComment.trim()}
                            >
                              제출
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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