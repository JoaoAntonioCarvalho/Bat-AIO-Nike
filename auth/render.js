const campoEmail = document.querySelector('#email');
const campoPassword = document.querySelector('#password');

const botaoLogin = document.querySelector('#botao-login');

botaoLogin.addEventListener('click', (event) => {
    event.preventDefault();

    email = campoEmail.value;
    password = campoPassword.value;

    window.loginAPI.salvarCartaoCredito(email, password);

})

window.onload = () => {
    console.log('evento onload');
    
    window.loginAPI.erroNoLogin((event, message) => {
        new Notification(message, {silent: true});

        let consolezinho = document.querySelector('#console');
        consolezinho.textContent = 'Acesso negado!';

    })
};