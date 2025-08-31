import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { UploadResult } from '../services/uploadService';
import { useToast } from '../contexts/ToastContext';

interface FileManagerProps {
  className?: string;
  showRootOnly?: boolean;
  maxFiles?: number;
}

const FileManager: React.FC<FileManagerProps> = ({
  className = '',
  showRootOnly = true,
  maxFiles = 50
}) => {
  const { addToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback quando upload é concluído
  const handleUploadComplete = useCallback((results: UploadResult[]) => {
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      addToast({
        type: 'success',
        title: 'Upload concluído',
        message: `${successCount} arquivo${successCount !== 1 ? 's' : ''} enviado${successCount !== 1 ? 's' : ''} com sucesso!`
      });
      
      // Força atualização da lista de arquivos
      setRefreshKey(prev => prev + 1);
    }

    if (errorCount > 0) {
      addToast({
        type: 'error',
        title: 'Erro no upload',
        message: `${errorCount} arquivo${errorCount !== 1 ? 's' : ''} falhou${errorCount !== 1 ? 'ram' : ''} no upload`
      });
    }
  }, [addToast]);

  // Callback quando há erro no upload
  const handleUploadError = useCallback((error: string) => {
    addToast({
      type: 'error',
      title: 'Erro no upload',
      message: error
    });
  }, [addToast]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Seção de Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload de Arquivos
        </h2>
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          multiple={true}
          showPreview={true}
          className="w-full"
        />
      </div>

      {/* Seção de Listagem */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Arquivos Enviados
        </h2>
        <FileList
          key={refreshKey} // Força re-render quando refreshKey muda
          showRootOnly={showRootOnly}
          maxFiles={maxFiles}
        />
      </div>
    </div>
  );
};

export default FileManager;
