/**
 * Script de Teste de Conexão com Supabase
 * Execute: npx ts-node scripts/test-supabase.ts
 */

import { testSupabaseConnection, getServiceSupabase } from '../lib/supabase';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    duration?: number;
}

const results: TestResult[] = [];

async function runTest(
    name: string,
    testFn: () => Promise<{ success: boolean; message: string }>
): Promise<void> {
    const start = Date.now();
    try {
        const result = await testFn();
        const duration = Date.now() - start;
        results.push({
            name,
            status: result.success ? 'PASS' : 'FAIL',
            message: result.message,
            duration,
        });
    } catch (error) {
        const duration = Date.now() - start;
        results.push({
            name,
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            duration,
        });
    }
}

async function testEnvVariables(): Promise<{ success: boolean; message: string }> {
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
    ];

    const missing = required.filter((v) => !process.env[v]);

    if (missing.length > 0) {
        return {
            success: false,
            message: `Variáveis faltando: ${missing.join(', ')}`,
        };
    }

    return {
        success: true,
        message: 'Todas as variáveis de ambiente estão configuradas',
    };
}

async function testPublicConnection(): Promise<{ success: boolean; message: string }> {
    return await testSupabaseConnection();
}

async function testServiceConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = getServiceSupabase();
        const { error } = await supabase.from('oficinas').select('count').limit(1);

        if (error) {
            return {
                success: false,
                message: `Erro: ${error.message}`,
            };
        }

        return {
            success: true,
            message: 'Conexão admin estabelecida com sucesso',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

async function testTableExists(tableName: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = getServiceSupabase();
        const { error } = await supabase.from(tableName).select('*').limit(1);

        if (error && error.message.includes('does not exist')) {
            return {
                success: false,
                message: `Tabela '${tableName}' não existe`,
            };
        }

        if (error) {
            return {
                success: false,
                message: `Erro ao acessar tabela: ${error.message}`,
            };
        }

        return {
            success: true,
            message: `Tabela '${tableName}' existe e está acessível`,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           🧪 TESTE DE CONEXÃO SUPABASE                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Carregar variáveis de ambiente
    require('dotenv').config({ path: '.env' });

    // Executar testes
    await runTest('Variáveis de Ambiente', testEnvVariables);
    await runTest('Conexão Pública (Anon Key)', testPublicConnection);
    await runTest('Conexão Admin (Service Key)', testServiceConnection);

    // Testar tabelas esperadas
    const tables = ['oficinas', 'clientes', 'servicos', 'mensagens_whatsapp'];
    for (const table of tables) {
        await runTest(`Tabela: ${table}`, () => testTableExists(table));
    }

    // Exibir resultados
    console.log('\n📊 RESULTADOS DOS TESTES:\n');
    console.log('─'.repeat(70));

    let passed = 0;
    let failed = 0;

    for (const result of results) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
        const duration = result.duration ? ` (${result.duration}ms)` : '';
        console.log(`${icon} ${result.name}${duration}`);
        console.log(`   ${result.message}\n`);

        if (result.status === 'PASS') passed++;
        else if (result.status === 'FAIL') failed++;
    }

    console.log('─'.repeat(70));
    console.log(`\n📈 RESUMO: ${passed}/${results.length} testes passaram`);

    if (failed > 0) {
        console.log(`\n⚠️  ${failed} teste(s) falharam. Verifique as configurações.`);
        process.exit(1);
    } else {
        console.log('\n🎉 Todos os testes passaram! Supabase está configurado corretamente.');
        process.exit(0);
    }
}

main().catch(console.error);
