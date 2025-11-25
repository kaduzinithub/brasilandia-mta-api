// server.js

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuração para processar JSON e URLs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **RESOLVENDO O PROBLEMA DO CORS**
// Permitir o acesso do seu domínio para todas as requisições
app.use((req, res, next) => {
    // Substitua 'http://brasilandiarp.wuaze.com' pelo seu domínio real (e verifique HTTPS se aplicável)
    const allowedOrigins = ['http://brasilandiarp.wuaze.com', 'http://localhost:8080']; 
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // Lida com preflight requests (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// ----------------------------------------------------
// ROTAS ESTÁTICAS (para servir HTML, CSS e JS do seu site)
// A pasta 'public' deve conter index.html, style.css e a subpasta 'pages'
app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ----------------------------------------------------


// ROTA PRINCIPAL: RECEBER DADOS DO STAFF E ENVIAR AO DISCORD
app.post('/api/discord-send', async (req, res) => {
    
    // **TOKEN DO BOT: Pegando da Variável de Ambiente (Recomendado)**
    const BOT_TOKEN = process.env.BOT_TOKEN; 
    
    // Se você não conseguir configurar a variável de ambiente no Render, 
    // use a linha abaixo (MENOS SEGURA):
    // const BOT_TOKEN = 'MTQ0Mjk2NDE3ODY3MDE5MDcwNQ.G9mRe_.VrS0G7QY32HNfWHd0xU47uvXEAPxYm-pQEu5aE'; 

    const { staffName, channelId, nickname, rpName, serial, motivoRejeicao, banDuration } = req.body;
    
    // Validação básica do Channel ID
    if (!channelId || isNaN(channelId) || channelId.length < 18) {
        return res.status(400).json({ success: false, message: "ID do Canal inválido ou não fornecido." });
    }

    const DISCORD_API_URL = `https://discord.com/api/v10/channels/${channelId}/messages`;

    // PAYLOAD DA MENSAGEM (O mesmo que estava no HTML)
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
        
        components: [
            {
                type: 1, 
                components: [
                    {
                        type: 2, 
                        style: 3, 
                        label: '✅ APROVAR WL',
                        custom_id: `APPROVE_${nickname}_${rpName}_${serial}_${staffName}`
                    },
                    {
                        type: 2, 
                        style: 4, 
                        label: '❌ REPROVAR WL',
                        custom_id: `REJECT_${nickname}_${rpName}_${serial}_${staffName}_${motivoRejeicao}_${banDuration}`
                    }
                ]
            }
        ]
    };

    try {
        const discordResponse = await axios.post(DISCORD_API_URL, payload, {
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
        
        const discordError = error.response ? error.response.data.message : 'Erro de rede ou Bot offline.';
        
        // Retorna erro detalhado para o frontend
        res.status(500).json({ 
            success: false, 
            message: `Erro ao enviar ao Discord: ${discordError}` 
        });
    }
});


// ROTA DE INTERAÇÃO DO DISCORD (OBRIGATÓRIA PARA BOTÕES)
// *** VOCÊ PRECISA DE UM INTERACTION HANDLER AQUI ***
// Caso você não tenha um, ignore por enquanto, mas lembre-se que 
// os botões não funcionarão sem essa rota.
app.post('/api/interactions', (req, res) => {
    // ... Aqui vai a lógica para verificar o Signature e responder à interação ...
    // ... Isso é mais complexo e requer o 'discord-interactions' package ...
    res.status(200).send("OK");
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
