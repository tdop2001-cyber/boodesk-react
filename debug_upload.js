// Debug do problema de upload
// Execute: node debug_upload.js

require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function debugUpload() {
  console.log('🔍 DEBUG DO PROBLEMA DE UPLOAD');
  console.log('=' .repeat(50));
  
  // Verificar credenciais
  console.log('1. Verificando credenciais...');
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.log('❌ Credenciais não encontradas no .env');
    return;
  }
  console.log('✅ Credenciais encontradas');
  console.log(`   Access Key: ${R2_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log(`   Secret Key: ${R2_SECRET_ACCESS_KEY.substring(0, 8)}...`);
  
  // Criar cliente S3
  console.log('\n2. Criando cliente S3...');
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  console.log('✅ Cliente S3 criado');
  
  // Criar arquivo de teste
  console.log('\n3. Criando arquivo de teste...');
  const testContent = 'Teste de upload - ' + new Date().toISOString();
  const testFileName = `debug-test-${Date.now()}.txt`;
  const testFilePath = path.join(__dirname, testFileName);
  
  fs.writeFileSync(testFilePath, testContent);
  console.log(`✅ Arquivo criado: ${testFileName}`);
  
  // Ler arquivo
  console.log('\n4. Lendo arquivo...');
  const fileBuffer = fs.readFileSync(testFilePath);
  console.log(`✅ Arquivo lido: ${fileBuffer.length} bytes`);
  
  // Testar upload
  console.log('\n5. Testando upload...');
  const testKey = `debug/${testFileName}`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: fileBuffer,
      ContentType: 'text/plain',
      Metadata: {
        debug: 'true',
        uploadedAt: new Date().toISOString(),
      },
    });
    
    console.log('🔄 Enviando comando...');
    await s3Client.send(command);
    
    console.log('✅ Upload realizado com sucesso!');
    console.log(`📁 Arquivo salvo como: ${testKey}`);
    console.log(`🔗 URL: ${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`);
    
    // Testar acesso público
    console.log('\n6. Testando acesso público...');
    const publicUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`;
    console.log(`🔗 URL pública: ${publicUrl}`);
    
    // Verificar se o bucket tem CORS configurado
    console.log('\n7. Verificando configuração CORS...');
    console.log('⚠️ Se o upload falhar no navegador, pode ser problema de CORS');
    console.log('💡 Configure CORS no bucket R2:');
    console.log(`
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
    `);
    
  } catch (error) {
    console.log('❌ Erro no upload:');
    console.log(`   ${error.message}`);
    console.log(`   Code: ${error.Code || 'N/A'}`);
    console.log(`   StatusCode: ${error.$metadata?.httpStatusCode || 'N/A'}`);
    
    if (error.name === 'AccessDenied') {
      console.log('\n🔧 Possível solução:');
      console.log('1. Verifique se as credenciais têm permissão de escrita');
      console.log('2. Verifique se o bucket existe');
      console.log('3. Verifique as políticas de bucket');
    }
  }
  
  // Limpar arquivo de teste
  console.log('\n8. Limpando arquivo de teste...');
  fs.unlinkSync(testFilePath);
  console.log('✅ Arquivo de teste removido');
  
  console.log('\n🎯 CONCLUSÃO:');
  console.log('Se o upload funcionou aqui mas falha no navegador,');
  console.log('o problema é provavelmente CORS ou configuração do bucket.');
}

// Executar debug
debugUpload();
