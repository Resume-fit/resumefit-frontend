import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const handleProtectedNav = (path: string) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };

  return (
    <div className="home-page">
      {/* 네비게이션 */}
      <nav className="home-nav">
        <div className="nav-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-text">ResumeFit</span>
          </div>
          <div className="nav-links">
            <button onClick={() => handleProtectedNav('/resumes')} className="nav-link">
              내 이력서
            </button>
            <button onClick={() => handleProtectedNav('/resumes/create')} className="nav-link">
              이력서 작성
            </button>
            <button onClick={() => handleProtectedNav('/resumes/upload')} className="nav-link">
              이력서 업로드
            </button>
            <button onClick={() => navigate('/job-positions')} className="nav-link">
              채용공고
            </button>
          </div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/mypage')} className="nav-btn mypage">
                  마이페이지
                </button>
                <button onClick={handleLogout} className="nav-btn secondary">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="nav-btn secondary">
                  로그인
                </button>
                <button onClick={() => navigate('/join')} className="nav-btn primary">
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">AI 기반 취업 매칭 서비스</div>
          <h1 className="hero-title">
            이력서 하나로<br />
            <span className="gradient-text">최적의 채용공고</span>를<br /> 찾아드립니다
          </h1>
          <p className="hero-description">
            AI가 당신의 이력서를 분석하여 가장 적합한 채용공고를 추천해드립니다.
            <br />더 이상 수백 개의 공고를 일일이 확인하지 마세요.
          </p>
          <div className="hero-actions">
            <button 
              onClick={() => navigate(isLoggedIn ? '/resumes' : '/join')} 
              className="hero-btn primary"
            >
              {isLoggedIn ? '이력서 매칭하기' : '무료로 시작하기'}
            </button>
            <button 
              onClick={() => navigate('/job-positions')} 
              className="hero-btn secondary"
            >
              채용공고 둘러보기
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">262+</span>
              <span className="stat-label">채용공고</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">AI</span>
              <span className="stat-label">맞춤 분석</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">무료</span>
              <span className="stat-label">서비스</span>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="section-title">왜 ResumeFit인가요?</h2>
          <p className="section-description">
            취업 준비의 새로운 패러다임을 경험하세요
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <h3>스마트 매칭</h3>
              <p>AI가 이력서와 채용공고를 분석하여 적합도를 계산합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3>맞춤 추천</h3>
              <p>현재 지원 가능한 공고와 성장이 필요한 공고를 구분해서 추천합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>빠른 분석</h3>
              <p>단 1분 만에 수백 개의 채용공고를 분석하고 추천합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3>이력서 작성</h3>
              <p>서비스 내에서 직접 이력서를 작성하고 PDF로 저장할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로세스 섹션 */}
      <section className="process-section">
        <div className="process-content">
          <h2 className="section-title">어떻게 사용하나요?</h2>
          <p className="section-description">3단계로 간단하게 시작하세요</p>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>이력서 등록</h3>
              <p>PDF 이력서를 업로드하거나<br />직접 작성하세요</p>
            </div>
            <div className="process-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>AI 분석</h3>
              <p>AI가 이력서를 분석하고<br />채용공고와 매칭합니다</p>
            </div>
            <div className="process-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>결과 확인</h3>
              <p>적합한 공고와 성장 트랙<br />공고를 확인하세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>지금 바로 시작하세요</h2>
          <p>무료로 AI 이력서 매칭 서비스를 경험해보세요</p>
          <button 
            onClick={() => navigate(isLoggedIn ? '/resumes' : '/join')} 
            className="cta-btn"
          >
            {isLoggedIn ? '이력서 매칭하기' : '무료 회원가입'}
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-text">ResumeFit</span>
          </div>
          <p className="footer-text">
            © 2025 ResumeFit. AI 기반 취업 매칭 서비스
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;