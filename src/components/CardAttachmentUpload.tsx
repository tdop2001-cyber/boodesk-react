import React, { useState } from 'react';
import { Paperclip, X, File, Image, FileText, Archive, Download, Eye } from 'lucide-react';
import { uploadService, UploadResult } from '../services/uploadService';
import { useToast } from '../contexts/ToastContext';

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface CardAttachmentUploadProps {
  cardId: string;
  attachments: Attachment[];
  onAttachmentAdded: (attachment: Attachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
  className?: string;
}

const CardAttachmentUpload: React.FC<CardAttachmentUploadProps> = ({
  cardId,
  attachments,
  onAttachmentAdded,
  onAttachmentRemoved,
  className = '',
}) => {
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Handler para upload de arquivos
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      for (const file of fileArray) {
        // Validação básica
        if (file.size > 50 * 1024 * 1024) { // 50MB
          addToast({
            type: 'error',
            title: 'Arquivo muito grande',
            message: `${file.name} excede o limite de 50MB.`,
          });
          continue;
        }

        // Upload para pasta específica do card
        const result = await uploadService.uploadFile({
          file,
          folder: `cards/${cardId}/attachments`,
          fileName: `${Date.now()}-${file.name}`,
        });

        if (result.success && result.url) {
          const attachment: Attachment = {
            id: result.key || `${Date.now()}-${file.name}`,
            name: file.name,
            url: result.url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          };

          onAttachmentAdded(attachment);
          addToast({
            type: 'success',
            title: 'Anexo adicionado',
            message: `${file.name} foi anexado ao card.`,
          });
        } else {
          addToast({
            type: 'error',
            title: 'Erro no upload',
            message: result.error || 'Erro ao fazer upload do arquivo.',
          });
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no upload',
        message: 'Erro inesperado durante o upload.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Handler para clique no input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Limpa o input
    if (e.target) {
      e.target.value = '';
    }
  };

  // Remove anexo
  const removeAttachment = async (attachment: Attachment) => {
    try {
      const success = await uploadService.deleteFile(attachment.id);
      
      if (success) {
        onAttachmentRemoved(attachment.id);
        addToast({
          type: 'success',
          title: 'Anexo removido',
          message: `${attachment.name} foi removido.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao remover',
          message: 'Não foi possível remover o anexo.',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao remover',
        message: 'Erro inesperado ao remover o anexo.',
      });
    }
  };

  // Download anexo
  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const downloadUrl = await uploadService.getSignedDownloadUrl(attachment.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no download',
        message: 'Não foi possível baixar o anexo.',
      });
    }
  };

  // Formata tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('document') || type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-input-${cardId}`)?.click()}
      >
        <input
          id={`file-input-${cardId}`}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          <Paperclip className="w-6 h-6 mx-auto text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? 'Enviando...' : 'Arraste arquivos aqui ou clique para anexar'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo: 50MB por arquivo
            </p>
          </div>
        </div>
      </div>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Anexos ({attachments.length})
          </h4>
          
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* Ícone do arquivo */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {getFileIcon(attachment.type)}
                  </div>
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {attachment.uploadedAt.toLocaleDateString()}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(attachment.url, '_blank');
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAttachment(attachment);
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(attachment);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
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

export default CardAttachmentUpload;
