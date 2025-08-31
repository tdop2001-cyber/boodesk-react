require('dotenv').config();

// Teste de upload para a raiz do bucket R2
const AWS = require('aws-sdk');

// Configuração
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

console.log('🔧 TESTE UPLOAD PARA RAIZ DO BUCKET');
console.log('====================================');

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

// Teste de upload para raiz
async function testUploadToRoot() {
  try {
    console.log('🔄 Testando upload para raiz do bucket...');
    
    // Criar arquivo de teste
    const testContent = `Teste de upload para raiz - ${new Date().toISOString()}`;
    const fileName = `test-root-${Date.now()}.txt`;
    const key = fileName; // Sem pasta, apenas o nome do arquivo
    
    const params = {
      Bucket: R2_BUCKET,
      Key: key,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        originalName: fileName,
        uploadedBy: 'test-script',
        uploadedAt: new Date().toISOString(),
      }
    };

    console.log('📁 Uploadando para raiz:', fileName);
    
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
    console.log('📁 Localização: Raiz do bucket');
    
  } catch (error) {
    console.log('❌ Erro no upload:', error.message);
    console.log('🔍 Tipo:', error.name);
    console.log('📋 Código:', error.code);
  }
}

// Teste de listagem de arquivos
async function listFiles() {
  try {
    console.log('\n📋 Listando arquivos no bucket...');
    
    const params = {
      Bucket: R2_BUCKET,
      MaxKeys: 10
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
      console.log('📁 Arquivos encontrados:');
      result.Contents.forEach((obj, index) => {
        console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes) - ${obj.LastModified}`);
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
  await testUploadToRoot();
  await listFiles();
}

runTests();
