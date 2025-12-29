const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const jsonfile = require('jsonfile-promised');
const fs = require('fs');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const axios = require('axios');
const Firebase = require('./auth/firebase-config.js');

let versao = 'VIP';


let acessoAutorizado;

let loginPage;
app.on('ready', () => {
    console.log('Pagina de login carregada com sucesso');

    loginPage = new BrowserWindow({
        width: 700,
        height: 500,
        maximizable: false,
        icon: './icon.ico', 
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            devTools: false,
            preload: path.join(`${__dirname}/auth/preload-login.js`)

        }

    })
    loginPage.loadFile('./auth/login.html')

})

ipcMain.on('login-app', (event, email, password) => {
    console.log(email, password);
    let status = null;
    status = Firebase.signIn(email, password);

    if(status == 'acesso autorizado'){
        acessoAutorizado = true;
        console.log('acesso autorizado');
    } else if(status == 'acesso negado'){
        acessoAutorizado = false;
        console.log('acesso negado');
        loginPage.webContents.send('erro-ao-login', status)

    }

    loginPage.on('closed', () => {
        if(acessoAutorizado == true){

        } else {
            app.quit();

        }
    })

    if(acessoAutorizado == true) {          
        loginPage.close();

        criaPastasFaltantes();

        let mainWindow;
        
        mainWindow = new BrowserWindow({ 
            width: 1000,
            height: 600,
            maximizable: false,
            icon: './icon.ico',
            autoHideMenuBar: true,
            resizable: false,
            webPreferences: {
                devTools: false,
                preload: path.join(`${__dirname}/app/js/preload.js`)
            },
        }); //cria janela principal
        
        mainWindow.loadFile('./app/index.html'); //carrega o html na janela principal
        
        mainWindow.on('closed', () => {
            app.quit();
        })
        
        // webhook pedido finalizado
        let arc;
        let linkWebhook;
        let hook;
        async function enviaWebhookPedidoFinalizado(modoTask, withProxy, nomeProduto, sku, tamanho, fotoProduto, versao, hook){
            stringarc = fs.readFileSync(`${__dirname}/data/webhook.json`, 'utf8');
            arc = JSON.parse(stringarc);
            linkWebhook = arc.webhook;
            let webhook = new Webhook(linkWebhook);
            if(hook == 'https://discord.com/api/webhooks/937788339384365097/KNt4lg47YuHtyHvRQtSG-6IHh1atbiWNTfb78mtuZZ9DSrXEt9ITEhgndq_s0d9tgUla'){
                hook = new Webhook('https://discord.com/api/webhooks/937788339384365097/KNt4lg47YuHtyHvRQtSG-6IHh1atbiWNTfb78mtuZZ9DSrXEt9ITEhgndq_s0d9tgUla');
            }
            try {
              const embed = new MessageBuilder()
        
              .setTitle('Compra efetuada com sucesso!')
              .setAuthor('BAT.IO', 'https://www.cgcreativeshop.com/wp-content/uploads/2018/10/baticon15102018.jpg')
              .addField('Modo', '||'+modoTask+'||', true)
              .addField('Proxy', '||'+withProxy+'||', true)
              .addField('Cookies', `${cookiesForData.length}`)
              .addField('Produto', nomeProduto)
              .addField('Ean', '||'+sku+'||', true)
              .addField('Tamanho', tamanho, true)
              .setColor('#5cff00')
              .setImage(fotoProduto)
              .setFooter(`BAT.IO Nike ${versao}`)
              await hook.send(embed);
              await webhook.send(embed);
              console.log('Webhook enviado com sucesso');
              webhookEnviado = true;
            } catch (err) {
              console.log(err)
              console.log('Erro ao enviar webhook');
              webhookEnviado = false;
            }
          }
        

        // adicionar todos os logs no logs.txt

        ipcMain.on('adiciona-log', (event, message) => {
            if(fs.existsSync(`${__dirname}/data/logs.txt`)){
                fs.appendFile(`${__dirname}/data/logs.txt`, `\n${message}`, (err) => {
                    if (err){
                        console.log(err);
                    } else {
                        console.log('Log adicionado ao arquivo!');
    
                    }
                  });
            } else {
                let date = new Date()
                fs.writeFile(`${__dirname}/data/logs.txt`, `Criado forçadamente ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`, (err) => {
                    if(err){
                        console.log(err);
                    } else{
                        console.log('Arquivo logs criado com sucesso');

                    }
                });
            }
            
        })


        
        // salvar dados do cartao em json
        
        
        
        ipcMain.on('salvar-cartao-credito', (event, numeroCartao, nomeCartao, mesValidade, anoValidade, cvvCartao, bandeiraCartao, codigoEspecie) => {
            let dados = {
                numeroCartao: numeroCartao,
                nomeCartao: nomeCartao,
                mesValidade: mesValidade,
                anoValidade: anoValidade,
                cvvCartao: cvvCartao,
                bandeiraCartao: bandeiraCartao,
                codigoEspecie: codigoEspecie
            }
        
            let arquivoCartao = `${__dirname}/data/cartao.json`;
            if(fs.existsSync(arquivoCartao)){
                console.log('Pasta ja existe, salvando dados dentro dela');
        
                jsonfile.writeFile(arquivoCartao, dados, {spaces: 8})
                    .then(() => {
                        console.log('Dados do cartao salvos com sucesso!');
                        mainWindow.webContents.send('mostra-no-status', 'Cartão salvo!')
                    }).catch((err) => {
                        console.log(err);
                        mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar cartão!')
                    });
        
                
            }else{
                //cria o arquivo e salva os dados do cartão 
        
                jsonfile.writeFile(arquivoCartao, {})
                    .then(() => {
                        console.log('Arquivo criado com sucesso');
                        jsonfile.writeFile(arquivoCartao, dados, {spaces: 8})
                            .then(() => {
                                console.log('Dados do cartao salvos com sucesso!');
                                mainWindow.webContents.send('mostra-no-status', 'Cartão salvo!')
                            }).catch((err) => {
                                console.log('Erro ao salvar dados do cartao ' + err)
                                mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar cartão!')
                            })
                    }).catch((err) => {
                        console.log(err);
                    }
                )
        
        
            }
        
            
        });       
        
        
        
        
        //salvar o webhook no banco de dados
        
        
        ipcMain.on('salvar-link-webhook', (event, linkWebhook) => {
        
            let dados = {
                webhook: linkWebhook
            }
        
            let arquivoWebhook = `${__dirname}/data/webhook.json`;
            if(fs.existsSync(arquivoWebhook)){
                console.log('Pasta ja existe, salvando novo webhook');
        
                jsonfile.writeFile(arquivoWebhook, dados, {spaces: 1})
                    .then(() => {
                        console.log('Webhook salvo com sucesso!');
                        mainWindow.webContents.send('mostra-no-status', 'Webhook salvo com sucesso!') // manda para o preload
        
                    }).catch((err) => {
                        console.log('Erro ao salvar webhook: ' + err);
                        mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar webhook') // manda para o preload
        
                    });
        
                
            }else{
                //cria o arquivo e salva os dados do cartão 
        
                jsonfile.writeFile(arquivoWebhook, {})
                    .then(() => {
                        console.log('Arquivo criado com sucesso');
                        jsonfile.writeFile(arquivoWebhook, dados, {spaces: 1})
                            .then(() => {
                                console.log('Webhook salvo com sucesso!');
                                mainWindow.webContents.send('mostra-no-status', 'Webhook salvo com sucesso!') // manda para o preload
                            }).catch((err) => {
                                console.log('Erro ao salvar webhook: ' + err)
                                mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar webhook') // manda para o preload
                            })
                    }).catch((err) => {
                        console.log(err);
                    }
                )
        
        
            }
            
        });
        
        
        
        // adicionar proxy a base de dados e criar um array de proxy
        
        
        
        ipcMain.on('adicionar-proxy-a-bdd', (event, proxy) => {
            
            let arquivoProxy = `${__dirname}/data/proxy.json`
            if(fs.existsSync(arquivoProxy)){
                
                let stringrequireArquivoProxy = fs.readFileSync(`${__dirname}/data/proxy.json`, 'utf8');
                let requireArquivoProxy = JSON.parse(stringrequireArquivoProxy);
                let arrayProxy = requireArquivoProxy.proxy
                arrayProxy.push(proxy);
                jsonfile.writeFile(arquivoProxy, {proxy: arrayProxy}, {spaces: 1})
                    .then(() => {
                        console.log('Proxy salvo com sucesso!');
                        mainWindow.webContents.send('mostra-no-status', 'Proxy salvo!');
        
                    }).catch((err) => {
                        console.log('Erro ao salvar ' + err);
                        mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar proxy!');
                    });
            }else {
        
                jsonfile.writeFile(arquivoProxy, {proxy: []}, {spaces: 1})
                    .then(() => {
                        console.log('Arquivo proxy.json criado com sucesso!');
        
                        let arrayProxy = []
                        arrayProxy.push(proxy);
                        jsonfile.writeFile(arquivoProxy, {proxy: arrayProxy}, {spaces: 1})
                            .then(() => {
                                console.log('Proxy salvo com sucesso!');
                                mainWindow.webContents.send('mostra-no-status', 'Proxy salvo!');
                            }).catch((err) => {
                                console.log('Erro ao salvar ' + err);
                                mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar proxy!');
                            });
        
                    }).catch((err) => {
                        console.log('Erro ao criar arquivo: ' + err);
                        mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar proxy => criar arq!');
                    });
            };
        });
               
        
        
        // deleta lista de proxy
        
        ipcMain.on('deleta-lista-proxy', () => {
            let arquivoProxy = `${__dirname}/data/proxy.json`;
            if(fs.existsSync(arquivoProxy)){
                fs.unlink(arquivoProxy, () => {
                    mainWindow.webContents.send('mostra-no-status', 'ProxyList limpa com sucesso!');
                    console.log('Lista de proxy deletada')
                });
            } else {
                mainWindow.webContents.send('mostra-no-status', 'ProxyList limpa com sucesso!');
                console.log('Não existe lista de proxy');
            }
        });
        
        
        
        // salva token da conta na base de dados
        
        ipcMain.on('salva-token-conta', (event, token) => {
            let arquivoToken = `${__dirname}/data/token.json`;
            if(fs.existsSync(arquivoToken)){
                jsonfile.writeFile(arquivoToken, {token: token}, {spaces: 1})
                    .then(() => {
                        mainWindow.webContents.send('mostra-no-status', 'Token salvo com sucesso');
                    }).catch((err) => {
                        mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar token');
                        console.log('Erro ao salvar token: ' + err);
                    });
            } else {
                jsonfile.writeFile(arquivoToken, {})
                    .then(() => {
                        jsonfile.writeFile(arquivoToken, {token: token}, {spaces: 1})
                            .then(() => {
                                mainWindow.webContents.send('mostra-no-status', 'Token salvo com sucesso');
                            }).catch((err) => {
                                mainWindow.webContents.send('mostra-no-status', 'Erro ao salvar token');
                                console.log('Erro ao salvar token ' + err);
                            });
        
                    }).catch((err) => {
                        console.log('Erro ao criar pasta ' + err);
                    });
            };
        });
        
        //salvar cookies
        ipcMain.on('salvar-cookies', (event, cookieAbck, cookieBmsz) => {

            console.log(cookieAbck, cookieBmsz);

            let arquivoCookies = `${__dirname}/data/cookies.json`;
            if(fs.existsSync(arquivoCookies)){

                stringCookiesJaSalvos = fs.readFileSync(arquivoCookies, 'utf8')
                arrayCookiesJaSalvos = JSON.parse(stringCookiesJaSalvos);

                console.log(arrayCookiesJaSalvos);

                arrayCookiesJaSalvos.push({
                    '_abck': cookieAbck,
                    'bm_sz': cookieBmsz
                })

                console.log(arrayCookiesJaSalvos);

                fs.writeFile(arquivoCookies, JSON.stringify(arrayCookiesJaSalvos), (err) => {
                    if(err){mainWindow.webContents.send('Erro ao salvar cookies'); throw err; };
                    console.log('Arquivo salvo com sucesso');
                    mainWindow.webContents.send('mostra-no-status', 'Cookies salvos');
                })

            } else {

                let array = [{'_abck': cookieAbck,'bm_sz': cookieBmsz}]

                fs.writeFile(arquivoCookies, JSON.stringify(array), (err) => {
                    if(err){mainWindow.webContents.send('Erro ao salvar cookies'); throw err; };
                    console.log('Arquivo salvo com sucesso');
                    mainWindow.webContents.send('mostra-no-status', 'Cookies salvos');
                })
            }
        })

        //deletar cookies
        ipcMain.on('deletar-cookies', () => {
            if(fs.existsSync(`${__dirname}/data/cookies.json`)){
                fs.unlink(`${__dirname}/data/cookies.json`, (err) => {
                    console.log('cookies file was deleted');
                    mainWindow.webContents.send('mostra-no-status', 'Lista de cookies deletada!')
                });
            } else {
                mainWindow.webContents.send('mostra-no-status', 'Lista de cookies deletada!')
            }
        })
        
        
        // checar todas as infos
        
        ipcMain.on('checar-todas-infos', () => {
            let cartao;
            if(fs.existsSync(`${__dirname}/data/cartao.json`)){
                let stringarc = fs.readFileSync(`${__dirname}/data/cartao.json`, 'utf8');
                let arc = JSON.parse(stringarc);
                if(arc.numeroCartao){
                    cartao = arc.numeroCartao;

                } else {
                    cartao = 'Não existe informações salvas';
                }
            
            } else {
                cartao = 'Não existe informações salvas';
            };
        
            let token;
            if(fs.existsSync(`${__dirname}/data/token.json`)){
                let stringarc = fs.readFileSync(`${__dirname}/data/token.json`, 'utf8');
                let arc = JSON.parse(stringarc);
                if(arc.token){
                    token = arc.token;

                } else {
                    token = 'Não existe informações salvas';

                }
            
            } else {
                token = 'Não existe informações salvas';
            };
        
            let proxy;
            if(fs.existsSync(`${__dirname}/data/proxy.json`)){
                let stringarc = fs.readFileSync(`${__dirname}/data/proxy.json`, 'utf8');
                let arc = JSON.parse(stringarc);
                if(arc.proxy){
                    proxyList = arc.proxy;
                    proxy = proxyList.length;
                } else {
                    proxy = 'Não existe informações salvas';

                }

            } else {
                proxy = 'Não existe informações salvas';
            };

            let qtdCookies;
            let arquivoCookies = `${__dirname}/data/cookies.json`
            if(fs.existsSync(arquivoCookies)){
                let stringCookies = fs.readFileSync(arquivoCookies, 'utf8');
                let arrayCookies = JSON.parse(stringCookies);
                if(arrayCookies.length == undefined){
                    qtdCookies = '0'
                } else {
                    qtdCookies = arrayCookies.length;

                }
            } else {
                qtdCookies = '0'
            }
            
            let arquivoWebhook = `${__dirname}/data/webhook.json`;
            if(fs.existsSync(arquivoWebhook)){
                let stringrequireWebhook = fs.readFileSync(arquivoWebhook, 'utf8');
                let requireWebhook = JSON.parse(stringrequireWebhook);
                if(requireWebhook.webhook){
                    let linkWebhook = requireWebhook.webhook;
                    hook = new Webhook(linkWebhook);

                    async function enviaWebhook(hook){
                        try {
                            const embed = new MessageBuilder()
                            .setTitle('Dados salvos:')
                            .setAuthor('BAT.IO', 'https://www.cgcreativeshop.com/wp-content/uploads/2018/10/baticon15102018.jpg')
                            .setDescription('Webhook: ' + linkWebhook + '\nCartão: ' + cartao + '\nToken: ' + token + '\nQtd proxy: ' + proxy + '\nQtdCookies: ' + qtdCookies)
                            .setColor('#b3ab0f')
                            .setFooter(`BatIO ${versao}`)
                            await hook.send(embed);;
                            console.log('Webhook enviado com sucesso');
                            mainWindow.webContents.send('mostra-no-status', 'Webhook enviado');
                        } catch (err) {
                          console.log('Erro ao enviar webhook - ' + err);
                          mainWindow.webContents.send('mostra-no-status', 'Erro ao enviar webhook: webhook inválido');
                        }
                    };
                    enviaWebhook(hook);
                } else {
                    mainWindow.webContents.send('mostra-no-status', 'Erro: salve um webhook primeiro');
                };
            } else {
                mainWindow.webContents.send('mostra-no-status', 'Erro: salve um webhook primeiro');
            };
        });
        
        
        
        // preparar quicktask
        // dados que serão utilizados em variáveis
        let proxiesForData; //array de proxy
        
        let numeroCartaoForData; // numero do cartao
        let nomeCartaoForData; //nome no cartao
        let mesValidadeCartaoForData; //mes de validade do cartao
        let anoValidadeCartaoForData; //ano de validade do cartao
        let cvvCartaoForData; //cvv do cartao
        let bandeiraCartaoForData; //bandeira do cartao
        let codigoEspecieCartaoForData; //codigo especie do cartao
                
        let tokenForData; //token da conta
        
        let cookiesForData; //array de cookies
        
        let modoTask;
        
        let proxyParaRequests;
        
        let proxy;
        ipcMain.on('preparar-quicktask', async (event, withProxy) => {
            
            await checaApi();
            if(apiOnline == false){
                return
            } else {
                withProxy = withProxy;
            
                verificaDados(withProxy);
                if(dadosOk == true){
                    mainWindow.webContents.send("mostra-no-status", "Preparando task!");
                    await getEndereco(tokenForData, cookieABCKForData, cookieBMSZForData);
                    if(getEnderecoOk == false){
                        while(getEnderecoOk == false){
                            await sleep(1000);
                            await getEndereco(tokenForData, cookieABCKForData, cookieBMSZForData);
                        };
                    };
                    if(getEnderecoOk == true){
                        mainWindow.webContents.send("mostra-no-status", `Quicktask pronta para iniciar`);
                        mainWindow.webContents.send("troca-quicktask-textcontent", "QUICKTASK PRONTA");
                    };
                } else {
                    return
                };       
            }
        });
        
        
        // play quicktask
        
        ipcMain.on('iniciar-quicktask', async (event, sku, withProxy) => {
            
            modoTask = 'Quicktask'

            if(withProxy == false){
                proxy = 'nulo';
            } else if(withProxy == true){
                proxy = trocaProxy(proxiesForData)
            }
            await adicionar(tokenForData, sku, cookieABCKForData, cookieBMSZForData, proxy);
            while(produtoAdicionado != true) {
              await sleep(1000); //delay de 1s para adicionar
              trocaCookieAbck(cookiesForData)
              if(withProxy == false){
                proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }       
                await adicionar(tokenForData, sku, cookieABCKForData, cookieBMSZForData, proxy);
            };
            
            await getCarrinhos(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, proxy);
            while(getCarrinhosOk == false){
              await sleep(1000);
              trocaCookieAbck(cookiesForData)
              if(withProxy == false){
                proxy = 'nulo';
            } else if(withProxy == true){
                proxy = trocaProxy(proxiesForData)
            }              
            await getCarrinhos(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, proxy);
            };
        
        
            const data = new Date();
            const dataFormataded = data.toLocaleDateString(
              'pt-BR',
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',    
              }
            )
            const dataFormatada = dataFormataded;
          
            await entregas(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, dataFormatada, itemCarrinhoID, sku, proxy);
            while(entregasOk != true){
              await sleep(1000);
              trocaCookieAbck(cookiesForData)
              if(withProxy == false){
                proxy = 'nulo';
            } else if(withProxy == true){
                proxy = trocaProxy(proxiesForData)
            }              
            await entregas(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, dataFormatada, itemCarrinhoID, sku, proxy);
            };
        
            trocaCookieAbck(cookiesForData)
            console.log('Processando pagamento')
            mainWindow.webContents.send("mostra-no-status", "Processando pagamento");
            await processamentoPedido(tokenForData, cookieABCKForData, cookieBMSZForData, mesValidadeCartaoForData, anoValidadeCartaoForData, bandeiraCartaoForData, numeroCartaoForData, nomeCartaoForData, cvvCartaoForData, codigoEspecieCartaoForData, proxy)
            while(pedidoFinalizado != true){
              await sleep(1000);
              trocaCookieAbck(cookiesForData)
              mainWindow.webContents.send("mostra-no-status", "Processando pagamento");
              console.log('Processando pagamento')
              if(withProxy == false){
                proxy = 'nulo';
            } else if(withProxy == true){
                proxy = trocaProxy(proxiesForData)
            }        
            await processamentoPedido(tokenForData, cookieABCKForData, cookieBMSZForData, mesValidadeCartaoForData, anoValidadeCartaoForData, bandeiraCartaoForData, numeroCartaoForData, nomeCartaoForData, cvvCartaoForData, codigoEspecieCartaoForData, proxy)
            };
            if(pedidoFinalizado == true){
                await enviaWebhookPedidoFinalizado(modoTask, withProxy, nomeProduto, sku, tamanho, fotoProduto, versao, 'https://discord.com/api/webhooks/937788339384365097/KNt4lg47YuHtyHvRQtSG-6IHh1atbiWNTfb78mtuZZ9DSrXEt9ITEhgndq_s0d9tgUla');
            };
        })
        
        // play drop mode
        
        ipcMain.on('iniciar-drop-mode', async (event, sku, horarioInicio, withProxy, linkProduto) => {

            modoTask = 'Drop';

            await checaApi();
            if(apiOnline == false){
                return
            } else {
                verificaDados(withProxy);
                if(dadosOk == true){
                    mainWindow.webContents.send("mostra-no-status", "Preparando task!");
                    await getEndereco(tokenForData, cookieABCKForData, cookieBMSZForData);
                    if(getEnderecoOk == false){
                        while(getEnderecoOk == false){
                            await sleep(1000);
                            await getEndereco(tokenForData, cookieABCKForData, cookieBMSZForData);
                        };
                    };
                    if(getEnderecoOk == true){
                        mainWindow.webContents.send("mostra-no-status", `Aguardando ${horarioInicio}`);
                    };
                } else {
                    return
                };                                    
            
                    
                while(new Date(horarioInicio).getTime() >= new Date().getTime()) {
                    await sleep(10);
                };
                if(withProxy == false){
                    proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }            
                await adicionar(tokenForData, sku, cookieABCKForData, cookieBMSZForData, proxy, linkProduto);
                while(produtoAdicionado != true) {
                  await sleep(1000); //delay de 1s para adicionar
                  trocaCookieAbck(cookiesForData)
                  if(withProxy == false){
                    proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }              
                await adicionar(tokenForData, sku, cookieABCKForData, cookieBMSZForData, proxy, linkProduto);
            };
                
                await getCarrinhos(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, proxy);
                while(getCarrinhosOk == false){
                  await sleep(1000);
                  trocaCookieAbck(cookiesForData)
                  if(withProxy == false){
                    proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }              
                await getCarrinhos(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, proxy);
                };
            
            
                const data = new Date();
                const dataFormataded = data.toLocaleDateString(
                  'pt-BR',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',    
                  }
                )
                const dataFormatada = dataFormataded;
              
                await entregas(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, dataFormatada, itemCarrinhoID, sku, proxy);
                while(entregasOk != true){
                  await sleep(1000);
                  trocaCookieAbck(cookiesForData)
                  if(withProxy == false){
                    proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }              
                await entregas(tokenForData, cookieABCKForData, cookieBMSZForData, enderecoID, dataFormatada, itemCarrinhoID, sku, proxy);
                };
            
                trocaCookieAbck(cookiesForData)
                console.log('Processando pagamento')
                mainWindow.webContents.send("mostra-no-status", "Processando pagamento");
                await processamentoPedido(tokenForData, cookieABCKForData, cookieBMSZForData, mesValidadeCartaoForData, anoValidadeCartaoForData, bandeiraCartaoForData, numeroCartaoForData, nomeCartaoForData, cvvCartaoForData, codigoEspecieCartaoForData, proxy)
                while(pedidoFinalizado != true){
                  await sleep(1000);
                  trocaCookieAbck(cookiesForData)
                  mainWindow.webContents.send("mostra-no-status", "Processando pagamento");
                  console.log('Processando pagamento')
                  if(withProxy == false){
                    proxy = 'nulo';
                } else if(withProxy == true){
                    proxy = trocaProxy(proxiesForData)
                }        
                    await processamentoPedido(tokenForData, cookieABCKForData, cookieBMSZForData, mesValidadeCartaoForData, anoValidadeCartaoForData, bandeiraCartaoForData, numeroCartaoForData, nomeCartaoForData, cvvCartaoForData, codigoEspecieCartaoForData, proxy)
                };
                if(pedidoFinalizado == true){
                    await enviaWebhookPedidoFinalizado(modoTask, withProxy, nomeProduto, sku, tamanho, fotoProduto, versao, 'https://discord.com/api/webhooks/937788339384365097/KNt4lg47YuHtyHvRQtSG-6IHh1atbiWNTfb78mtuZZ9DSrXEt9ITEhgndq_s0d9tgUla');
            
                };
            }            
        })
        
        
        
        // funções de requisições
        
        let getEnderecoOk = false;
        let enderecoID;
        async function getEndereco(token, abckCookie, bmszCookie){
                
            let headers = {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-client-token": token,
                "x-cv-id": "1",
                "cookie": `_abck=${abckCookie.replace(/ /g, '+')}; bm_sz=${bmszCookie.replace(/ /g, '+')}`,
                "origin": "https://www.nike.com.br",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
                "Referer": "https://www.nike.com.br/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            };

            try {

                const response = await axios.get('https://apigateway.nike.com.br/v4.2/endereco', {
                    headers: headers
                });

                if(response.status >= 200 && response.status <= 299){
                    let body = await response.data;
                    if(body[0].id){
                      enderecoID = body[0].id;
                      console.log(`Dados do endereco pegos com sucesso! => ` + enderecoID);
                      mainWindow.webContents.send("mostra-no-status", "Task pronta para iniciar!");
                      getEnderecoOk = true;
                
                    };
                  } else {
                    if(response.status == 403){
                      console.log(`Erro ao pegar dados do endereço! Status: ${response.status} - BANIDO!`);
                      mainWindow.webContents.send("mostra-no-status", "Erro ao pegar dados do end - 403");
                      trocaCookieAbck(cookiesForData);
                    };
                    if(response.status != 403){
                      console.log(`Erro ao pegar dados do endereco! => ${response.status}`);
                      mainWindow.webContents.send("mostra-no-status", "Erro ao pegar dados do end - " + response.status);
                
                    };
                    getEnderecoOk = false;

                }

            } catch (error) {
                console.log(error)
                getEnderecoOk = false;
            }
        

        }
        
        // funçoes relacionadas com api de requests
        
        let produtoAdicionado;
        async function adicionar(token, sku, cookie, bmsz, proxy, linkProduto) {    
        
            if(linkProduto == undefined){
                linkProduto = undefined
            }

            try {
              const response = await axios.get(`http://127.0.0.1:6666/adicionar?token=${token}&cookie=${cookie}&sku=${sku}&proxy=${proxy}&bmsz=${bmsz}&linkProduto=${linkProduto}`);
              console.log(response.data.data);
              let status = response.data.data;
              if(status >= 200 && status <= 299){
                console.log('Status: ' + status + ' - produto adicionado com sucesso');
                mainWindow.webContents.send("mostra-no-status", "Produto adicionado!");
                produtoAdicionado = true;
              } else if(status == 'Erro com a request') {
                console.log('Erro no fetch da request');
                mainWindow.webContents.send("mostra-no-status", "Erro na requisição de adicionar");
                produtoAdicionado = false;
              }
              else {
                console.log('Status: ' + status + ' - erro ao adicionar o produto');
                mainWindow.webContents.send("mostra-no-status", `Erro ${status} ao adicionar`);
                produtoAdicionado = false;
              }
            } catch (error) {
              console.error(error);
              mainWindow.webContents.send("mostra-no-status", "INTERNAL ERROR: failed to send request to own API /adicionar");
              produtoAdicionado = false;
            }
        };
        
        let getCarrinhosOk = false;
        let itemCarrinhoID;
        let nomeProduto;
        let tamanho;
        let fotoProduto;
        async function getCarrinhos(token, cookie, bmsz, enderecoID, proxy) {
        
            try {
              const response = await axios.get(`http://127.0.0.1:6666/carrinho?token=${token}&cookie=${cookie}&enderecoId=${enderecoID}&proxy=${proxy}&bmsz=${bmsz}`);
              console.log(response.data.data);
              let resp = response.data.data;
              if(resp == 'Sem os paramêtros' || resp == 'Erro com a request'){
                console.log('Status: ' + resp + ' - erro no get carrinhos');
                mainWindow.webContents.send("mostra-no-status", `Erro ${resp} no frete 1/2`);
                getCarrinhosOk = false;
              } else if(resp.mensagensCarrinhoStatusSucesso){
                    if(resp.mensagensCarrinhoStatusSucesso == true){
                        console.log('Status: ' + resp + ' - Get carrinhos executado com sucesso');
                        mainWindow.webContents.send("mostra-no-status", "Frete 1/2 bem sucedido");
                        getCarrinhosOk = true;
        
                        itemCarrinhoID = resp.enderecos[0].grupoEntrega[0].tiposDeEntrega[0].itens[0].itemCarrinhoId;
                        nomeProduto = resp.enderecos[0].grupoEntrega[0].tiposDeEntrega[0].itens[0].descricao;
                        tamanho = resp.enderecos[0].grupoEntrega[0].tiposDeEntrega[0].itens[0].tamanho;
                        fotoProduto = resp.enderecos[0].grupoEntrega[0].tiposDeEntrega[0].itens[0].imagem;
                    } else {
                        getCarrinhosOk = false;
                    }
        
              }
            } catch (error) {
              console.error(error);
              mainWindow.webContents.send("mostra-no-status", "INTERNAL ERROR: failed to send request to own API /gCar1.2");
              getCarrinhosOk = false;
            }
        };
        
        let entregasOk = false;
        async function entregas(token, cookie, bmsz, enderecoID, dataFormatada, itemCarrinhoId, itemSku, proxy) {
        
            try {
                const response = await axios.get(`http://127.0.0.1:6666/frete?token=${token}&cookie=${cookie}&enderecoId=${enderecoID}&dataFormatada=${dataFormatada}&itemCarrinhoId=${itemCarrinhoId}&itemSku=${itemSku}&proxy=${proxy}&bmsz=${bmsz}`);
                console.log(response.data.data);
                if(response.data.data >= 200 && response.data.data <= 299) {
                    console.log('Frete gerado com sucesso')
                    entregasOk = true
                    mainWindow.webContents.send("mostra-no-status", "Frete gerado com sucesso");
                } else {
                    console.log(`Erro ${response.data.data} ao gerar frete`)
                    entregasOk = false
                    mainWindow.webContents.send("mostra-no-status", `Erro ${response.data.data} ao gerar frete`);
                }
              } catch (error) { 
                console.error(error);
                mainWindow.webContents.send("mostra-no-status", "INTERNAL ERROR: failed to send request to own API /frete");
                entregasOk = false
            }
        };
        
        let pedidoFinalizado;
        async function processamentoPedido(token, cookie, bmsz, mesCartao, anoCartao, bandeiraCartao, numeroCartao, titularCartao, cvvCartao, codigoEspecie, proxy) {
        
            try {
                const response = await axios.get(`http://127.0.0.1:6666/pagar?token=${token}&cookie=${cookie}&mesCartao=${mesCartao}&anoCartao=${anoCartao}&bandeiraCartao=${bandeiraCartao}&numeroCartao=${numeroCartao}&titularCartao=${titularCartao}&codigoSegurancaCartao=${cvvCartao}&codigoEspecie=${codigoEspecie}&proxy=${proxy}&bmsz=${bmsz}`);
                console.log(response.data.data);
                if(response.data.data == 'Pedido finalizado com sucesso!') {
                    console.log('Pedido finalizado com sucesso!')
                    pedidoFinalizado = true
                    mainWindow.webContents.send("mostra-no-status", "Pedido finalizado com sucesso");
                } else {
                    console.log(response.data.data)
                    pedidoFinalizado = false
                    mainWindow.webContents.send("mostra-no-status", response.data.data);
                }
              } catch (error) { 
                mainWindow.webContents.send("mostra-no-status", "INTERNAL ERROR: failed to send request to own API /pagar");
                pedidoFinalizado = false
            }
        };


        //api online ou offline
        let apiOnline;
        async function checaApi(){
            try {
                const response = await axios.get(`http://127.0.0.1:6666/testarApi`)
                if(response.data.data == 'api online'){
                    apiOnline = true
                    console.log('Api aberta')
                } else {
                    apiOnline = false
                    console.log('Api não identificada | fechada')
                }
            } catch (error) {
                console.log(error);
                mainWindow.webContents.send("mostra-no-status", "ERRO: Abra a API para rodar!");
                apiOnline = false

            }
        }
        
        
        // funções para manusear cookies e proxies
        
        
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        };
        
        let contadorProxy = 0;
        function trocaProxy(proxyList){
            let numeroProxies = proxyList.length;
            if(proxyParaRequests == true){
                if(contadorProxy < numeroProxies){
        
                    numProxy = proxyList[contadorProxy];        
                    contadorProxy = contadorProxy+1;
                } else {
            
                    contadorProxy = 0;
                    numProxy = proxyList[contadorProxy];
                }
                proxy_res_ = numProxy
            } else if (proxyParaRequests == false) {
                proxy_res_ = null;
            }
            
            
            return proxy_res_;
        };
        
        let contadorArrayCookies = 1;
        let cookieABCKForData;
        let cookieBMSZForData;
        function trocaCookieAbck(arrayCookies){
          if(contadorArrayCookies >= arrayCookies.length){
            console.log('Reutilizando cookies');
            contadorArrayCookies = 0;
          }
          cookieABCKForData = arrayCookies[contadorArrayCookies]._abck;
          cookieBMSZForData = arrayCookies[contadorArrayCookies].bm_sz;
          contadorArrayCookies++;
          console.log('Trocando cookies');
          mainWindow.webContents.send("mostra-no-status", "Trocando cookies");
        
        };


        // função que verifica dados para task
        let dadosOk;
        function verificaDados(withProxy){

            const arqProxy = `${__dirname}/data/proxy.json`;
            const arqCartao = `${__dirname}/data/cartao.json`;
            const arqWebhook = `${__dirname}/data/webhook.json`;
            const arqToken = `${__dirname}/data/token.json`;
            const arqCookies = `${__dirname}/data/cookies.json`;
    
            console.log('withProxy = ' + withProxy);

            if(withProxy == true){
                proxyParaRequests = true;
            } else {
                proxyParaRequests = false;
                proxiesForData = ["null"];
            };
    
            // verificando se tem proxy salvo
            if(withProxy == true){
                if(fs.existsSync(arqProxy)){
                    let stringReqProxy = fs.readFileSync(arqProxy, 'utf8');
                    let reqProxy = JSON.parse(stringReqProxy);
                    if(reqProxy.proxy){
                        if(reqProxy.proxy.length > 0){
                            console.log('Existem proxy salvos');
                            proxiesForData = reqProxy.proxy;
                        } else {
                            console.log('Erro: Não existem proxy salvos => lista vazia');
                            mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem proxies salvos => lista vazia');
                            return
                        }
                    } else {
                        console.log('Erro: Não existe array proxy na pasta de proxy');
                        mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem proxies salvos => arr não existente');
                        return
                    }
                } else {
                    console.log('Erro: Não existe pasta de proxy');
                    mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem proxies salvos => pasta não existente');
                    return
                }
            };
    
            if(fs.existsSync(arqCartao)){
                let stringReqCartao = fs.readFileSync(arqCartao, 'utf8');
                let reqCartao = JSON.parse(stringReqCartao);
                if(reqCartao.numeroCartao && reqCartao.nomeCartao && reqCartao.mesValidade && reqCartao.anoValidade && reqCartao.cvvCartao && reqCartao.bandeiraCartao){
                    if(reqCartao.numeroCartao.length > 2 && reqCartao.nomeCartao.length > 2 && reqCartao.mesValidade && reqCartao.anoValidade && reqCartao.cvvCartao && reqCartao.bandeiraCartao){
                        numeroCartaoForData = reqCartao.numeroCartao;
                        nomeCartaoForData = reqCartao.nomeCartao;
                        mesValidadeCartaoForData = reqCartao.mesValidade;
                        anoValidadeCartaoForData = reqCartao.anoValidade;
                        cvvCartaoForData = reqCartao.cvvCartao;
                        bandeiraCartaoForData = reqCartao.bandeiraCartao;
                        codigoEspecieCartaoForData = reqCartao.codigoEspecie;
                    } else {
                        console.log('Erro: Não existe cartao salvo => pasta vazia');
                        mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem cartao salvo => pasta vazia');
                        return
                    }
                } else {
                    console.log('Erro: Não existe cartao salvo => pasta vazia');
                    mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem cartao salvo => pasta vazia');
                    return 
                }
            } else {
                console.log('Erro: Não existe pasta de cartao');
                mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe cartao salvo => pasta não existente');
                return
            };
    
            if(fs.existsSync(arqWebhook)){
                let stringReqWebhook = fs.readFileSync(arqWebhook, 'utf8');
                let reqWebhook = JSON.parse(stringReqWebhook);
                if(reqWebhook.webhook){
                    if(reqWebhook.webhook.length > 1){
                        linkWebhookForData = reqWebhook.webhook;
                    } else {
                        console.log('Erro: Não existe webhook salvo na pasta => variavel vazia');
                        mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe webhook salvo => valor vazio');
                        return
                    }
                } else {
                    console.log('Erro: Não existe webhook salvo na pasta => variavel vazia');
                    mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe webhook salvo => valor vazio');
                    return
                }
            } else {
                console.log('Erro: Não existe pasta de webhook');
                mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe webhook salvo => pasta não existente');
                return
            };
    
            if(fs.existsSync(arqToken)){
                let stringReqToken = fs.readFileSync(arqToken);
                let reqToken = JSON.parse(stringReqToken);
                if(reqToken.token){
                    if(reqToken.token.length > 1){
                        tokenForData = reqToken.token;
                    } else {
                        console.log('Erro: Não existe token salvo na pasta => variavel vazia');
                        mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe token salvo => valor vazio');
                        return
                    }
                } else {
                    console.log('Erro: Não existe token salvo na pasta => variavel vazia');
                    mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe token salvo => valor vazio');
                    return
                }
            } else {
                console.log('Erro: Não existe pasta de token');
                mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe token salvo => pasta não existente');
                return
            };

            if(fs.existsSync(arqCookies)){
                const reqCookies = fs.readFileSync(arqCookies, 'utf8');
                let arrayCookies = JSON.parse(reqCookies);
                if(arrayCookies.length > 0){
                    cookiesForData = arrayCookies;
                    cookieABCKForData = arrayCookies[0]._abck;
                    cookieBMSZForData = arrayCookies[0].bm_sz;
                    console.log(cookiesForData);
                } else {
                    console.log('Erro: Não existe cookies salvos na pasta => array vazio');
                    mainWindow.webContents.send('mostra-no-status', 'Erro: Não existem cookies salvos');
                    return
                }
            } else {
                console.log('Erro: Não existe pasta de cookies');
                mainWindow.webContents.send('mostra-no-status', 'Erro: Não existe cookies salvos => pasta não existente');
                return
            }
    
            mainWindow.webContents.send("mostra-no-status", "Dados ok!");
            console.log('Todos os dados estão ok');
            dadosOk = true;
    
        };


        // função que verifica se o user deletou alguma pasta e cria

        function criaPastasFaltantes(){

            let arquivoLogs = `${__dirname}/data/logs.txt`;
            let arquivoCartao = `${__dirname}/data/cartao.json`;
            let arquivoProxy = `${__dirname}/data/proxy.json`;
            let arquivoToken = `${__dirname}/data/token.json`;
            let arquivoWebhook = `${__dirname}/data/webhook.json`;
            let arquivoCookies = `${__dirname}/data/cookies.json`;


            if(fs.existsSync(arquivoLogs)){
                console.log('Existe arquivo logs');
            } else {
                let date = new Date()
                fs.writeFile(arquivoLogs, `Criado forçadamente ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`, (err) => {
                    if(err){
                        console.log(err);
                    } else{
                        console.log('Arquivo logs criado com sucesso');

                    }
                });
            }

            if(fs.existsSync(arquivoCartao)){
                console.log('Existe arquivo cartao');
            } else {
                jsonfile.writeFile(arquivoCartao, {})
                    .then(() => {
                        console.log('Arquivo cartao criado com sucesso')
                    })
                    .catch((err) => {
                        console.log('Erro ao criar arquivo cartao: ' + err)
                    })
            }

            if(fs.existsSync(arquivoProxy)){
                console.log('Existe arquivo proxy');
            } else {
                jsonfile.writeFile(arquivoProxy, {proxy: []})
                    .then(() => {
                        console.log('Arquivo proxy criado com sucesso')
                    })
                    .catch((err) => {
                        console.log('Erro ao criar arquivo proxy: ' + err)
                    })
            }

            if(fs.existsSync(arquivoToken)){
                console.log('Existe arquivo Token');
            } else {
                jsonfile.writeFile(arquivoToken, {})
                    .then(() => {
                        console.log('Arquivo Token criado com sucesso')
                    })
                    .catch((err) => {
                        console.log('Erro ao criar arquivo Token: ' + err)
                    })
            }

            if(fs.existsSync(arquivoWebhook)){
                console.log('Existe arquivo Webhook');
            } else {
                jsonfile.writeFile(arquivoWebhook, {})
                    .then(() => {
                        console.log('Arquivo Webhook criado com sucesso')
                    })
                    .catch((err) => {
                        console.log('Erro ao criar arquivo Webhook: ' + err)
                    })
            }

            if(fs.existsSync(arquivoCookies)){
                console.log('Existe arquivo cookies');
            } else {
                jsonfile.writeFile(arquivoCookies, [])
                    .then(() => {
                        console.log('Arquivo cookies criado com sucesso')
                    })
                    .catch((err) => {
                        console.log('Erro ao criar arquivo cookies: ' + err)
                    })
            }

        }
    } else if(acessoAutorizado == false) {
        console.log('Acesso negado')
        
    }
    
})