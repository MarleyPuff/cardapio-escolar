// Verifica se a pessoa entrou e se tem permissão de administrador.
async function verificarAdministrador() {
    const { data } = await banco.auth.getSession();
    const sessao = data.session;
   
    if (!sessao) {
      window.location.href = 'login.html';
      return false;
    }
   
    const { data: perfil, error } = await banco
      .from('profiles')
      .select('role')
      .eq('id', sessao.user.id)
      .single();
   
    if (error || perfil.role !== 'admin') {
      await banco.auth.signOut();
      window.location.href = 'login.html';
      return false;
    }
   
    return true;
  }

  async function carregarCardapioAtual() {
    const { data, error } = await banco.rpc('cardapio_de_hoje');
    if (error || !data || data.length === 0) return;
   
    const menu = data[0];
    document.getElementById('cafe').value = menu.breakfast || '';
    document.getElementById('lanche').value = menu.afternoon_snack || '';
    document.getElementById('almoco').value = menu.lunch_dinner || '';
    document.getElementById('limite-cafe').value = menu.cutoff_breakfast;
    document.getElementById('limite-lanche').value = menu.cutoff_snack;
    document.getElementById('limite-almoco').value = menu.cutoff_lunch;
  }

  document.getElementById('form-cardapio')
  .addEventListener('submit', async function(evento) {
    evento.preventDefault();
 
    const { data, error } = await banco.rpc('salvar_cardapio_do_dia', {
      p_cafe: document.getElementById('cafe').value.trim(),
      p_lanche: document.getElementById('lanche').value.trim(),
      p_almoco: document.getElementById('almoco').value.trim(),
      p_limite_cafe: document.getElementById('limite-cafe').value,
      p_limite_lanche: document.getElementById('limite-lanche').value,
      p_limite_almoco: document.getElementById('limite-almoco').value
    });
 
    document.getElementById('mensagem-cardapio').textContent =
      error ? error.message : data;
  });

  document.getElementById('form-estudante')
  .addEventListener('submit', async function(evento) {
    evento.preventDefault();
 
    const ra = document.getElementById('novo-ra').value.trim();
    const turma = document.getElementById('nova-turma').value.trim();
 
    const { error } = await banco.from('students').upsert({
      ra: ra,
      class_name: turma,
      active: true
    }, { onConflict: 'ra' });
 
    document.getElementById('mensagem-estudante').textContent =
      error ? error.message : 'RA cadastrado com sucesso.';
 
    if (!error) {
      this.reset();
      carregarEstudantes();
    }
  });

  async function carregarEstudantes() {
    const { data, error } = await banco
      .from('students')
      .select('ra, class_name, active')
      .order('class_name');
   
    const lista = document.getElementById('lista-estudantes');
    lista.innerHTML = '';
   
    if (error) {
      lista.textContent = 'Não foi possível carregar os estudantes.';
      return;
    }
   
    data.forEach(function(aluno) {
      const linha = document.createElement('div');
      linha.className = 'cartao';
   
      const texto = document.createElement('span');
      texto.textContent = aluno.ra + ' - ' + aluno.class_name +
        (aluno.active ? ' (ativo)' : ' (inativo)');
      linha.appendChild(texto);
   
      // Só mostramos o botão quando o RA ainda está ativo.
      if (aluno.active) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.textContent = 'Desativar RA';
        botao.addEventListener('click', function() {
          desativarEstudante(aluno.ra);
        });
        linha.appendChild(botao);
      }
   
      lista.appendChild(linha);
    });
  }
   
  // Desativar é mais seguro do que apagar o RA do histórico.
  async function desativarEstudante(ra) {
    const { error } = await banco.from('students')
      .update({ active: false })
      .eq('ra', ra);
   
    document.getElementById('mensagem-estudante').textContent =
      error ? error.message : 'RA desativado.';
   
    if (!error) carregarEstudantes();
  }

  // Cria uma barra simples para visualizar uma quantidade.
function criarBarra(nome, quantidade, total, cor) {
    const linha = document.createElement('div');
    linha.className = 'linha-grafico';
   
    const legenda = document.createElement('p');
    legenda.className = 'legenda-grafico';
    legenda.textContent = nome + ': ' + quantidade;
   
    const fundo = document.createElement('div');
    fundo.className = 'barra-fundo';
   
    const preenchimento = document.createElement('div');
    preenchimento.className = 'barra-preenchida';
    preenchimento.style.backgroundColor = cor;
   
    // Calcula a largura da barra em porcentagem.
    const porcentagem = total > 0 ? (quantidade / total) * 100 : 0;
    preenchimento.style.width = porcentagem + '%';
   
    fundo.appendChild(preenchimento);
    linha.appendChild(legenda);
    linha.appendChild(fundo);
    return linha;
  }
   
  async function carregarRelatorio() {
    const { data, error } = await banco.rpc('resumo_intencoes');
    const area = document.getElementById('relatorio');
    area.innerHTML = '';
   
    if (error) {
      area.textContent = 'Não foi possível carregar o relatório.';
      return;
    }
   
    if (!data || data.length === 0) {
      area.textContent = 'Nenhuma refeição foi publicada no cardápio de hoje.';
      return;
    }
   
    const nomes = {
      cafe_manha: 'Café da manhã',
      lanche_tarde: 'Lanche da tarde',
      almoco_jantar: 'Almoço / jantar'
    };
   
    data.forEach(function(item) {
      const cartao = document.createElement('div');
      cartao.className = 'cartao';
   
      const titulo = document.createElement('h3');
      titulo.textContent = nomes[item.meal_type];
      cartao.appendChild(titulo);
   
      // Cada refeição terá uma barra para SIM, NÃO e SEM RESPOSTA.
      cartao.appendChild(criarBarra('SIM', Number(item.yes_count), Number(item.total_students), '#27834a'));
      cartao.appendChild(criarBarra('NÃO', Number(item.no_count), Number(item.total_students), '#c44b4b'));
      cartao.appendChild(criarBarra('SEM RESPOSTA', Number(item.no_response_count), Number(item.total_students), '#d39b27'));
   
      area.appendChild(cartao);
    });
  }
   
  document.getElementById('atualizar-relatorio')
    .addEventListener('click', carregarRelatorio);
   
  document.getElementById('sair').addEventListener('click', async function() {
    await banco.auth.signOut();
    window.location.href = 'login.html';
  });
   
  // Executa as verificações e carrega os dados ao abrir o painel.
  verificarAdministrador().then(function(podeEntrar) {
    if (podeEntrar) {
      carregarCardapioAtual();
      carregarEstudantes();
      carregarRelatorio();
    }
  });
  