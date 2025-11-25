// server.js - Backend da Brasilândia RP - MTA com Interações do Discord
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); 
const { verifyKeyMiddleware } = require('discord-interactions'); // Middleware do Discord

const app = express();
const port = process.env.PORT || 3000;

// Variáveis de ambiente (necessárias no Render):
// DISCORD_PUBLIC_KEY, APPROVED_WEBHOOK_URL, REJECTED_WEBHOOK_URL
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// ----------------------------------------------------
// Middleware para Habilitar CORS (Para o Painel de Staff)
// ----------------------------------------------------
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware para JSON (antes das rotas)
app.use(bodyParser.json());

// ----------------------------------------------------
// 1. ROTA DE TESTE (Health Check)
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('API da Brasilândia RP - MTA está online e funcionando no Render! Interações do Discord prontas.');
});

// ----------------------------------------------------
// 2. ROTA DE FEEDBACK MANUAL (Painel de Staff - POST)
// ----------------------------------------------------
app.post('/api/feedback', async (req, res) => {
    // Código de envio de Webhook final (já criado, permanece intacto)
    const { status, nickname, rpName, serial, motivoRejeicao, banDuration, staffName } = req.body;
    
    // ... (Lógica de Webhook para aprovação/reprovação) ...
    
    // Código de geração de payload para reuso
    const generatePayload = (isApproved, nickname, rpName, serial, motivoRejeicao, banDuration, staffName) => {
        const color = isApproved ? 65280 : 16711680;
        let messageDescription;
        let fields = [];

        if (isApproved) {
            messageDescription = `Parabéns, ${nickname}! Sua aplicação foi aceita. O seu personagem **${rpName}** foi aprovado e seu Serial MTA liberado.`;
            fields.push({ name: 'ID RP Aprovado', value: rpName, inline: true });
            fields.push({ name: 'Serial MTA', value: '```' + serial + '```', inline: false });
            fields.push({ name: 'Instruções', value: 'Aguarde a liberação oficial no Discord. Seja bem-vindo à Brasilândia RP!', inline: false });
        } else {
            messageDescription = `Olá, ${nickname}. Após análise, sua aplicação foi **REPROVADA**.`;
            fields.push({ name: 'Serial MTA', value: '```' + serial + '```', inline: false });
            fields.push({ name: 'Motivo Detalhado', value: motivoRejeicao, inline: false });
            fields.push({ name: 'Prazo/Penalidade', value: banDuration, inline: true });
            fields.push({ name: 'Próxima Tentativa', value: (banDuration === '72 Horas (WL)') ? 'Após o prazo de 72 horas.' : 'Entre em contato com a Staff após o prazo.', inline: true });
        }

        return {
            username: 'Staff Control Panel | API',
            avatar_url: isApproved ? 'https://i.imgur.com/vHq05sJ.png' : 'https://i.imgur.com/D4sT9uF.png', 
            embeds: [{
                title: isApproved ? '✅ NOVO CIDADÃO APROVADO: ' + rpName.toUpperCase() : '🚫 APLICAÇÃO REPROVADA',
                description: messageDescription,
                color: color,
                timestamp: new Date().toISOString(),
                fields: fields,
                footer: {
                    text: `Decisão tomada por: ${staffName} | API Render`,
                }
            }]
        };
    };

    const isApproved = status === 'Aprovado';
    const webhookUrl = isApproved ? process.env.APPROVED_WEBHOOK_URL : process.env.REJECTED_WEBHOOK_URL;
    
    if (!webhookUrl) {
        return res.status(500).send({ error: 'Erro de configuração do servidor (Webhooks).' });
    }

    try {
        const payload = generatePayload(isApproved, nickname, rpName, serial, motivoRejeicao, banDuration, staffName);
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            res.status(200).send({ message: 'Feedback enviado com sucesso!' });
        } else {
            res.status(500).send({ error: 'Erro ao enviar Webhook do Discord (API).' });
        }
    } catch (error) {
        console.error('Erro de conexão ou servidor:', error);
        res.status(500).send({ error: 'Erro interno do servidor (Conexão).' });
    }
});


// ----------------------------------------------------
// 3. ROTA DE INTERAÇÕES (Discord Bot - Handshake e Botões)
// ----------------------------------------------------
app.post('/interactions', verifyKeyMiddleware(DISCORD_PUBLIC_KEY), async (req, res) => {
    const interaction = req.body;
    
    // 1. HANDSHAKE (Ping/Pong) para o Discord Developers Portal
    if (interaction.type === 1) { // PING type
        return res.send({ type: 1 }); // Responde com PONG type
    }
    
    // 2. LÓGICA FUTURA PARA CLIQUES DE BOTÃO (Interaction Type 3: MESSAGE_COMPONENT)
    if (interaction.type === 3) { 
        // Esta é a parte que desenvolveremos na próxima etapa
        return res.send({
            type: 4, // Resposta simples: Edita a mensagem original
            data: {
                content: 'Interação recebida! A lógica dos botões será implementada em breve.',
                flags: 64, // Ephemeral (só quem clicou vê)
            },
        });
    }

    return res.status(400).end();
});


// Inicia o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
