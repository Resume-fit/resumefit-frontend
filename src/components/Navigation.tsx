import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <span className="logo-text">ResumeFit</span>
        </div>
        
        <div className="nav-links">
          <button 
            onClick={() => handleProtectedNav('/resumes')} 
            className={`nav-link ${isActive('/resumes') && !isActive('/resumes/create') && !isActive('/resumes/upload') ? 'active' : ''}`}
          >
            내 이력서
          </button>
          <button 
            onClick={() => handleProtectedNav('/resumes/create')} 
            className={`nav-link ${isActive('/resumes/create') ? 'active' : ''}`}
          >
            이력서 작성
          </button>
          <button 
            onClick={() => handleProtectedNav('/resumes/upload')} 
            className={`nav-link ${isActive('/resumes/upload') ? 'active' : ''}`}
          >
            이력서 업로드
          </button>
          {/* ⭐ 매칭 결과 메뉴 제거 - 각 이력서 카드에서 접근 */}
          <button 
            onClick={() => navigate('/job-positions')} 
            className={`nav-link ${isActive('/job-positions') ? 'active' : ''}`}
          >
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
  );
};

export default Navigation;