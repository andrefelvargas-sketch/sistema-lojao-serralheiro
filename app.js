import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  updatePassword,
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvLd2Csbhtc6mk4aubUKCbOmxdiRUsde4",
  authDomain: "lojao-serralheiro-app.firebaseapp.com",
  projectId: "lojao-serralheiro-app",
  storageBucket: "lojao-serralheiro-app.firebasestorage.app",
  messagingSenderId: "550951409624",
  appId: "1:550951409624:web:c9932a80c1b5dbfbab84ad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos do DOM
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const loginUserInput = document.getElementById('loginUser');
const loginSenhaInput = document.getElementById('loginSenha');
const loginErro = document.getElementById('loginErro');
const btnLogout = document.getElementById('btnLogout');
const userInfo = document.getElementById('userInfo');

// Modal de Troca de Senha
const modalTrocaElement = document.getElementById('modalTrocaSenha');
const modalTrocaSenha = new bootstrap.Modal(modalTrocaElement);
const formTrocaSenha = document.getElementById('formTrocaSenha');
const novaSenhaInput = document.getElementById('novaSenha');
const confirmaNovaSenhaInput = document.getElementById('confirmaNovaSenha');
const trocaSenhaErro = document.getElementById('trocaSenhaErro');

// Botão Toggle Senha
const btnToggleSenha = document.getElementById('btnToggleSenha');
const iconEye = document.getElementById('iconEye');

if (btnToggleSenha && loginSenhaInput) {
  btnToggleSenha.addEventListener('click', () => {
    const isPassword = loginSenhaInput.getAttribute('type') === 'password';
    loginSenhaInput.setAttribute('type', isPassword ? 'text' : 'password');
    iconEye.classList.toggle('bi-eye', isPassword);
    iconEye.classList.toggle('bi-eye-slash', !isPassword);
  });
}

// Converte nome digitado em e-mail corporativo (preserva senhas exatas)
function formatarEntradaParaEmail(entrada) {
  const limpo = entrada.trim();
  if (limpo.includes('@')) {
    return limpo;
  }
  
  // Trata casos específicos do Admin
  const entradaNormalizada = limpo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (entradaNormalizada === 'andre vargas' || entradaNormalizada === 'andre') {
    return 'andrefel.vargas@gmail.com';
  }

  // Converte "Allan Henrique" ou "allan.henrique" para "allan.henrique@lojaoserralheiro.com.br"
  const formatoUsuario = entradaNormalizada.replace(/\s+/g, '.');
  return `${formatoUsuario}@lojaoserralheiro.com.br`;
}

// Monitorar Autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
    if (userInfo) userInfo.innerText = `Logado como: ${user.email}`;
  } else {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
});

// Ação de Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErro.style.display = 'none';

  const usuarioDigitado = loginUserInput.value;
  const senhaDigitada = loginSenhaInput.value; // Senha mantida EXATAMENTE como foi digitada
  const emailFinal = formatarEntradaParaEmail(usuarioDigitado);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailFinal, senhaDigitada);
    
    // Se a senha for a padrão inicial, solicita obrigatoriamente a troca de senha
    if (senhaDigitada === 'lojao6081') {
      modalTrocaSenha.show();
    }
  } catch (error) {
    loginErro.style.display = 'block';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      loginErro.innerText = 'Usuário ou senha incorretos.';
    } else if (error.code === 'auth/too-many-requests') {
      loginErro.innerText = 'Muitas tentativas falhas. Tente novamente em instantes.';
    } else {
      loginErro.innerText = 'Erro ao entrar: ' + error.message;
    }
  }
});

// Ação de Troca de Senha (Primeiro Acesso)
formTrocaSenha.addEventListener('submit', async (e) => {
  e.preventDefault();
  trocaSenhaErro.style.display = 'none';

  const nova = novaSenhaInput.value;
  const confirma = confirmaNovaSenhaInput.value;

  if (nova !== confirma) {
    trocaSenhaErro.style.display = 'block';
    trocaSenhaErro.innerText = 'As senhas não coincidem.';
    return;
  }

  if (nova === 'lojao6081') {
    trocaSenhaErro.style.display = 'block';
    trocaSenhaErro.innerText = 'A nova senha precisa ser diferente da senha padrão.';
    return;
  }

  try {
    await updatePassword(auth.currentUser, nova);
    modalTrocaSenha.hide();
    alert('Senha atualizada com sucesso!');
  } catch (error) {
    trocaSenhaErro.style.display = 'block';
    trocaSenhaErro.innerText = 'Erro ao alterar senha: ' + error.message;
  }
});

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  });
}