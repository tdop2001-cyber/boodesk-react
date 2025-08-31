// Teste simples de upload
// Execute: node test_upload_simple.js

require('dotenv').config();
const fs = require('fs');
const https = require('https');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testUploadSimple() {
  console.log('📤 TESTE SIMPLES DE UPLOAD');
  console.log('=' .repeat(40));
  
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📦 Bucket: ${R2_BUCKET}`);
  console.log(`🔑 Access Key: ${R2_ACCESS_KEY_ID ? '✅ Configurada' : '❌ Não configurada'}`);
  
  // Criar arquivo de teste
  const testContent = 'Teste de upload - ' + new Date().toISOString();
  const testKey = `test-upload-${Date.now()}.txt`;
  
  console.log(`\n📁 Testando upload: ${testKey}`);
  
  const postData = JSON.stringify({
    method: 'PUT',
    url: `${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: testContent
  });
  
  const options = {
    hostname: 'd20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com',
    port: 443,
    path: `/${R2_BUCKET}/${testKey}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(testContent)
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Upload funcionou!');
        console.log(`📁 Arquivo: ${testKey}`);
        console.log(`🔗 URL: ${R2_ENDPOINT}/${R2_BUCKET}/${testKey}`);
      } else {
        console.log('❌ Upload falhou');
        console.log(`📋 Resposta: ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Erro na requisição:', error.message);
  });
  
  req.write(testContent);
  req.end();
}

// Executar teste
testUploadSimple();
