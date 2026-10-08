import { tpl, mc, pickWrong, take3, NAMES } from './helpers.js'

/**
 * Língua Portuguesa — 6º ao 9º ano.
 *
 * A variação aqui vem de POOLS: cada template sorteia um item de um banco de
 * frases/palavras cuidadosamente classificadas. Um template com 20 itens e
 * distratores embaralhados já produz dezenas de questões distintas.
 */

// ---------------------------------------------------------------------------
// Pools compartilhados
// ---------------------------------------------------------------------------

const CLASSES_PALAVRAS = [
  { palavra: 'felicidade', classe: 'Substantivo' },
  { palavra: 'corajoso', classe: 'Adjetivo' },
  { palavra: 'rapidamente', classe: 'Advérbio' },
  { palavra: 'correr', classe: 'Verbo' },
  { palavra: 'nosso', classe: 'Pronome' },
  { palavra: 'três', classe: 'Numeral' },
  { palavra: 'embora', classe: 'Conjunção' },
  { palavra: 'sobre', classe: 'Preposição' },
  { palavra: 'liberdade', classe: 'Substantivo' },
  { palavra: 'gentil', classe: 'Adjetivo' },
  { palavra: 'ontem', classe: 'Advérbio' },
  { palavra: 'estudar', classe: 'Verbo' },
  { palavra: 'aquele', classe: 'Pronome' },
  { palavra: 'primeiro', classe: 'Numeral' },
  { palavra: 'porque', classe: 'Conjunção' },
  { palavra: 'entre', classe: 'Preposição' },
  { palavra: 'cidade', classe: 'Substantivo' },
  { palavra: 'imenso', classe: 'Adjetivo' },
  { palavra: 'talvez', classe: 'Advérbio' },
  { palavra: 'escrever', classe: 'Verbo' },
  { palavra: 'meu', classe: 'Pronome' },
  { palavra: 'dobro', classe: 'Numeral' },
  { palavra: 'mas', classe: 'Conjunção' },
  { palavra: 'durante', classe: 'Preposição' },
]

const TODAS_CLASSES = ['Substantivo', 'Adjetivo', 'Advérbio', 'Verbo', 'Pronome', 'Numeral', 'Conjunção', 'Preposição', 'Interjeição', 'Artigo']

const ACENTUACAO = [
  { palavra: 'cafézinho', correta: 'cafezinho' },
  { palavra: 'sofá', tipo: 'Oxítona' },
  { palavra: 'você', tipo: 'Oxítona' },
  { palavra: 'jacaré', tipo: 'Oxítona' },
  { palavra: 'através', tipo: 'Oxítona' },
  { palavra: 'fácil', tipo: 'Paroxítona' },
  { palavra: 'táxi', tipo: 'Paroxítona' },
  { palavra: 'álbum', tipo: 'Paroxítona' },
  { palavra: 'caráter', tipo: 'Paroxítona' },
  { palavra: 'médico', tipo: 'Proparoxítona' },
  { palavra: 'lâmpada', tipo: 'Proparoxítona' },
  { palavra: 'música', tipo: 'Proparoxítona' },
  { palavra: 'xícara', tipo: 'Proparoxítona' },
  { palavra: 'cérebro', tipo: 'Proparoxítona' },
].filter((x) => x.tipo)

const PLURAIS = [
  ['cidadão', 'cidadãos'], ['pão', 'pães'], ['coração', 'corações'], ['alemão', 'alemães'],
  ['cão', 'cães'], ['mão', 'mãos'], ['irmão', 'irmãos'], ['capitão', 'capitães'],
  ['papel', 'papéis'], ['anel', 'anéis'], ['funil', 'funis'], ['fóssil', 'fósseis'],
  ['animal', 'animais'], ['túnel', 'túneis'], ['réptil', 'répteis'], ['lápis', 'lápis'],
  ['tórax', 'tórax'], ['cadáver', 'cadáveres'], ['troféu', 'troféus'], ['chapéu', 'chapéus'],
]

const PREFIXOS = [
  { palavra: 'infeliz', afixo: 'in-', sentido: 'negação' },
  { palavra: 'desfazer', afixo: 'des-', sentido: 'ação contrária' },
  { palavra: 'refazer', afixo: 're-', sentido: 'repetição' },
  { palavra: 'bilíngue', afixo: 'bi-', sentido: 'dois' },
  { palavra: 'anteontem', afixo: 'ante-', sentido: 'anterioridade' },
  { palavra: 'supermercado', afixo: 'super-', sentido: 'excesso, superioridade' },
  { palavra: 'subsolo', afixo: 'sub-', sentido: 'posição inferior' },
  { palavra: 'intermunicipal', afixo: 'inter-', sentido: 'entre' },
  { palavra: 'exportar', afixo: 'ex-', sentido: 'para fora' },
  { palavra: 'imoral', afixo: 'i(m)-', sentido: 'negação' },
]

const SUFIXOS = [
  { palavra: 'livraria', base: 'livro', sentido: 'lugar onde se vende' },
  { palavra: 'jornalista', base: 'jornal', sentido: 'profissão' },
  { palavra: 'carrinho', base: 'carro', sentido: 'diminutivo' },
  { palavra: 'casarão', base: 'casa', sentido: 'aumentativo' },
  { palavra: 'felizmente', base: 'feliz', sentido: 'advérbio de modo' },
  { palavra: 'beleza', base: 'belo', sentido: 'qualidade (substantivo abstrato)' },
  { palavra: 'brasileiro', base: 'Brasil', sentido: 'origem' },
  { palavra: 'floricultura', base: 'flor', sentido: 'cultivo' },
]

const FIGURAS = [
  { nome: 'Metáfora', ex: 'Meu coração é um balde despejado.', dica: 'comparação implícita, sem conectivo' },
  { nome: 'Comparação', ex: 'Ele é forte como um touro.', dica: 'comparação explícita, com "como"' },
  { nome: 'Hipérbole', ex: 'Já te disse isso um milhão de vezes!', dica: 'exagero intencional' },
  { nome: 'Personificação', ex: 'O vento sussurrava segredos na janela.', dica: 'dá características humanas a seres inanimados' },
  { nome: 'Ironia', ex: 'Que belo trabalho você fez, destruiu tudo!', dica: 'diz o contrário do que se quer dizer' },
  { nome: 'Eufemismo', ex: 'Ele partiu desta para melhor.', dica: 'suaviza uma ideia desagradável' },
  { nome: 'Antítese', ex: 'É um mar de água doce e de lágrimas salgadas.', dica: 'aproxima ideias opostas' },
  { nome: 'Metonímia', ex: 'Li Machado de Assis inteiro nas férias.', dica: 'troca o nome por algo relacionado (autor pela obra)' },
  { nome: 'Onomatopeia', ex: 'O relógio fazia tique-taque a noite toda.', dica: 'imita um som' },
  { nome: 'Pleonasmo', ex: 'Vi com meus próprios olhos o acidente.', dica: 'repete a ideia para dar ênfase' },
]

const CONJUNCOES = [
  { conj: 'mas', relacao: 'Oposição / adversidade', frase: 'Estudei muito, ___ não consegui a nota máxima.' },
  { conj: 'porque', relacao: 'Causa', frase: 'Não fui à escola ___ estava doente.' },
  { conj: 'portanto', relacao: 'Conclusão', frase: 'Ele treinou todos os dias; ___ venceu a competição.' },
  { conj: 'ou', relacao: 'Alternância', frase: 'Você prefere ir de ônibus ___ de bicicleta?' },
  { conj: 'embora', relacao: 'Concessão', frase: '___ estivesse cansado, terminou o trabalho.' },
  { conj: 'se', relacao: 'Condição', frase: '___ chover, o jogo será adiado.' },
  { conj: 'quando', relacao: 'Tempo', frase: '___ cheguei, a aula já tinha começado.' },
  { conj: 'para que', relacao: 'Finalidade', frase: 'Falou devagar ___ todos entendessem.' },
  { conj: 'e', relacao: 'Adição', frase: 'Ela canta ___ toca violão.' },
]

const TODAS_RELACOES = ['Oposição / adversidade', 'Causa', 'Conclusão', 'Alternância', 'Concessão', 'Condição', 'Tempo', 'Finalidade', 'Adição', 'Comparação', 'Explicação']

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export default [
  // ======================================================= 6º ANO
  tpl({
    id: 'pt6-classes',
    grade: 6, subject: 'portugues', bncc: 'EF06LP04',
    topic: 'Classes de palavras', level: 1, variants: 400,
    gen(r) {
      const item = r.pick(CLASSES_PALAVRAS)
      return mc({
        prompt: `A que classe gramatical pertence a palavra destacada?\n\n"${item.palavra}"`,
        answer: item.classe,
        wrong: pickWrong(r, TODAS_CLASSES, item.classe),
        why: `"${item.palavra}" é ${item.classe.toLowerCase()}. ${
          { Substantivo: 'Substantivos nomeiam seres, lugares, sentimentos e ideias.', Adjetivo: 'Adjetivos atribuem características ao substantivo.', Advérbio: 'Advérbios modificam verbo, adjetivo ou outro advérbio.', Verbo: 'Verbos indicam ação, estado ou fenômeno.', Pronome: 'Pronomes substituem ou acompanham o substantivo.', Numeral: 'Numerais indicam quantidade, ordem, multiplicação ou fração.', Conjunção: 'Conjunções ligam orações ou termos.', Preposição: 'Preposições ligam palavras estabelecendo relação entre elas.' }[item.classe]
        }`,
      })
    },
  }),

  tpl({
    id: 'pt6-plural',
    grade: 6, subject: 'portugues', bncc: 'EF06LP04',
    topic: 'Flexão de número', level: 1, variants: 200,
    gen(r) {
      const [sing, plur] = r.pick(PLURAIS)
      const outros = PLURAIS.filter((p) => p[1] !== plur).map((p) => p[1])
      const falsos = [
        sing.endsWith('ão') ? sing.replace(/ão$/, 'ãos') : `${sing}s`,
        sing.endsWith('ão') ? sing.replace(/ão$/, 'ães') : sing.replace(/l$/, 'les'),
        sing.endsWith('ão') ? sing.replace(/ão$/, 'ões') : `${sing}es`,
      ]
      return mc({
        prompt: `Qual é o plural correto de "${sing}"?`,
        answer: plur,
        wrong: take3(plur, [...falsos, ...r.sample(outros, 3)]),
        why: `O plural de "${sing}" é "${plur}".`,
      })
    },
  }),

  tpl({
    id: 'pt6-acentuacao',
    grade: 6, subject: 'portugues', bncc: 'EF06LP11',
    topic: 'Acentuação', level: 2, variants: 120,
    gen(r) {
      const item = r.pick(ACENTUACAO)
      return mc({
        prompt: `Quanto à sílaba tônica, a palavra "${item.palavra}" é classificada como:`,
        answer: item.tipo,
        wrong: pickWrong(r, ['Oxítona', 'Paroxítona', 'Proparoxítona', 'Monossílaba tônica'], item.tipo),
        why: `${item.tipo === 'Oxítona' ? 'A sílaba tônica é a última' : item.tipo === 'Paroxítona' ? 'A sílaba tônica é a penúltima' : 'A sílaba tônica é a antepenúltima'}: por isso "${item.palavra}" é ${item.tipo.toLowerCase()}.${item.tipo === 'Proparoxítona' ? ' Lembre: TODAS as proparoxítonas são acentuadas.' : ''}`,
      })
    },
  }),

  tpl({
    id: 'pt6-encontros',
    grade: 6, subject: 'portugues', bncc: 'EF06LP11',
    topic: 'Encontros vocálicos', level: 2, variants: 80,
    gen(r) {
      const itens = [
        { p: 'saída', t: 'Hiato' }, { p: 'poeta', t: 'Hiato' }, { p: 'saúde', t: 'Hiato' },
        { p: 'baú', t: 'Hiato' }, { p: 'caixa', t: 'Ditongo' }, { p: 'pai', t: 'Ditongo' },
        { p: 'herói', t: 'Ditongo' }, { p: 'água', t: 'Ditongo' }, { p: 'Paraguai', t: 'Tritongo' },
        { p: 'saguão', t: 'Tritongo' }, { p: 'quais', t: 'Tritongo' }, { p: 'iguais', t: 'Tritongo' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Que tipo de encontro vocálico aparece na palavra "${item.p}"?`,
        answer: item.t,
        wrong: pickWrong(r, ['Ditongo', 'Hiato', 'Tritongo', 'Dígrafo'], item.t),
        why: `Ditongo: duas vogais na MESMA sílaba. Hiato: duas vogais em sílabas SEPARADAS. Tritongo: três vogais na mesma sílaba. Em "${item.p}" temos um ${item.t.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt6-sinonimos',
    grade: 6, subject: 'portugues', bncc: 'EF06LP03',
    topic: 'Sinônimos e antônimos', level: 1, variants: 300,
    gen(r) {
      const pares = [
        { p: 'belo', sin: 'bonito', ant: 'feio' },
        { p: 'alegre', sin: 'contente', ant: 'triste' },
        { p: 'rápido', sin: 'veloz', ant: 'lento' },
        { p: 'difícil', sin: 'árduo', ant: 'fácil' },
        { p: 'generoso', sin: 'bondoso', ant: 'egoísta' },
        { p: 'início', sin: 'começo', ant: 'fim' },
        { p: 'claro', sin: 'nítido', ant: 'escuro' },
        { p: 'forte', sin: 'robusto', ant: 'fraco' },
        { p: 'antigo', sin: 'velho', ant: 'moderno' },
        { p: 'calmo', sin: 'sereno', ant: 'agitado' },
        { p: 'rico', sin: 'abastado', ant: 'pobre' },
        { p: 'corajoso', sin: 'destemido', ant: 'covarde' },
      ]
      const item = r.pick(pares)
      const pedeSinonimo = r.chance()
      const certo = pedeSinonimo ? item.sin : item.ant
      const pool = pares.flatMap((p) => [p.sin, p.ant]).filter((w) => w !== certo && w !== item.p)
      return mc({
        prompt: `Qual palavra é ${pedeSinonimo ? 'SINÔNIMO' : 'ANTÔNIMO'} de "${item.p}"?`,
        answer: certo,
        wrong: take3(certo, [pedeSinonimo ? item.ant : item.sin, ...r.sample(pool, 5)]),
        why: `"${item.p}" tem como sinônimo "${item.sin}" e como antônimo "${item.ant}".`,
      })
    },
  }),

  tpl({
    id: 'pt6-sujeito-predicado',
    grade: 6, subject: 'portugues', bncc: 'EF06LP08',
    topic: 'Sujeito e predicado', level: 2, variants: 200,
    gen(r) {
      const frases = [
        { f: 'As crianças brincaram no parque.', suj: 'As crianças' },
        { f: 'O professor explicou a matéria.', suj: 'O professor' },
        { f: 'Meu irmão mais velho comprou um violão.', suj: 'Meu irmão mais velho' },
        { f: 'A chuva forte alagou a rua.', suj: 'A chuva forte' },
        { f: 'Os alunos do 6º ano venceram o campeonato.', suj: 'Os alunos do 6º ano' },
        { f: 'Aquele cachorro late muito à noite.', suj: 'Aquele cachorro' },
        { f: 'A biblioteca da escola abriu cedo.', suj: 'A biblioteca da escola' },
        { f: 'Minha avó prepara o melhor bolo.', suj: 'Minha avó' },
      ]
      const item = r.pick(frases)
      const predicado = item.f.replace(item.suj, '').replace(/^\s+/, '').replace(/\.$/, '')
      return mc({
        prompt: `Identifique o SUJEITO da oração:\n\n"${item.f}"`,
        answer: item.suj,
        wrong: take3(item.suj, [predicado, item.f.replace(/\.$/, ''), predicado.split(' ')[0], 'A oração não tem sujeito']),
        why: `O sujeito é quem pratica a ação ou de quem se declara algo: "${item.suj}". O restante ("${predicado}") é o predicado.`,
      })
    },
  }),

  tpl({
    id: 'pt6-concordancia',
    grade: 6, subject: 'portugues', bncc: 'EF06LP06',
    topic: 'Concordância', level: 2, variants: 150,
    gen(r) {
      const itens = [
        { certa: 'Os meninos chegaram atrasados.', errada: 'Os meninos chegou atrasado.' },
        { certa: 'Havia muitos alunos na quadra.', errada: 'Haviam muitos alunos na quadra.' },
        { certa: 'Fazem dois anos que estudo aqui.', errada: 'Faz dois anos que estudo aqui.', inverter: true },
        { certa: 'Elas estavam cansadas da viagem.', errada: 'Elas estavam cansados da viagem.' },
        { certa: 'Chegaram as encomendas da loja.', errada: 'Chegou as encomendas da loja.' },
        { certa: 'A maioria dos alunos participou da prova.', errada: 'A maioria dos alunos participaram-se da prova.' },
        { certa: 'Existem várias soluções possíveis.', errada: 'Existe várias soluções possíveis.' },
        { certa: 'Nós fizemos o trabalho juntos.', errada: 'Nós fizemo o trabalho junto.' },
      ].filter((i) => !i.inverter)
      const item = r.pick(itens)
      const outras = itens.filter((i) => i !== item)
      return mc({
        prompt: 'Qual frase está de acordo com as regras de concordância?',
        answer: item.certa,
        wrong: take3(item.certa, [item.errada, ...r.sample(outras.map((o) => o.errada), 3)]),
        why: `A forma correta é: "${item.certa}". O verbo e os adjetivos precisam concordar em número e pessoa com o sujeito.`,
      })
    },
  }),

  tpl({
    id: 'pt6-modos-verbais',
    grade: 6, subject: 'portugues', bncc: 'EF06LP05',
    topic: 'Modos verbais', level: 2, variants: 120,
    gen(r) {
      const itens = [
        { f: 'Feche a porta, por favor.', modo: 'Imperativo', sentido: 'ordem ou pedido' },
        { f: 'Eu estudo todos os dias.', modo: 'Indicativo', sentido: 'fato certo' },
        { f: 'Se eu estudasse mais, passaria.', modo: 'Subjuntivo', sentido: 'hipótese' },
        { f: 'Traga seu caderno amanhã.', modo: 'Imperativo', sentido: 'ordem' },
        { f: 'Talvez ele venha à festa.', modo: 'Subjuntivo', sentido: 'dúvida' },
        { f: 'Ontem choveu muito na cidade.', modo: 'Indicativo', sentido: 'fato ocorrido' },
        { f: 'Espero que você consiga.', modo: 'Subjuntivo', sentido: 'desejo' },
        { f: 'Não corram no corredor.', modo: 'Imperativo', sentido: 'proibição' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Em que modo verbal está o verbo destacado?\n\n"${item.f}"`,
        answer: item.modo,
        wrong: pickWrong(r, ['Indicativo', 'Subjuntivo', 'Imperativo'], item.modo),
        why: `O verbo expressa ${item.sentido}, característica do modo ${item.modo.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt6-pontuacao',
    grade: 6, subject: 'portugues', bncc: 'EF06LP07',
    topic: 'Pontuação', level: 2, variants: 80,
    gen(r) {
      const itens = [
        { f: 'Ana, venha aqui agora.', uso: 'Isolar o vocativo' },
        { f: 'Comprei pães, leite, ovos e café.', uso: 'Separar elementos de uma enumeração' },
        { f: 'Pedro, o novo aluno, chegou hoje.', uso: 'Isolar o aposto' },
        { f: 'Ontem, fomos ao cinema.', uso: 'Separar adjunto adverbial deslocado' },
        { f: 'Que surpresa incrível!', uso: 'Indicar emoção ou surpresa' },
        { f: 'Você vai à festa?', uso: 'Indicar uma pergunta' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual é a função da pontuação na frase abaixo?\n\n"${item.f}"`,
        answer: item.uso,
        wrong: pickWrong(r, itens.map((i) => i.uso), item.uso),
        why: `Nessa frase, a pontuação serve para: ${item.uso.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt6-coesao-pronomes',
    grade: 6, subject: 'portugues', bncc: 'EF06LP12',
    topic: 'Coesão referencial', level: 3, variants: 90,
    gen(r) {
      const nome = r.pick(NAMES)
      const itens = [
        { f: `${nome} comprou um livro novo. ELE custou caro.`, ref: 'o livro novo' },
        { f: `A professora chegou cedo. ELA abriu a sala.`, ref: 'a professora' },
        { f: `Os alunos entregaram o trabalho. ISSO alegrou o professor.`, ref: 'o fato de os alunos entregarem o trabalho' },
        { f: `${nome} e Pedro saíram. ELES foram ao parque.`, ref: `${nome} e Pedro` },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `A que se refere a palavra em MAIÚSCULAS no trecho abaixo?\n\n"${item.f}"`,
        answer: item.ref,
        wrong: take3(item.ref, [...itens.filter((i) => i !== item).map((i) => i.ref), 'a nenhum termo anterior']),
        why: `A palavra retoma um termo já citado — isso é coesão referencial. Aqui ela retoma "${item.ref}".`,
      })
    },
  }),

  // ======================================================= 7º ANO
  tpl({
    id: 'pt7-prefixos',
    grade: 7, subject: 'portugues', bncc: 'EF07LP03',
    topic: 'Formação de palavras', level: 2, variants: 200,
    gen(r) {
      const item = r.pick(PREFIXOS)
      return mc({
        prompt: `Qual é o sentido do prefixo em "${item.palavra}"?`,
        answer: item.sentido,
        wrong: pickWrong(r, PREFIXOS.map((p) => p.sentido), item.sentido),
        why: `O prefixo ${item.afixo} em "${item.palavra}" indica ${item.sentido}.`,
      })
    },
  }),

  tpl({
    id: 'pt7-sufixos',
    grade: 7, subject: 'portugues', bncc: 'EF07LP03',
    topic: 'Derivação por sufixo', level: 2, variants: 150,
    gen(r) {
      const item = r.pick(SUFIXOS)
      const perguntaBase = r.chance(0.4)
      if (perguntaBase) {
        return mc({
          prompt: `De qual palavra primitiva deriva "${item.palavra}"?`,
          answer: item.base,
          wrong: pickWrong(r, SUFIXOS.map((s) => s.base), item.base),
          why: `"${item.palavra}" é formada por derivação a partir de "${item.base}".`,
        })
      }
      return mc({
        prompt: `Qual é o sentido acrescentado pelo sufixo em "${item.palavra}"?`,
        answer: item.sentido,
        wrong: pickWrong(r, SUFIXOS.map((s) => s.sentido), item.sentido),
        why: `O sufixo em "${item.palavra}" (de "${item.base}") indica ${item.sentido}.`,
      })
    },
  }),

  tpl({
    id: 'pt7-transitividade',
    grade: 7, subject: 'portugues', bncc: 'EF07LP05',
    topic: 'Transitividade verbal', level: 3, variants: 150,
    gen(r) {
      const itens = [
        { f: 'O menino quebrou o vidro.', t: 'Transitivo direto', why: 'O verbo pede complemento sem preposição ("o vidro").' },
        { f: 'Ela gosta de música clássica.', t: 'Transitivo indireto', why: 'O verbo pede complemento com preposição ("de música").' },
        { f: 'O bebê dormiu profundamente.', t: 'Intransitivo', why: 'O verbo tem sentido completo, não pede complemento.' },
        { f: 'Entreguei o livro ao professor.', t: 'Transitivo direto e indireto', why: 'Tem complemento sem preposição ("o livro") e com preposição ("ao professor").' },
        { f: 'Os pássaros voaram para o sul.', t: 'Intransitivo', why: '"Voaram" tem sentido completo; "para o sul" é adjunto adverbial.' },
        { f: 'Precisamos de mais tempo.', t: 'Transitivo indireto', why: '"Precisar" exige a preposição "de".' },
        { f: 'A turma assistiu ao filme.', t: 'Transitivo indireto', why: '"Assistir" no sentido de ver exige a preposição "a".' },
        { f: 'Comprei um presente para minha mãe.', t: 'Transitivo direto e indireto', why: 'Tem objeto direto ("um presente") e objeto indireto ("para minha mãe").' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Classifique a transitividade do verbo na oração:\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Transitivo direto', 'Transitivo indireto', 'Transitivo direto e indireto', 'Intransitivo'], item.t),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt7-conjuncoes',
    grade: 7, subject: 'portugues', bncc: ['EF07LP07', 'EF07LP08'],
    topic: 'Conjunções e sentidos', level: 2, variants: 180,
    gen(r) {
      const item = r.pick(CONJUNCOES)
      const pedeRelacao = r.chance(0.6)
      if (pedeRelacao) {
        return mc({
          prompt: `Que relação de sentido a conjunção "${item.conj}" estabelece na frase abaixo?\n\n"${item.frase.replace('___', item.conj)}"`,
          answer: item.relacao,
          wrong: pickWrong(r, TODAS_RELACOES, item.relacao),
          why: `A conjunção "${item.conj}" indica ${item.relacao.toLowerCase()}.`,
        })
      }
      return mc({
        prompt: `Qual conjunção completa a frase mantendo a relação de ${item.relacao.toLowerCase()}?\n\n"${item.frase}"`,
        answer: item.conj,
        wrong: pickWrong(r, CONJUNCOES.map((c) => c.conj), item.conj),
        why: `"${item.conj}" é a conjunção que estabelece ${item.relacao.toLowerCase()} nesse contexto.`,
      })
    },
  }),

  tpl({
    id: 'pt7-tipos-sujeito',
    grade: 7, subject: 'portugues', bncc: 'EF07LP11',
    topic: 'Tipos de sujeito', level: 3, variants: 120,
    gen(r) {
      const itens = [
        { f: 'A professora corrigiu as provas.', t: 'Simples', why: 'Um só núcleo: "professora".' },
        { f: 'João e Maria viajaram ontem.', t: 'Composto', why: 'Dois núcleos: "João" e "Maria".' },
        { f: 'Chegamos cedo à escola.', t: 'Oculto (desinencial)', why: 'O sujeito "nós" está implícito na terminação do verbo.' },
        { f: 'Roubaram minha bicicleta.', t: 'Indeterminado', why: 'Não se sabe nem se quer identificar quem praticou a ação.' },
        { f: 'Chove muito em janeiro.', t: 'Oração sem sujeito', why: 'Verbo que indica fenômeno da natureza não tem sujeito.' },
        { f: 'Os livros e os cadernos ficaram na mesa.', t: 'Composto', why: 'Dois núcleos: "livros" e "cadernos".' },
        { f: 'Precisa-se de voluntários.', t: 'Indeterminado', why: 'O índice "se" torna o sujeito indeterminado.' },
        { f: 'Há três alunos na sala.', t: 'Oração sem sujeito', why: 'O verbo "haver" no sentido de existir é impessoal.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Classifique o sujeito da oração:\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Simples', 'Composto', 'Oculto (desinencial)', 'Indeterminado', 'Oração sem sujeito'], item.t),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt7-tempos-verbais',
    grade: 7, subject: 'portugues', bncc: 'EF07LP06',
    topic: 'Tempos verbais', level: 2, variants: 150,
    gen(r) {
      const verbos = [
        { inf: 'cantar', pres: 'canto', pret: 'cantei', fut: 'cantarei' },
        { inf: 'correr', pres: 'corro', pret: 'corri', fut: 'correrei' },
        { inf: 'partir', pres: 'parto', pret: 'parti', fut: 'partirei' },
        { inf: 'estudar', pres: 'estudo', pret: 'estudei', fut: 'estudarei' },
        { inf: 'vender', pres: 'vendo', pret: 'vendi', fut: 'venderei' },
        { inf: 'abrir', pres: 'abro', pret: 'abri', fut: 'abrirei' },
      ]
      const v = r.pick(verbos)
      const tempo = r.pick([
        { k: 'pres', nome: 'presente do indicativo' },
        { k: 'pret', nome: 'pretérito perfeito do indicativo' },
        { k: 'fut', nome: 'futuro do presente do indicativo' },
      ])
      return mc({
        prompt: `Qual é a forma do verbo "${v.inf}" na 1ª pessoa do singular (eu), no ${tempo.nome}?`,
        answer: v[tempo.k],
        wrong: take3(v[tempo.k], [v.pres, v.pret, v.fut, ...r.sample(verbos.filter((x) => x !== v).map((x) => x[tempo.k]), 2)]),
        why: `No ${tempo.nome}, "${v.inf}" na 1ª pessoa do singular fica "${v[tempo.k]}".`,
      })
    },
  }),

  tpl({
    id: 'pt7-coordenadas',
    grade: 7, subject: 'portugues', bncc: 'EF07LP07',
    topic: 'Orações coordenadas', level: 3, variants: 100,
    gen(r) {
      const itens = [
        { f: 'Estudou bastante, mas não passou.', t: 'Adversativa' },
        { f: 'Ou você estuda, ou não passa de ano.', t: 'Alternativa' },
        { f: 'Choveu muito; portanto, o jogo foi cancelado.', t: 'Conclusiva' },
        { f: 'Entrou na sala e sentou-se rapidamente.', t: 'Aditiva' },
        { f: 'Vista o casaco, pois está muito frio.', t: 'Explicativa' },
        { f: 'Não gritou nem reclamou.', t: 'Aditiva' },
        { f: 'Ela caiu, logo se machucou.', t: 'Conclusiva' },
        { f: 'Trabalhou o dia todo, porém não se cansou.', t: 'Adversativa' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Classifique a oração coordenada destacada:\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Aditiva', 'Adversativa', 'Alternativa', 'Conclusiva', 'Explicativa'], item.t),
        why: `Trata-se de uma oração coordenada sindética ${item.t.toLowerCase()}, pela relação de sentido que a conjunção estabelece.`,
      })
    },
  }),

  // ======================================================= 8º ANO
  tpl({
    id: 'pt8-composicao',
    grade: 8, subject: 'portugues', bncc: 'EF08LP05',
    topic: 'Formação por composição', level: 2, variants: 100,
    gen(r) {
      const itens = [
        { p: 'passatempo', t: 'Justaposição', why: 'As palavras "passa" + "tempo" se juntam sem perder letras.' },
        { p: 'planalto', t: 'Aglutinação', why: '"Plano" + "alto" perdem elementos ao se unir.' },
        { p: 'girassol', t: 'Justaposição', why: '"Gira" + "sol" mantêm sua forma original.' },
        { p: 'aguardente', t: 'Aglutinação', why: '"Água" + "ardente" sofrem alteração ao se unir.' },
        { p: 'guarda-chuva', t: 'Justaposição', why: 'As palavras se unem sem alteração, com hífen.' },
        { p: 'pernalta', t: 'Aglutinação', why: '"Perna" + "alta" perdem o "a" na junção.' },
        { p: 'beija-flor', t: 'Justaposição', why: 'As duas palavras mantêm sua forma.' },
        { p: 'embora', t: 'Aglutinação', why: '"Em" + "boa" + "hora" se fundem com perda de elementos.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `A palavra "${item.p}" foi formada por composição. Qual é o processo?`,
        answer: item.t,
        wrong: take3(item.t, [item.t === 'Justaposição' ? 'Aglutinação' : 'Justaposição', 'Derivação prefixal', 'Derivação sufixal', 'Onomatopeia']),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt8-termos-oracao',
    grade: 8, subject: 'portugues', bncc: 'EF08LP06',
    topic: 'Termos da oração', level: 3, variants: 160,
    gen(r) {
      const itens = [
        { f: 'Maria comprou um livro novo.', termo: 'um livro novo', t: 'Objeto direto' },
        { f: 'Ele precisa de ajuda urgente.', termo: 'de ajuda urgente', t: 'Objeto indireto' },
        { f: 'O carro do meu pai quebrou.', termo: 'do meu pai', t: 'Adjunto adnominal' },
        { f: 'Os alunos chegaram muito cedo.', termo: 'muito cedo', t: 'Adjunto adverbial' },
        { f: 'Brasília, capital do Brasil, é planejada.', termo: 'capital do Brasil', t: 'Aposto' },
        { f: 'Pedro, venha aqui imediatamente!', termo: 'Pedro', t: 'Vocativo' },
        { f: 'A menina ficou muito feliz.', termo: 'muito feliz', t: 'Predicativo do sujeito' },
        { f: 'Entregamos os documentos ao diretor.', termo: 'ao diretor', t: 'Objeto indireto' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual é a função sintática do termo destacado?\n\n"${item.f}"\n\nTermo: ${item.termo}`,
        answer: item.t,
        wrong: pickWrong(r, ['Objeto direto', 'Objeto indireto', 'Adjunto adnominal', 'Adjunto adverbial', 'Aposto', 'Vocativo', 'Predicativo do sujeito'], item.t),
        why: `"${item.termo}" exerce a função de ${item.t.toLowerCase()} nessa oração.`,
      })
    },
  }),

  tpl({
    id: 'pt8-vozes-verbais',
    grade: 8, subject: 'portugues', bncc: 'EF08LP07',
    topic: 'Vozes verbais', level: 3, variants: 120,
    gen(r) {
      const itens = [
        { f: 'O professor corrigiu as provas.', v: 'Voz ativa' },
        { f: 'As provas foram corrigidas pelo professor.', v: 'Voz passiva' },
        { f: 'O menino machucou-se no treino.', v: 'Voz reflexiva' },
        { f: 'A casa foi construída por meu avô.', v: 'Voz passiva' },
        { f: 'Os alunos organizaram a festa.', v: 'Voz ativa' },
        { f: 'Ela penteou-se diante do espelho.', v: 'Voz reflexiva' },
        { f: 'Vendem-se casas nesta rua.', v: 'Voz passiva' },
        { f: 'A chuva destruiu a plantação.', v: 'Voz ativa' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Em que voz verbal está a oração?\n\n"${item.f}"`,
        answer: item.v,
        wrong: pickWrong(r, ['Voz ativa', 'Voz passiva', 'Voz reflexiva'], item.v),
        why: `Voz ativa: o sujeito pratica a ação. Voz passiva: o sujeito sofre a ação. Voz reflexiva: o sujeito pratica e sofre. Aqui temos ${item.v.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt8-adverbiais',
    grade: 8, subject: 'portugues', bncc: ['EF08LP09', 'EF08LP12'],
    topic: 'Orações subordinadas adverbiais', level: 3, variants: 140,
    gen(r) {
      const itens = [
        { f: 'Quando o sinal tocou, todos saíram.', t: 'Temporal' },
        { f: 'Se você estudar, vai passar.', t: 'Condicional' },
        { f: 'Ele faltou porque estava doente.', t: 'Causal' },
        { f: 'Estudou tanto que ficou exausto.', t: 'Consecutiva' },
        { f: 'Embora chovesse, saímos de casa.', t: 'Concessiva' },
        { f: 'Falou alto para que todos ouvissem.', t: 'Final' },
        { f: 'Ela corre mais rápido do que eu.', t: 'Comparativa' },
        { f: 'Conforme combinamos, cheguei às oito.', t: 'Conformativa' },
        { f: 'À medida que o tempo passava, ficava mais frio.', t: 'Proporcional' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Classifique a oração subordinada adverbial:\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Temporal', 'Condicional', 'Causal', 'Consecutiva', 'Concessiva', 'Final', 'Comparativa', 'Conformativa', 'Proporcional'], item.t),
        why: `A conjunção que inicia a oração marca a relação com a principal: oração subordinada adverbial ${item.t.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt8-ortografia',
    grade: 8, subject: 'portugues', bncc: 'EF08LP04',
    topic: 'Ortografia', level: 2, variants: 120,
    gen(r) {
      const itens = [
        { certa: 'exceção', erradas: ['excessão', 'esceção', 'excesão'] },
        { certa: 'privilégio', erradas: ['previlégio', 'privilejio', 'previlegio'] },
        { certa: 'beneficente', erradas: ['beneficiente', 'benificente', 'beneficentes'] },
        { certa: 'ansioso', erradas: ['anscioso', 'ancioso', 'anssioso'] },
        { certa: 'concerto musical', erradas: ['conserto musical', 'councerto musical', 'conssérto musical'] },
        { certa: 'mendigo', erradas: ['mendingo', 'mendígo', 'mindigo'] },
        { certa: 'adolescente', erradas: ['adolecente', 'adoleçente', 'adoleicente'] },
        { certa: 'através', erradas: ['atravez', 'através de de', 'atraves'] },
        { certa: 'discussão', erradas: ['discução', 'discusão', 'dicussão'] },
        { certa: 'paralisar', erradas: ['paralizar', 'parelisar', 'paralisár'] },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: 'Qual é a grafia CORRETA?',
        answer: item.certa,
        wrong: item.erradas.slice(0, 3),
        why: `A forma correta é "${item.certa}".`,
      })
    },
  }),

  tpl({
    id: 'pt8-interpretacao',
    grade: 8, subject: 'portugues', bncc: 'EF69LP03',
    topic: 'Interpretação de texto', level: 2, variants: 60,
    gen(r) {
      const textos = [
        {
          t: 'A prefeitura anunciou ontem a ampliação da ciclovia da avenida central. A obra, que começa em março, vai acrescentar 4 km de faixa exclusiva e deve reduzir em 15% o número de acidentes com ciclistas, segundo estudo da secretaria de trânsito.',
          q: 'Qual é o fato central da notícia?',
          a: 'A ampliação da ciclovia da avenida central',
          w: ['A redução de 15% nos acidentes', 'O estudo da secretaria de trânsito', 'O início das obras em março'],
          why: 'O fato central é o acontecimento principal anunciado; os outros dados são desdobramentos e detalhes.',
        },
        {
          t: 'Pesquisadores identificaram uma nova espécie de sapo na Mata Atlântica. O animal, de apenas 2 cm, vive entre folhas secas e só foi encontrado após três anos de expedições na região sul da Bahia.',
          q: 'Qual informação NÃO está presente no texto?',
          a: 'O nome científico dado à nova espécie',
          w: ['O tamanho do animal', 'O tempo de duração das expedições', 'O local onde a espécie foi encontrada'],
          why: 'O texto informa tamanho, tempo e local, mas não menciona o nome científico da espécie.',
        },
        {
          t: '"Não adianta reclamar do calor", disse o meteorologista, "porque as próximas semanas serão ainda mais quentes."',
          q: 'Qual é o efeito de sentido do uso das aspas no trecho?',
          a: 'Marcar a fala exata de outra pessoa (discurso direto)',
          w: ['Indicar ironia do autor', 'Destacar uma palavra estrangeira', 'Sinalizar um título de obra'],
          why: 'As aspas, aqui, reproduzem literalmente o que foi dito pelo meteorologista.',
        },
      ]
      const item = r.pick(textos)
      return mc({
        prompt: item.q,
        support: item.t,
        answer: item.a,
        wrong: item.w,
        why: item.why,
      })
    },
  }),

  // ======================================================= 9º ANO
  tpl({
    id: 'pt9-figuras',
    grade: 9, subject: 'portugues', bncc: 'EF69LP54',
    topic: 'Figuras de linguagem', level: 2, variants: 200,
    gen(r) {
      const item = r.pick(FIGURAS)
      const pedeNome = r.chance(0.7)
      if (pedeNome) {
        return mc({
          prompt: `Qual figura de linguagem está presente na frase?\n\n"${item.ex}"`,
          answer: item.nome,
          wrong: pickWrong(r, FIGURAS.map((f) => f.nome), item.nome),
          why: `${item.nome}: ${item.dica}.`,
        })
      }
      return mc({
        prompt: `Qual figura de linguagem é definida como "${item.dica}"?`,
        answer: item.nome,
        wrong: pickWrong(r, FIGURAS.map((f) => f.nome), item.nome),
        why: `Exemplo de ${item.nome.toLowerCase()}: "${item.ex}"`,
      })
    },
  }),

  tpl({
    id: 'pt9-predicativo',
    grade: 9, subject: 'portugues', bncc: 'EF09LP05',
    topic: 'Predicado e predicativo', level: 3, variants: 120,
    gen(r) {
      const itens = [
        { f: 'O dia está nublado.', t: 'Predicado nominal', why: '"Estar" é verbo de ligação e "nublado" é predicativo do sujeito.' },
        { f: 'Os alunos estudaram muito.', t: 'Predicado verbal', why: '"Estudaram" é verbo de ação e o núcleo do predicado.' },
        { f: 'A menina chegou cansada.', t: 'Predicado verbo-nominal', why: 'Há ação ("chegou") e característica do sujeito ("cansada").' },
        { f: 'Meu irmão é engenheiro.', t: 'Predicado nominal', why: '"Ser" é verbo de ligação e "engenheiro" é predicativo.' },
        { f: 'O time venceu o campeonato.', t: 'Predicado verbal', why: '"Venceu" expressa ação, com objeto direto.' },
        { f: 'Elegeram Maria representante da turma.', t: 'Predicado verbo-nominal', why: 'Há a ação de eleger e o predicativo do objeto ("representante").' },
        { f: 'A sopa ficou fria.', t: 'Predicado nominal', why: '"Ficar" aqui é verbo de ligação e "fria" é predicativo do sujeito.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Classifique o predicado da oração:\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Predicado verbal', 'Predicado nominal', 'Predicado verbo-nominal'], item.t),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt9-adjetivas',
    grade: 9, subject: 'portugues', bncc: 'EF09LP09',
    topic: 'Orações adjetivas', level: 3, variants: 90,
    gen(r) {
      const itens = [
        { f: 'Os alunos que estudaram passaram na prova.', t: 'Restritiva', why: 'Sem vírgulas: restringe o sentido — apenas os que estudaram passaram.' },
        { f: 'Os alunos, que estudaram, passaram na prova.', t: 'Explicativa', why: 'Entre vírgulas: acrescenta informação — todos os alunos estudaram e passaram.' },
        { f: 'O Brasil, que é o maior país da América do Sul, tem grande biodiversidade.', t: 'Explicativa', why: 'Entre vírgulas, explica uma característica já conhecida do termo.' },
        { f: 'A casa que comprei fica perto da escola.', t: 'Restritiva', why: 'Delimita qual casa entre várias possíveis.' },
        { f: 'Pelé, que marcou mais de mil gols, nasceu em Três Corações.', t: 'Explicativa', why: 'Acrescenta informação sobre um termo único e já identificado.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `A oração subordinada adjetiva destacada é restritiva ou explicativa?\n\n"${item.f}"`,
        answer: item.t,
        wrong: [item.t === 'Restritiva' ? 'Explicativa' : 'Restritiva', 'Substantiva objetiva', 'Adverbial causal'],
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt9-regencia',
    grade: 9, subject: 'portugues', bncc: 'EF09LP07',
    topic: 'Regência', level: 3, variants: 110,
    gen(r) {
      const itens = [
        { certa: 'Assisti ao filme ontem.', errada: 'Assisti o filme ontem.', why: '"Assistir" no sentido de ver exige a preposição "a".' },
        { certa: 'Obedeça aos seus pais.', errada: 'Obedeça seus pais.', why: '"Obedecer" é transitivo indireto: obedecer A alguém.' },
        { certa: 'Prefiro cinema a teatro.', errada: 'Prefiro mais cinema do que teatro.', why: '"Preferir" pede a estrutura "preferir algo A algo", sem "mais" nem "do que".' },
        { certa: 'Cheguei a São Paulo na terça.', errada: 'Cheguei em São Paulo na terça.', why: 'O verbo "chegar" pede a preposição "a" para indicar destino.' },
        { certa: 'Aspiro ao cargo de diretor.', errada: 'Aspiro o cargo de diretor.', why: '"Aspirar" no sentido de almejar é transitivo indireto.' },
        { certa: 'Ele visa a um futuro melhor.', errada: 'Ele visa um futuro melhor.', why: '"Visar" no sentido de almejar exige a preposição "a".' },
        { certa: 'Esqueci-me do compromisso.', errada: 'Esqueci-me o compromisso.', why: 'Com o pronome, "esquecer-se" exige a preposição "de".' },
      ]
      const item = r.pick(itens)
      const outras = itens.filter((i) => i !== item)
      return mc({
        prompt: 'Qual frase está de acordo com a norma-padrão quanto à regência?',
        answer: item.certa,
        wrong: take3(item.certa, [item.errada, ...r.sample(outras.map((o) => o.errada), 3)]),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt9-colocacao-pronominal',
    grade: 9, subject: 'portugues', bncc: 'EF09LP10',
    topic: 'Colocação pronominal', level: 3, variants: 90,
    gen(r) {
      const itens = [
        { f: 'Não me diga isso!', t: 'Próclise', why: 'A palavra negativa "não" atrai o pronome para antes do verbo.' },
        { f: 'Diga-me a verdade.', t: 'Ênclise', why: 'Com o verbo no imperativo afirmativo, o pronome vem depois.' },
        { f: 'Quem me contou foi o João.', t: 'Próclise', why: 'O pronome relativo "quem" atrai o pronome oblíquo.' },
        { f: 'Dar-te-ei um presente.', t: 'Mesóclise', why: 'Verbo no futuro do presente, sem palavra atrativa: pronome no meio.' },
        { f: 'Entregaram-me o pacote.', t: 'Ênclise', why: 'Sem palavra atrativa, o pronome fica após o verbo.' },
        { f: 'Talvez se arrependa depois.', t: 'Próclise', why: 'O advérbio de dúvida "talvez" atrai o pronome.' },
        { f: 'Far-se-á justiça.', t: 'Mesóclise', why: 'Futuro do presente sem fator de próclise: pronome no meio do verbo.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual é a colocação pronominal usada na frase?\n\n"${item.f}"`,
        answer: item.t,
        wrong: pickWrong(r, ['Próclise', 'Ênclise', 'Mesóclise'], item.t),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'pt9-conectivos',
    grade: 9, subject: 'portugues', bncc: 'EF09LP08',
    topic: 'Conectivos e argumentação', level: 2, variants: 140,
    gen(r) {
      const itens = [
        { conectivo: 'no entanto', relacao: 'Oposição' },
        { conectivo: 'além disso', relacao: 'Adição' },
        { conectivo: 'por conseguinte', relacao: 'Conclusão' },
        { conectivo: 'uma vez que', relacao: 'Causa' },
        { conectivo: 'por exemplo', relacao: 'Exemplificação' },
        { conectivo: 'em primeiro lugar', relacao: 'Ordenação' },
        { conectivo: 'ou seja', relacao: 'Explicação / retificação' },
        { conectivo: 'a fim de', relacao: 'Finalidade' },
        { conectivo: 'apesar disso', relacao: 'Concessão' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Que relação de sentido o conectivo "${item.conectivo}" estabelece em um texto argumentativo?`,
        answer: item.relacao,
        wrong: pickWrong(r, itens.map((i) => i.relacao), item.relacao),
        why: `"${item.conectivo}" é um conectivo de ${item.relacao.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'pt9-variacao',
    grade: 9, subject: 'portugues', bncc: 'EF09LP04',
    topic: 'Variação linguística', level: 2, variants: 60,
    gen(r) {
      const itens = [
        { f: '"Vosmecê vai aonde, moço?"', t: 'Variação histórica (arcaísmo)' },
        { f: '"O guri tá na pracinha."', t: 'Variação regional' },
        { f: '"Deu ruim, mano."', t: 'Variação social (gíria juvenil)' },
        { f: '"Solicito deferimento ao presente requerimento."', t: 'Registro formal' },
        { f: '"Bah, tchê, que frio danado!"', t: 'Variação regional' },
        { f: '"Vou mandar o relatório amanhã, tá?"', t: 'Registro informal' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Que tipo de variação linguística o trecho abaixo representa?\n\n${item.f}`,
        answer: item.t,
        wrong: pickWrong(r, itens.map((i) => i.t), item.t),
        why: `A língua varia conforme região, época, grupo social e situação. Aqui temos ${item.t.toLowerCase()}.`,
      })
    },
  }),
]
