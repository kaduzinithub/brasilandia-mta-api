<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação WL - Staff Control Panel</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax-words/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="../style.css"> 
    <style>
        :root {
            --cor-fundo: #000000;
            --cor-primaria: #FF0000;
            --cor-secundaria: #B30000;
            --cor-destaque: #FFFFFF;
            --cor-card: #1C1C1C;
            --cor-texto-secundario: #b9bbbe;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: var(--cor-fundo);
            padding: 50px 20px;
        }

        .staff-tool-container {
            width: 100%;
            max-width: 550px;
            background-color: var(--cor-card);
            border-radius: 8px;
            box-shadow: 0 0 25px rgba(255, 0, 0, 0.5);
            padding: 30px;
            border-top: 5px solid var(--cor-primaria);
            color: var(--cor-destaque);
        }

        .staff-tool-container h1 {
            color: var(--cor-primaria);
            text-align: center;
            margin-bottom: 5px;
            font-size: 2.5em;
        }
        
        .staff-tool-container p.subtitle {
            text-align: center;
            color: var(--cor-texto-secundario);
            margin-bottom: 25px;
            font-size: 1.1em;
        }
        
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #333;
            background-color: #0d0d0d;
            color: var(--cor-destaque);
            border-radius: 4px;
        }
        
        .action-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 25px;
        }
        
        .submit-button {
            padding: 15px;
            border: none;
            border-radius: 4px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }
        
        .submit-button:hover {
            transform: translateY(-2px);
        }
        
        #approve-button {
            background-color: #4CAF50;
            color: var(--cor-destaque);
        }

        #reject-button {
            background-color: #f44336;
            color: var(--cor-destaque);
        }
        
        #clear-button {
            grid-column: 1 / 3;
            background-color: #3f3f3f;
            color: #ccc;
            margin-top: 10px;
        }
        
        #rejection-controls {
            background-color: #2a0d0d;
            border-left: 5px solid #f44336;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        
        #rejection-controls h3 {
            color: #f44336;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .message {
            text-align: center;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
            display: none;
            font-weight: bold;
        }
        
        .message.success { background-color: #0d2a0d; color: #4CAF50; }
        .message.error { background-color: #f4433630; color: #f44336; }

    </style>
</head>
<body>

    <div class="staff-tool-container">
        <h1><i class="fas fa-desktop"></i> Painel de Controle WL</h1>
        <p class="subtitle">Ferramenta para feedback e gerenciamento da Whitelist.</p>
        
        <form id="feedback-form">
            
            <div class="form-group">
                <label for="staff-name"><i class="fas fa-user-secret"></i> Seu Nickname Discord (Staff) *</label>
                <input type="text" id="staff-name" required placeholder="@SeuNick">
            </div>
            
            <hr style="border-color: var(--cor-secundaria); margin: 25px 0;">

            <div class="form-group">
                <label for="nickname"><i class="fab fa-discord"></i> Nickname Discord do Jogador *</label>
                <input type="text" id="nickname" required placeholder="@NomeDoPlayer">
            </div>

            <div class="form-group">
                <label for="rp-name"><i class="fas fa-id-card"></i> Nome In-Game Aprovado (Ex: John Smith) *</label>
                <input type="text" id="rp-name" required placeholder="Nome e Sobrenome para o RP">
            </div>

            <div class="form-group">
                <label for="serial"><i class="fas fa-fingerprint"></i> Serial MTA do Jogador *</label>
                <input type="text" id="serial" required placeholder="Cole o Serial completo (F8: serial)">
            </div>
            
            <div id="rejection-controls">
                <h3><i class="fas fa-ban"></i> Controles de Reprovação</h3>
                
                <div class="form-group">
                    <label for="motivo_rejeicao">Motivo da Rejeição (Obrigatório se Reprovado)</label>
                    <textarea id="motivo_rejeicao" rows="3" placeholder="Explique o motivo detalhadamente."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="ban-duration">Prazo de Banimento (Se aplicável)</label>
                    <select id="ban-duration">
                        <option value="72 Horas (WL)">72 Horas (Apenas WL, pode reaplicar)</option>
                        <option value="7 dias">7 dias (Motivo Leve)</option>
                        <option value="30 dias">30 dias (Motivo Médio)</option>
                        <option value="Permanente">Permanente (Quebra Grave de Regra)</option>
                    </select>
                </div>
            </div>

            <div class="action-group">
                <button type="submit" id="approve-button" data-status="Aprovado" class="submit-button">
                    <i class="fas fa-check"></i> APROVAR WL
                </button>
                <button type="submit" id="reject-button" data-status="Reprovado" class="submit-button">
                    <i class="fas fa-times-circle"></i> REPROVAR WL
                </button>
                <button type="button" id="clear-button" class="submit-button">
                    <i class="fas fa-eraser"></i> LIMPAR FORMULÁRIO
                </button>
            </div>
            
        </form>
        
        <div id="status-message" class="message"></div>

    </div>

    <script>
        // ESTA É A URL DA SUA API NO RENDER - CONECTADA AO BACKEND!
        const RENDER_API_FEEDBACK_URL = 'https://brasilandia-mta-api.onrender.com/api/feedback'; 
        
        const form = document.getElementById('feedback-form');
        const statusMessage = document.getElementById('status-message');
        const approveButton = document.getElementById('approve-button');
        const rejectButton = document.getElementById('reject-button');
        const clearButton = document.getElementById('clear-button');

        function showMessage(type, text) {
            statusMessage.textContent = text;
            statusMessage.className = `message ${type}`;
            statusMessage.style.display = 'block';
        }

        function toggleButtons(disabled, status) {
            approveButton.disabled = disabled;
            rejectButton.disabled = disabled;
            clearButton.disabled = disabled;
            
            if (disabled) {
                 approveButton.textContent = (status === 'Aprovado') ? 'Enviando...' : 'APROVAR WL';
                 rejectButton.textContent = (status === 'Reprovado') ? 'Enviando...' : 'REPROVAR WL';
            } else {
                 approveButton.textContent = 'APROVAR WL';
                 rejectButton.textContent = 'REPROVAR WL';
            }
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
        
        clearButton.addEventListener('click', function() {
            const staffName = document.getElementById('staff-name').value; 
            form.reset();
            document.getElementById('staff-name').value = staffName;
            statusMessage.style.display = 'none';
        });

        approveButton.addEventListener('click', function() {
            submitFeedback('Aprovado');
        });

        rejectButton.addEventListener('click', function() {
            submitFeedback('Reprovado');
        });

        function submitFeedback(status) {
            const staffName = document.getElementById('staff-name').value.trim();
            const nickname = document.getElementById('nickname').value.trim();
            const rpName = document.getElementById('rp-name').value.trim();
            const serial = document.getElementById('serial').value.trim();
            const motivoRejeicao = document.getElementById('motivo_rejeicao').value.trim();
            const banDuration = document.getElementById('ban-duration').value;

            if (!nickname || !serial || !staffName || !rpName) {
                showMessage('error', 'Preencha todos os campos obrigatórios (marcados com *).');
                return;
            }
            
            if (status === 'Reprovado' && !motivoRejeicao) {
                showMessage('error', 'O motivo da rejeição é obrigatório para reprovar.');
                return;
            }

            statusMessage.style.display = 'none';
            toggleButtons(true, status);
            
            // PAYLOAD DE DADOS PARA ENVIAR PARA A API DO RENDER
            const payload = {
                status: status, 
                staffName: staffName,
                nickname: nickname,
                rpName: rpName,
                serial: serial,
                motivoRejeicao: motivoRejeicao,
                banDuration: banDuration,
            };

            // Envia a requisição Fetch para a API do Render
            fetch(RENDER_API_FEEDBACK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            .then(response => {
                if (response.ok) {
                    showMessage('success', `Feedback de ${status} enviado (Via API Render)!`);
                    // Limpa campos específicos, mantendo o nome da Staff
                    document.getElementById('nickname').value = ''; 
                    document.getElementById('rp-name').value = '';
                    document.getElementById('serial').value = ''; 
                    document.getElementById('motivo_rejeicao').value = '';
                    document.getElementById('ban-duration').value = '72 Horas (WL)';
                } else {
                    showMessage('error', `Erro ao enviar para a API do Render. Status: ${response.status}.`);
                }
                return response.json();
            })
            .catch(error => {
                showMessage('error', `Erro de conexão. Verifique se o Render está LIVE. Detalhes: ${error.message}`);
            })
            .finally(() => {
                toggleButtons(false, status);
            });
        }
    </script>
</body>
</html>
