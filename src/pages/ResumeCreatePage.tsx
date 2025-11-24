import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/services';
import Navigation from '../components/Navigation';
import '../styles/ResumeCreate.css';

interface Education {
  schoolName: string;
  major: string;
  degree: string;
  status: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  maxGpa?: string;
}

interface Experience {
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certificate {
  certificateName: string;
  acquisitionDate: string;
}

interface Project {
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  projectUrl?: string;
}

interface Award {
  activityName: string;
  organization: string;
  description: string;
  date: string;
}

const ResumeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // 기본 정보
  const [resumeTitle, setResumeTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  // 학력
  const [educations, setEducations] = useState<Education[]>([{
    schoolName: '',
    major: '',
    degree: '학사',
    status: '졸업',
    startDate: '',
    endDate: '',
    gpa: '',
    maxGpa: '4.5'
  }]);
  
  // 경력
  const [experiences, setExperiences] = useState<Experience[]>([]);
  
  // 자격증
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // 프로젝트
  const [projects, setProjects] = useState<Project[]>([]);
  
  // 수상/활동
  const [awards, setAwards] = useState<Award[]>([]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations([...educations, {
      schoolName: '',
      major: '',
      degree: '학사',
      status: '졸업',
      startDate: '',
      endDate: '',
      gpa: '',
      maxGpa: '4.5'
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    setCertificates([...certificates, {
      certificateName: '',
      acquisitionDate: ''
    }]);
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, {
      projectName: '',
      description: '',
      startDate: '',
      endDate: '',
      projectUrl: ''
    }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addAward = () => {
    setAwards([...awards, {
      activityName: '',
      organization: '',
      description: '',
      date: ''
    }]);
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    setAwards(updated);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!resumeTitle.trim()) {
      alert('이력서 제목을 입력해주세요.');
      return;
    }

    if (!introduction.trim()) {
      alert('자기소개를 입력해주세요.');
      return;
    }

    if (educations.length === 0 || !educations[0].schoolName) {
      alert('학력 정보를 최소 1개 이상 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 날짜 형식 변환 함수 (YYYY-MM -> YYYY-MM-01)
      const formatDate = (dateStr: string): string | null => {
        if (!dateStr) return null;
        // 이미 YYYY-MM-DD 형식이면 그대로 반환
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
        // YYYY-MM 형식이면 -01 추가
        if (dateStr.match(/^\d{4}-\d{2}$/)) return `${dateStr}-01`;
        return dateStr;
      };

      const resumeData = {
        resumeTitle,
        profileImageS3Url: null,
        introduction,
        skills,
        education: educations.map(edu => ({
          schoolName: edu.schoolName,
          major: edu.major,
          degree: edu.degree,
          status: edu.status,
          startDate: formatDate(edu.startDate),
          endDate: formatDate(edu.endDate),
          gpa: edu.gpa ? parseFloat(edu.gpa) : null,
          maxGpa: edu.maxGpa ? parseFloat(edu.maxGpa) : null
        })),
        experience: experiences.map(exp => ({
          companyName: exp.companyName,
          position: exp.position,
          startDate: formatDate(exp.startDate),
          endDate: formatDate(exp.endDate),
          description: exp.description
        })),
        certificates: certificates.map(cert => ({
          certificateName: cert.certificateName,
          acquisitionDate: formatDate(cert.acquisitionDate)
        })),
        projects: projects.map(proj => ({
          projectName: proj.projectName,
          description: proj.description,
          startDate: formatDate(proj.startDate),
          endDate: formatDate(proj.endDate),
          projectUrl: proj.projectUrl || null
        })),
        awardsActivities: awards.map(award => ({
          activityName: award.activityName,
          organization: award.organization,
          description: award.description,
          date: formatDate(award.date)
        }))
      };

      console.log('전송할 데이터:', JSON.stringify(resumeData, null, 2));
      await resumeAPI.createResume(resumeData);
      alert('이력서가 성공적으로 생성되었습니다!');
      navigate('/resumes');
    } catch (err: any) {
      console.error('이력서 생성 실패:', err);
      console.error('응답 상태:', err.response?.status);
      console.error('응답 데이터:', err.response?.data);
      alert(err.response?.data?.message || '이력서 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: '기본 정보' },
    { number: 2, title: '학력' },
    { number: 3, title: '경력' },
    { number: 4, title: '기술/자격증' },
    { number: 5, title: '프로젝트/수상' }
  ];

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="resume-create-container">
          <div className="page-title-section">
            <h1>이력서 작성</h1>
            <p>정보를 입력하면 자동으로 PDF 이력서가 생성됩니다</p>
          </div>

          {/* 진행 단계 표시 */}
          <div className="step-indicator">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.number)}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
          </div>

          <div className="form-container">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="form-section">
              <h2>기본 정보</h2>
              
              <div className="form-group">
                <label>이력서 제목 *</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="예: 백엔드 개발자 이력서"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>자기소개 *</label>
                <textarea
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="자신을 소개해주세요. 경력 요약, 강점, 목표 등을 작성하세요."
                  className="form-textarea"
                  rows={6}
                />
              </div>
            </div>
          )}

          {/* Step 2: 학력 */}
          {currentStep === 2 && (
            <div className="form-section">
              <h2>학력</h2>
              
              {educations.map((edu, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <span>학력 {index + 1}</span>
                    {educations.length > 1 && (
                      <button 
                        onClick={() => removeEducation(index)}
                        className="remove-button"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>학교명 *</label>
                      <input
                        type="text"
                        value={edu.schoolName}
                        onChange={(e) => updateEducation(index, 'schoolName', e.target.value)}
                        placeholder="예: 명지대학교"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>전공 *</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => updateEducation(index, 'major', e.target.value)}
                        placeholder="예: 컴퓨터공학과"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>학위</label>
                      <select
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="form-select"
                      >
                        <option value="고등학교">고등학교</option>
                        <option value="전문학사">전문학사 (2~3년제)</option>
                        <option value="학사">학사 (4년제)</option>
                        <option value="석사">석사</option>
                        <option value="박사">박사</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>상태</label>
                      <select
                        value={edu.status}
                        onChange={(e) => updateEducation(index, 'status', e.target.value)}
                        className="form-select"
                      >
                        <option value="재학">재학</option>
                        <option value="휴학">휴학</option>
                        <option value="졸업예정">졸업예정</option>
                        <option value="졸업">졸업</option>
                        <option value="중퇴">중퇴</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>입학일</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>졸업일</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>학점</label>
                      <input
                        type="number"
                        step="0.01"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        placeholder="예: 3.8"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>만점</label>
                      <select
                        value={edu.maxGpa}
                        onChange={(e) => updateEducation(index, 'maxGpa', e.target.value)}
                        className="form-select"
                      >
                        <option value="4.0">4.0</option>
                        <option value="4.3">4.3</option>
                        <option value="4.5">4.5</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addEducation} className="add-button">
                + 학력 추가
              </button>
            </div>
          )}

          {/* Step 3: 경력 */}
          {currentStep === 3 && (
            <div className="form-section">
              <h2>경력</h2>
              <p className="section-description">신입의 경우 인턴, 아르바이트 경험도 포함할 수 있습니다.</p>
              
              {experiences.length === 0 ? (
                <div className="empty-section">
                  <p>아직 추가된 경력이 없습니다.</p>
                </div>
              ) : (
                experiences.map((exp, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <span>경력 {index + 1}</span>
                      <button 
                        onClick={() => removeExperience(index)}
                        className="remove-button"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>회사명 *</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                          placeholder="예: 네이버"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>직책/직무 *</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="예: 백엔드 개발자"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>시작일</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>종료일</label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>업무 내용</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="담당했던 업무와 성과를 작성해주세요."
                        className="form-textarea"
                        rows={4}
                      />
                    </div>
                  </div>
                ))
              )}

              <button onClick={addExperience} className="add-button">
                + 경력 추가
              </button>
            </div>
          )}

          {/* Step 4: 기술/자격증 */}
          {currentStep === 4 && (
            <div className="form-section">
              <h2>기술 스택</h2>
              
              <div className="form-group">
                <label>기술 스택</label>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="예: Java, Spring Boot, React"
                    className="form-input"
                  />
                  <button onClick={addSkill} className="add-skill-button">추가</button>
                </div>
                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="remove-skill">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <h2 style={{ marginTop: '40px' }}>자격증</h2>
              
              {certificates.length === 0 ? (
                <div className="empty-section">
                  <p>아직 추가된 자격증이 없습니다.</p>
                </div>
              ) : (
                certificates.map((cert, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <span>자격증 {index + 1}</span>
                      <button 
                        onClick={() => removeCertificate(index)}
                        className="remove-button"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>자격증명 *</label>
                        <input
                          type="text"
                          value={cert.certificateName}
                          onChange={(e) => updateCertificate(index, 'certificateName', e.target.value)}
                          placeholder="예: 정보처리기사"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>취득일</label>
                        <input
                          type="month"
                          value={cert.acquisitionDate}
                          onChange={(e) => updateCertificate(index, 'acquisitionDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button onClick={addCertificate} className="add-button">
                + 자격증 추가
              </button>
            </div>
          )}

          {/* Step 5: 프로젝트/수상 */}
          {currentStep === 5 && (
            <div className="form-section">
              <h2>프로젝트</h2>
              
              {projects.length === 0 ? (
                <div className="empty-section">
                  <p>아직 추가된 프로젝트가 없습니다.</p>
                </div>
              ) : (
                projects.map((proj, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <span>프로젝트 {index + 1}</span>
                      <button 
                        onClick={() => removeProject(index)}
                        className="remove-button"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>프로젝트명 *</label>
                      <input
                        type="text"
                        value={proj.projectName}
                        onChange={(e) => updateProject(index, 'projectName', e.target.value)}
                        placeholder="예: ResumeFit - AI 이력서 매칭 서비스"
                        className="form-input"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>시작일</label>
                        <input
                          type="month"
                          value={proj.startDate}
                          onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>종료일</label>
                        <input
                          type="month"
                          value={proj.endDate}
                          onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>프로젝트 설명</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="프로젝트 내용, 담당 역할, 사용 기술 등을 작성해주세요."
                        className="form-textarea"
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label>프로젝트 URL (선택)</label>
                      <input
                        type="url"
                        value={proj.projectUrl}
                        onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                        placeholder="https://github.com/..."
                        className="form-input"
                      />
                    </div>
                  </div>
                ))
              )}

              <button onClick={addProject} className="add-button">
                + 프로젝트 추가
              </button>

              <h2 style={{ marginTop: '40px' }}>수상/활동</h2>
              
              {awards.length === 0 ? (
                <div className="empty-section">
                  <p>아직 추가된 수상/활동이 없습니다.</p>
                </div>
              ) : (
                awards.map((award, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <span>수상/활동 {index + 1}</span>
                      <button 
                        onClick={() => removeAward(index)}
                        className="remove-button"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>활동/수상명 *</label>
                        <input
                          type="text"
                          value={award.activityName}
                          onChange={(e) => updateAward(index, 'activityName', e.target.value)}
                          placeholder="예: 교내 해커톤 대상"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>주최기관</label>
                        <input
                          type="text"
                          value={award.organization}
                          onChange={(e) => updateAward(index, 'organization', e.target.value)}
                          placeholder="예: 명지대학교"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>날짜</label>
                        <input
                          type="month"
                          value={award.date}
                          onChange={(e) => updateAward(index, 'date', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>설명</label>
                      <textarea
                        value={award.description}
                        onChange={(e) => updateAward(index, 'description', e.target.value)}
                        placeholder="활동 내용이나 수상 내역을 작성해주세요."
                        className="form-textarea"
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}

              <button onClick={addAward} className="add-button">
                + 수상/활동 추가
              </button>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="nav-button prev"
              >
                ← 이전
              </button>
            )}
            
            {currentStep < 5 ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="nav-button next"
              >
                다음 →
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="nav-button submit"
                disabled={loading}
              >
                {loading ? '생성 중...' : '이력서 생성'}
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreatePage;