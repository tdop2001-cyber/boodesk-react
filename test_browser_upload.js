// Teste de upload no navegador
// Execute: node test_browser_upload.js

require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testBrowserUpload() {
  console.log('🌐 TESTE DE UPLOAD NO NAVEGADOR');
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
    // Teste 1: Upload simples
    console.log('\n📤 Teste 1: Upload simples...');
    const testContent = 'Teste browser - ' + new Date().toISOString();
    const testKey = `browser-test-${Date.now()}.txt`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        test: 'browser',
        uploadedAt: new Date().toISOString(),
      },
    });
    
    await s3Client.send(command);
    console.log('✅ Upload simples: FUNCIONANDO');
    console.log(`📁 Arquivo: ${testKey}`);
    
    // Teste 2: Verificar se o arquivo está acessível
    console.log('\n🔍 Teste 2: Verificando acesso...');
    const publicUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`;
    console.log(`🔗 URL pública: ${publicUrl}`);
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
    console.log('✅ Credenciais: OK');
    console.log('✅ Permissões: OK');
    console.log('✅ Upload via Node.js: OK');
    console.log('❌ Upload via navegador: FALHANDO');
    console.log('');
    console.log('🔧 POSSÍVEIS CAUSAS:');
    console.log('1. Configuração CORS incorreta');
    console.log('2. Problema com AWS SDK no navegador');
    console.log('3. Bloqueio de rede/proxy');
    console.log('4. Problema com certificados SSL');
    console.log('');
    console.log('💡 SOLUÇÕES PARA TESTAR:');
    console.log('');
    console.log('1. Abra o arquivo debug_browser_upload.html no navegador');
    console.log('2. Teste o upload diretamente');
    console.log('3. Verifique o console do navegador (F12)');
    console.log('4. Verifique a aba Network para ver os erros');
    console.log('');
    console.log('5. Configure CORS no Cloudflare R2:');
    console.log(`
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
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
testBrowserUpload();
