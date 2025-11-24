import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/services';
import Navigation from '../components/Navigation';
import '../styles/Upload.css';

const ResumeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    // PDF 파일인지 확인
    if (selectedFile.type !== 'application/pdf') {
      setError('PDF 파일만 업로드 가능합니다.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');

    // 파일명을 기본 제목으로 설정
    if (!title) {
      const fileName = selectedFile.name.replace('.pdf', '');
      setTitle(fileName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      setError('이력서 제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resumeAPI.uploadResumeFile(file, title);
      alert('이력서가 업로드되었습니다.');
      navigate('/resumes');
    } catch (err: any) {
      setError(err.response?.data?.message || '이력서 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="page-content">
        <div className="upload-container">
          <div className="page-title-section">
            <h1>이력서 업로드</h1>
            <p>PDF 형식의 이력서 파일을 업로드하세요</p>
          </div>

          <div className="upload-card">
            <form onSubmit={handleSubmit} className="upload-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="title">이력서 제목</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="예: 2024년 백엔드 개발자 이력서"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>이력서 파일 (PDF)</label>
                <div 
                  className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {file ? (
                    <div className="file-info">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        type="button" 
                        className="remove-file"
                        onClick={() => setFile(null)}
                      >
                        파일 변경
                      </button>
                    </div>
                  ) : (
                    <div className="drop-content">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p>파일을 드래그하거나 클릭하여 선택하세요</p>
                      <span>PDF 파일만 업로드 가능합니다</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={() => navigate('/resumes')}
                  className="cancel-button"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading || !file}
                >
                  {loading ? '업로드 중...' : '업로드'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;