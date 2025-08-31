require('dotenv').config();

// Teste do sistema de listagem de arquivos
const AWS = require('aws-sdk');

// Configuração
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

console.log('🔧 TESTE DO SISTEMA DE LISTAGEM DE ARQUIVOS');
console.log('===========================================');

// Verificar credenciais
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.log('❌ Credenciais não configuradas no .env');
  process.exit(1);
}

// Configurar AWS SDK
AWS.config.update({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto'
});

// Criar cliente S3 para R2
const s3 = new AWS.S3({
  endpoint: R2_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

// Funções auxiliares (simulando o fileListService)
function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

function isDocumentFile(filename) {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return documentExtensions.includes(ext);
}

function isArchiveFile(filename) {
  const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return archiveExtensions.includes(ext);
}

function getFileType(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  const mimeTypes = {
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

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUploadDate(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Teste de listagem de arquivos na raiz
async function testListRootFiles() {
  try {
    console.log('🔄 Testando listagem de arquivos na raiz...');
    
    const params = {
      Bucket: R2_BUCKET,
      MaxKeys: 50
    };

    const result = await new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    console.log('✅ Listagem concluída');
    console.log('📊 Total de objetos:', result.Contents?.length || 0);
    
    if (result.Contents && result.Contents.length > 0) {
      console.log('\n📁 Arquivos na raiz (visíveis no app):');
      
      const rootFiles = result.Contents.filter(obj => !obj.Key.includes('/'));
      
      rootFiles.forEach((obj, index) => {
        const name = obj.Key;
        const isImage = isImageFile(name);
        const isDocument = isDocumentFile(name);
        const isArchive = isArchiveFile(name);
        
        console.log(`  ${index + 1}. ${name}`);
        console.log(`     📏 Tamanho: ${formatFileSize(obj.Size)}`);
        console.log(`     📅 Data: ${formatUploadDate(new Date(obj.LastModified))}`);
        console.log(`     🔗 URL: ${R2_ENDPOINT}/${R2_BUCKET}/${obj.Key}`);
        console.log(`     🏷️ Tipo: ${getFileType(name)}`);
        console.log(`     📂 Categoria: ${isImage ? 'images' : isDocument ? 'documents' : isArchive ? 'archives' : 'others'}`);
        console.log('');
      });
      
      console.log(`🎉 ${rootFiles.length} arquivo${rootFiles.length !== 1 ? 's' : ''} na raiz que aparecerão no aplicativo!`);
    } else {
      console.log('📁 Nenhum arquivo encontrado na raiz');
    }
    
  } catch (error) {
    console.log('❌ Erro na listagem:', error.message);
  }
}

// Teste de upload para raiz
async function testUploadToRoot() {
  try {
    console.log('\n🔄 Testando upload para raiz...');
    
    const testContent = `Teste do sistema de listagem - ${new Date().toISOString()}`;
    const fileName = `teste-sistema-${Date.now()}.txt`;
    
    const params = {
      Bucket: R2_BUCKET,
      Key: fileName,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        originalName: fileName,
        uploadedBy: 'test-sistema',
        uploadedAt: new Date().toISOString(),
      }
    };

    const result = await new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    console.log('✅ Upload para raiz funcionou!');
    console.log('📁 Arquivo:', fileName);
    console.log('🔗 URL:', `${R2_ENDPOINT}/${R2_BUCKET}/${fileName}`);
    console.log('📋 ETag:', result.ETag);
    
    return fileName;
    
  } catch (error) {
    console.log('❌ Erro no upload:', error.message);
    return null;
  }
}

// Executar testes
async function runTests() {
  await testListRootFiles();
  const uploadedFile = await testUploadToRoot();
  
  if (uploadedFile) {
    console.log('\n🎉 SUCESSO!');
    console.log('📁 O arquivo foi enviado para a raiz');
    console.log('🔍 Agora ele deve aparecer no aplicativo React');
    console.log('🚀 Teste o aplicativo para ver os arquivos!');
  }
}

runTests();
