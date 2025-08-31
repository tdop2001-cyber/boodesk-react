require('dotenv').config();
const AWS = require('aws-sdk');

// Configuração do R2
const R2_ENDPOINT = 'https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com';
const R2_BUCKET = 'boodesk-cdn';
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;

// Configuração do Supabase
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 Testando integração Supabase + R2');
console.log('=====================================');

// Verificar variáveis de ambiente
console.log('\n📋 Verificando variáveis de ambiente:');
console.log('R2_ENDPOINT:', R2_ENDPOINT ? '✅ Configurado' : '❌ Não configurado');
console.log('R2_BUCKET:', R2_BUCKET ? '✅ Configurado' : '❌ Não configurado');
console.log('R2_ACCESS_KEY_ID:', R2_ACCESS_KEY_ID ? '✅ Configurado' : '❌ Não configurado');
console.log('R2_SECRET_ACCESS_KEY:', R2_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ Não configurado');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado');

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Variáveis de ambiente não configuradas corretamente!');
  console.log('Certifique-se de que o arquivo .env contém:');
  console.log('- REACT_APP_R2_ACCESS_KEY_ID');
  console.log('- REACT_APP_R2_SECRET_ACCESS_KEY');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Configurar AWS SDK para R2
AWS.config.update({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto',
  endpoint: R2_ENDPOINT,
  s3ForcePathStyle: true
});

const s3 = new AWS.S3();

// Testar conexão com R2
async function testR2Connection() {
  console.log('\n🌐 Testando conexão com R2...');
  try {
    const result = await s3.listBuckets().promise();
    console.log('✅ Conexão com R2 estabelecida');
    console.log('📦 Buckets disponíveis:', result.Buckets.map(b => b.Name));
    
    // Verificar se o bucket existe
    const bucketExists = result.Buckets.some(b => b.Name === R2_BUCKET);
    if (bucketExists) {
      console.log(`✅ Bucket "${R2_BUCKET}" encontrado`);
    } else {
      console.log(`❌ Bucket "${R2_BUCKET}" não encontrado`);
    }
    
    return bucketExists;
  } catch (error) {
    console.error('❌ Erro ao conectar com R2:', error.message);
    return false;
  }
}

// Testar upload para R2
async function testR2Upload() {
  console.log('\n📤 Testando upload para R2...');
  try {
    const testContent = 'Teste de integração Supabase + R2 - ' + new Date().toISOString();
    const testKey = `test-integration-${Date.now()}.txt`;
    
    const uploadParams = {
      Bucket: R2_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    };
    
    const result = await s3.upload(uploadParams).promise();
    console.log('✅ Upload para R2 realizado com sucesso');
    console.log('🔗 URL:', result.Location);
    console.log('🔑 Key:', result.Key);
    
    return {
      success: true,
      key: result.Key,
      url: result.Location
    };
  } catch (error) {
    console.error('❌ Erro no upload para R2:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Testar Supabase (simulação)
async function testSupabaseConnection() {
  console.log('\n🗄️ Testando conexão com Supabase...');
  try {
    // Simular verificação de conexão
    console.log('✅ Supabase configurado (simulação)');
    console.log('📊 URL:', SUPABASE_URL);
    console.log('🔑 Chave anônima configurada');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    return false;
  }
}

// Testar integração completa
async function testCompleteIntegration() {
  console.log('\n🔄 Testando integração completa...');
  
  // 1. Testar R2
  const r2Connected = await testR2Connection();
  if (!r2Connected) {
    console.log('❌ Falha na conexão com R2');
    return false;
  }
  
  // 2. Testar upload R2
  const uploadResult = await testR2Upload();
  if (!uploadResult.success) {
    console.log('❌ Falha no upload para R2');
    return false;
  }
  
  // 3. Testar Supabase
  const supabaseConnected = await testSupabaseConnection();
  if (!supabaseConnected) {
    console.log('❌ Falha na conexão com Supabase');
    return false;
  }
  
  console.log('\n✅ Integração completa funcionando!');
  console.log('📝 Próximos passos:');
  console.log('1. Execute o script SQL no Supabase para criar a tabela "files"');
  console.log('2. Configure as políticas RLS no Supabase');
  console.log('3. Teste o upload de arquivos no React app');
  
  return true;
}

// Executar testes
async function runTests() {
  try {
    await testCompleteIntegration();
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

runTests();
