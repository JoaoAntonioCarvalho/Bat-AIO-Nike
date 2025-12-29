const { initializeApp } = require ('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require ("firebase/auth");

const firebaseConfig = { //get the configuration set for the firebase app
  apiKey: "",
  authDomain: "",
  projectId: "batio-vip",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""

};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
let status;
module.exports.signIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      status = 'acesso autorizado';
      const user = userCredential.user;
      
    })
    .catch((error) => {
      //const errorCode = error.code;
      //const errorMessage = error.message;
      status = 'acesso negado'
    });
    return status
}
