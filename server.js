// server.js - Versão Final, Corrigida para Erro de Embed (50035)

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
// O Render define a porta automaticamente:
const port = process.env.PORT || 3000; 

// --- Configuração Básica ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RESOLVENDO O CORS ---
app.use((req, res, next) => {
    // Domínios que podem acessar esta API
    const allowedOrigins = [
        'http://brasilandiarp.wuaze.com', 
        'https://brasilandiarp.wuaze.com', 
        'http://localhost:8080'
    ]; 
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // Lida com preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// --- VARIÁVEIS DE DISCORD FIXAS ---
const REJECT_CHANNEL_ID = '1435430452318961764'; // Canal fixo de Reprovados
const BASE_DISCORD_API_URL = 'https://discord.com/api/v10'; 

// --- ROTA PRINCIPAL: POST para o Discord ---
app.post('/api/discord-send', async (req, res) => {
    
    const BOT_TOKEN = process.env.BOT_TOKEN; 
    
    if (!BOT_TOKEN) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro de configuração: Token do Bot não encontrado no servidor (Variável BOT_TOKEN)." 
        });
    }

    const uniqueId = Date.now().toString(36); 
    const { staffName, channelId, nickname, rpName, serial, motivoRejeicao, banDuration } = req.body;
    
    // GARANTIA DE VALOR PARA O EMBED (CORRIGE ERRO 50035)
    // Se o motivoRejeicao vier vazio, usamos uma string padrão.
    const finalMotivoRejeicao = motivoRejeicao && motivoRejeicao.trim() !== '' 
        ? motivoRejeicao 
        : 'Motivo a ser preenchido pela Staff. O staff não anexou um motivo padrão.';


    // Validação do ID do Canal de Avaliação
    if (!channelId || isNaN(channelId) || channelId.length < 18) {
        return res.status(400).json({ 
            success: false, 
            message: "ID do Canal de Avaliação inválido ou não fornecido." 
        });
    }

    const DISCORD_API_URL = `${BASE_DISCORD_API_URL}/channels/${channelId}/messages`;

    // --- PAYLOAD (Mensagem com Embed e Botões) ---
    const payload = {
        content: `🚨 **NOVA AVALIAÇÃO DE WL** - Requer Decisão da Staff 🚨`,
        embeds: [{
            title: `Aplicação WL Pendente: ${rpName.toUpperCase()}`,
            description: `O Staff **@${staffName}** submeteu uma nova aplicação para avaliação.`,
            color: 16776960, // Amarelo (Pendente)
            fields: [
                { name: 'Discord', value: nickname, inline: true },
                { name: 'Serial MTA', value: '```' + serial + '```', inline: false },
                // USANDO A VARIÁVEL CORRIGIDA AQUI:
                { name: 'Motivo Padrão de Reprovação', value: finalMotivoRejeicao, inline: false },
                { name: 'Punição Padrão', value: banDuration, inline: true }
            ],
            footer: {
                text: `Submetido por: ${staffName} | ID Único: ${uniqueId}`
            },
            timestamp: new Date().toISOString()
        }],
        
        components: [
            // Linha 1: APROVAR e Opções de Reprovação
            {
                type: 1, 
                components: [
                    {
                        type: 2, 
                        style: 3, 
                        label: '✅ APROVAR WL',
                        custom_id: `APPROVE_${uniqueId}` 
                    },
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ Reprovar (72H)',
                        custom_id: `REJECT_72H_${uniqueId}` 
                    },
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ Reprovar (7 Dias)',
                        custom_id: `REJECT_7D_${uniqueId}` 
                    },
                ]
            },
            // Linha 2: Mais opções de reprovação
             {
                type: 1, 
                components: [
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ Reprovar (30 Dias)',
                        custom_id: `REJECT_30D_${uniqueId}` 
                    },
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ Reprovar (PERM)',
                        custom_id: `REJECT_PERM_${uniqueId}` 
                    }
                ]
            }
        ]
    };

    try {
        await axios.post(DISCORD_API_URL, payload, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bot ${BOT_TOKEN}` 
            }
        });

        res.status(200).json({ 
            success: true, 
            message: `Mensagem enviada! O staff pode prosseguir com a aprovação/reprovação.` 
        });

    } catch (error) {
        console.error('Erro na API do Discord:', error.response ? error.response.data : error.message);
        
        const discordError = error.response ? error.response.data.message : 'Erro de rede ou Bot offline.';
        
        res.status(500).json({ 
            success: false, 
            message: `Erro ao enviar ao Discord: ${discordError}` 
        });
    }
});


// ROTA DE INTERAÇÃO DO DISCORD (Manter para interações de botão)
app.post('/api/interactions', (req, res) => {
    res.status(200).send("OK");
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
