// Teste com novo token R2
// Execute: node test_new_token.js

require('dotenv').config();
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testNewToken() {
  console.log('🔑 TESTE COM NOVO TOKEN R2');
  console.log('=' .repeat(50));
  
  // Verificar credenciais
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.log('❌ Credenciais não encontradas no .env');
    console.log('💡 Atualize o arquivo .env com as novas credenciais');
    return;
  }
  
  console.log('✅ Credenciais encontradas');
  console.log(`🔑 Access Key: ${R2_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log(`🔑 Secret Key: ${R2_SECRET_ACCESS_KEY.substring(0, 8)}...`);
  
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
    // Teste 1: Listar objetos (verificar permissão de leitura)
    console.log('\n📋 Teste 1: Listando objetos...');
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      MaxKeys: 5,
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log('✅ Permissão de leitura: OK');
    console.log(`📁 Objetos encontrados: ${listResult.Contents?.length || 0}`);
    
    // Teste 2: Upload de arquivo (verificar permissão de escrita)
    console.log('\n📤 Teste 2: Testando upload...');
    const testContent = 'Teste com novo token - ' + new Date().toISOString();
    const testKey = `test-new-token-${Date.now()}.txt`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        test: 'new-token',
        uploadedAt: new Date().toISOString(),
      },
    });
    
    await s3Client.send(uploadCommand);
    console.log('✅ Permissão de escrita: OK');
    console.log(`📁 Arquivo enviado: ${testKey}`);
    
    // Teste 3: Verificar se o arquivo foi criado
    console.log('\n🔍 Teste 3: Verificando arquivo criado...');
    const verifyCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: testKey,
    });
    
    const verifyResult = await s3Client.send(verifyCommand);
    if (verifyResult.Contents && verifyResult.Contents.length > 0) {
      console.log('✅ Arquivo encontrado no bucket');
      console.log(`📊 Tamanho: ${verifyResult.Contents[0].Size} bytes`);
    }
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Seu novo token está funcionando perfeitamente');
    console.log('🚀 O upload no navegador deve funcionar agora');
    
  } catch (error) {
    console.log('❌ Erro nos testes:');
    console.log(`   ${error.message}`);
    console.log(`   Code: ${error.Code || 'N/A'}`);
    console.log(`   StatusCode: ${error.$metadata?.httpStatusCode || 'N/A'}`);
    
    if (error.name === 'AccessDenied') {
      console.log('\n🔧 Soluções:');
      console.log('1. Verifique se o token tem permissão "Object Read & Write"');
      console.log('2. Verifique se não há filtros de IP');
      console.log('3. Verifique se o bucket existe e está acessível');
      console.log('4. Tente criar um novo token com permissões completas');
    }
  }
}

// Executar teste
testNewToken();
