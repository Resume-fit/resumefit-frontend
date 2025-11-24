import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/services';
import Navigation from '../components/Navigation';
import '../styles/MyPage.css';


interface UserInfo {
  email: string;
  name: string;
  phoneNumber?: string; // 전화번호 추가
  profileImage?: string; // 백엔드 photo를 프론트에서 사용
  academic?: string; // 최종 학력 추가
  schoolName?: string; // 학교명 추가
  major?: string; // 전공 추가
}

// 최종 학력 표시를 위한 맵 (필요하다면 더 추가)
const ACADEMIC_MAP: { [key: string]: string } = {
  HIGH_SCHOOL: '고등학교 졸업',
  ASSOCIATE_DEGREE: '전문학사 (2~3년제)',
  BACHELOR_DEGREE: '학사 (4년제)',
  MASTER_DEGREE: '석사',
  DOCTORATE: '박사',
};


const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 수정 폼 상태 변경: age, gender 대신 새로운 필드 사용
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: '', 
    academic: '', 
    schoolName: '', 
    major: '', 
  });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      // API 반환 타입을 UserInfo 대신 any로 받은 후 매핑 (타입 불일치 오류 방지)
      const data: any = await userAPI.getUserInfo(); 
      
      // 백엔드 데이터(photo)를 프론트엔드 상태(profileImage)에 맞게 매핑
      const mappedData: UserInfo = {
          email: data.email,
          name: data.name,
          phoneNumber: data.phoneNumber,
          profileImage: data.photo, // photo -> profileImage
          academic: data.academic,
          schoolName: data.schoolName,
          major: data.major,
      };

      setUserInfo(mappedData); 
      
      // editForm 상태 초기화 (새로운 필드 사용)
      setEditForm({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        academic: data.academic || '',
        schoolName: data.schoolName || '',
        major: data.major || '',
      });

    } catch (err: any) {
      console.error('사용자 정보 로드 실패:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setNewProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setSaving(true);
    
    try {
      const formData = new FormData();
      
      // 백엔드가 기대하는 방식: userInfoDto를 JSON Blob으로 전송
      const userInfoDto = {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber || null,
        academic: editForm.academic || null,
        schoolName: editForm.schoolName || null,
        major: editForm.major || null,
      };
      
      formData.append(
        'userInfoDto', 
        new Blob([JSON.stringify(userInfoDto)], { type: 'application/json' })
      );

      // 프로필 이미지 추가 (있는 경우만)
      if (newProfileImage) {
        formData.append('photo', newProfileImage);
      }
      
      const updatedData: any = await userAPI.updateUserInfo(formData);
      
      // 업데이트된 데이터도 프론트엔드 상태에 맞게 매핑
      const mappedUpdatedUser: UserInfo = {
          email: updatedData.email,
          name: updatedData.name,
          phoneNumber: updatedData.phoneNumber,
          profileImage: updatedData.photo, // photo -> profileImage
          academic: updatedData.academic,
          schoolName: updatedData.schoolName,
          major: updatedData.major,
      };

      setUserInfo(mappedUpdatedUser);
      setIsEditing(false);
      setNewProfileImage(null);
      setPreviewImage(null);
      alert('프로필이 수정되었습니다.');
      
      // 최신 데이터 다시 로드
      await loadUserInfo();

    } catch (err: any) {
      console.error('프로필 수정 실패:', err);
      if (err.response?.status === 413) {
        alert('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
      } else {
        alert(err.response?.data?.message || '프로필 수정에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      // 취소 시 기존 userInfo로 editForm 재설정
      setEditForm({
        name: userInfo.name || '',
        phoneNumber: userInfo.phoneNumber || '',
        academic: userInfo.academic || '',
        schoolName: userInfo.schoolName || '',
        major: userInfo.major || '',
      });
    }
    setNewProfileImage(null);
    setPreviewImage(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="page-content">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadUserInfo} className="btn-retry">다시 시도</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="mypage-container">
          <div className="page-title-section">
            <h1>마이페이지</h1>
            <p>내 정보를 확인하고 수정하세요</p>
          </div>

          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-image-section">
                {isEditing ? (
                  <label className="profile-image-edit">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden-input"
                    />
                    {previewImage ? (
                      <img src={previewImage} alt="프로필 미리보기" />
                    ) : userInfo?.profileImage ? ( // profileImage로 변경
                      <img src={userInfo.profileImage} alt="프로필" />
                    ) : (
                      <div className="profile-placeholder-circle">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    )}
                    <div className="edit-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                  </label>
                ) : (
                  <div className="profile-image-display">
                    {userInfo?.profileImage ? ( // profileImage로 변경
                      <img src={userInfo.profileImage} alt="프로필" />
                    ) : (
                      <div className="profile-placeholder-circle">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  프로필 수정
                </button>
              )}
            </div>

            <div className="profile-info">
              <div className="info-item">
                <label>이메일</label>
                <span className="info-value">{userInfo?.email}</span>
              </div>

              <div className="info-item">
                <label>이름</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="edit-input"
                    placeholder="이름을 입력하세요"
                  />
                ) : (
                  <span className="info-value">{userInfo?.name || '-'}</span>
                )}
              </div>

              {/*  전화번호 필드로 변경 */}
              <div className="info-item">
                <label>전화번호</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="edit-input"
                    placeholder="전화번호를 입력하세요"
                  />
                ) : (
                  <span className="info-value">{userInfo?.phoneNumber || '-'}</span>
                )}
              </div>

              {/*  최종 학력 필드 추가 */}
              <div className="info-item">
                <label>최종 학력</label>
                {isEditing ? (
                  <select
                    value={editForm.academic}
                    onChange={(e) => setEditForm({ ...editForm, academic: e.target.value })}
                    className="edit-select"
                  >
                    <option value="">선택 안함</option>
                    <option value="HIGH_SCHOOL">고등학교 졸업</option>
                    <option value="ASSOCIATE_DEGREE">전문학사 (2~3년제)</option>
                    <option value="BACHELOR_DEGREE">학사 (4년제)</option>
                    <option value="MASTER_DEGREE">석사</option>
                    <option value="DOCTORATE">박사</option>
                  </select>
                ) : (
                  <span className="info-value">
                    {userInfo?.academic ? ACADEMIC_MAP[userInfo.academic] || userInfo.academic : '-'}
                  </span>
                )}
              </div>

              {/*  학교명 필드 추가 */}
              <div className="info-item">
                <label>학교명</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.schoolName}
                    onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
                    className="edit-input"
                    placeholder="학교명을 입력하세요"
                  />
                ) : (
                  <span className="info-value">{userInfo?.schoolName || '-'}</span>
                )}
              </div>

              {/*  전공 필드 추가 */}
              <div className="info-item">
                <label>전공</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.major}
                    onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                    className="edit-input"
                    placeholder="전공을 입력하세요"
                  />
                ) : (
                  <span className="info-value">{userInfo?.major || '-'}</span>
                )}
              </div>
              
            </div>

            {isEditing && (
              <div className="edit-actions">
                <button onClick={handleCancel} className="cancel-btn" disabled={saving}>
                  취소
                </button>
                <button onClick={handleSave} className="save-btn" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>

          <div className="mypage-links">
            <button onClick={() => navigate('/resumes')} className="link-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>내 이력서 관리</span>
            </button>
            <button onClick={() => navigate('/job-positions')} className="link-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span>채용공고 보기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;