// Este arquivo faz a ligação entre o site e o banco de dados.
// Troque os dois textos entre aspas pelos dados do seu projeto.
// Use a chave PUBLICÁVEL. Nunca use a chave secreta aqui.
 
const URL_DO_PROJETO = 'https://qaijwfjfhbwtcoxthyks.supabase.co/';
const CHAVE_PUBLICAVEL = 'sb_publishable_t4rRMiLLTjoTv2oTHLdWNQ';
 
// Criamos uma conexão que será usada pelos outros arquivos.
const banco = window.supabase.createClient(
  URL_DO_PROJETO,
  CHAVE_PUBLICAVEL
);
