import React, { useState, useRef, useEffect } from 'react';
import { importApi } from '../api/import.api';
import { ImportTemplate, ImportValidation } from '../types/import.types';
import { 
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  DownloadIcon,
  RefreshCwIcon,
  InfoIcon
} from 'lucide-react';

interface ImportUploadProps {
  onImportStart?: (jobId: string) => void;
  onSuccess?: () => void;
}

const ImportUpload: React.FC<ImportUploadProps> = ({ 
  onImportStart, 
  onSuccess 
}) => {
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await importApi.getTemplates();
      setTemplates(templatesData);
      if (templatesData.length > 0 && !selectedType) {
        setSelectedType(templatesData[0].type);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load import templates');
    } finally {
      setLoading(false);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setValidation(null);
    setError(null);
  };

  const validateFile = async () => {
    if (!selectedFile || !selectedType) return;

    setValidating(true);
    setError(null);

    try {
      const validationResult = await importApi.uploadFile(selectedFile, selectedType);
      setValidation(validationResult);
    } catch (error: any) {
      console.error('Validation error:', error);
      setError(error.response?.data?.message || 'File validation failed');
    } finally {
      setValidating(false);
    }
  };

  const startImport = async () => {
    if (!selectedFile || !selectedType || !validation?.valid) return;

    setUploading(true);
    setError(null);

    try {
      const job = await importApi.startImport(selectedFile, selectedType);
      
      if (onImportStart) {
        onImportStart(job.id);
      }
      
      // Reset form
      setSelectedFile(null);
      setValidation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Failed to start import');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    if (!selectedType) return;

    try {
      const blob = await importApi.downloadTemplate(selectedType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download error:', error);
      setError('Failed to download template');
    }
  };

  const selectedTemplate = templates.find(t => t.type === selectedType);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <RefreshCwIcon className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span>Loading import templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <UploadIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Import Data</h2>
      </div>

      {/* Import Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Import Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedFile(null);
            setValidation(null);
            setError(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Choose import type...</option>
          {templates.map(template => (
            <option key={template.type} value={template.type}>
              {template.name}
            </option>
          ))}
        </select>

        {selectedTemplate && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                <p className="text-sm text-blue-700 mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <DownloadIcon className="w-3 h-3" />
                Template
              </button>
            </div>

            {/* Template Columns */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Required Columns:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedTemplate.columns.filter(col => col.required).map(column => (
                  <div key={column.name} className="text-xs bg-white px-2 py-1 rounded border border-blue-300">
                    {column.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Area */}
      {selectedType && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File
          </label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileIcon className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-medium text-slate-900">{selectedFile.name}</div>
                  <div className="text-sm text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setValidation(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <div className="text-lg font-medium text-slate-700 mb-2">
                  Drop your file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </div>
                <div className="text-sm text-slate-500">
                  Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
        </div>
      )}

      {/* Validation Step */}
      {selectedFile && !validation && (
        <div className="mb-6">
          <button
            onClick={validateFile}
            disabled={validating}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {validating ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Validating File...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Validate File
              </>
            )}
          </button>
        </div>
      )}

      {/* Validation Results */}
      {validation && (
        <div className="mb-6">
          <div className={`p-4 rounded-lg border ${
            validation.valid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validation.valid ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                validation.valid ? 'text-green-900' : 'text-red-900'
              }`}>
                {validation.valid ? 'File Valid' : 'Validation Failed'}
              </span>
            </div>

            <div className={`text-sm ${
              validation.valid ? 'text-green-700' : 'text-red-700'
            }`}>
              Found {validation.total_rows} rows to import
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                <ul className="space-y-1">
                  {validation.errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {error}
                    </li>
                  ))}
                  {validation.errors.length > 5 && (
                    <li className="text-sm text-red-600">
                      ... and {validation.errors.length - 5} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-1">
                  <AlertTriangleIcon className="w-4 h-4" />
                  Warnings:
                </h4>
                <ul className="space-y-1">
                  {validation.warnings.slice(0, 3).map((warning, index) => (
                    <li key={index} className="text-sm text-amber-700">
                      • {warning}
                    </li>
                  ))}
                  {validation.warnings.length > 3 && (
                    <li className="text-sm text-amber-600">
                      ... and {validation.warnings.length - 3} more warnings
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Import Button */}
      {validation?.valid && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedFile(null);
              setValidation(null);
              setError(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={startImport}
            disabled={uploading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Starting Import...
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                Start Import ({validation.total_rows} records)
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <InfoIcon className="w-4 h-4 text-slate-600" />
          <span className="font-medium text-slate-700">Import Instructions</span>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>1. Select the type of data you want to import</li>
          <li>2. Download the template to see required format</li>
          <li>3. Fill in your data using the template structure</li>
          <li>4. Upload your file and validate the data</li>
          <li>5. Start the import process</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportUpload;
