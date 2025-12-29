const consoleDeStatus = document.querySelector('#console');
function escreveNoConsole(message){
    let mensagem = hora() + message
    consoleDeStatus.textContent = mensagem;
    window.electronAPI.adicionaLog(mensagem);

};

// horario para utilizar no log



function hora(){
    let hora = new Date()
    let horario = hora.toLocaleTimeString('pt-br');
    let horaFormatada = `[${horario}] - `;

    return horaFormatada
}





// pegar dados do cartão e salvar cartão de crédito



let botaoAdicionaCartaoCredito = document.querySelector('.button-save-card');
let campoNumeroCartao = document.querySelector('#card-number');
let campoNomeCartao = document.querySelector('#card-name');
let campoMesValidadeCartao = document.querySelector('#month-validate');
let campoAnoValidadeCartao = document.querySelector('#year-validate');
let campoCvvCartao = document.querySelector('#card-cvv');
let campoBandeiraCartao = document.querySelector('#card-bandeira');
botaoAdicionaCartaoCredito.addEventListener('click', (event) => {
    event.preventDefault();

    let numeroCartao = campoNumeroCartao.value;
    let nomeCartao = campoNomeCartao.value;
    let mesValidade = campoMesValidadeCartao.value;
    let anoValidade = campoAnoValidadeCartao.value;
    let cvvCartao = campoCvvCartao.value;
    let bandeiraCartao = campoBandeiraCartao.value;
    let codigoEspecie;



    // verificacao de dados
    let dadosOk;

    if(mesValidade == 'wrong'){
        escreveNoConsole('Selecionar o mês de validade do cartão!');
        dadosOk = false;
    }

    if(anoValidade == 'wrong'){
        escreveNoConsole('Selecionar o ano de validade do cartão!');
        dadosOk = false;
    }

    if(bandeiraCartao == 'mastercard'){codigoEspecie = 'M1'; bandeiraCartao = 'MASTERCARD'; };
    if(bandeiraCartao == 'visa'){codigoEspecie = 'V1'; bandeiraCartao = 'VISA'; };
    if(bandeiraCartao == 'diners'){codigoEspecie = 'D1'; bandeiraCartao = 'DINERS'; };
    if(bandeiraCartao == 'amex'){codigoEspecie = 'AE1'; bandeiraCartao = 'AMERICAN EXPRESS'; };
    if(bandeiraCartao == 'hipercard'){codigoEspecie = 'H1'; bandeiraCartao = 'HIPERCARD'; };
    if(bandeiraCartao == 'elo'){codigoEspecie = '1E'; bandeiraCartao = 'ELO'; };

    if(bandeiraCartao == 'wrong'){
        escreveNoConsole('Selecionar uma bandeira de cartão!');
        dadosOk = false;
    };
    if(dadosOk != false){
        window.electronAPI.salvarCartaoCredito(numeroCartao, nomeCartao, mesValidade, anoValidade, cvvCartao, bandeiraCartao, codigoEspecie);


        // apos ja ter salvado os dados => limpando os campos

        campoNumeroCartao.value = '';
        campoNomeCartao.value = '';
        campoCvvCartao.value = '';
    };
});


//rodar relogio principal




function rodarRelogio(){
    let horaAgora; 
    let hora;
    let el = document.querySelector('#relogio-principal')

    setInterval(() => {
        hora = new Date();
        // horaAgora = `${hora.getHours()}:${hora.getMinutes()}:${hora.getSeconds()}`;
        horaAgora = hora.toLocaleTimeString('pt-BR')
        el.textContent = horaAgora;
    }, 400);
};


//função salvar webhook



let botaoAdicionarWebhook = document.querySelector('#webhook-button');
let campoTextoWebhook = document.querySelector('#campo-texto-webhook');
botaoAdicionarWebhook.addEventListener('click', (event) => {
    event.preventDefault();
    if(campoTextoWebhook.value == ''){
        escreveNoConsole('Erro: use um link válido');
    } else {
        let webhook = campoTextoWebhook.value;
        window.electronAPI.enviaWebhookLinkParaOMainSalvar(webhook);
    }
    

    campoTextoWebhook.value = '';
});

// recebendo e salvando proxy na base de dados



let campoTextoProxy = document.querySelector("#campo-texto-proxy");
let botaoAdicionarProxy = document.querySelector("#proxy-button-add")
botaoAdicionarProxy.addEventListener('click', (event) => {
    event.preventDefault();

    if(campoTextoProxy.value == ''){
        escreveNoConsole('Inserir um valor válido de proxy');
    }else {
        let proxy = `http://${campoTextoProxy.value}`;

        window.electronAPI.salvarProxy(proxy);
    };



    campoTextoProxy.value = '';
});

//deletando a lista de proxy
let botaoDeletaListaProxy = document.querySelector('#proxy-button-delete-all');
botaoDeletaListaProxy.addEventListener('click', (event) => {
    event.preventDefault();

    escreveNoConsole('2 cliques para deletar a lista de proxy');
})
botaoDeletaListaProxy.addEventListener('dblclick', (event) => {
    event.preventDefault();

    window.electronAPI.deletaListaProxy();
})





//pegando e salvando token da conta



let campoDaConta = document.querySelector('#campo-token-da-conta');
let botaoSalvarToken = document.querySelector('#botao-salva-token-conta');
botaoSalvarToken.addEventListener('click', (event) => {
    event.preventDefault();

    if(campoDaConta.value == ''){
        escreveNoConsole('Valor inválido de token');
    } else {
        let token = campoDaConta.value;
        window.electronAPI.salvaTokenDaConta(token);
    }
    campoDaConta.value = '';
});


// botao checar todas as infos

let botaoChecarTodasInfos = document.querySelector("#botao-checar-todas-infos");
botaoChecarTodasInfos.addEventListener('click', (event) => {
    event.preventDefault();

    window.electronAPI.checarTodasAsInfos();

});



// botao prepare quicktask


let botaoPrepareQuicktask = document.querySelector("#prepare-quicktask");
botaoPrepareQuicktask.addEventListener('click', () => {
    //verifica se o proxy esta ativado
    let proxyCheckArea = document.querySelector('#check-quicktask');
    console.log(proxyCheckArea.checked);

    //manda preload enviar o ipcmain fazer o post
    let campoProxyAtivado = proxyCheckArea.checked
    window.electronAPI.prepareQuicktask(campoProxyAtivado);

});



// botao play quicktask

let quicktaskNoHtml = document.querySelector('#quicktask-label');
let sku;

let botaoPlayQuicktask = document.querySelector("#play-quicktask");
let areaSkuQuicktask = document.querySelector("#sku-quicktask-proxy");
botaoPlayQuicktask.addEventListener('click', (event) => {
    event.preventDefault();

    if(quicktaskNoHtml.textContent == 'QUICKTASK PRONTA'){
        if(areaSkuQuicktask.value == ''){
            escreveNoConsole("ERRO: Sku inválido");
        } else {
            escreveNoConsole("Rodando quicktask");
            //rodar quicktask com o valor do sku
            sku = areaSkuQuicktask.value;
            let proxyCheckArea = document.querySelector('#check-quicktask');
            withProxy = proxyCheckArea.checked;
            window.electronAPI.iniciarQuicktask(sku, withProxy);
        };
    } else if(quicktaskNoHtml.textContent == 'QUICKTASK'){
        escreveNoConsole("ERRO: Preparar a task antes de iniciar!");
    };



    areaSkuQuicktask.value = '';
});


// botao play drop mode
let botaoPlayDropmode = document.querySelector("#play-dropmode");
let areaSkuDropmode = document.querySelector("#sku-dropmode");
let areaHorarioDropMode = document.querySelector("#horario-inicio-drop");
let areaLinkProduto = document.getElementById("link-product");

botaoPlayDropmode.addEventListener('click', (event) => {
    event.preventDefault();

    if(areaSkuDropmode.value == ''){
        escreveNoConsole("ERRO: Sku inválido");
    } else if(areaHorarioDropMode.value == ''){
        escreveNoConsole("ERRO: Horario iniciar inválido");
    } else {
        escreveNoConsole("Rodando Task Dropmode");
        let proxyAreaCheck = document.querySelector('#check-drop');
        sku = areaSkuDropmode.value;
        horarioInicio = areaHorarioDropMode.value;
        linkProduto = areaLinkProduto.value;
        withProxy = proxyAreaCheck.checked;
        window.electronAPI.iniciarDropTask(sku, horarioInicio, withProxy, linkProduto);
    }
})


//tratando os cookies 
let campoCookieAbck = document.getElementById("campo-inserir-cookies-abck");
let campoCookieBmsz = document.getElementById("campo-inserir-cookies-bmsz");
let botaoAddCookies = document.getElementById("botao-adicionar-cookies");
let botaoDeleteCookies = document.getElementById("botao-deletar-todos-cookies");

let cookieAbck;
let cookieBmsz;
botaoAddCookies.addEventListener("click", (event) => {
    event.preventDefault();

    if(campoCookieAbck.value == '' || campoCookieBmsz.value == ''){
        escreveNoConsole("ERRO: Cookie com valor inválido");

    } else {
        cookieAbck = campoCookieAbck.value;
        cookieBmsz = campoCookieBmsz.value;
        
        window.electronAPI.adicionarCookies(cookieAbck, cookieBmsz);

        campoCookieAbck.value = '';
        campoCookieBmsz.value = '';



        escreveNoConsole("Valores validos de cookie");
    }
})

botaoDeleteCookies.addEventListener("click", (event) => {
    event.preventDefault();

    escreveNoConsole("2 cliques no lixo para deletar todos os cookies salvos")
})

botaoDeleteCookies.addEventListener("dblclick", (event) => {
    event.preventDefault();

    window.electronAPI.deletarCookies();
})



// tudo que deve iniciar assim que carregar a pagina


window.onload = () => {
    rodarRelogio(); // roda o relogio

    window.electronAPI.trocaQuicktaskTextContent((event, message) => {
        quicktaskNoHtml.textContent = message;
        let botaoPreparaTask = document.getElementById("prepare-quicktask")
        botaoPreparaTask.setAttribute('style', "display: none")
    });
    window.electronAPI.mostraNoStatus((event, message) => {
        escreveNoConsole(message);
        //new Notification(message, {silent: true});
    })
};