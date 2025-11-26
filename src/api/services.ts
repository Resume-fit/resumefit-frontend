import axiosInstance from './axios';
import {
  LoginRequest,
  LoginResponse,
  User,
  ResumeSummary,
  ResumeDetail,
  MatchingResponse,
  ReviewRequest,
  JobPositionSummary,
  JobPositionDetail,
} from '../types';

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout');
  },

  join: async (formData: FormData): Promise<void> => {
    await axiosInstance.post('/api/join', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// User API
export const userAPI = {
  getUserInfo: async (): Promise<User> => {
    const response = await axiosInstance.get('/api/users');
    return response.data;
  },

  updateUserInfo: async (formData: FormData): Promise<User> => {
    const response = await axiosInstance.patch('/api/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Resume API
export const resumeAPI = {
  getAllResumes: async (): Promise<ResumeSummary[]> => {
    const response = await axiosInstance.get('/api/resumes');
    return response.data;
  },

  getResumeDetail: async (resumeId: number): Promise<ResumeDetail> => {
    const response = await axiosInstance.get(`/api/resumes/${resumeId}`);
    return response.data;
  },

  uploadResumeFile: async (file: File, title: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    await axiosInstance.post('/api/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteResume: async (resumeId: number): Promise<void> => {
    await axiosInstance.delete(`/api/resumes/${resumeId}`);
  },

  matchResume: async (resumeId: number): Promise<MatchingResponse[]> => {
    const response = await axiosInstance.post(`/api/resumes/${resumeId}/match`);
    return response.data;
  },

  createResume: async (resumeData: any): Promise<void> => {
    await axiosInstance.post('/api/resumes', resumeData);
  },
};

// Matching API
export const matchingAPI = {
  getMatching: async (resumeId: number): Promise<MatchingResponse[]> => {
    const response = await axiosInstance.get(`/api/matching/${resumeId}`);
    return response.data;
  },

  getMatchingResults: async (resumeId: number): Promise<MatchingResponse[]> => {
    const response = await axiosInstance.get(`/api/matching/${resumeId}`);
    return response.data;
  },
};

// Review API (수정됨 - 하나로 통합)
export const reviewAPI = {
  // 리뷰 제출
  submitReview: async (resumeId: number, data: ReviewRequest): Promise<void> => {
    // ❌ 기존: DELETE 메서드 (오류)
    // await axiosInstance.delete(`/api/resumes/${resumeId}/review`, { data });
    
    // ✅ 수정: POST 메서드 + 올바른 엔드포인트
    await axiosInstance.post(`/api/reviews/${resumeId}`, data);
  },

  // 리뷰 존재 여부 확인
  checkReviewExists: async (resumeId: number): Promise<boolean> => {
    try {
      const response = await axiosInstance.get(`/api/reviews/check/${resumeId}`);
      return response.data; // true or false
    } catch (error) {
      console.error('리뷰 존재 확인 실패:', error);
      return false;
    }
  },
  
  // 기존 리뷰 조회 (선택사항)
  getReview: async (resumeId: number) => {
    const response = await axiosInstance.get(`/api/reviews/${resumeId}`);
    return response.data;
  },
};

// Job Position API
export const jobPositionAPI = {
  getAllJobPositions: async (): Promise<JobPositionSummary[]> => {
    const response = await axiosInstance.get('/api/job-positions');
    return response.data;
  },

  getJobPositionsByCategory: async (category: string): Promise<JobPositionSummary[]> => {
    const response = await axiosInstance.get(`/api/job-positions/category/${category}`);
    return response.data;
  },

  getJobPositionDetail: async (id: number): Promise<JobPositionDetail> => {
    const response = await axiosInstance.get(`/api/job-positions/${id}`);
    return response.data;
  },
};

// Re-export types for convenience
export type { MatchingResponse } from '../types';