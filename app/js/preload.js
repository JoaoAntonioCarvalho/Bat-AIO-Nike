const { contextBridge, ipcRenderer } = require('electron'); // Preload (Isolated World)

contextBridge.exposeInMainWorld(
  'electronAPI',
  {

    salvarCartaoCredito: (numeroCartao, nomeCartao, mesValidade, anoValidade, cvvCartao, bandeiraCartao, codigoEspecie) => {
      ipcRenderer.send('salvar-cartao-credito', numeroCartao, nomeCartao, mesValidade, anoValidade, cvvCartao, bandeiraCartao, codigoEspecie);
      
    },

    enviaWebhookLinkParaOMainSalvar: (linkWebhook) => {
      ipcRenderer.send('salvar-link-webhook', linkWebhook);
    },

    salvarProxy: (proxy) => {
      ipcRenderer.send('adicionar-proxy-a-bdd', proxy);
    },

    deletaListaProxy: () => {
      ipcRenderer.send('deleta-lista-proxy');
    },

    salvaTokenDaConta: (token) => {
      ipcRenderer.send('salva-token-conta', token);
    },

    checarTodasAsInfos: () => {
      ipcRenderer.send('checar-todas-infos');
    },

    prepareQuicktask: (withProxy) => {
      ipcRenderer.send('preparar-quicktask', withProxy);
    },

    trocaQuicktaskTextContent: (message) => {
      ipcRenderer.on('troca-quicktask-textcontent', message);
    },

    iniciarQuicktask: (sku, withProxy) => {
      ipcRenderer.send('iniciar-quicktask', sku, withProxy);
    },

    iniciarDropTask: (sku, horarioInicio, withProxy) => {
      ipcRenderer.send('iniciar-drop-mode', sku, horarioInicio, withProxy, linkProduto);
    },
    enviaDados: (email, password) => {
      ipcRenderer.send('efetua-login', email, password);
    },

    mostraNoStatus: (message) => {
      ipcRenderer.on('mostra-no-status', message);
    },

    adicionaLog: (message) => {
      ipcRenderer.send('adiciona-log', message);
    }, 
    
    adicionarCookies: (cookieAbck, cookieBmsz) => {
      ipcRenderer.send('salvar-cookies', cookieAbck, cookieBmsz);
    },

    deletarCookies: () => {
      ipcRenderer.send('deletar-cookies')
    }

    }   
)