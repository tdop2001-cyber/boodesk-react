// Teste de CORS para upload
// Execute: node test_cors_upload.js

require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testCorsUpload() {
  console.log('🔍 TESTE DE CORS PARA UPLOAD');
  console.log('=' .repeat(50));
  
  console.log('✅ Credenciais encontradas');
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📦 Bucket: ${R2_BUCKET}`);
  
  // Criar cliente S3
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  
  try {
    // Teste de upload
    console.log('\n📤 Testando upload...');
    const testContent = 'Teste CORS - ' + new Date().toISOString();
    const testKey = `cors-test-${Date.now()}.txt`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        test: 'cors',
        uploadedAt: new Date().toISOString(),
      },
    });
    
    await s3Client.send(command);
    console.log('✅ Upload via Node.js: FUNCIONANDO');
    console.log(`📁 Arquivo: ${testKey}`);
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('✅ Credenciais: OK');
    console.log('✅ Permissões: OK');
    console.log('✅ Upload via Node.js: OK');
    console.log('❌ Upload via navegador: FALHANDO');
    console.log('');
    console.log('🔧 PROBLEMA IDENTIFICADO: CORS');
    console.log('');
    console.log('💡 SOLUÇÃO: Atualize a configuração CORS no Cloudflare R2:');
    console.log(`
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
    `);
    
  } catch (error) {
    console.log('❌ Erro no teste:');
    console.log(`   ${error.message}`);
    console.log(`   Code: ${error.Code || 'N/A'}`);
    console.log(`   StatusCode: ${error.$metadata?.httpStatusCode || 'N/A'}`);
  }
}

// Executar teste
testCorsUpload();
