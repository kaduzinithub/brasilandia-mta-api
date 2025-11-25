// server.js - Backend da Brasilândia RP - MTA (Hospedado no Render)
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// ROTA DE TESTE (Health Check)
app.get('/', (req, res) => {
    res.send('API da Brasilândia RP - MTA está online e funcionando no Render!');
});

// ROTA PRINCIPAL PARA PROCESSAR O PAINEL DE STAFF
// URL de destino: SEU_RENDER_URL/api/feedback
app.post('/api/feedback', async (req, res) => {
    
    // Dados enviados pelo frontend
    const { status, nickname, rpName, serial, motivoRejeicao, banDuration, staffName } = req.body;

    const isApproved = status === 'Aprovado';
    
    // Obtém as URLs secretas do ambiente do Render
    const approvedUrl = process.env.APPROVED_WEBHOOK_URL;
    const rejectedUrl = process.env.REJECTED_WEBHOOK_URL;
    
    const webhookUrl = isApproved ? approvedUrl : rejectedUrl;
    
    if (!webhookUrl) {
        console.error(`Erro: Webhook URL não configurada para ${status}.`);
        return res.status(500).send({ error: 'Erro de configuração do servidor (Webhooks).' });
    }

    const color = isApproved ? 65280 : 16711680; // Verde ou Vermelho
    
    let messageDescription;
    let fields = [];

    // Lógica do Embed
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

    const payload = {
        username: 'Staff Control Panel | API',
        avatar_url: isApproved 
            ? 'https://i.imgur.com/vHq05sJ.png' 
            : 'https://i.imgur.com/D4sT9uF.png', 
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

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            res.status(200).send({ message: 'Feedback enviado com sucesso!' });
        } else {
            console.error('Erro na resposta do Discord:', response.status, await response.text());
            res.status(500).send({ error: 'Erro ao enviar Webhook do Discord (API).' });
        }
    } catch (error) {
        console.error('Erro de conexão ou servidor:', error);
        res.status(500).send({ error: 'Erro interno do servidor (Conexão).' });
    }
});

// Inicia o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
