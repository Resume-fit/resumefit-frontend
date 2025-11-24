import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/services';
import '../styles/Auth.css';

const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    phoneNumber: '',
    email: '',
    password: '',
    passwordConfirm: '',
    academic: '',
    schoolName: '',
    major: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 비밀번호 확인 검증
    if (name === 'password' || name === 'passwordConfirm') {
      if (name === 'passwordConfirm') {
        if (value !== formData.password) {
          setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
          setPasswordError('');
        }
      } else if (name === 'password') {
        if (formData.passwordConfirm && value !== formData.passwordConfirm) {
          setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인 검증
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 패턴 검증
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,64}$/;
    if (!passwordPattern.test(formData.password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 8자 이상이어야 합니다.');
      return;
    }

    // 전화번호 패턴 검증
    const phonePattern = /^\d{10,11}$/;
    if (!phonePattern.test(formData.phoneNumber)) {
      setError('전화번호는 \'-\' 없이 10~11자리 숫자로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      const joinDto = {
        name: formData.name,
        birth: formData.birth || null,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        academic: formData.academic || null,
        schoolName: formData.schoolName || null,
        major: formData.major || null,
      };

      submitData.append('joinDto', new Blob([JSON.stringify(joinDto)], { type: 'application/json' }));
      
      if (photo) {
        submitData.append('photo', photo);
      }

      await authAPI.join(submitData);
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">ResumeFit 회원가입</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth">생년월일</label>
            <input
              type="date"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호 *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="01012345678 (- 제외)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
            />
            {passwordError && <span className="field-error">{passwordError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="academic">학력</label>
            <select
              id="academic"
              name="academic"
              value={formData.academic}
              onChange={handleChange}
            >
              <option value="">선택하세요</option>
              <option value="HIGH_SCHOOL">고등학교 졸업</option>
              <option value="ASSOCIATE_DEGREE">전문학사 졸업 (2~3년제)</option>
              <option value="BACHELOR_DEGREE">학사 졸업 (4년제)</option>
              <option value="MASTER_DEGREE">석사 졸업</option>
              <option value="DOCTORATE_DEGREE">박사 졸업</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="schoolName">학교명</label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="학교명을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="major">전공</label>
            <input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="전공을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">프로필 사진</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading || passwordError !== ''}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
