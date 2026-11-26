// Encontra o formulário e o espaço para mensagens.
const formularioLogin = document.getElementById('form-login');
const mensagemLogin = document.getElementById('mensagem-login');
 
formularioLogin.addEventListener('submit', async function(evento) {
  // Impede que a página recarregue antes de terminar o login.
  evento.preventDefault();
 
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
 
  // Pede ao Supabase para conferir o e-mail e a senha.
  const { data, error } = await banco.auth.signInWithPassword({
    email: email,
    password: senha
  });
 
  if (error) {
    mensagemLogin.textContent = 'E-mail ou senha não conferem.';
    return;
  }
 
  // Procura o perfil da pessoa que acabou de entrar.
  const { data: perfil, error: erroPerfil } = await banco
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();
 
  if (erroPerfil || perfil.role !== 'admin') {
    await banco.auth.signOut();
    mensagemLogin.textContent = 'Esta conta ainda não tem permissão.';
    return;
  }
 
  // Se tudo estiver certo, abre o painel.
  window.location.href = 'admin.html';
});
