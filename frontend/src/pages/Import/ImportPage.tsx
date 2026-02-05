// src/pages/Import/ImportPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import type { User } from '../../types/auth.types';

import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'students' | 'buses' | 'transport' | 'lunch'>('students');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);

      // Call import API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/import/${importType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();
      setSuccess(`Successfully imported ${data.imported || 0} records`);
      setSelectedFile(null);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Failed to import file. Please try again.');
  }
}
finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = (type: string) => {
    // Download template from backend
    window.open(`${import.meta.env.VITE_API_URL}/import/template/${type}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Import Data</h1>
            <p className="text-gray-600 mt-1">Upload Excel files to import students, buses, or service details</p>
          </div>

          {/* Alerts */}
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}

          {/* Import Type Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Import Type</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setImportType('students')}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  importType === 'students'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="font-medium">Students</p>
              </button>

              <button
                onClick={() => setImportType('buses')}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  importType === 'buses'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <p className="font-medium">Buses</p>
              </button>

              <button
                onClick={() => setImportType('transport')}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  importType === 'transport'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-medium">Transport Details</p>
              </button>

              <button
                onClick={() => setImportType('lunch')}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  importType === 'lunch'
                    ? 'border-yellow-600 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Lunch Details</p>
              </button>
            </div>
          </Card>

          {/* File Upload */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upload File</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate(importType)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  Download Template
                </Button>
              </div>
            </CardHeader>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              {selectedFile ? (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag and drop your Excel file here
                  </p>
                  <p className="text-sm text-gray-600 mb-4">or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <span className="btn btn-primary cursor-pointer">
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: .xlsx, .xls (Max size: 10MB)
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex justify-end">
              <Button
                variant="success"
                size="lg"
                onClick={handleUpload}
                isLoading={isUploading}
                leftIcon={
                  !isUploading && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )
                }
              >
                Upload and Import
              </Button>
            </div>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
            </CardHeader>
            <div className="prose prose-sm max-w-none">
              <ol className="space-y-2 text-gray-700">
                <li>Download the appropriate template for your import type</li>
                <li>Fill in the template with your data (do not modify column headers)</li>
                <li>Save the file in Excel format (.xlsx or .xls)</li>
                <li>Select the import type above</li>
                <li>Upload your file and click "Upload and Import"</li>
              </ol>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">⚠️ Important Notes:</p>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                  <li>Ensure all required fields are filled</li>
                  <li>Check for duplicate admission numbers or bus numbers</li>
                  <li>Validate phone numbers and email addresses</li>
                  <li>Large files may take longer to process</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
