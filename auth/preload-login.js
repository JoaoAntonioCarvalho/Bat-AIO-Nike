const { contextBridge, ipcRenderer } = require('electron'); // Preload (Isolated World)

contextBridge.exposeInMainWorld(
    'loginAPI',
    {
        salvarCartaoCredito: (email, password) => {
            ipcRenderer.send('login-app', email, password);
            
        },
        erroNoLogin: (message) => {
            ipcRenderer.on('erro-ao-login', message)
        }        
    }   
)