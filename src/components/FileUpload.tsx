import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Archive, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadService, ALLOWED_FILE_TYPES, MAX_FILE_SIZES, UploadResult } from '../services/uploadService';
import { useToast } from '../contexts/ToastContext';

interface FileUploadProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  accept?: string[];
  maxSize?: number;
  folder?: string;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  result?: UploadResult;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = [],
  maxSize = MAX_FILE_SIZES.default,
  folder = 'uploads',
  showPreview = true,
  className = '',
  disabled = false,
}) => {
  const { addToast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validação de arquivo
  const validateFile = useCallback((file: File): string | null => {
    // Verifica tipo
    if (accept.length > 0 && !accept.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}`;
    }

    // Verifica tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }

    return null;
  }, [accept, maxSize]);

  // Adiciona arquivos
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        addToast({
          type: 'error',
          title: 'Arquivo inválido',
          message: error,
        });
        continue;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        uploading: false,
        uploaded: false,
      };

      // Gera preview para imagens
      if (showPreview && file.type.startsWith('image/')) {
        try {
          const preview = await uploadService.generateImagePreview(file);
          fileWithPreview.preview = preview;
        } catch (error) {
          console.warn('Erro ao gerar preview:', error);
        }
      }

      validFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [validateFile, showPreview, addToast]);

  // Upload de arquivos
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileWithPreview = files[i];
      
      if (fileWithPreview.uploaded || fileWithPreview.uploading) continue;

      // Marca como fazendo upload
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, uploading: true, error: undefined } : f
      ));

      try {
        let result: UploadResult;

        // Upload com compressão para imagens
        if (fileWithPreview.file.type.startsWith('image/')) {
          result = await uploadService.uploadImageWithCompression(
            fileWithPreview.file,
            folder,
            0.8
          );
        } else {
          result = await uploadService.uploadFile({
            file: fileWithPreview.file,
            folder,
          });
        }

        // Atualiza estado do arquivo
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            uploading: false, 
            uploaded: result.success,
            error: result.error,
            result
          } : f
        ));

        results.push(result);

        if (result.success) {
          addToast({
            type: 'success',
            title: 'Upload concluído',
            message: `${fileWithPreview.file.name} foi enviado com sucesso!`,
          });
        } else {
          addToast({
            type: 'error',
            title: 'Erro no upload',
            message: result.error || 'Erro desconhecido',
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            uploading: false, 
            error: errorMessage 
          } : f
        ));

        addToast({
          type: 'error',
          title: 'Erro no upload',
          message: errorMessage,
        });
      }
    }

    setIsUploading(false);

    // Chama callbacks
    if (onUploadComplete) {
      onUploadComplete(results);
    }

    const hasErrors = results.some(r => !r.success);
    if (hasErrors && onUploadError) {
      onUploadError('Alguns arquivos falharam no upload');
    }
  }, [files, folder, onUploadComplete, onUploadError, addToast]);

  // Remove arquivo
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handlers de drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [disabled, addFiles]);

  // Handler de clique no input
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  // Abre seletor de arquivos
  const openFileSelector = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.includes('document') || file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Formata tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept.length > 0 && `Tipos permitidos: ${accept.join(', ')}`}
              {` • Máximo: ${maxSize}MB`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Arquivos selecionados ({files.length})
            </h3>
            <button
              onClick={uploadFiles}
              disabled={isUploading || disabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Enviar {files.length} arquivo{files.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((fileWithPreview, index) => (
              <div
                key={index}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg border
                  ${fileWithPreview.uploaded 
                    ? 'border-green-200 bg-green-50' 
                    : fileWithPreview.error 
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                {/* Preview/Ícone */}
                <div className="flex-shrink-0">
                  {fileWithPreview.preview ? (
                    <img
                      src={fileWithPreview.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(fileWithPreview.file)}
                    </div>
                  )}
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileWithPreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileWithPreview.file.size)}
                  </p>
                  {fileWithPreview.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {fileWithPreview.error}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {fileWithPreview.uploading && (
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                  {fileWithPreview.uploaded && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {fileWithPreview.error && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
