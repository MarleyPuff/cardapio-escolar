// Procura um elemento da página pelo id.
const listaRefeicoes = document.getElementById('lista-refeicoes');
const opcoesRefeicoes = document.getElementById('opcoes-refeicoes');
const areaResposta = document.getElementById('area-resposta');
const mensagem = document.getElementById('mensagem');
 
// Busca o cardápio que corresponde à data de hoje.
async function carregarCardapio() {
  const { data, error } = await banco.rpc('cardapio_de_hoje');
 
  // Se o banco responder com erro, mostramos um aviso.
  if (error) {
    document.getElementById('data-cardapio').textContent =
      'Não foi possível carregar o cardápio.';
    console.log(error.message);
    return;
  }
 
  // A função devolve uma lista. Pegamos a primeira linha.
  const cardapio = data[0];
 
  // Se não existir cardápio para hoje, avisamos o estudante.
  if (!cardapio) {
    document.getElementById('data-cardapio').textContent =
      'O cardápio de hoje ainda não foi publicado.';
    areaResposta.classList.add('oculto');
    return;
  }
 
  document.getElementById('data-cardapio').textContent =
    'Cardápio atualizado para hoje.';
 
  mostrarRefeicao('Café da manhã', cardapio.breakfast,
    cardapio.cutoff_breakfast, 'cafe_manha');
  mostrarRefeicao('Lanche da tarde', cardapio.afternoon_snack,
    cardapio.cutoff_snack, 'lanche_tarde');
  mostrarRefeicao('Almoço / jantar', cardapio.lunch_dinner,
    cardapio.cutoff_lunch, 'almoco_jantar');
}
 
// Chama a função assim que a página abre.
carregarCardapio();

function mostrarRefeicao(titulo, texto, horario, codigo) {
    // Se a refeição não foi informada, ela não aparece hoje.
    if (!texto || texto.trim() === '') {
      return;
    }
   
    // Primeiro criamos o cartão que mostra o alimento previsto.
    const caixaCardapio = document.createElement('div');
    caixaCardapio.className = 'cartao';
   
    const nome = document.createElement('h3');
    nome.textContent = titulo;
   
    const descricao = document.createElement('p');
    descricao.textContent = texto;
   
    caixaCardapio.appendChild(nome);
    caixaCardapio.appendChild(descricao);
    listaRefeicoes.appendChild(caixaCardapio);
   
    // Agora criamos uma área separada para a resposta SIM ou NÃO.
    const caixaResposta = document.createElement('div');
    caixaResposta.className = 'cartao';
   
    const pergunta = document.createElement('h3');
    pergunta.textContent = titulo + ' - Você pretende consumir?';
   
    const prazo = document.createElement('p');
    prazo.textContent = 'Responda até: ' + horario;
   
    const opcoes = document.createElement('div');
    opcoes.className = 'opcoes';
    opcoes.innerHTML =
      '<label><input type="radio" name="' + codigo + '" value="sim"> SIM</label>' +
      '<label><input type="radio" name="' + codigo + '" value="nao"> NÃO</label>';
   
    // Botão para salvar somente a resposta desta refeição.
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = 'Confirmar resposta';
    botao.addEventListener('click', function() {
      registrarResposta(codigo);
    });
   
    caixaResposta.appendChild(pergunta);
    caixaResposta.appendChild(prazo);
    caixaResposta.appendChild(opcoes);
    caixaResposta.appendChild(botao);
    opcoesRefeicoes.appendChild(caixaResposta);
   
    // Mostra o campo de RA quando existir pelo menos uma refeição.
    areaResposta.classList.remove('oculto');
  }

  async function registrarResposta(codigoRefeicao) {
    const ra = document.getElementById('ra-estudante').value.trim();
   
    // Procura a opção marcada para esta refeição.
    const marcada = document.querySelector(
      'input[name="' + codigoRefeicao + '"]:checked'
    );
   
    if (ra === '') {
      mensagem.textContent = 'Digite seu RA antes de responder.';
      return;
    }
   
    if (!marcada) {
      mensagem.textContent = 'Escolha SIM ou NÃO para esta refeição.';
      return;
    }
   
    // Transformamos o texto SIM/NÃO em verdadeiro/falso.
    const vaiConsumir = marcada.value === 'sim';
   
    // Envia RA, refeição e escolha para a função do banco.
    const { data, error } = await banco.rpc('registrar_intencao', {
      p_ra: ra,
      p_refeicao: codigoRefeicao,
      p_consume: vaiConsumir
    });
   
    if (error) {
      mensagem.textContent = error.message;
      return;
    }
   
    mensagem.textContent = data;
  }
  