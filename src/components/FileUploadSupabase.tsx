import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { fileDatabaseService, FileUploadResult } from '../services/fileDatabaseService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadSupabaseProps {
  onUploadComplete?: (results: FileUploadResult[]) => void;
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
  result?: FileUploadResult;
}

const FileUploadSupabase: React.FC<FileUploadSupabaseProps> = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = [],
  maxSize = 100, // 100MB default
  folder = 'root',
  showPreview = true,
  className = '',
  disabled = false,
}) => {
  const { addToast } = useToast();
  const { user } = useAuth();
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
          const reader = new FileReader();
          const preview = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
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
    if (files.length === 0 || !user?.id) return;

    setIsUploading(true);
    const results: FileUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileWithPreview = files[i];
      
      if (fileWithPreview.uploaded) continue;

      // Marcar como fazendo upload
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, uploading: true, error: undefined } : f
      ));

      try {
        // 1. Upload para R2 usando o uploadService original
        const { uploadService } = await import('../services/uploadService');
        
        const uploadResult = await uploadService.uploadFile({
          file: fileWithPreview.file,
          folder: folder,
          contentType: fileWithPreview.file.type
        });

        if (uploadResult.success && uploadResult.key && uploadResult.url) {
          // Upload para R2 bem-sucedido - não precisa do Supabase para upload
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, uploading: false, uploaded: true } : f
          ));
          
          addToast({
            type: 'success',
            title: 'Upload concluído',
            message: `${fileWithPreview.file.name} foi enviado com sucesso para R2!`,
          });

          results.push({
            success: true,
            file: {
              id: Date.now(), // ID temporário
              file_id: uploadResult.key,
              name: fileWithPreview.file.name,
              original_name: fileWithPreview.file.name,
              size: fileWithPreview.file.size,
              type: fileWithPreview.file.type,
              url: uploadResult.url,
              r2_key: uploadResult.key,
              folder: folder,
              category: 'other',
              uploaded_by: user.id,
              is_public: true,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: undefined
          });
        } else {
          // Erro no upload para R2
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, uploading: false, error: uploadResult.error } : f
          ));
          
          addToast({
            type: 'error',
            title: 'Erro no upload',
            message: `Erro ao enviar ${fileWithPreview.file.name} para R2: ${uploadResult.error}`,
          });

          results.push({
            success: false,
            file: undefined,
            error: uploadResult.error
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, uploading: false, error: errorMessage } : f
        ));

        addToast({
          type: 'error',
          title: 'Erro no upload',
          message: `Erro ao enviar ${fileWithPreview.file.name}: ${errorMessage}`,
        });

        results.push({
          success: false,
          error: errorMessage
        });
      }
    }

    setIsUploading(false);

    // Callback de conclusão
    if (onUploadComplete) {
      onUploadComplete(results);
    }

    // Limpar arquivos enviados após 3 segundos
    setTimeout(() => {
      setFiles(prev => prev.filter(f => !f.uploaded));
    }, 3000);

  }, [files, user?.id, folder, onUploadComplete, addToast]);

  // Remove arquivo da lista
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handlers de drag and drop
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

  // Handler de seleção de arquivo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset do input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  // Verificar se há arquivos para enviar
  const hasFilesToUpload = files.some(f => !f.uploaded && !f.uploading);

  return (
    <div className={`w-full ${className}`}>
      {/* Área de drag and drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        
        {/* Tipos permitidos */}
        {accept.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">
            Tipos permitidos: {accept.join(', ')}
          </p>
        )}
        
        {/* Tamanho máximo */}
        <p className="text-xs text-gray-500">
          Máximo: {maxSize}MB
        </p>

        {/* Input de arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Arquivos selecionados ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((fileWithPreview, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${fileWithPreview.uploaded ? 'bg-green-50 border-green-200' : 
                    fileWithPreview.error ? 'bg-red-50 border-red-200' :
                    fileWithPreview.uploading ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'}
                `}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Preview ou ícone */}
                  {fileWithPreview.preview ? (
                    <img
                      src={fileWithPreview.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <File className="w-5 h-5 text-gray-500" />
                    </div>
                  )}

                  {/* Informações do arquivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileDatabaseService.formatFileSize(fileWithPreview.file.size)}
                    </p>
                  </div>
                </div>

                {/* Status e ações */}
                <div className="flex items-center space-x-2 ml-4">
                  {fileWithPreview.uploading && (
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  
                  {fileWithPreview.uploaded && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  
                  {fileWithPreview.error && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}

                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                    disabled={fileWithPreview.uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de upload */}
          {hasFilesToUpload && (
            <button
              onClick={uploadFiles}
              disabled={isUploading || !user?.id}
              className={`
                mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors
                ${isUploading || !user?.id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'}
              `}
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Enviar {files.filter(f => !f.uploaded).length} arquivo{files.filter(f => !f.uploaded).length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadSupabase;
