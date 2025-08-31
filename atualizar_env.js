// Script para atualizar o arquivo .env com as novas credenciais
// Execute: node atualizar_env.js

const fs = require('fs');
const path = require('path');

// Novas credenciais do R2
const NOVAS_CREDENCIAIS = `# ============================================================================
# CREDENCIAIS CLOUDFLARE R2 (ARMAZENAMENTO) - ATUALIZADAS
# ============================================================================
REACT_APP_R2_ACCESS_KEY_ID=3f2763c4d4c5a5b942cf45ca7291d50c
REACT_APP_R2_SECRET_ACCESS_KEY=9ad1b4ee1d1d8849b966a8f2f21135241b2a91428a51997eec7293d9c135bfbc
REACT_APP_R2_BUCKET=boodesk-cdn
REACT_APP_R2_ENDPOINT=https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com

# ============================================================================
# CREDENCIAIS SUPABASE (BANCO DE DADOS)
# ============================================================================
REACT_APP_SUPABASE_URL=https://noxhoaarzezagzsbypsw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4NDAwOCwiZXhwIjoyMDcyMDYwMDA4fQ.JKkbg0ZAeovLdYbS0tdiNrTK5sseLZ9ZX85HKhGdEyc

# ============================================================================
# CONFIGURAÇÕES ADICIONAIS
# ============================================================================
NODE_ENV=development
`;

function atualizarEnv() {
  console.log('🔄 Atualizando arquivo .env...');
  
  const envPath = path.join(__dirname, '.env');
  
  try {
    // Fazer backup do arquivo atual
    if (fs.existsSync(envPath)) {
      const backupPath = path.join(__dirname, '.env.backup');
      fs.copyFileSync(envPath, backupPath);
      console.log('✅ Backup criado: .env.backup');
    }
    
    // Escrever novas credenciais
    fs.writeFileSync(envPath, NOVAS_CREDENCIAIS);
    console.log('✅ Arquivo .env atualizado com sucesso!');
    
    // Verificar se foi escrito corretamente
    const conteudo = fs.readFileSync(envPath, 'utf8');
    if (conteudo.includes('3f2763c4d4c5a5b942cf45ca7291d50c')) {
      console.log('✅ Novas credenciais confirmadas no arquivo');
    } else {
      console.log('❌ Erro: Credenciais não foram escritas corretamente');
    }
    
    console.log('\n🎉 Arquivo .env atualizado!');
    console.log('💡 Agora execute: node test_new_token.js');
    
  } catch (error) {
    console.log('❌ Erro ao atualizar .env:');
    console.log(`   ${error.message}`);
  }
}

// Executar atualização
atualizarEnv();
