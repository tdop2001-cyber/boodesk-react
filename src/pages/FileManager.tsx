import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Folder, File, Image, FileText, Archive, Trash2, Download, Eye, Search } from 'lucide-react';
import FileUploadSupabase from '../components/FileUploadSupabase';
import { fileDatabaseService, FileUploadResult } from '../services/fileDatabaseService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const FileManager: React.FC = () => {
  const { addToast } = useToast();
  // const { user } = useAuth(); // Não usado no momento
  const [files, setFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carrega arquivos do R2 (sem Supabase)
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usar o fileListService para listar arquivos do R2
      const { fileListService } = await import('../services/fileListService');
      
      const result = await fileListService.listFiles();
      
      if (result.success && result.files) {
        setFiles(result.files);
        setFilteredFiles(result.files);
        console.log('📁 Arquivos carregados do R2:', result.files.length);
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao carregar arquivos',
          message: result.error || 'Não foi possível carregar a lista de arquivos.',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao carregar arquivos',
        message: 'Erro de conexão com o R2.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Filtra arquivos
  useEffect(() => {
    let filtered = files;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por pasta
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(file => file.folder === selectedFolder);
    }

    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(file => file.category === selectedType);
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedFolder, selectedType]);

  // Carrega arquivos na montagem
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);



  // Handler de erro no upload
  const handleUploadError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Erro no upload',
      message: error,
    });
  };

  // Deleta arquivo
  const deleteFile = async (file: any) => {
    try {
      // 1. Deletar do R2 primeiro
      const { uploadService } = await import('../services/uploadService');
      
      const deleteResult = await uploadService.deleteFile(file.key);
      
      if (deleteResult.success) {
        // 2. Se deletou do R2 com sucesso, remove da lista local
        setFiles(prev => prev.filter(f => f.key !== file.key));
        setFilteredFiles(prev => prev.filter(f => f.key !== file.key));
        
        addToast({
          type: 'success',
          title: 'Arquivo deletado',
          message: `${file.name} foi removido com sucesso do R2.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao deletar',
          message: `Erro ao deletar ${file.name} do R2: ${deleteResult.error}`,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao deletar',
        message: 'Erro inesperado ao deletar o arquivo.',
      });
    }
  };

  // Download do arquivo
  const downloadFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visualizar arquivo
  const viewFile = (file: any) => {
    window.open(file.url, '_blank');
  };

  // Callback quando upload é concluído
  const handleUploadComplete = (results: FileUploadResult[]) => {
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      addToast({
        type: 'success',
        title: 'Upload concluído',
        message: `${successCount} arquivo${successCount !== 1 ? 's' : ''} enviado${successCount !== 1 ? 's' : ''} com sucesso!`
      });
      
      // Recarrega a lista de arquivos
      loadFiles();
    }

    if (errorCount > 0) {
      addToast({
        type: 'error',
        title: 'Erro no upload',
        message: `${errorCount} arquivo${errorCount !== 1 ? 's' : ''} falhou${errorCount !== 1 ? 'ram' : ''} no upload`
      });
    }
  };

  // Formata tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    return fileDatabaseService.formatFileSize(bytes);
  };

  // Formata data
  const formatDate = (dateString: string) => {
    return fileDatabaseService.formatDate(dateString);
  };

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (file: any) => {
    const category = file.category || 'other';
    if (category === 'image') return <Image className="w-6 h-6 text-blue-500" />;
    if (category === 'document') return <FileText className="w-6 h-6 text-green-500" />;
    if (category === 'archive') return <Archive className="w-6 h-6 text-orange-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Pastas disponíveis
  const folders = [
    { value: 'all', label: 'Todas as pastas' },
    { value: 'root', label: 'Raiz' }
  ];

  // Tipos disponíveis
  const fileTypes = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'images', label: 'Imagens' },
    { value: 'documents', label: 'Documentos' },
    { value: 'archives', label: 'Arquivos compactados' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Folder className="w-8 h-8 text-blue-600" />
                <span>Gerenciador de Arquivos</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Faça upload e gerencie seus arquivos no Cloudflare R2
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                {viewMode === 'grid' ? 'Lista' : 'Grid'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Upload de Arquivos</span>
              </h2>
              
                             <FileUploadSupabase
                 onUploadComplete={handleUploadComplete}
                 onUploadError={handleUploadError}
                 multiple={true}
                 accept={[
                   'image/*',
                   'application/pdf',
                   'application/msword',
                   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                   'text/plain',
                   'application/zip',
                   'application/x-rar-compressed',
                   'application/x-7z-compressed'
                 ]}
                 maxSize={100}
                 folder="root"
                 showPreview={true}
               />

              {/* Estatísticas */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total de arquivos:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho total:</span>
                    <span className="font-medium">
                      {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar arquivos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro por pasta */}
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {folders.map(folder => (
                    <option key={folder.value} value={folder.value}>
                      {folder.label}
                    </option>
                  ))}
                </select>

                {/* Filtro por tipo */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fileTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de arquivos */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando arquivos...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum arquivo encontrado
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedFolder !== 'all' || selectedType !== 'all'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Faça upload do seu primeiro arquivo usando o painel ao lado.'
                    }
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                                     {filteredFiles.map((file) => (
                                           <div
                        key={file.key || file.name}
                       className={`
                         border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow
                         ${viewMode === 'grid' ? 'bg-white' : 'bg-gray-50'}
                       `}
                     >
                       {viewMode === 'grid' ? (
                         // Visualização em grid
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                 {getFileIcon(file)}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-gray-900 truncate">
                                   {file.name}
                                 </p>
                                 <p className="text-xs text-gray-500">
                                   {formatFileSize(file.size)}
                                 </p>
                               </div>
                             </div>
                           </div>
                           
                                                       <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatDate(file.lastModified || new Date().toISOString())}</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {file.folder || 'root'}
                              </span>
                            </div>

                          <div className="flex items-center justify-center space-x-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => downloadFile(file)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => viewFile(file)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFile(file)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Visualização em lista
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file)}
                          </div>
                          
                                                     <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-gray-900 truncate">
                               {file.name}
                             </p>
                                                           <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {formatDate(file.lastModified || new Date().toISOString())}
                              </p>
                           </div>

                           <div className="flex items-center space-x-2">
                                                           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {file.folder || 'root'}
                              </span>
                            
                            <button
                              onClick={() => downloadFile(file)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => viewFile(file)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFile(file)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
