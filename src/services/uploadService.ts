// Serviço de upload para Cloudflare R2 usando AWS SDK v2
// Compatível com navegadores e evita problemas de CORS

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

export interface UploadFile {
  file: File;
  folder?: string;
  fileName?: string;
  contentType?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileInfo {
  key: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

class UploadService {
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
   * Faz upload de um arquivo para o Cloudflare R2 usando AWS SDK v2
   */
  async uploadFile(uploadFile: UploadFile): Promise<UploadResult> {
    try {
      const { file, folder = '', fileName, contentType } = uploadFile;
      
      // Verificar se as credenciais estão configuradas
      if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        throw new Error('Credenciais R2 não configuradas');
      }
      
      // Gera nome único para o arquivo
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

      console.log('🔄 Iniciando upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        key: key
      });

      // Obter cliente S3
      const s3 = this.getS3Client();
      
      console.log('🔄 Fazendo upload com AWS SDK...');
      
      // Parâmetros do upload
      const params = {
        Bucket: R2_BUCKET,
        Key: key,
        Body: file,
        ContentType: contentType || file.type,
        Metadata: {
          originalName: file.name,
          uploadedBy: 'boodesk-app',
          uploadedAt: new Date().toISOString(),
        }
      };

      // Fazer upload usando AWS SDK
      const result = await new Promise<any>((resolve, reject) => {
        s3.upload(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      console.log('✅ Upload funcionou:', result);
      const url = `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;
      
      return {
        success: true,
        url,
        key,
      };
      
    } catch (error) {
      console.error('❌ Erro no upload:', {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Determinar o tipo de erro
      let errorMessage = 'Erro desconhecido no upload';
      
      if (error instanceof Error) {
        if (error.message.includes('Access Denied')) {
          errorMessage = 'Acesso negado - verifique as permissões do token R2';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Erro de rede - verifique a conexão com a internet';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Erro CORS - verifique a configuração CORS do bucket';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Falha na requisição - verifique o endpoint e credenciais';
        } else if (error.message.includes('readableStream.getReader')) {
          errorMessage = 'Erro de compatibilidade com navegador - tentando método alternativo';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Faz upload de múltiplos arquivos
   */
  async uploadMultipleFiles(files: UploadFile[]): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Gera URL pública para download
   */
  getPublicUrl(key: string): string {
    return `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;
  }

  /**
   * Deleta um arquivo do R2
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se as credenciais estão configuradas
      if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        return {
          success: false,
          error: 'Credenciais R2 não configuradas'
        };
      }

      console.log('🗑️ Deletando arquivo do R2:', key);

      // Obter cliente S3
      const s3 = this.getS3Client();
      
      // Parâmetros para deletar
      const params = {
        Bucket: R2_BUCKET,
        Key: key
      };

      // Deletar arquivo do R2
      await s3.deleteObject(params).promise();
      
      console.log('✅ Arquivo deletado com sucesso do R2:', key);
      
      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Erro ao deletar arquivo do R2:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar arquivo'
      };
    }
  }

  /**
   * Gera URL assinada para download privado (simulada)
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // Implementação simplificada - retorna URL pública
    return this.getPublicUrl(key);
  }

  /**
   * Valida tipo de arquivo
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Valida tamanho do arquivo
   */
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Gera preview de imagem
   */
  generateImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Arquivo não é uma imagem'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime imagem antes do upload
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Falha na compressão da imagem'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload com compressão automática para imagens
   */
  async uploadImageWithCompression(
    file: File,
    folder: string = '',
    quality: number = 0.8
  ): Promise<UploadResult> {
    try {
      const compressedFile = await this.compressImage(file, quality);
      return this.uploadFile({
        file: compressedFile,
        folder,
        contentType: file.type,
      });
    } catch (error) {
      console.error('Erro no upload com compressão:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload com compressão',
      };
    }
  }
}

// Instância global do serviço
export const uploadService = new UploadService();

// Tipos de arquivo permitidos
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

// Tamanhos máximos (em MB)
export const MAX_FILE_SIZES = {
  images: 10,
  documents: 50,
  spreadsheets: 50,
  presentations: 100,
  archives: 200,
  default: 100,
};
