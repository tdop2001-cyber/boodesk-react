require('dotenv').config();

// Teste final de upload para a raiz do bucket R2
const AWS = require('aws-sdk');

// Configuração
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

console.log('🔧 TESTE FINAL - UPLOAD PARA RAIZ DO BUCKET');
console.log('============================================');

// Verificar credenciais
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.log('❌ Credenciais não configuradas no .env');
  process.exit(1);
}

console.log('✅ Credenciais configuradas');
console.log('🌐 Endpoint:', R2_ENDPOINT);
console.log('📦 Bucket:', R2_BUCKET);

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

// Teste de upload para raiz (simulando o comportamento do React)
async function testUploadToRoot() {
  try {
    console.log('🔄 Testando upload para raiz do bucket...');
    
    // Simular o comportamento do uploadService.ts
    const file = {
      name: 'teste-final.txt',
      type: 'text/plain',
      size: 50
    };
    
    const folder = ''; // Pasta vazia = raiz
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
    
    // Criar conteúdo de teste
    const testContent = `Teste final - Upload para raiz - ${new Date().toISOString()}`;
    
    const params = {
      Bucket: R2_BUCKET,
      Key: key,
      Body: testContent,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: 'boodesk-app',
        uploadedAt: new Date().toISOString(),
      }
    };

    console.log('📁 Uploadando para raiz:', key);
    
    const result = await new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    console.log('✅ Upload funcionou!');
    console.log('📋 ETag:', result.ETag);
    console.log('🔗 URL:', `${R2_ENDPOINT}/${R2_BUCKET}/${key}`);
    console.log('📁 Localização: Raiz do bucket (visível no painel R2)');
    
    return key;
    
  } catch (error) {
    console.log('❌ Erro no upload:', error.message);
    console.log('🔍 Tipo:', error.name);
    console.log('📋 Código:', error.code);
    return null;
  }
}

// Listar arquivos na raiz
async function listRootFiles() {
  try {
    console.log('\n📋 Listando arquivos na raiz do bucket...');
    
    const params = {
      Bucket: R2_BUCKET,
      MaxKeys: 20
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
      console.log('📁 Arquivos na raiz do bucket:');
      result.Contents.forEach((obj, index) => {
        const isInRoot = !obj.Key.includes('/');
        const status = isInRoot ? '✅ RAIZ' : '📁 PASTA';
        console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes) - ${obj.LastModified} ${status}`);
      });
    } else {
      console.log('📁 Nenhum arquivo encontrado');
    }
    
  } catch (error) {
    console.log('❌ Erro na listagem:', error.message);
  }
}

// Executar testes
async function runTests() {
  const uploadedKey = await testUploadToRoot();
  await listRootFiles();
  
  if (uploadedKey) {
    console.log('\n🎉 SUCESSO!');
    console.log('📁 O arquivo foi enviado para a raiz do bucket');
    console.log('🔍 Agora ele deve aparecer na interface do Cloudflare R2');
    console.log('🔗 URL do arquivo:', `${R2_ENDPOINT}/${R2_BUCKET}/${uploadedKey}`);
  }
}

runTests();
