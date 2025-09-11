// Edge Function para Arquivamento Automático Contínuo
// Deploy no Supabase Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando arquivamento automático...')

    // Executar arquivamento automático
    const { data, error } = await supabaseClient.rpc('execute_auto_archive_with_logging')

    if (error) {
      console.error('Erro ao executar arquivamento automático:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Arquivamento automático executado com sucesso:', data)

    // Buscar status do sistema
    const { data: statusData, error: statusError } = await supabaseClient.rpc('get_archive_system_status')

    if (statusError) {
      console.error('Erro ao buscar status do sistema:', statusError)
    }

    // Log da execução
    await supabaseClient
      .from('archive_execution_log')
      .insert({
        executed_at: new Date().toISOString(),
        cards_archived: data?.cards_archived || 0,
        execution_duration_ms: data?.execution_time_ms || 0,
        status: 'success',
        settings_checked: data?.settings_checked || 0
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivamento automático executado com sucesso',
        data: data,
        system_status: statusData,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Para deploy:
// supabase functions deploy auto-archive
// supabase functions serve auto-archive
