// 사용자 관련 타입
export interface User {
  name: string;
  email: string;
  phoneNumber: string;
  photo?: string;
  academic?: string;
  schoolName?: string;
  major?: string;
}

export interface JoinRequest {
  name: string;
  birth?: string;
  phoneNumber: string;
  email: string;
  password: string;
  academic?: string;
  schoolName?: string;
  major?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// 이력서 관련 타입
export interface ResumeSummary {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDetail {
  title: string;
  fileKey: string;
  createdAt: string;
  updatedAt: string;
  pdfViewUrl?: string;
}

export interface ResumePost {
  resumeTitle: string;
  profileImageS3Url?: string;
  introduction: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  certificates: Certificate[];
  projects: Project[];
  awardsActivities: Award[];
}

export interface Education {
  schoolName: string;
  major: string;
  degree: string;
  status: string;
  startDate: string;
  endDate: string;
  gpa?: number;
  maxGpa?: number;
}

export interface Experience {
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Certificate {
  certificateName: string;
  acquisitionDate: string;
}

export interface Project {
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  projectUrl?: string;
}

export interface Award {
  activityName: string;
  organization: string;
  description: string;
  date: string;
}

// 채용공고 관련 타입
export interface JobPositionSummary {
  id: number;
  positionName: string;
  companyName: string;
  workPlace: string;
  employmentType: string;
  url: string;
}

export interface JobPositionDetail extends JobPositionSummary {
  jobCategory: string;
  mainJob: string;
  requirements: Requirement[];
}

export interface Requirement {
  type: 'REQUIRED' | 'PREFERRED';
  content: string;
}

// 매칭 관련 타입
export interface MatchingResponse {
  jobPosition: JobPositionSummary;
  matchType: 'SUITABLE' | 'GROWTH_TRACK';
  comment: string;
}

// 리뷰 관련 타입
export interface ReviewRequest {
  reviewType: 'LIKE' | 'RESUME_MISMATCH' | 'FIELD_MISMATCH' | 'CRITERIA_UNCLEAR' | 'OTHER';
  recommendedJobPositionIds?: number[];
  otherComment?: string;
}
