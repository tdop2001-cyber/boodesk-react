import React, { useState, useEffect } from 'react';
import { fileListService, FileItem } from '../services/fileListService';
import { useToast } from '../contexts/ToastContext';
import { 
  FileText, 
  Image, 
  Archive, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw,
  Folder,
  File
} from 'lucide-react';

interface FileListProps {
  className?: string;
  showRootOnly?: boolean;
  maxFiles?: number;
}

const FileList: React.FC<FileListProps> = ({ 
  className = '', 
  showRootOnly = true,
  maxFiles = 50 
}) => {
  const { addToast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar arquivos
  const loadFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = showRootOnly 
        ? await fileListService.listRootFiles(maxFiles)
        : await fileListService.listFiles('', maxFiles);

      if (result.success && result.files) {
        setFiles(result.files);
        console.log('📁 Arquivos carregados:', result.files.length);
      } else {
        setError(result.error || 'Erro ao carregar arquivos');
        addToast({
          type: 'error',
          title: 'Erro',
          message: result.error || 'Erro ao carregar arquivos'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar arquivos na inicialização
  useEffect(() => {
    loadFiles();
  }, [showRootOnly, maxFiles]);

  // Obter ícone do arquivo
  const getFileIcon = (file: FileItem) => {
    if (file.isImage) return <Image className="w-5 h-5 text-blue-500" />;
    if (file.isDocument) return <FileText className="w-5 h-5 text-green-500" />;
    if (file.isArchive) return <Archive className="w-5 h-5 text-orange-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Obter categoria do arquivo
  const getFileCategory = (file: FileItem) => {
    if (file.isImage) return 'images';
    if (file.isDocument) return 'documents';
    if (file.isArchive) return 'archives';
    return 'others';
  };

  // Abrir arquivo em nova aba
  const openFile = (file: FileItem) => {
    window.open(file.url, '_blank');
  };

  // Download do arquivo
  const downloadFile = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Deletar arquivo (simulado)
  const deleteFile = (file: FileItem) => {
    addToast({
      type: 'info',
      title: 'Funcionalidade em desenvolvimento',
      message: 'A exclusão de arquivos será implementada em breve'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Arquivos no R2
          </h3>
          <p className="text-sm text-gray-500">
            {files.length} arquivo{files.length !== 1 ? 's' : ''} encontrado{files.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={loadFiles}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando arquivos...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadFiles}
            className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* File List */}
      {!loading && !error && (
        <div className="divide-y divide-gray-200">
          {files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum arquivo encontrado</p>
              <p className="text-sm">Faça upload de arquivos para vê-los aqui</p>
            </div>
          ) : (
            files.map((file) => (
              <div key={file.key} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* File Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{fileListService.formatFileSize(file.size)}</span>
                        <span>{fileListService.formatUploadDate(file.uploadedAt)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {getFileCategory(file)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openFile(file)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteFile(file)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FileList;
