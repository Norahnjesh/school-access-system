// Import Types for School Access System

export interface ImportJob {
  id: string;
  type: 'students' | 'buses' | 'transport_details' | 'lunch_details';
  filename: string;
  original_filename: string;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ImportWarning {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ImportStats {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  processing_jobs: number;
  total_records_processed: number;
  success_rate: number;
}

export interface ImportTemplate {
  type: 'students' | 'buses' | 'transport_details' | 'lunch_details';
  name: string;
  description: string;
  columns: ImportColumn[];
  sample_data: any[];
  download_url: string;
}

export interface ImportColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  required: boolean;
  description: string;
  validation?: string;
  example?: string;
}

export interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  total_rows: number;
  sample_data: any[];
}
