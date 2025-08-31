import { supabase } from './database';

// Interfaces para arquivos no Supabase
export interface FileRecord {
  id: number;
  file_id: string;
  name: string;
  original_name: string;
  size: number;
  type: string;
  url: string;
  r2_key: string;
  folder: string;
  category: 'image' | 'document' | 'archive' | 'other';
  uploaded_by: number;
  is_public: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResult {
  success: boolean;
  file?: FileRecord;
  error?: string;
}

export interface FileListResult {
  success: boolean;
  files?: FileRecord[];
  error?: string;
}

class FileDatabaseService {
  /**
   * Salva metadados de um arquivo no Supabase (após upload para R2)
   */
  async saveFileMetadata(
    file: File,
    r2Key: string,
    r2Url: string,
    folder: string = '',
    uploadedBy: number,
    isPublic: boolean = true
  ): Promise<FileUploadResult> {
    try {
      // Salvar metadados no Supabase
      const fileRecord: Omit<FileRecord, 'id' | 'created_at' | 'updated_at'> = {
        file_id: r2Key,
        name: file.name,
        original_name: file.name,
        size: file.size,
        type: file.type,
        url: r2Url,
        r2_key: r2Key,
        folder: folder || 'root',
        category: this.getFileCategory(file.name),
        uploaded_by: uploadedBy,
        is_public: isPublic,
        metadata: {
          originalName: file.name,
          uploadedBy: uploadedBy,
          uploadedAt: new Date().toISOString(),
          r2Endpoint: 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com',
          r2Bucket: 'boodesk-cdn'
        }
      };

      const { data, error } = await supabase
        .from('files')
        .insert([fileRecord])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        return {
          success: false,
          error: `Erro ao salvar metadados: ${error.message}`
        };
      }

      return {
        success: true,
        file: data
      };

    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Faz upload de um arquivo para o R2 e salva os metadados no Supabase
   * @deprecated Use uploadService.uploadFile + saveFileMetadata instead
   */
  async uploadFile(
    file: File,
    folder: string = '',
    uploadedBy: number,
    isPublic: boolean = true
  ): Promise<FileUploadResult> {
    try {
      // 1. Upload para R2 (mantém a funcionalidade existente)
      const { uploadService } = await import('./uploadService');
      
      const uploadResult = await uploadService.uploadFile({
        file,
        folder,
        contentType: file.type
      });

      if (!uploadResult.success || !uploadResult.key || !uploadResult.url) {
        return {
          success: false,
          error: uploadResult.error || 'Erro no upload para R2'
        };
      }

      // 2. Salvar metadados no Supabase
      return await this.saveFileMetadata(
        file,
        uploadResult.key,
        uploadResult.url,
        folder,
        uploadedBy,
        isPublic
      );

    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista arquivos do Supabase
   */
  async listFiles(
    options: {
      folder?: string;
      category?: string;
      uploadedBy?: number;
      isPublic?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<FileListResult> {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (options.folder) {
        query = query.eq('folder', options.folder);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.uploadedBy) {
        query = query.eq('uploaded_by', options.uploadedBy);
      }

      if (options.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return {
          success: false,
          error: `Erro ao listar arquivos: ${error.message}`
        };
      }

      return {
        success: true,
        files: data || []
      };

    } catch (error) {
      console.error('Erro na listagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista arquivos na raiz (folder = 'root' ou vazio)
   */
  async listRootFiles(limit: number = 50): Promise<FileListResult> {
    return this.listFiles({
      folder: 'root',
      limit
    });
  }

  /**
   * Busca arquivo por ID
   */
  async getFileById(id: number): Promise<FileUploadResult> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: `Arquivo não encontrado: ${error.message}`
        };
      }

      return {
        success: true,
        file: data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca arquivo por file_id (R2 key)
   */
  async getFileByKey(fileId: string): Promise<FileUploadResult> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('file_id', fileId)
        .single();

      if (error) {
        return {
          success: false,
          error: `Arquivo não encontrado: ${error.message}`
        };
      }

      return {
        success: true,
        file: data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza metadados de um arquivo
   */
  async updateFile(
    id: number,
    updates: Partial<Pick<FileRecord, 'name' | 'folder' | 'is_public' | 'metadata'>>
  ): Promise<FileUploadResult> {
    try {
      const { data, error } = await supabase
        .from('files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: `Erro ao atualizar: ${error.message}`
        };
      }

      return {
        success: true,
        file: data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Deleta um arquivo (remove do Supabase e R2)
   */
  async deleteFile(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Buscar o arquivo para obter a chave R2
      const fileResult = await this.getFileById(id);
      if (!fileResult.success || !fileResult.file) {
        return {
          success: false,
          error: 'Arquivo não encontrado'
        };
      }

      // 2. Deletar do Supabase
      const { error: supabaseError } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        return {
          success: false,
          error: `Erro ao deletar do Supabase: ${supabaseError.message}`
        };
      }

      // 3. Deletar do R2 (implementar quando necessário)
      // Por enquanto, apenas remove do Supabase
      console.log('Arquivo removido do Supabase. R2 cleanup pode ser implementado posteriormente.');

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca arquivos por nome
   */
  async searchFiles(searchTerm: string, limit: number = 50): Promise<FileListResult> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,original_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: `Erro na busca: ${error.message}`
        };
      }

      return {
        success: true,
        files: data || []
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém estatísticas dos arquivos
   */
  async getFileStats(userId?: number): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byFolder: Record<string, number>;
  }> {
    try {
      let query = supabase.from('files').select('*');
      
      if (userId) {
        query = query.eq('uploaded_by', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const files = data || [];
      
      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((acc, file) => acc + file.size, 0),
        byCategory: {} as Record<string, number>,
        byFolder: {} as Record<string, number>
      };

      // Contar por categoria
      files.forEach(file => {
        stats.byCategory[file.category] = (stats.byCategory[file.category] || 0) + 1;
        stats.byFolder[file.folder] = (stats.byFolder[file.folder] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {},
        byFolder: {}
      };
    }
  }

  /**
   * Determina a categoria do arquivo baseado na extensão
   */
  private getFileCategory(filename: string): 'image' | 'document' | 'archive' | 'other' {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];

    if (imageExtensions.includes(ext)) return 'image';
    if (documentExtensions.includes(ext)) return 'document';
    if (archiveExtensions.includes(ext)) return 'archive';
    
    return 'other';
  }

  /**
   * Formata o tamanho do arquivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata a data
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Instância global do serviço
export const fileDatabaseService = new FileDatabaseService();
