// Serviço para listar arquivos do Cloudflare R2
// Permite visualizar os arquivos enviados no aplicativo

// Configuração do Cloudflare R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY || '';

// Importar AWS SDK v2
declare global {
  interface Window {
    AWS: any;
  }
}

const AWS = window.AWS;

export interface FileItem {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  isImage: boolean;
  isDocument: boolean;
  isArchive: boolean;
}

export interface FileListResult {
  success: boolean;
  files?: FileItem[];
  error?: string;
}

class FileListService {
  /**
   * Configura o cliente AWS S3 para R2
   */
  private getS3Client() {
    // Verificar se AWS SDK está disponível
    if (typeof AWS === 'undefined') {
      throw new Error('AWS SDK não está carregado. Verifique se o script está incluído no index.html');
    }

    // Configurar AWS SDK
    AWS.config.update({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      region: 'auto'
    });

    // Criar cliente S3 para R2
    return new AWS.S3({
      endpoint: R2_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });
  }

  /**
   * Lista arquivos do R2
   */
  async listFiles(prefix: string = '', maxKeys: number = 50): Promise<FileListResult> {
    try {
      // Verificar se as credenciais estão configuradas
      if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        throw new Error('Credenciais R2 não configuradas');
      }

      console.log('🔄 Listando arquivos do R2...');

      // Obter cliente S3
      const s3 = this.getS3Client();

      // Parâmetros da listagem
      const params = {
        Bucket: R2_BUCKET,
        MaxKeys: maxKeys,
        ...(prefix && { Prefix: prefix })
      };

      // Listar objetos
      const result = await new Promise<any>((resolve, reject) => {
        s3.listObjectsV2(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      console.log('✅ Listagem concluída:', result.Contents?.length || 0, 'arquivos');

      // Converter para formato do aplicativo
      const files: FileItem[] = (result.Contents || []).map((obj: any) => {
        const key = obj.Key;
        const name = key.includes('/') ? key.split('/').pop() : key;
        const isImage = this.isImageFile(name);
        const isDocument = this.isDocumentFile(name);
        const isArchive = this.isArchiveFile(name);

        return {
          key,
          name,
          size: obj.Size,
          type: this.getFileType(name),
          url: `${R2_ENDPOINT}/${R2_BUCKET}/${key}`,
          uploadedAt: new Date(obj.LastModified),
          isImage,
          isDocument,
          isArchive
        };
      });

      return {
        success: true,
        files
      };

    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista apenas arquivos na raiz (sem pasta)
   */
  async listRootFiles(maxKeys: number = 50): Promise<FileListResult> {
    try {
      const result = await this.listFiles('', maxKeys);
      
      if (result.success && result.files) {
        // Filtrar apenas arquivos na raiz (sem /)
        const rootFiles = result.files.filter(file => !file.key.includes('/'));
        
        return {
          success: true,
          files: rootFiles
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao listar arquivos da raiz'
      };
    }
  }

  /**
   * Lista arquivos de uma pasta específica
   */
  async listFolderFiles(folder: string, maxKeys: number = 50): Promise<FileListResult> {
    const prefix = folder.endsWith('/') ? folder : `${folder}/`;
    return this.listFiles(prefix, maxKeys);
  }

  /**
   * Verifica se é arquivo de imagem
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  /**
   * Verifica se é arquivo de documento
   */
  private isDocumentFile(filename: string): boolean {
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return documentExtensions.includes(ext);
  }

  /**
   * Verifica se é arquivo compactado
   */
  private isArchiveFile(filename: string): boolean {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return archiveExtensions.includes(ext);
  }

  /**
   * Obtém o tipo MIME do arquivo
   */
  private getFileType(filename: string): string {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed'
    };

    return mimeTypes[ext] || 'application/octet-stream';
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
   * Formata a data de upload
   */
  formatUploadDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Instância global do serviço
export const fileListService = new FileListService();
