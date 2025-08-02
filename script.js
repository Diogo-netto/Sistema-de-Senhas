// Sistema de Senhas v2.3 - Layout Otimizado
// Gerenciamento otimizado de filas prioritárias e comuns

class SistemaSenhasLimpo {
  constructor() {
    // Estado das filas
    this.filas = {
      prioridade: {
        atual: 0,
        proxima: 1,
        aguardando: [],
        historico: []
      },
      comum: {
        atual: 0,
        proxima: 1,
        aguardando: [],
        historico: []
      }
    };

    // Configurações
    this.config = {
      somAtivo: true,
      autoSave: true,
      volume: 50,
      vozAtiva: null, // Para armazenar a voz selecionada
      modoIntercalacao: false, // Novo: Modo de intercalação automática
      ratioIntercalacao: 2 // Novo: Quantas senhas comuns para cada prioritária
    };

    // Contador para intercalação
    this.contadorIntercalacao = 0;

    // Elementos DOM
    this.elementos = this.obterElementos();
    
    // Inicializar Web Speech API
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.carregarVozes();

    this.inicializar();
  }

  obterElementos() {
    return {
      // Senhas atuais
      senhaPrioridadeAtual: document.getElementById("senha-prioridade-atual"),
      senhaComumAtual: document.getElementById("senha-comum-atual"),
      
      // Próximas senhas
      proximasPrioridade: document.getElementById("proximas-prioridade"),
      proximasComum: document.getElementById("proximas-comum"),
      
      // Botões principais
      gerarPrioridade: document.getElementById("gerar-prioridade"),
      chamarPrioridade: document.getElementById("chamar-prioridade"),
      repetirPrioridade: document.getElementById("repetir-prioridade"),
      
      gerarComum: document.getElementById("gerar-comum"),
      chamarComum: document.getElementById("chamar-comum"),
      repetirComum: document.getElementById("repetir-comum"),
      
      // Botões administrativos
      resetPrioridade: document.getElementById("reset-prioridade"),
      resetComum: document.getElementById("reset-comum"),
      resetTudo: document.getElementById("reset-tudo"),
      
      // Histórico
      historicoChamadas: document.getElementById("historico-chamadas"),
      
      // Data e hora
      dataAtual: document.getElementById("data-atual"),
      horaAtual: document.getElementById("hora-atual"),
      
      // Modal e configurações
      modalConfig: document.getElementById("modal-config"),
      abrirConfig: document.getElementById("abrir-config"),
      fecharModal: document.getElementById("fechar-modal"),
      somAtivo: document.getElementById("som-ativo"),
      autoSave: document.getElementById("auto-save"),
      volumeSom: document.getElementById("volume-som"),
      selectVoz: document.getElementById("select-voz")
    };
  }

  inicializar() {
    this.configurarEventos();
    this.carregarConfiguracoes();
    this.carregarDados();
    this.atualizarInterface();
    this.iniciarRelogio();
    this.criarElementosUI();
    this.mostrarNotificacao("Sistema iniciado com sucesso!", "success");
  }

  // Novo método para criar elementos de UI adicionais
  criarElementosUI() {
    // Criar botão de chamada automática
    this.criarBotaoChamadaAutomatica();
    
    // Criar container para modais customizados
    this.criarContainerModais();
    
    // Adicionar opções de intercalação ao modal de configurações
    this.adicionarOpcoesIntercalacao();
  }

  // Novo método para criar botão de chamada automática
  criarBotaoChamadaAutomatica() {
    // Verificar se já existe
    if (document.getElementById("chamar-automatico")) return;
    
    // Criar botão
    const botao = document.createElement("button");
    botao.id = "chamar-automatico";
    botao.className = "btn btn-chamar-auto";
    botao.setAttribute("aria-label", "Chamar próxima senha automaticamente");
    botao.innerHTML = `
      <i class="bi bi-shuffle" aria-hidden="true"></i>
      Chamar Próximo
    `;
    
    // Estilizar botão
    Object.assign(botao.style, {
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "0.9rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      margin: "10px auto",
      width: "100%",
      maxWidth: "200px"
    });
    
    // Adicionar evento
    botao.addEventListener("click", () => this.chamarProximaAutomatica());
    botao.addEventListener("mouseover", () => {
      botao.style.transform = "translateY(-2px)";
      botao.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });
    botao.addEventListener("mouseout", () => {
      botao.style.transform = "";
      botao.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });
    
    // Adicionar ao DOM - procurar um local adequado
    const adminSection = document.querySelector(".admin-section");
    if (adminSection) {
      adminSection.appendChild(botao);
    } else {
      // Alternativa: adicionar após os botões de chamar
      const ultimoBotao = this.elementos.chamarComum;
      if (ultimoBotao && ultimoBotao.parentNode) {
        ultimoBotao.parentNode.appendChild(botao);
      }
    }
  }

  // Novo método para criar container de modais customizados
  criarContainerModais() {
    // Verificar se já existe
    if (document.getElementById("modais-container")) return;
    
    // Criar container
    const container = document.createElement("div");
    container.id = "modais-container";
    
    // Estilizar container
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000"
    });
    
    // Adicionar ao DOM
    document.body.appendChild(container);
  }

  // Novo método para adicionar opções de intercalação ao modal de configurações
  adicionarOpcoesIntercalacao() {
    const modalBody = document.querySelector(".modal-body");
    if (!modalBody) return;
    
    // Verificar se já existe
    if (document.getElementById("modo-intercalacao")) return;
    
    // Criar elemento para modo de intercalação
    const divIntercalacao = document.createElement("div");
    divIntercalacao.className = "config-item";
    divIntercalacao.innerHTML = `
      <label>
        <input type="checkbox" id="modo-intercalacao">
        Modo de Intercalação Automática
      </label>
      <div class="config-info">
        <small>Alterna automaticamente entre senhas comuns e prioritárias</small>
      </div>
    `;
    
    // Criar elemento para ratio de intercalação
    const divRatio = document.createElement("div");
    divRatio.className = "config-item";
    divRatio.innerHTML = `
      <label for="ratio-intercalacao">Senhas comuns por prioritária:</label>
      <select id="ratio-intercalacao">
        <option value="1">1 comum : 1 prioritária</option>
        <option value="2" selected>2 comuns : 1 prioritária</option>
        <option value="3">3 comuns : 1 prioritária</option>
        <option value="4">4 comuns : 1 prioritária</option>
      </select>
    `;
    
    // Estilizar elementos
    const configInfo = divIntercalacao.querySelector(".config-info");
    if (configInfo) {
      Object.assign(configInfo.style, {
        fontSize: "0.8rem",
        color: "#6b7280",
        marginLeft: "24px"
      });
    }
    
    // Adicionar ao modal
    modalBody.appendChild(divIntercalacao);
    modalBody.appendChild(divRatio);
    
    // Adicionar eventos
    const checkboxIntercalacao = document.getElementById("modo-intercalacao");
    const selectRatio = document.getElementById("ratio-intercalacao");
    
    if (checkboxIntercalacao) {
      checkboxIntercalacao.checked = this.config.modoIntercalacao;
      checkboxIntercalacao.addEventListener("change", (e) => {
        this.config.modoIntercalacao = e.target.checked;
        this.salvarConfiguracoes();
        this.atualizarVisibilidadeBotaoAutomatico();
      });
    }
    
    if (selectRatio) {
      selectRatio.value = this.config.ratioIntercalacao.toString();
      selectRatio.addEventListener("change", (e) => {
        this.config.ratioIntercalacao = parseInt(e.target.value);
        this.salvarConfiguracoes();
      });
    }
    
    // Atualizar visibilidade do botão automático
    this.atualizarVisibilidadeBotaoAutomatico();
  }

  // Novo método para atualizar visibilidade do botão automático
  atualizarVisibilidadeBotaoAutomatico() {
    const botao = document.getElementById("chamar-automatico");
    if (botao) {
      botao.style.display = this.config.modoIntercalacao ? "flex" : "none";
    }
  }

  carregarVozes() {
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices().filter(voice => voice.lang.startsWith("pt-") || voice.lang.startsWith("en-"));
        this.popularSelectVoz();
      };
      // Em alguns navegadores, as vozes já podem estar carregadas
      if (this.synth.getVoices().length > 0) {
        this.voices = this.synth.getVoices().filter(voice => voice.lang.startsWith("pt-") || voice.lang.startsWith("en-"));
        this.popularSelectVoz();
      }
    }
  }

  popularSelectVoz() {
    if (this.elementos.selectVoz) {
      this.elementos.selectVoz.innerHTML = '';
      this.voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        this.elementos.selectVoz.appendChild(option);
      });
      // Selecionar a voz salva ou uma padrão
      if (this.config.vozAtiva) {
        this.elementos.selectVoz.value = this.config.vozAtiva;
      } else if (this.voices.length > 0) {
        // Tentar selecionar uma voz em português como padrão
        const vozPadraoPt = this.voices.find(voice => voice.lang === 'pt-BR' || voice.lang === 'pt-PT');
        if (vozPadraoPt) {
          this.elementos.selectVoz.value = vozPadraoPt.name;
          this.config.vozAtiva = vozPadraoPt.name;
          this.salvarConfiguracoes();
        } else {
          this.elementos.selectVoz.value = this.voices[0].name;
          this.config.vozAtiva = this.voices[0].name;
          this.salvarConfiguracoes();
        }
      }
    }
  }

  configurarEventos() {
    // Botões de gerar senha
    this.elementos.gerarPrioridade?.addEventListener("click", () => this.gerarSenha("prioridade"));
    this.elementos.gerarComum?.addEventListener("click", () => this.gerarSenha("comum"));

    // Botões de chamar senha
    this.elementos.chamarPrioridade?.addEventListener("click", () => this.chamarProximaSenha("prioridade"));
    this.elementos.chamarComum?.addEventListener("click", () => this.chamarProximaSenha("comum"));

    // Botões de repetir
    this.elementos.repetirPrioridade?.addEventListener("click", () => this.repetirChamada("prioridade"));
    this.elementos.repetirComum?.addEventListener("click", () => this.repetirChamada("comum"));

    // Botões de reset
    this.elementos.resetPrioridade?.addEventListener("click", () => this.resetFila("prioridade"));
    this.elementos.resetComum?.addEventListener("click", () => this.resetFila("comum"));
    this.elementos.resetTudo?.addEventListener("click", () => this.resetTudo());

    // Modal de configurações
    this.elementos.abrirConfig?.addEventListener("click", () => this.abrirModal());
    this.elementos.fecharModal?.addEventListener("click", () => this.fecharModal());
    this.elementos.modalConfig?.addEventListener("click", (e) => {
      if (e.target === this.elementos.modalConfig) {
        this.fecharModal();
      }
    });

    // Configurações
    this.elementos.somAtivo?.addEventListener("change", (e) => {
      this.config.somAtivo = e.target.checked;
      this.salvarConfiguracoes();
    });

    this.elementos.autoSave?.addEventListener("change", (e) => {
      this.config.autoSave = e.target.checked;
      this.salvarConfiguracoes();
    });

    this.elementos.volumeSom?.addEventListener("input", (e) => {
      this.config.volume = parseInt(e.target.value);
      this.salvarConfiguracoes();
    });

    this.elementos.selectVoz?.addEventListener("change", (e) => {
      this.config.vozAtiva = e.target.value;
      this.salvarConfiguracoes();
    });

    // Atalhos de teclado
    document.addEventListener("keydown", (e) => this.processarAtalhos(e));

    // Prevenir fechamento acidental
    window.addEventListener("beforeunload", (e) => this.prevenieFechamento(e));
  }

  // Modificado: Método para gerar senha com feedback visual melhorado
  gerarSenha(tipo) {
    const fila = this.filas[tipo];
    const novaSenha = fila.proxima;
    
    fila.aguardando.push(novaSenha);
    fila.proxima++;
    
    this.atualizarInterface();
    this.salvarDados();
    
    // Animação no botão
    const botao = tipo === "prioridade" ? this.elementos.gerarPrioridade : this.elementos.gerarComum;
    this.animarBotao(botao);
    
    // Mostrar notificação
    this.mostrarNotificacao(`Senha ${this.formatarSenha(novaSenha, tipo)} gerada!`, "success");
    
    // NOVO: Mostrar modal de confirmação central
    this.mostrarModalSenhaGerada(novaSenha, tipo);
  }

  // NOVO: Método para mostrar modal central com a senha gerada
  mostrarModalSenhaGerada(senha, tipo) {
    // Criar modal
    const modal = document.createElement("div");
    modal.className = "modal-senha-gerada";
    
    // Determinar cor baseada no tipo
    const corFundo = tipo === "prioridade" ? "#fee2e2" : "#dcfce7";
    const corBorda = tipo === "prioridade" ? "#ef4444" : "#10b981";
    const corTexto = tipo === "prioridade" ? "#b91c1c" : "#047857";
    
    // Estilizar modal
    Object.assign(modal.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: corFundo,
      border: `2px solid ${corBorda}`,
      borderRadius: "16px",
      padding: "20px 30px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      zIndex: "1002",
      textAlign: "center",
      animation: "fadeInOut 3s forwards"
    });
    
    // Adicionar conteúdo
    modal.innerHTML = `
      <h3 style="margin: 0 0 10px; color: ${corTexto}; font-size: 1.2rem;">Senha Gerada</h3>
      <div style="font-size: 2.5rem; font-weight: 700; color: ${corTexto}; margin: 15px 0;">
        ${this.formatarSenha(senha, tipo)}
      </div>
      <p style="margin: 10px 0 0; color: ${corTexto}; font-size: 1rem;">
        Aguarde ser chamado
      </p>
    `;
    
    // Adicionar animação CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao DOM
    document.body.appendChild(modal);
    
    // Remover após animação
    setTimeout(() => {
      if (modal.parentElement) {
        modal.parentElement.removeChild(modal);
      }
    }, 3000);
  }

  chamarProximaSenha(tipo) {
    const fila = this.filas[tipo];
    
    if (fila.aguardando.length === 0) {
      this.mostrarNotificacao("Não há senhas aguardando!", "warning");
      return;
    }

    fila.atual = fila.aguardando.shift();
    
    // Adicionar ao histórico
    this.adicionarAoHistorico(fila.atual, tipo);

    this.atualizarInterface();
    this.salvarDados();
    this.falarSenha(fila.atual, tipo);
    this.destacarChamada(tipo);
    this.mostrarNotificacao(`Chamando senha ${this.formatarSenha(fila.atual, tipo)}!`, "info");
  }

  // NOVO: Método para chamar próxima senha automaticamente
  chamarProximaAutomatica() {
    // Verificar se há senhas aguardando
    const temPrioritaria = this.filas.prioridade.aguardando.length > 0;
    const temComum = this.filas.comum.aguardando.length > 0;
    
    // Se não há senhas aguardando
    if (!temPrioritaria && !temComum) {
      this.mostrarNotificacao("Não há senhas aguardando!", "warning");
      return;
    }
    
    // Determinar qual tipo chamar baseado na regra de intercalação
    let tipoChamar;
    
    // Se não há um tipo, chamar o outro
    if (!temPrioritaria) {
      tipoChamar = "comum";
    } else if (!temComum) {
      tipoChamar = "prioridade";
    } else {
      // Ambos os tipos têm senhas aguardando, aplicar regra de intercalação
      if (this.contadorIntercalacao < this.config.ratioIntercalacao) {
        // Chamar senha comum
        tipoChamar = "comum";
        this.contadorIntercalacao++;
      } else {
        // Chamar senha prioritária
        tipoChamar = "prioridade";
        this.contadorIntercalacao = 0;
      }
    }
    
    // Chamar a próxima senha do tipo determinado
    this.chamarProximaSenha(tipoChamar);
  }

  repetirChamada(tipo) {
    const fila = this.filas[tipo];
    
    if (fila.atual === 0) {
      this.mostrarNotificacao("Nenhuma senha foi chamada ainda!", "warning");
      return;
    }

    this.falarSenha(fila.atual, tipo);
    this.destacarChamada(tipo);
    this.mostrarNotificacao(`Repetindo chamada: ${this.formatarSenha(fila.atual, tipo)}`, "info");
  }

  // Modificado: Método para resetar fila com modal customizado
  resetFila(tipo) {
    const tipoTexto = tipo === "prioridade" ? "prioritária" : "comum";
    
    // NOVO: Usar modal customizado em vez de confirm()
    this.mostrarModalConfirmacao(
      `Resetar Fila ${tipoTexto}`,
      `Tem certeza que deseja resetar a fila ${tipoTexto}? Esta ação não pode ser desfeita.`,
      () => {
        // Ação ao confirmar
        this.filas[tipo] = {
          atual: 0,
          proxima: 1,
          aguardando: [],
          historico: []
        };
        
        this.atualizarInterface();
        this.salvarDados();
        this.mostrarNotificacao(`Fila ${tipoTexto} resetada!`, "success");
      }
    );
  }

  // Modificado: Método para resetar tudo com modal customizado
  resetTudo() {
    // NOVO: Usar modal customizado em vez de confirm()
    this.mostrarModalConfirmacao(
      "Resetar Sistema Completo",
      "Tem certeza que deseja resetar TODAS as filas? Esta ação não pode ser desfeita!",
      () => {
        // Ação ao confirmar
        this.filas = {
          prioridade: {
            atual: 0,
            proxima: 1,
            aguardando: [],
            historico: []
          },
          comum: {
            atual: 0,
            proxima: 1,
            aguardando: [],
            historico: []
          }
        };
        
        this.atualizarInterface();
        this.salvarDados();
        this.mostrarNotificacao("Sistema resetado completamente!", "success");
      },
      true // Requer confirmação extra
    );
  }

  // NOVO: Método para mostrar modal de confirmação customizado
  mostrarModalConfirmacao(titulo, mensagem, acaoConfirmar, requerConfirmacaoExtra = false) {
    // Obter container de modais
    const container = document.getElementById("modais-container");
    if (!container) return;
    
    // Limpar container
    container.innerHTML = "";
    
    // Criar modal
    const modal = document.createElement("div");
    modal.className = "modal-confirmacao";
    
    // Estilizar modal
    Object.assign(modal.style, {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      maxWidth: "400px",
      width: "90%",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
    });
    
    // Determinar se é reset completo (vermelho) ou parcial (laranja)
    const ehResetCompleto = requerConfirmacaoExtra;
    const corPrimaria = ehResetCompleto ? "#ef4444" : "#f59e0b";
    
    // Criar conteúdo do modal
    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: ${corPrimaria}; font-size: 1.3rem;">${titulo}</h3>
      </div>
      <div style="margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; color: #4b5563;">${mensagem}</p>
      </div>
      ${requerConfirmacaoExtra ? `
        <div style="margin-bottom: 20px; text-align: center;">
          <p style="margin: 0 0 10px; color: #4b5563; font-size: 0.9rem;">
            Digite "RESETAR" para confirmar:
          </p>
          <input type="text" id="confirmacao-texto" style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            text-align: center;
          ">
        </div>
      ` : ''}
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button id="btn-cancelar" style="
          padding: 8px 16px;
          background-color: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        ">Cancelar</button>
        <button id="btn-confirmar" style="
          padding: 8px 16px;
          background-color: ${corPrimaria};
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          ${requerConfirmacaoExtra ? 'opacity: 0.5;' : ''}
        ">Confirmar</button>
      </div>
    `;
    
    // Adicionar modal ao container
    container.appendChild(modal);
    
    // Mostrar container
    container.style.display = "flex";
    
    // Adicionar eventos
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnConfirmar = document.getElementById("btn-confirmar");
    
    // Evento de cancelar
    btnCancelar.addEventListener("click", () => {
      container.style.display = "none";
    });
    
    // Evento de confirmar
    btnConfirmar.addEventListener("click", () => {
      // Verificar confirmação extra se necessário
      if (requerConfirmacaoExtra) {
        const inputConfirmacao = document.getElementById("confirmacao-texto");
        if (inputConfirmacao && inputConfirmacao.value === "RESETAR") {
          container.style.display = "none";
          acaoConfirmar();
        } else {
          // Mostrar erro
          const inputConfirmacao = document.getElementById("confirmacao-texto");
          if (inputConfirmacao) {
            inputConfirmacao.style.borderColor = "#ef4444";
            inputConfirmacao.style.backgroundColor = "#fee2e2";
            setTimeout(() => {
              inputConfirmacao.style.borderColor = "#d1d5db";
              inputConfirmacao.style.backgroundColor = "";
            }, 1000);
          }
        }
      } else {
        container.style.display = "none";
        acaoConfirmar();
      }
    });
    
    // Se requer confirmação extra, adicionar evento para habilitar/desabilitar botão
    if (requerConfirmacaoExtra) {
      const inputConfirmacao = document.getElementById("confirmacao-texto");
      if (inputConfirmacao) {
        inputConfirmacao.addEventListener("input", (e) => {
          if (e.target.value === "RESETAR") {
            btnConfirmar.style.opacity = "1";
          } else {
            btnConfirmar.style.opacity = "0.5";
          }
        });
      }
    }
    
    // Adicionar evento para fechar com ESC
    const escListener = (e) => {
      if (e.key === "Escape") {
        container.style.display = "none";
        document.removeEventListener("keydown", escListener);
      }
    };
    document.addEventListener("keydown", escListener);
  }

  adicionarAoHistorico(senha, tipo) {
    const agora = new Date();
    const fila = this.filas[tipo];
    
    fila.historico.unshift({
      senha: senha,
      tipo: tipo,
      hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: agora.getTime()
    });

    // Manter apenas os últimos 10 registros por fila
    if (fila.historico.length > 10) {
      fila.historico = fila.historico.slice(0, 10);
    }
  }

  processarAtalhos(e) {
    if (e.ctrlKey) {
      switch(e.key.toLowerCase()) {
        case "p":
          e.preventDefault();
          this.gerarSenha("prioridade");
          break;
        case "c":
          e.preventDefault();
          this.gerarSenha("comum");
          break;
        case "1":
          e.preventDefault();
          this.chamarProximaSenha("prioridade");
          break;
        case "2":
          e.preventDefault();
          this.chamarProximaSenha("comum");
          break;
        case "a": // NOVO: Atalho para chamada automática
          e.preventDefault();
          if (this.config.modoIntercalacao) {
            this.chamarProximaAutomatica();
          }
          break;
      }
    }
    
    // ESC para fechar modal
    if (e.key === "Escape") {
      this.fecharModal();
      
      // Fechar também o container de modais customizados
      const container = document.getElementById("modais-container");
      if (container) {
        container.style.display = "none";
      }
    }
  }

  atualizarInterface() {
    // Atualizar senhas atuais
    if (this.elementos.senhaPrioridadeAtual) {
      this.elementos.senhaPrioridadeAtual.textContent = this.formatarSenha(this.filas.prioridade.atual, "prioridade");
    }
    if (this.elementos.senhaComumAtual) {
      this.elementos.senhaComumAtual.textContent = this.formatarSenha(this.filas.comum.atual, "comum");
    }

    // Atualizar próximas senhas
    this.atualizarProximasSenhas("prioridade");
    this.atualizarProximasSenhas("comum");

    // Atualizar histórico
    this.atualizarHistorico();

    // Atualizar estado dos botões
    this.atualizarEstadoBotoes();
    
    // Atualizar visibilidade do botão automático
    this.atualizarVisibilidadeBotaoAutomatico();
  }

  atualizarProximasSenhas(tipo) {
    const container = tipo === "prioridade" ? this.elementos.proximasPrioridade : this.elementos.proximasComum;
    if (!container) return;
    
    const fila = this.filas[tipo];
    container.innerHTML = "";
    
    const proximasTres = fila.aguardando.slice(0, 3);
    
    if (proximasTres.length === 0) {
      container.innerHTML = "<span class=\"senha-item\">Nenhuma</span>";
      return;
    }
    
    proximasTres.forEach(senha => {
      const span = document.createElement("span");
      span.className = "senha-item";
      span.textContent = this.formatarSenha(senha, tipo);
      container.appendChild(span);
    });
  }

  atualizarHistorico() {
    if (!this.elementos.historicoChamadas) return;
    
    const todosHistoricos = [
      ...this.filas.prioridade.historico,
      ...this.filas.comum.historico
    ];
    
    // Ordenar por timestamp (mais recente primeiro)
    todosHistoricos.sort((a, b) => b.timestamp - a.timestamp);
    
    this.elementos.historicoChamadas.innerHTML = "";
    
    todosHistoricos.slice(0, 6).forEach(item => {
      const div = document.createElement("div");
      div.className = "historico-item";
      
      // Aplicar cor baseada no tipo
      const corSenha = item.tipo === "prioridade" ? "#dc2626" : "#059669";
      
      div.innerHTML = `
        <span class="senha" style="color: ${corSenha};">${this.formatarSenha(item.senha, item.tipo)}</span>
        <span class="hora">${item.hora}</span>
      `;
      this.elementos.historicoChamadas.appendChild(div);
    });
  }

  atualizarEstadoBotoes() {
    // Desabilitar botões de chamar se não há senhas aguardando
    if (this.elementos.chamarPrioridade) {
      this.elementos.chamarPrioridade.disabled = this.filas.prioridade.aguardando.length === 0;
    }
    if (this.elementos.chamarComum) {
      this.elementos.chamarComum.disabled = this.filas.comum.aguardando.length === 0;
    }
    
    // Desabilitar botões de repetir se não há senha atual
    if (this.elementos.repetirPrioridade) {
      this.elementos.repetirPrioridade.disabled = this.filas.prioridade.atual === 0;
    }
    if (this.elementos.repetirComum) {
      this.elementos.repetirComum.disabled = this.filas.comum.atual === 0;
    }
    
    // Desabilitar botão de chamada automática se não há senhas aguardando
    const botaoAuto = document.getElementById("chamar-automatico");
    if (botaoAuto) {
      botaoAuto.disabled = this.filas.prioridade.aguardando.length === 0 && this.filas.comum.aguardando.length === 0;
    }
  }

  formatarSenha(numero, tipo) {
    if (numero === 0) return tipo === "prioridade" ? "P000" : "C000";
    const prefixo = tipo === "prioridade" ? "P" : "C";
    return `${prefixo}${numero.toString().padStart(3, "0")}`;
  }

  destacarChamada(tipo) {
    const card = document.querySelector(`.senha-card.${tipo}`);
    if (card) {
      card.classList.add("senha-chamada");
      setTimeout(() => {
        card.classList.remove("senha-chamada");
      }, 3000);
    }
  }

  falarSenha(numero, tipo) {
    if (!this.config.somAtivo || !this.synth) return;

    const textoSenha = this.formatarSenhaParaVoz(numero, tipo);
    const utterance = new SpeechSynthesisUtterance(textoSenha);

    utterance.volume = this.config.volume / 100; // Volume de 0 a 1
    utterance.lang = 'pt-BR'; // Definir idioma para português do Brasil

    // Tentar usar a voz selecionada
    if (this.config.vozAtiva) {
      const vozSelecionada = this.voices.find(voice => voice.name === this.config.vozAtiva);
      if (vozSelecionada) {
        utterance.voice = vozSelecionada;
      }
    }

    this.synth.cancel(); // Parar qualquer fala anterior
    this.synth.speak(utterance);

    utterance.onerror = (event) => {
      console.error('Erro na síntese de fala:', event.error);
      this.mostrarNotificacao(`Erro na voz: ${event.error}. Tente outra voz ou verifique as configurações do navegador.`, "error");
    };
  }

  formatarSenhaParaVoz(numero, tipo) {
    const tipoTexto = tipo === "prioridade" ? " atendimento prioridade" : "atendimento geral";
    return `Senha número ${numero} ${tipoTexto}`;
  }

  animarBotao(botao) {
    if (botao) {
      botao.style.transform = "scale(0.95)";
      setTimeout(() => {
        botao.style.transform = "";
      }, 150);
    }
  }

  abrirModal() {
    if (this.elementos.modalConfig) {
      this.elementos.modalConfig.classList.add("active");
    }
  }

  fecharModal() {
    if (this.elementos.modalConfig) {
      this.elementos.modalConfig.classList.remove("active");
    }
  }

  mostrarNotificacao(mensagem, tipo = "info") {
    const notificacao = document.createElement("div");
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    
    const cores = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6"
    };
    
    Object.assign(notificacao.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "1rem 1.5rem",
      borderRadius: "12px",
      color: "white",
      fontWeight: "600",
      zIndex: "1001",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
      maxWidth: "350px",
      backgroundColor: cores[tipo] || cores.info,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
    });
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
      notificacao.style.transform = "translateX(0)";
    }, 100);
    
    setTimeout(() => {
      notificacao.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notificacao.parentElement) {
          notificacao.parentElement.removeChild(notificacao);
        }
      }, 300);
    }, 4000);
  }

  iniciarRelogio() {
    const atualizarDataHora = () => {
      const agora = new Date();
      
      const opcoesDatas = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      };
      
      const opcoesHora = { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      };
      
      if (this.elementos.dataAtual) {
        this.elementos.dataAtual.textContent = agora.toLocaleDateString("pt-BR", opcoesDatas);
      }
      if (this.elementos.horaAtual) {
        this.elementos.horaAtual.textContent = agora.toLocaleTimeString("pt-BR", opcoesHora);
      }
    };
    
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
  }

  salvarDados() {
    if (!this.config.autoSave) return;
    
    try {
      localStorage.setItem("sistemaSenhasLimpo", JSON.stringify(this.filas));
    } catch (error) {
      console.warn("Não foi possível salvar os dados:", error);
    }
  }

  carregarDados() {
    try {
      const dados = localStorage.getItem("sistemaSenhasLimpo");
      if (dados) {
        const filasSalvas = JSON.parse(dados);
        if (filasSalvas.prioridade && filasSalvas.comum) {
          this.filas = filasSalvas;
        }
      }
    } catch (error) {
      console.warn("Não foi possível carregar os dados salvos:", error);
    }
  }

  salvarConfiguracoes() {
    try {
      localStorage.setItem("configSistemaSenhas", JSON.stringify(this.config));
    } catch (error) {
      console.warn("Não foi possível salvar as configurações:", error);
    }
  }

  carregarConfiguracoes() {
    try {
      const config = localStorage.getItem("configSistemaSenhas");
      if (config) {
        this.config = { ...this.config, ...JSON.parse(config) };
      }
      
      // Aplicar configurações na interface
      if (this.elementos.somAtivo) {
        this.elementos.somAtivo.checked = this.config.somAtivo;
      }
      if (this.elementos.autoSave) {
        this.elementos.autoSave.checked = this.config.autoSave;
      }
      if (this.elementos.volumeSom) {
        this.elementos.volumeSom.value = this.config.volume;
      }
      if (this.elementos.selectVoz) {
        this.elementos.selectVoz.value = this.config.vozAtiva || '';
      }
      
      // Aplicar configurações de intercalação
      const checkboxIntercalacao = document.getElementById("modo-intercalacao");
      if (checkboxIntercalacao) {
        checkboxIntercalacao.checked = this.config.modoIntercalacao;
      }
      
      const selectRatio = document.getElementById("ratio-intercalacao");
      if (selectRatio) {
        selectRatio.value = this.config.ratioIntercalacao.toString();
      }
    } catch (error) {
      console.warn("Não foi possível carregar as configurações:", error);
    }
  }

  prevenieFechamento(e) {
    const totalSenhas = this.filas.prioridade.aguardando.length + this.filas.comum.aguardando.length;
    
    if (totalSenhas > 0) {
      e.preventDefault();
      e.returnValue = "Existem senhas aguardando. Tem certeza que deseja sair?";
    }
  }

  // Métodos utilitários para backup/restore
  exportarDados() {
    const dados = {
      timestamp: new Date().toISOString(),
      filas: this.filas,
      config: this.config
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-senhas-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.mostrarNotificacao("Backup exportado com sucesso!", "success");
  }

  importarDados(arquivo) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (dados.filas) {
          this.filas = dados.filas;
        }
        if (dados.config) {
          this.config = { ...this.config, ...dados.config };
        }
        
        this.atualizarInterface();
        this.salvarDados();
        this.salvarConfiguracoes();
        this.mostrarNotificacao("Dados importados com sucesso!", "success");
      } catch (error) {
        this.mostrarNotificacao("Erro ao importar dados!", "error");
      }
    };
    reader.readAsText(arquivo);
  }
}

// Inicializar sistema quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.sistemaSenhas = new SistemaSenhasLimpo();
  
  // Adicionar informações de atalhos no console
  console.log(`
    🏥 Sistema de Senhas v2.3 - Layout Otimizado
    
    Atalhos de Teclado:
    Ctrl + P = Gerar senha prioritária
    Ctrl + C = Gerar senha comum
    Ctrl + 1 = Chamar próxima prioritária
    Ctrl + 2 = Chamar próxima comum
    Ctrl + A = Chamar próxima automática (quando modo intercalação ativado)
    ESC = Fechar modal
    
    Comandos do Console:
    sistemaSenhas.exportarDados() = Exportar backup
    sistemaSenhas.abrirModal() = Abrir configurações
  `);
});
