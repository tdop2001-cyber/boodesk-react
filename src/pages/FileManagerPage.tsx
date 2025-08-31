import React from 'react';
import FileManager from '../components/FileManager';

const FileManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciador de Arquivos
          </h1>
          <p className="mt-2 text-gray-600">
            Faça upload e gerencie seus arquivos no Cloudflare R2
          </p>
        </div>

        {/* File Manager */}
        <FileManager 
          showRootOnly={true}
          maxFiles={50}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default FileManagerPage;
