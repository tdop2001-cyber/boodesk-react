require('dotenv').config();

// Teste para listar arquivos na pasta uploads
const AWS = require('aws-sdk');

// Configuração
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

console.log('🔧 LISTANDO ARQUIVOS NA PASTA UPLOADS');
console.log('=====================================');

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

// Listar arquivos na pasta uploads
async function listUploadsFiles() {
  try {
    console.log('📋 Listando arquivos na pasta uploads/...');
    
    const params = {
      Bucket: R2_BUCKET,
      Prefix: 'uploads/',
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
    console.log('📊 Total de objetos na pasta uploads/:', result.Contents?.length || 0);
    
    if (result.Contents && result.Contents.length > 0) {
      console.log('📁 Arquivos encontrados na pasta uploads/:');
      result.Contents.forEach((obj, index) => {
        const fileName = obj.Key.replace('uploads/', '');
        console.log(`  ${index + 1}. ${fileName} (${obj.Size} bytes) - ${obj.LastModified}`);
        console.log(`     🔗 URL: ${R2_ENDPOINT}/${R2_BUCKET}/${obj.Key}`);
      });
    } else {
      console.log('📁 Nenhum arquivo encontrado na pasta uploads/');
    }
    
  } catch (error) {
    console.log('❌ Erro na listagem:', error.message);
  }
}

// Listar todos os arquivos (para comparação)
async function listAllFiles() {
  try {
    console.log('\n📋 Listando TODOS os arquivos no bucket...');
    
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

    console.log('✅ Listagem completa concluída');
    console.log('📊 Total de objetos no bucket:', result.Contents?.length || 0);
    
    if (result.Contents && result.Contents.length > 0) {
      console.log('📁 Todos os arquivos no bucket:');
      result.Contents.forEach((obj, index) => {
        console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes) - ${obj.LastModified}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro na listagem completa:', error.message);
  }
}

// Executar testes
async function runTests() {
  await listUploadsFiles();
  await listAllFiles();
}

runTests();
