// Teste de configuração do Cloudflare R2
// Execute: node test_r2_config.js

require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configuração do R2 (baseada nos arquivos da pasta 32x32)
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';

// Credenciais (você precisa configurar estas variáveis de ambiente)
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

async function testR2Connection() {
  console.log('🔧 Testando configuração do Cloudflare R2...');
  console.log('=' .repeat(50));
  
  // Verificar se as credenciais estão configuradas
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.log('❌ Credenciais não configuradas!');
    console.log('Configure as seguintes variáveis de ambiente:');
    console.log('- REACT_APP_R2_ACCESS_KEY_ID');
    console.log('- REACT_APP_R2_SECRET_ACCESS_KEY');
    console.log('');
    console.log('💡 Dica: Crie um arquivo .env com as credenciais');
    return;
  }
  
  console.log('✅ Credenciais encontradas');
  console.log(`📦 Bucket: ${R2_BUCKET}`);
  console.log(`🌐 Endpoint: ${R2_ENDPOINT}`);
  console.log(`🔑 Access Key ID: ${R2_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log(`🔑 Secret Key: ${R2_SECRET_ACCESS_KEY.substring(0, 8)}...`);
  console.log(`📏 Access Key Length: ${R2_ACCESS_KEY_ID.length}`);
  console.log(`📏 Secret Key Length: ${R2_SECRET_ACCESS_KEY.length}`);
  console.log('');
  
  try {
    // Criar cliente S3 para R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('🔄 Conectando ao Cloudflare R2...');
    
    // Testar conexão listando objetos
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      MaxKeys: 5, // Limitar a 5 objetos para teste
    });
    
    const response = await s3Client.send(command);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📁 Objetos encontrados: ${response.Contents?.length || 0}`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('📋 Primeiros objetos:');
      response.Contents.forEach((obj, index) => {
        console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('📁 Bucket está vazio (normal para novo bucket)');
    }
    
    console.log('');
    console.log('🎉 Configuração do R2 está funcionando perfeitamente!');
    console.log('🚀 Você pode usar o sistema de upload agora.');
    
  } catch (error) {
    console.log('❌ Erro na conexão com R2:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verifique se as credenciais estão corretas');
    console.log('2. Verifique se o bucket existe');
    console.log('3. Verifique se as permissões estão configuradas');
    console.log('4. Verifique a configuração CORS do bucket');
  }
}

// Executar teste
testR2Connection();
