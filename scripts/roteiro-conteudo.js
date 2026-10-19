/**
 * Conteúdo do roteiro de apresentação.
 *
 * Separado do gerador de PDF de propósito: quem for ajustar o texto da fala
 * mexe só aqui, sem encostar no HTML. Os números citados saem do banco real
 * (npm run stats) — se o banco crescer, atualize-os aqui.
 */

export const PROJETO = {
  nome: 'Educa+',
  tagline: 'Aprenda jogando. Construa seu próprio mundo.',
  // Confirme os nomes antes de imprimir.
  equipe: [
    'Gabriella Baima',
    'Giovana Passos',
    'Laura Magalhães',
    'Lia Maria Carvalho',
    'Maria Clara Saraiva',
    'Maria Eduarda Alves',
  ],
}

/** Números verificáveis — todos saem de `npm run check`. */
export const NUMEROS = [
  { valor: '203', rotulo: 'geradores de questão' },
  { valor: '~145 mil', rotulo: 'questões diferentes possíveis' },
  { valor: '234', rotulo: 'habilidades da BNCC' },
  { valor: '6 × 4', rotulo: 'matérias × anos escolares' },
  { valor: '14.309', rotulo: 'questões auditadas sem erro' },
  { valor: 'R$ 0,00', rotulo: 'custo de produção' },
]

export const SECOES = [
  {
    n: 1,
    titulo: 'Abertura e Conceito',
    oQueFalar: 'Apresentação da equipe e definição do produto em uma frase impactante.',
    prints: ['01-onboarding.png'],
    roteiro: [
      'Bom dia! A nossa equipe é formada por **{EQUIPE}**.',
      'Nós criamos o **Educa+**, uma plataforma que transforma o estudo do 6º ao 9º ano em um jogo: **cada questão que o aluno acerta vira moeda para construir a própria cidade**.',
    ],
    dica: 'Fale a frase do produto devagar e faça uma pausa depois dela. É a única frase que a banca vai lembrar se esquecer todo o resto.',
  },
  {
    n: 2,
    titulo: 'O Funcionamento — Parte 1 (Entrada e Interface)',
    oQueFalar: 'Explica o primeiro contato do usuário com a criação. Mostre a tela e navegue de verdade.',
    prints: ['02-home.png', '03-materias.png', '04-missao-setup.png'],
    roteiro: [
      'O funcionamento começa aqui. Quando o aluno abre o Educa+, ele escolhe um **avatar**, um **apelido** e o **ano** em que está.',
      'Ele cai na tela inicial, que mostra o **nível**, a **ofensiva** — os dias seguidos estudando — e as **missões do dia**.',
      'A primeira ação é escolher uma das **seis matérias** e o **nível da missão**: Explorador, Aventureiro ou Mestre. Repare que o aplicativo já mostra quais habilidades da BNCC podem cair naquela missão.',
    ],
    dica: 'Mostre a navegação no celular, não no computador. É como o aluno realmente usa, e a banca percebe isso.',
  },
  {
    n: 3,
    titulo: 'O Funcionamento — Parte 2 (Mecanismo e Tecnologia)',
    oQueFalar: 'Explica a lógica interna. É o momento mais técnico — e o que mais impressiona.',
    prints: ['05-quiz-multipla.png', '07-feedback-acerto.png', '08-feedback-erro.png'],
    roteiro: [
      'Por trás dessa interface, o sistema **não tem uma lista de perguntas prontas**. Ele tem **203 geradores de questão**.',
      'Cada gerador sorteia os números, os nomes e o contexto na hora. Isso dá cerca de **145 mil questões diferentes**, todas amarradas a uma habilidade da BNCC — o código aparece na tela, como EF07MA17.',
      'Isso resolve dois problemas de uma vez: **o aluno não decora a prova**, porque refazer a missão dá outros números; e **o professor sabe exatamente qual habilidade foi exercitada**.',
      'E tem um detalhe de segurança: **a resposta certa não existe no código da página**. Ela viaja criptografada e só é aberta depois que o aluno responde. Quem abrir o "Inspecionar" do navegador não acha o gabarito.',
    ],
    dica: 'Se der tempo, refaça a MESMA missão na frente da banca para mostrar que os números mudaram. É a demonstração mais forte da apresentação.',
  },
  {
    n: 4,
    titulo: 'Materiais, Tecnologia e Custo de Produção',
    oQueFalar: 'Detalha o que foi usado e quanto custa produzir.',
    prints: ['10-cidade.png'],
    roteiro: [
      'Para construir este protótipo usamos **React com Vite** no aplicativo, **Supabase** no banco de dados e **Vercel** para publicar na internet.',
      'Os desenhos da cidade são **SVG feitos por nós**, e as fontes e ícones têm **licença livre** — não dependemos de banco de imagens pago.',
      'O custo para produzir e manter esta versão foi de **R$ 0,00**. Todas as ferramentas têm plano gratuito suficiente para uma escola inteira: o banco de dados cobre **50 mil usuários por mês** sem cobrar nada.',
      'Na prática, isso quer dizer que **qualquer escola pública pode adotar o Educa+ sem gastar nada**.',
    ],
    dica: 'O "R$ 0,00" é o número que mais pega na banca. Diga, espere, e só então explique por quê.',
  },
  {
    n: 5,
    titulo: 'Estratégia de Engajamento e Convencimento do Público',
    oQueFalar: 'Como convencer as pessoas a adotar a criação no dia a dia. Três frentes.',
    prints: ['09-resultado.png', '12-conquistas.png'],
    roteiro: [
      'Para convencer o nosso público, estruturamos uma estratégia em **três frentes**:',
      '**1. Demonstração de benefício claro.** O aluno vê o resultado na hora: errou, aparece a explicação passo a passo; acertou, ganha moeda e vê a cidade crescer. Ele não precisa esperar a prova para saber se aprendeu.',
      '**2. Campanha na escola — o Desafio do Código de Turma.** Cada professor gera um código e passa para a turma. No fim do mês, a turma que mais dominar habilidades da BNCC ganha destaque no mural e no grêmio.',
      '**3. Incentivo inicial.** O aluno começa com **120 moedas**, o suficiente para já construir alguma coisa no primeiro acesso. Ele sente o laço — estudar vira construir — antes mesmo de terminar a primeira missão.',
    ],
    dica: 'Esta é a parte do "Especialista em Engajamento". Se houver integrante com esse papel, é ele quem fala aqui.',
  },
  {
    n: 6,
    titulo: 'Testes Realizados e Diferencial Competitivo',
    oQueFalar: 'Prova prática de que funciona e por que é melhor do que o que já existe.',
    prints: ['13-perfil.png'],
    roteiro: [
      'Nós submetemos o protótipo a **testes automáticos**. O sistema gera **14.309 questões** e confere uma por uma se tem alternativa repetida, duas respostas certas ou explicação faltando. **Passou sem nenhum erro.**',
      'Também testamos as **232 telas** do aplicativo simulando **72 missões completas**, do começo ao fim.',
      'O grande diferencial em relação ao que já existe: o **Duolingo** gamifica idioma, mas só idioma. O **Khan Academy** tem conteúdo, mas não tem jogo.',
      'O **Educa+ junta as duas coisas**, é **alinhado à BNCC brasileira**, funciona **offline** — importante em escola com internet ruim — e é **gratuito**.',
    ],
    dica: 'Se perguntarem "e se não tiver internet?", a resposta é: o aplicativo funciona offline e sincroniza depois.',
  },
  {
    n: 7,
    titulo: 'Encerramento e Chamada para Ação',
    oQueFalar: 'Finalização com impacto e convite à banca.',
    prints: ['11-loja.png'],
    roteiro: [
      'O **Educa+ já está no ar** e pode ser aberto agora, no celular de vocês, por este QR Code.',
      'Convidamos a banca a **testar o protótipo** ao final da apresentação.',
      'Porque no Educa+, **cada conhecimento aprendido ajuda o aluno a construir o seu próprio mundo**. Obrigado!',
    ],
    dica: 'Deixe o QR Code projetado na tela durante as perguntas. Quem testar enquanto pergunta já vira aliado.',
  },
]

/** Perguntas prováveis da banca. Não está no roteiro original — é reforço. */
export const PERGUNTAS = [
  {
    q: 'Como vocês garantem que o aluno não cola?',
    a: 'A resposta certa não fica no código da página: ela é selada e só é aberta depois que o aluno responde. Além disso, refazer a mesma missão gera outros números, então não adianta decorar. A próxima etapa é conferir a resposta no servidor, e o sistema já está preparado para isso.',
  },
  {
    q: 'E se a escola não tiver internet boa?',
    a: 'O aplicativo inteiro funciona offline. As questões são geradas no próprio aparelho, não baixadas. O progresso fica salvo no celular e sobe para o servidor quando a conexão voltar.',
  },
  {
    q: 'Quem garante que as questões estão certas?',
    a: 'Um teste automático gera 14.309 questões e audita cada uma. Ele reprova se houver alternativa repetida, duas alternativas corretas, explicação faltando ou resposta que não bate. Rodamos esse teste a cada mudança.',
  },
  {
    q: 'Isso coleta dados das crianças?',
    a: 'Não. O aluno entra com um código de turma e um apelido — sem e-mail, sem nome completo, sem telefone. Foi uma decisão de projeto por causa da LGPD, que exige consentimento dos pais para tratar dado de criança. Quem sabe quem é quem é o professor, fora do sistema.',
  },
  {
    q: 'Como o professor acompanha a turma?',
    a: 'O sistema guarda cada resposta junto com a habilidade da BNCC correspondente. Com isso o professor vê um relatório de onde a turma trava — por exemplo, "70% erram proporcionalidade" — e pode planejar a aula em cima disso.',
  },
  {
    q: 'Quanto custaria para a escola adotar?',
    a: 'Zero. Os planos gratuitos das ferramentas que usamos cobrem 50 mil usuários ativos por mês. Uma escola inteira cabe nisso com folga.',
  },
  {
    q: 'Dá para colocar outras matérias ou outro ano?',
    a: 'Dá. Cada assunto é um arquivo separado com um gerador. Acrescentar um assunto novo é escrever uma função; não precisa mexer no resto do aplicativo.',
  },
]
