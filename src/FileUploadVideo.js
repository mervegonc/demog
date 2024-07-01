import React, { useRef } from 'react';

const FileUploadVideo = ({ onFileChange }) => {
  const fileInputRef = useRef();

  const handleFileChange = event => {
    onFileChange(event.target.files[0]);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="video/*"
      />
      <button type="button" onClick={() => fileInputRef.current.click()}>
        Add Video
      </button>
    </div>
  );
};

export default FileUploadVideo;
