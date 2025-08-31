// Teste de upload usando AWS SDK
// Execute: node test_aws_sdk_upload.js

require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testAwsSdkUpload() {
  console.log('📤 TESTE AWS SDK UPLOAD');
  console.log('=' .repeat(40));
  
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📦 Bucket: ${R2_BUCKET}`);
  console.log(`🔑 Access Key: ${R2_ACCESS_KEY_ID ? '✅ Configurada' : '❌ Não configurada'}`);
  
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.log('❌ Credenciais não configuradas no .env');
    return;
  }
  
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
    console.log('\n📁 Testando upload...');
    const testContent = 'Teste AWS SDK - ' + new Date().toISOString();
    const testKey = `aws-sdk-test-${Date.now()}.txt`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        test: 'aws-sdk',
        uploadedAt: new Date().toISOString(),
      },
    });
    
    await s3Client.send(command);
    console.log('✅ Upload funcionou!');
    console.log(`📁 Arquivo: ${testKey}`);
    console.log(`🔗 URL: ${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`);
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('✅ Credenciais: OK');
    console.log('✅ AWS SDK: OK');
    console.log('✅ Upload: OK');
    console.log('');
    console.log('💡 O problema pode estar no navegador. Tente:');
    console.log('1. Recarregar a página');
    console.log('2. Verificar o console do navegador (F12)');
    console.log('3. Verificar se há erros de CORS');
    
  } catch (error) {
    console.log('❌ Erro no teste:');
    console.log(`   ${error.message}`);
    console.log(`   Code: ${error.Code || 'N/A'}`);
    console.log(`   StatusCode: ${error.$metadata?.httpStatusCode || 'N/A'}`);
  }
}

// Executar teste
testAwsSdkUpload();
