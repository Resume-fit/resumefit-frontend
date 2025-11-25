import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import ResumesPage from './pages/ResumesPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import ResumeCreatePage from './pages/ResumeCreatePage';
import JobPositionsPage from './pages/JobPositionsPage';
import JobPositionDetailPage from './pages/JobPositionDetailPage';
import MyPage from './pages/MyPage';
import './App.css';
import './styles/Common.css';
import MatchingResultPage from './pages/MatchingResultPage';

// 토큰 유효성 검사 함수
const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // JWT 토큰 형식 확인 (간단한 검증)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // payload 디코딩하여 만료 시간 확인
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000; // 초를 밀리초로 변환
    
    // 만료되었는지 확인
    return Date.now() < expirationTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// 인증 상태 확인 함수
const checkAuthentication = (): boolean => {
  const token = localStorage.getItem('accessToken');
  
  if (!isValidToken(token)) {
    // 유효하지 않은 토큰은 삭제
    localStorage.removeItem('accessToken');
    return false;
  }
  
  return true;
};

// 인증된 사용자만 접근 가능한 라우트
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(checkAuthentication());
  }, []);

  // 인증 상태 확인 중
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 비인증 사용자만 접근 가능한 라우트 (로그인, 회원가입)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(checkAuthentication());
  }, []);

  // 인증 상태 확인 중
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/resumes" replace />;
};

function App() {
  // 앱 시작 시 토큰 유효성 검사
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isValidToken(token)) {
      console.log('Invalid token detected on app start. Clearing...');
      localStorage.removeItem('accessToken');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 홈 페이지 - 누구나 접근 가능 */}
          <Route path="/" element={<HomePage />} />

          {/* 공개 라우트 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/join"
            element={
              <PublicRoute>
                <JoinPage />
              </PublicRoute>
            }
          />
          
          {/* 채용공고 - 누구나 접근 가능 */}
          <Route path="/job-positions" element={<JobPositionsPage />} />

          {/* 보호된 라우트 */}
          <Route
            path="/resumes"
            element={
              <PrivateRoute>
                <ResumesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/resumes/upload"
            element={
              <PrivateRoute>
                <ResumeUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/resumes/create"
            element={
              <PrivateRoute>
                <ResumeCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/resumes/:resumeId"
            element={
              <PrivateRoute>
                <ResumeDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />

          <Route path="/matching/:resumeId" element={<MatchingResultPage />} />
          <Route path="/resumes/:resumeId" element={<ResumeDetailPage />} />
          <Route path="/job-positions/:id" element={<JobPositionDetailPage />} />

          {/* 404 페이지 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;