import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './styles/FileUpload.css';

const FileUpload = ({ onFileChange }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: acceptedFiles => {
            setUploadedFiles(acceptedFiles);
            onFileChange(acceptedFiles); // Seçilen dosyaları PostForm bileşenine iletiyoruz

            // Dosya isimlerini konsola yazdır ve isimlendirme yap
            acceptedFiles.forEach((file, index) => {
                const fileName = `postId_${index + 1}.jpeg`; // Örneğin: postId_1.jpeg, postId_2.jpeg, ...
                console.log(`File ${index + 1}: ${fileName}`);
                file.newName = fileName; // Yeni ismi dosyanın içine ekliyoruz
            });
        },
        multiple: true 
    });
    return (
        <div {...getRootProps()} className="drop-area">
            <input {...getInputProps()} />
            <p>Drag and drop files here or click to browse.</p>
            <ul>
                <div className='upload-file-names'>
                {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.newName || file.name}</li>
                ))}
                </div>
            </ul>
        </div>
    );
};

export default FileUpload;
