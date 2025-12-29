const { initializeApp } = require ('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require ("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyAMr_Y4c15PM2uYGZceVtBNlczYSRA1Xgc",
  authDomain: "batio-vip.firebaseapp.com",
  projectId: "batio-vip",
  storageBucket: "batio-vip.appspot.com",
  messagingSenderId: "914944149429",
  appId: "1:914944149429:web:c65fc717acd806d6547bfc"

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
