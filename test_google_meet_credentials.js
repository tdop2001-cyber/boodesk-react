// Teste das credenciais do Google Meet
// Execute: node test_google_meet_credentials.js

const fs = require('fs');
const path = require('path');

async function testGoogleMeetCredentials() {
  console.log('🔐 TESTE DAS CREDENCIAIS DO GOOGLE MEET');
  console.log('=' .repeat(50));
  console.log('');

  // Verificar se o arquivo credentials.json existe
  const credentialsPath = './public/credentials.json';
  
  if (!fs.existsSync(credentialsPath)) {
    console.log('❌ Arquivo credentials.json não encontrado!');
    console.log('');
    console.log('📋 Para obter as credenciais:');
    console.log('1. Acesse: https://console.cloud.google.com/');
    console.log('2. Crie um projeto ou selecione existente');
    console.log('3. Habilite: Google Meet API e Google Calendar API');
    console.log('4. Crie um Service Account');
    console.log('5. Baixe a chave JSON');
    console.log('6. Renomeie para credentials.json');
    console.log('7. Mova para public/credentials.json');
    console.log('');
    return;
  }

  try {
    // Ler e validar o arquivo de credenciais
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    console.log('✅ Arquivo credentials.json encontrado!');
    console.log('');
    console.log('📋 Informações das credenciais:');
    console.log(`   Project ID: ${credentials.project_id}`);
    console.log(`   Client Email: ${credentials.client_email}`);
    console.log(`   Client ID: ${credentials.client_id}`);
    console.log(`   Type: ${credentials.type}`);
    console.log('');

    // Verificar campos obrigatórios
    const requiredFields = [
      'project_id',
      'client_email', 
      'private_key',
      'client_id',
      'auth_uri',
      'token_uri'
    ];

    let allFieldsPresent = true;
    for (const field of requiredFields) {
      if (!credentials[field]) {
        console.log(`❌ Campo obrigatório ausente: ${field}`);
        allFieldsPresent = false;
      }
    }

    if (allFieldsPresent) {
      console.log('✅ Todos os campos obrigatórios estão presentes!');
      console.log('');
      console.log('🔗 Próximos passos:');
      console.log('1. Execute: npm start');
      console.log('2. Acesse: http://localhost:3000/meetings');
      console.log('3. Crie uma reunião com Google Meet');
      console.log('4. Verifique se o link funciona');
      console.log('');
      console.log('🎉 SUAS CREDENCIAIS ESTÃO PRONTAS!');
    } else {
      console.log('❌ Credenciais incompletas!');
      console.log('   Verifique se baixou o arquivo correto do Google Cloud Console');
    }

  } catch (error) {
    console.log('❌ Erro ao ler credentials.json:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('💡 Verifique se o arquivo está em formato JSON válido');
  }
}

// Executar teste
testGoogleMeetCredentials();
