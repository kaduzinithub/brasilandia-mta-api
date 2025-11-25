// server.js - CORRIGIDO

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuração para processar JSON e URLs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **RESOLVENDO O PROBLEMA DO CORS**
app.use((req, res, next) => {
    // Adicione AQUI todos os domínios que podem acessar esta API 
    const allowedOrigins = ['http://brasilandiarp.wuaze.com', 'https://brasilandiarp.wuaze.com', 'http://localhost:8080']; 
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// ----------------------------------------------------
// ROTA PRINCIPAL: RECEBER DADOS DO STAFF E ENVIAR AO DISCORD
app.post('/api/discord-send', async (req, res) => {
    
    const BOT_TOKEN = process.env.BOT_TOKEN; 
    
    if (!BOT_TOKEN) {
        console.error("BOT_TOKEN não está definido nas variáveis de ambiente!");
        return res.status(500).json({ success: false, message: "Erro de configuração: Token do Bot não encontrado no servidor." });
    }

    // Usando uma simples hash (ex: timestamp) para o custom_id
    const uniqueId = Date.now().toString(36); 

    const { staffName, channelId, nickname, rpName, serial, motivoRejeicao, banDuration } = req.body;
    
    // Validação básica do Channel ID
    if (!channelId || isNaN(channelId) || channelId.length < 18) {
        return res.status(400).json({ success: false, message: "ID do Canal inválido ou não fornecido." });
    }

    const DISCORD_API_URL = `https://discord.com/api/v10/channels/${channelId}/messages`;

    // PAYLOAD DA MENSAGEM
    const payload = {
        content: `🚨 **NOVA AVALIAÇÃO DE WL** - Requer Decisão da Staff 🚨`,
        embeds: [{
            title: `Aplicação WL Pendente: ${rpName.toUpperCase()}`,
            description: `O Staff **@${staffName}** submeteu uma nova aplicação para avaliação.`,
            color: 16776960, // Amarelo (Pendente)
            fields: [
                { name: 'Discord', value: nickname, inline: true },
                { name: 'Serial MTA', value: '```' + serial + '```', inline: false },
                { name: 'Motivo Padrão de Reprovação', value: motivoRejeicao || 'Motivo a ser preenchido pela Staff.', inline: false },
                { name: 'Punição Padrão', value: banDuration, inline: true }
            ],
            footer: {
                text: `Submetido por: ${staffName}`
            },
            timestamp: new Date().toISOString()
        }],
        
        // BOTÕES DE INTERAÇÃO - Custom_ID simplificado
        components: [
            {
                type: 1, 
                components: [
                    {
                        type: 2, 
                        style: 3, 
                        label: '✅ APROVAR WL',
                        // Custom_ID SIMPLIFICADO: Envia o tipo e o ID ÚNICO
                        custom_id: `APPROVE_${uniqueId}` 
                    },
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ REPROVAR WL',
                        // Custom_ID SIMPLIFICADO: Envia o tipo e o ID ÚNICO
                        custom_id: `REJECT_${uniqueId}` 
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

        // Retorna sucesso para o frontend
        res.status(200).json({ 
            success: true, 
            message: `Mensagem com botões enviada para o canal ${channelId}!` 
        });

    } catch (error) {
        console.error('Erro na API do Discord:', error.response ? error.response.data : error.message);
        
        // Se o erro for "Invalid Form Body", significa que algo no payload (o JSON) está errado.
        const discordError = error.response ? error.response.data.message : 'Erro de rede ou Bot offline.';
        
        res.status(500).json({ 
            success: false, 
            message: `Erro ao enviar ao Discord: ${discordError}` 
        });
    }
});


// ROTA DE INTERAÇÃO DO DISCORD (APENAS PARA MANTER O CODIGO COMPLETO)
app.post('/api/interactions', (req, res) => {
    res.status(200).send("OK");
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
