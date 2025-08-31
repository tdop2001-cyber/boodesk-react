// Teste simples de CORS
// Execute: node test_cors_simple.js

require('dotenv').config();
const https = require('https');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';

async function testCorsSimple() {
  console.log('🌐 TESTE SIMPLES DE CORS');
  console.log('=' .repeat(40));
  
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`📦 Bucket: ${R2_BUCKET}`);
  
  // Teste 1: OPTIONS request (CORS preflight)
  console.log('\n📋 Teste 1: OPTIONS request...');
  
  const options = {
    hostname: 'd20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com',
    port: 443,
    path: `/${R2_BUCKET}`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'content-type,x-amz-meta-originalname'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`);
    
    Object.keys(res.headers).forEach(key => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
        console.log(`   ${key}: ${res.headers[key]}`);
      }
    });
    
    if (res.statusCode === 200) {
      console.log('✅ CORS OPTIONS: OK');
    } else {
      console.log('❌ CORS OPTIONS: Falhou');
    }
  });
  
  req.on('error', (error) => {
    console.log('❌ Erro na requisição:', error.message);
  });
  
  req.end();
  
  // Teste 2: GET request (verificar se o bucket está acessível)
  console.log('\n📋 Teste 2: GET request...');
  
  const getOptions = {
    hostname: 'd20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com',
    port: 443,
    path: `/${R2_BUCKET}`,
    method: 'GET'
  };
  
  const getReq = https.request(getOptions, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ GET request: OK');
    } else if (res.statusCode === 403) {
      console.log('❌ GET request: Access Denied (normal para bucket privado)');
    } else {
      console.log(`❌ GET request: Status ${res.statusCode}`);
    }
  });
  
  getReq.on('error', (error) => {
    console.log('❌ Erro na requisição GET:', error.message);
  });
  
  getReq.end();
  
  console.log('\n💡 CONCLUSÕES:');
  console.log('1. Se OPTIONS retorna 200: CORS está configurado');
  console.log('2. Se OPTIONS retorna 403: CORS não está configurado');
  console.log('3. Se GET retorna 403: Bucket está privado (normal)');
  console.log('4. Se GET retorna 200: Bucket está público');
}

// Executar teste
testCorsSimple();
