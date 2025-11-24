import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송을 위해
});

// 요청 인터셉터: Authorization 헤더에 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 재발급
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 재발급 요청
        const response = await axios.post(`${API_BASE_URL}/api/reissue`, {}, {
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (reissueError) {
        // 재발급 실패 시 로그아웃
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
