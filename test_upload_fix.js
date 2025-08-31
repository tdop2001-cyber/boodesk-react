require('dotenv').config();

// Teste simples de upload usando AWS SDK v2
const AWS = require('aws-sdk');

// Configuração
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

console.log('🔧 TESTE UPLOAD COM AWS SDK v2');
console.log('================================');

// Verificar credenciais
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.log('❌ Credenciais não configuradas no .env');
  console.log('💡 Configure: REACT_APP_R2_ACCESS_KEY_ID e REACT_APP_R2_SECRET_ACCESS_KEY');
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

// Teste de upload
async function testUpload() {
  try {
    console.log('🔄 Testando upload...');
    
    // Criar arquivo de teste
    const testContent = `Teste de upload - ${new Date().toISOString()}`;
    const fileName = `test-aws-sdk-${Date.now()}.txt`;
    const key = `uploads/${fileName}`;
    
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

    console.log('📁 Uploadando:', fileName);
    
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
    
  } catch (error) {
    console.log('❌ Erro no upload:', error.message);
    console.log('🔍 Tipo:', error.name);
    console.log('📋 Código:', error.code);
  }
}

testUpload();
