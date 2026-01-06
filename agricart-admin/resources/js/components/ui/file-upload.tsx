import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeImage } from '@/lib/image-utils';
import { Trash2, Upload, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  currentFile?: string | null;
  onFileChange: (file: File | null) => void;
  onFileRemove?: () => void;
  onFileDelete?: (filePath: string) => Promise<void>;
  accept?: string;
  className?: string;
  disabled?: boolean;
  memberId?: number;
  documentMarkedForDeletion?: boolean;
}

export function FileUpload({
  label = "Document Upload",
  currentFile,
  onFileChange,
  onFileRemove,
  onFileDelete,
  accept = ".jpg,.jpeg,.png,.pdf",
  className = "",
  disabled = false,
  memberId,
  documentMarkedForDeletion = false
}: FileUploadProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid file type. Only JPG, PNG, and PDF files are allowed.');
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setPreviewFile(file);
      onFileChange(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to remove this file?');
    if (!confirmDelete) return;
    
    setPreviewFile(null);
    setPreviewUrl(null);
    onFileChange(null);
    onFileRemove?.();
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async () => {
    if (!currentFile || !onFileDelete) return;
    
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this file from storage? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await onFileDelete(currentFile);
      // File deletion handled by parent component
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const getFileIcon = (file: File | string) => {
    const fileName = typeof file === 'string' ? file : file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = typeof file === 'string' ? 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) :
      file.type.startsWith('image/');
    
    if (isPdf) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (isImage) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getFileType = (file: File | string) => {
    const fileName = typeof file === 'string' ? file : file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = typeof file === 'string' ? 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) :
      file.type.startsWith('image/');
    
    if (isPdf) return 'PDF Document';
    if (isImage) return 'Image';
    return 'Document';
  };

  const renderPreview = () => {
    // Show preview of newly selected file
    if (previewFile && previewUrl) {
      const isPdf = previewFile.name.toLowerCase().endsWith('.pdf');
      const isImage = previewFile.type.startsWith('image/');
      
      return (
        <div className="relative group">
          <div className="border rounded-lg p-4 bg-gray-50">
            {isImage ? (
              <img
                src={previewUrl}
                alt="Preview"
                onError={(e) => { e.currentTarget.src = '/images/fallback-photo.png'; }}
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            ) : isPdf ? (
              <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between p-2 bg-red-50 border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">PDF Preview</span>
                    </div>
                    <span className="text-xs text-gray-500">{previewFile.name}</span>
                  </div>
                  <div className="h-64 overflow-hidden">
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0"
                      title="PDF Preview"
                      style={{ minHeight: '256px' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-32 h-32 mx-auto">
                <FileText className="w-12 h-12 text-gray-500 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {previewFile.name}
                </span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 opacity-90 hover:opacity-100 transition-opacity shadow-lg"
            onClick={handleRemoveFile}
            disabled={disabled}
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    // Show current file if no new file selected
    if (currentFile && !previewFile) {
      const isPdf = currentFile.toLowerCase().endsWith('.pdf');
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(currentFile);
      
      return (
        <div className="relative group">
          <div className={`border rounded-lg p-4 ${documentMarkedForDeletion ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            {isImage ? (
              <SafeImage
                src={currentFile}
                alt="Current document"
                className={`w-32 h-32 object-cover rounded-lg mx-auto ${documentMarkedForDeletion ? 'opacity-50' : ''}`}
              />
            ) : isPdf ? (
              <div className="w-full max-w-md mx-auto">
                <div className={`bg-white rounded-lg shadow-sm border ${documentMarkedForDeletion ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between p-2 bg-red-50 border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">PDF Preview</span>
                    </div>
                    <span className="text-xs text-gray-500">Current PDF</span>
                  </div>
                  <div className="h-64 overflow-hidden">
                    <iframe
                      src={currentFile}
                      className="w-full h-full border-0"
                      title="Current PDF Preview"
                      style={{ minHeight: '256px' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-32 h-32 mx-auto">
                <FileText className={`w-12 h-12 mb-2 ${documentMarkedForDeletion ? 'text-red-400' : 'text-gray-500'}`} />
                <span className={`text-sm text-center ${documentMarkedForDeletion ? 'text-red-600' : 'text-gray-600'}`}>
                  Document
                </span>
              </div>
            )}
            {documentMarkedForDeletion && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 rounded-lg">
                <div className="text-center">
                  <div className="text-red-600 font-semibold text-sm">Marked for Deletion</div>
                  <div className="text-red-500 text-xs">Upload new file to replace</div>
                </div>
              </div>
            )}
          </div>
          {onFileDelete && !documentMarkedForDeletion && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 opacity-90 hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleDeleteFile}
              disabled={disabled}
              title="Delete file from storage"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Show placeholder when no file is present
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No file selected</p>
        <p className="text-sm text-gray-400">Click "Choose File" to upload a document</p>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="file-upload">{label}</Label>
      
      {/* Current/Preview File Display */}
      {renderPreview()}
      
      {/* File Upload Input */}
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </Button>
      </div>
      
      {/* File Info */}
      {(previewFile || currentFile) && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {getFileIcon(previewFile || currentFile!)}
            <div>
              <p className="font-medium">
                {previewFile ? previewFile.name : 'Current file'}
              </p>
              <p className="text-xs text-gray-500">
                {getFileType(previewFile || currentFile!)}
                {previewFile && ` • ${(previewFile.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* File Type Help Text */}
      <p className="text-xs text-gray-500">
        Accepted file types: JPG, PNG, PDF (Max size: 2MB)
      </p>
    </div>
  );
}
