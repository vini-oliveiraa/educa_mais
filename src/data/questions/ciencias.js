import { tpl, mc, input, pickWrong, take3, num, reduceFraction } from './helpers.js'

/** Ciências da Natureza — 6º ao 9º ano. */
export default [
  // ======================================================= 6º ANO
  tpl({
    id: 'ci6-misturas',
    grade: 6, subject: 'ciencias', bncc: 'EF06CI01',
    topic: 'Misturas', level: 1, variants: 120,
    gen(r) {
      const homogeneas = ['água e sal dissolvido', 'ar atmosférico filtrado', 'álcool e água', 'ouro 18 quilates', 'vinagre', 'aço (ferro e carbono)', 'refrigerante sem gás']
      const heterogeneas = ['água e óleo', 'água e areia', 'granito', 'salada de frutas', 'água e serragem', 'leite com achocolatado em pó não dissolvido', 'sangue']
      const pedeHomogenea = r.chance()
      const certo = pedeHomogenea ? r.pick(homogeneas) : r.pick(heterogeneas)
      const errados = pedeHomogenea ? r.sample(heterogeneas, 3) : r.sample(homogeneas, 3)
      return mc({
        prompt: `Qual das opções é um exemplo de mistura ${pedeHomogenea ? 'HOMOGÊNEA' : 'HETEROGÊNEA'}?`,
        answer: certo,
        wrong: errados,
        why: pedeHomogenea
          ? `Em "${certo}" não é possível distinguir as fases a olho nu: é uma mistura homogênea (uma única fase).`
          : `Em "${certo}" conseguimos distinguir mais de uma fase: é uma mistura heterogênea.`,
      })
    },
  }),

  tpl({
    id: 'ci6-separacao',
    grade: 6, subject: 'ciencias', bncc: 'EF06CI03',
    topic: 'Separação de misturas', level: 2, variants: 90,
    gen(r) {
      const itens = [
        { mist: 'água e areia', met: 'Filtração', why: 'A areia fica retida no filtro e a água passa.' },
        { mist: 'água e sal dissolvido', met: 'Destilação', why: 'A água evapora, é condensada e recolhida; o sal fica no recipiente.' },
        { mist: 'água e óleo', met: 'Decantação', why: 'Os líquidos não se misturam e se separam por diferença de densidade.' },
        { mist: 'limalha de ferro e areia', met: 'Separação magnética', why: 'Um ímã atrai apenas a limalha de ferro.' },
        { mist: 'arroz e feijão', met: 'Catação', why: 'Separação manual dos componentes sólidos visíveis.' },
        { mist: 'areia fina e pedras grandes', met: 'Peneiração', why: 'A peneira retém os grãos maiores e deixa passar os menores.' },
        { mist: 'álcool e água', met: 'Destilação fracionada', why: 'Os líquidos têm pontos de ebulição diferentes e evaporam em momentos distintos.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual é o método mais adequado para separar a mistura "${item.mist}"?`,
        answer: item.met,
        wrong: pickWrong(r, itens.map((i) => i.met), item.met),
        why: `${item.met}: ${item.why}`,
      })
    },
  }),

  tpl({
    id: 'ci6-celula',
    grade: 6, subject: 'ciencias', bncc: 'EF06CI05',
    topic: 'Célula', level: 1, variants: 80,
    gen(r) {
      // `f: true` marca as organelas de nome feminino, para artigo e contração
      // concordarem em vez de sair o remendo "do(a)".
      const itens = [
        { org: 'Núcleo', fun: 'Armazena o material genético (DNA) e comanda a célula' },
        { org: 'Mitocôndria', f: true, fun: 'Produz energia por meio da respiração celular' },
        { org: 'Membrana plasmática', f: true, fun: 'Controla a entrada e a saída de substâncias' },
        { org: 'Citoplasma', fun: 'Meio gelatinoso onde ficam as organelas' },
        { org: 'Cloroplasto', fun: 'Realiza a fotossíntese nas células vegetais' },
        { org: 'Parede celular', f: true, fun: 'Dá rigidez e sustentação à célula vegetal' },
        { org: 'Ribossomo', fun: 'Produz proteínas' },
        { org: 'Vacúolo', fun: 'Armazena água e outras substâncias' },
      ]
      const item = r.pick(itens)
      const nome = item.org.toLowerCase()
      const de = item.f ? 'da' : 'do'
      const o = item.f ? 'A' : 'O'
      const pedeFuncao = r.chance(0.6)
      if (pedeFuncao) {
        return mc({
          prompt: `Qual é a principal função ${de} ${nome}?`,
          answer: item.fun,
          wrong: pickWrong(r, itens.map((i) => i.fun), item.fun),
          why: `${o} ${nome} ${item.fun.toLowerCase()}.`,
        })
      }
      return mc({
        prompt: `Qual estrutura celular tem a função de "${item.fun.toLowerCase()}"?`,
        answer: item.org,
        wrong: pickWrong(r, itens.map((i) => i.org), item.org),
        why: `Essa é a função ${de} ${nome}.`,
      })
    },
  }),

  tpl({
    id: 'ci6-sistemas-corpo',
    grade: 6, subject: 'ciencias', bncc: ['EF06CI06', 'EF06CI07', 'EF06CI09'],
    topic: 'Sistemas do corpo humano', level: 1, variants: 100,
    gen(r) {
      const itens = [
        { sis: 'Sistema digestório', fun: 'Transformar o alimento em nutrientes absorvíveis' },
        { sis: 'Sistema respiratório', fun: 'Realizar as trocas gasosas entre o corpo e o ar' },
        { sis: 'Sistema circulatório', fun: 'Transportar sangue, nutrientes e oxigênio pelo corpo' },
        { sis: 'Sistema nervoso', fun: 'Receber estímulos e coordenar as respostas do corpo' },
        { sis: 'Sistema esquelético', fun: 'Sustentar o corpo e proteger órgãos internos' },
        { sis: 'Sistema muscular', fun: 'Produzir os movimentos do corpo' },
        { sis: 'Sistema excretor', fun: 'Filtrar o sangue e eliminar resíduos pela urina' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual sistema do corpo humano é responsável por ${item.fun.toLowerCase()}?`,
        answer: item.sis,
        wrong: pickWrong(r, itens.map((i) => i.sis), item.sis),
        why: `Essa é a função principal do ${item.sis.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'ci6-camadas-terra',
    grade: 6, subject: 'ciencias', bncc: ['EF06CI11', 'EF06CI12'],
    topic: 'Estrutura da Terra', level: 2, variants: 60,
    gen(r) {
      const itens = [
        { c: 'Crosta', d: 'Camada mais externa, sólida e fina, onde vivemos' },
        { c: 'Manto', d: 'Camada intermediária, com rochas parcialmente fundidas (magma)' },
        { c: 'Núcleo externo', d: 'Camada líquida de ferro e níquel, responsável pelo campo magnético' },
        { c: 'Núcleo interno', d: 'Camada mais profunda, sólida, de ferro e níquel sob pressão altíssima' },
      ]
      const item = r.pick(itens)
      const pedeNome = r.chance(0.6)
      if (pedeNome) {
        return mc({
          prompt: `Qual camada da Terra é descrita como: "${item.d}"?`,
          answer: item.c,
          wrong: pickWrong(r, itens.map((i) => i.c), item.c),
          why: `${item.c}: ${item.d.toLowerCase()}.`,
        })
      }
      const rochas = [
        { t: 'Magmática (ígnea)', ex: 'granito e basalto', o: 'resfriamento do magma' },
        { t: 'Sedimentar', ex: 'arenito e calcário', o: 'acúmulo e compactação de sedimentos' },
        { t: 'Metamórfica', ex: 'mármore e ardósia', o: 'transformação de outra rocha por calor e pressão' },
      ]
      const rocha = r.pick(rochas)
      return mc({
        prompt: `O ${rocha.ex.split(' e ')[0]} é um exemplo de qual tipo de rocha?`,
        answer: rocha.t,
        wrong: pickWrong(r, rochas.map((x) => x.t), rocha.t),
        why: `Rochas do tipo ${rocha.t.toLowerCase()} se formam por ${rocha.o}. Exemplos: ${rocha.ex}.`,
      })
    },
  }),

  tpl({
    id: 'ci6-movimentos-terra',
    grade: 6, subject: 'ciencias', bncc: ['EF06CI13', 'EF06CI14'],
    topic: 'Movimentos da Terra', level: 1, variants: 40,
    gen(r) {
      const itens = [
        { mov: 'Rotação', dur: '24 horas', efeito: 'a sucessão de dias e noites' },
        { mov: 'Translação', dur: '365 dias e 6 horas', efeito: 'as estações do ano' },
      ]
      const item = r.pick(itens)
      const pergunta = r.pick(['efeito', 'duracao'])
      if (pergunta === 'efeito') {
        return mc({
          prompt: `Qual movimento da Terra é responsável por ${item.efeito}?`,
          answer: item.mov,
          wrong: take3(item.mov, ['Rotação', 'Translação', 'Precessão', 'Nutação']),
          why: `O movimento de ${item.mov.toLowerCase()} dura ${item.dur} e causa ${item.efeito}.`,
        })
      }
      return mc({
        prompt: `Quanto tempo dura aproximadamente o movimento de ${item.mov.toLowerCase()} da Terra?`,
        answer: item.dur,
        wrong: take3(item.dur, ['24 horas', '365 dias e 6 horas', '28 dias', '12 horas']),
        why: `O movimento de ${item.mov.toLowerCase()} dura ${item.dur} e provoca ${item.efeito}.`,
      })
    },
  }),

  // ======================================================= 7º ANO
  tpl({
    id: 'ci7-calor',
    grade: 7, subject: 'ciencias', bncc: ['EF07CI02', 'EF07CI03'],
    topic: 'Calor e temperatura', level: 2, variants: 100,
    gen(r) {
      const itens = [
        { sit: 'A alça de metal de uma panela esquenta enquanto a comida cozinha', proc: 'Condução', why: 'O calor se propaga pelo material sólido, de partícula a partícula.' },
        { sit: 'O ar quente sobe e o ar frio desce dentro de uma geladeira', proc: 'Convecção', why: 'O calor se propaga por correntes num fluido (líquido ou gás).' },
        { sit: 'Sentimos o calor do Sol mesmo no vácuo do espaço', proc: 'Irradiação', why: 'O calor se propaga por ondas eletromagnéticas, sem precisar de meio material.' },
        { sit: 'Uma colher de metal numa xícara de chá quente fica quente', proc: 'Condução', why: 'Metais são bons condutores: o calor atravessa o material.' },
        { sit: 'A água da panela ferve formando correntes que sobem e descem', proc: 'Convecção', why: 'A água aquecida fica menos densa e sobe, criando correntes de convecção.' },
        { sit: 'A brasa da fogueira aquece quem está sentado em volta', proc: 'Irradiação', why: 'O calor chega por radiação infravermelha, sem contato.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual processo de propagação de calor explica a situação?\n\n"${item.sit}"`,
        answer: item.proc,
        wrong: pickWrong(r, ['Condução', 'Convecção', 'Irradiação'], item.proc),
        why: `${item.proc}: ${item.why}`,
      })
    },
  }),

  tpl({
    id: 'ci7-temperatura-conversao',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI02',
    topic: 'Escalas termométricas', level: 3, variants: 400,
    gen(r) {
      const celsius = r.int(-20, 100)
      const paraF = r.chance(0.5)
      if (paraF) {
        const f = (celsius * 9) / 5 + 32
        return input({
          prompt: `Converta ${celsius} °C para graus Fahrenheit.\n(Fórmula: °F = °C × 9/5 + 32)`,
          answer: num(f, Number.isInteger(f) ? 0 : 1),
          unit: '°F',
          decimal: !Number.isInteger(f),
          why: `°F = ${celsius} × 9/5 + 32 = ${num((celsius * 9) / 5, 1)} + 32 = ${num(f)} °F.`,
        })
      }
      const k = celsius + 273
      return input({
        prompt: `Converta ${celsius} °C para kelvin.\n(Use: K = °C + 273)`,
        answer: k,
        unit: 'K',
        why: `K = ${celsius} + 273 = ${k} K. A escala Kelvin começa no zero absoluto (−273 °C).`,
      })
    },
  }),

  tpl({
    id: 'ci7-maquinas-simples',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI01',
    topic: 'Máquinas simples', level: 1, variants: 60,
    gen(r) {
      const itens = [
        { maq: 'Alavanca', ex: 'uma gangorra, um abridor de garrafas' },
        { maq: 'Roldana (polia)', ex: 'o sistema para içar um balde em um poço' },
        { maq: 'Plano inclinado', ex: 'uma rampa para subir caixas num caminhão' },
        { maq: 'Roda e eixo', ex: 'a maçaneta de uma porta, o volante de um carro' },
        { maq: 'Parafuso', ex: 'uma rosca que converte giro em avanço' },
        { maq: 'Cunha', ex: 'a lâmina de um machado ou de uma faca' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Que máquina simples está presente em: ${item.ex}?`,
        answer: item.maq,
        wrong: pickWrong(r, itens.map((i) => i.maq), item.maq),
        why: `${item.maq} — exemplos: ${item.ex}. Máquinas simples não criam energia: elas facilitam o trabalho, trocando força por deslocamento.`,
      })
    },
  }),

  tpl({
    id: 'ci7-ecossistemas',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI07',
    topic: 'Ecossistemas brasileiros', level: 2, variants: 100,
    gen(r) {
      const itens = [
        { b: 'Amazônia', c: 'maior floresta tropical do mundo, clima equatorial úmido e enorme biodiversidade' },
        { b: 'Cerrado', c: 'savana brasileira, com árvores de troncos retorcidos e raízes profundas' },
        { b: 'Caatinga', c: 'vegetação adaptada à seca, com cactos e plantas que perdem as folhas' },
        { b: 'Mata Atlântica', c: 'floresta do litoral, muito desmatada, com alto índice de endemismo' },
        { b: 'Pantanal', c: 'maior planície alagável do mundo, com cheias e vazantes sazonais' },
        { b: 'Pampa', c: 'campos do extremo sul, com vegetação rasteira e gramíneas' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual bioma brasileiro é caracterizado como "${item.c}"?`,
        answer: item.b,
        wrong: pickWrong(r, itens.map((i) => i.b), item.b),
        why: `${item.b}: ${item.c}.`,
      })
    },
  }),

  tpl({
    id: 'ci7-cadeia-alimentar',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI08',
    topic: 'Cadeia alimentar', level: 2, variants: 120,
    gen(r) {
      const cadeias = [
        ['capim', 'gafanhoto', 'sapo', 'cobra', 'gavião'],
        ['algas', 'pequenos peixes', 'peixes maiores', 'tubarão'],
        ['folhas', 'lagarta', 'pássaro', 'gato-do-mato'],
        ['plâncton', 'camarão', 'peixe', 'garça'],
      ]
      const cadeia = r.pick(cadeias)
      const pergunta = r.pick(['produtor', 'nivel', 'consequencia'])
      const cadeiaTxt = cadeia.join(' → ')
      if (pergunta === 'produtor') {
        return mc({
          prompt: `Nessa cadeia alimentar, qual é o PRODUTOR?`,
          support: cadeiaTxt,
          answer: cadeia[0],
          wrong: cadeia.slice(1, 4),
          why: `Produtores são os organismos que produzem o próprio alimento por fotossíntese. Nessa cadeia, é "${cadeia[0]}".`,
        })
      }
      if (pergunta === 'nivel') {
        const idx = r.int(1, cadeia.length - 1)
        const ordinais = ['', 'primário', 'secundário', 'terciário', 'quaternário']
        return mc({
          prompt: `Nessa cadeia alimentar, "${cadeia[idx]}" ocupa qual posição?`,
          support: cadeiaTxt,
          answer: `Consumidor ${ordinais[idx]}`,
          wrong: take3(`Consumidor ${ordinais[idx]}`, ['Produtor', 'Consumidor primário', 'Consumidor secundário', 'Consumidor terciário', 'Decompositor']),
          why: `Quem se alimenta do produtor é consumidor primário; quem come o primário é secundário, e assim por diante. "${cadeia[idx]}" é consumidor ${ordinais[idx]}.`,
        })
      }
      const idx = r.int(1, cadeia.length - 2)
      return mc({
        prompt: `O que aconteceria, em curto prazo, se "${cadeia[idx]}" desaparecesse dessa cadeia?`,
        support: cadeiaTxt,
        answer: `A população de "${cadeia[idx - 1]}" aumentaria e a de "${cadeia[idx + 1]}" diminuiria`,
        wrong: [
          `A população de "${cadeia[idx - 1]}" diminuiria e a de "${cadeia[idx + 1]}" aumentaria`,
          'Nada mudaria, pois cada espécie vive de forma independente',
          'Todas as populações da cadeia aumentariam',
        ],
        why: `Sem "${cadeia[idx]}", o nível anterior deixa de ser consumido (aumenta) e o nível seguinte perde o alimento (diminui). Os elos de uma cadeia são interdependentes.`,
      })
    },
  }),

  tpl({
    id: 'ci7-atmosfera',
    grade: 7, subject: 'ciencias', bncc: ['EF07CI12', 'EF07CI13', 'EF07CI14'],
    topic: 'Atmosfera e clima', level: 2, variants: 80,
    gen(r) {
      const itens = [
        { q: 'Qual gás é o mais abundante na atmosfera terrestre?', a: 'Nitrogênio (cerca de 78%)', w: ['Oxigênio (cerca de 78%)', 'Gás carbônico (cerca de 50%)', 'Hidrogênio (cerca de 60%)'], why: 'O ar é composto por ~78% de nitrogênio, ~21% de oxigênio e ~1% de outros gases.' },
        { q: 'Qual é a função da camada de ozônio?', a: 'Filtrar parte da radiação ultravioleta vinda do Sol', w: ['Manter a temperatura do planeta constante', 'Produzir o oxigênio que respiramos', 'Refletir as ondas de rádio'], why: 'O ozônio (O₃) na estratosfera absorve grande parte da radiação UV, que causa queimaduras e câncer de pele.' },
        { q: 'O efeito estufa natural é importante porque:', a: 'Mantém a Terra aquecida o suficiente para a vida existir', w: ['Impede qualquer raio solar de chegar ao solo', 'Produz as chuvas em todo o planeta', 'É o responsável pelas marés'], why: 'Sem efeito estufa natural, a temperatura média da Terra seria cerca de −18 °C. O problema é a INTENSIFICAÇÃO causada pelo excesso de gases.' },
        { q: 'Qual gás é o principal responsável pela intensificação do efeito estufa?', a: 'Gás carbônico (CO₂)', w: ['Nitrogênio (N₂)', 'Hélio (He)', 'Argônio (Ar)'], why: 'O CO₂, liberado principalmente na queima de combustíveis fósseis, é o principal gás de efeito estufa de origem humana.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci7-placas',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI15',
    topic: 'Placas tectônicas', level: 2, variants: 50,
    gen(r) {
      const itens = [
        { q: 'O que causa os terremotos na maior parte dos casos?', a: 'O movimento e o choque entre placas tectônicas', w: ['A rotação da Terra', 'A ação da gravidade da Lua', 'O aquecimento da atmosfera'], why: 'A litosfera é dividida em placas que se movem sobre o manto; o atrito e o choque entre elas liberam energia na forma de terremotos.' },
        { q: 'Por que o Brasil tem poucos terremotos de grande intensidade?', a: 'Porque está no meio da placa Sul-Americana, longe das bordas', w: ['Porque fica no hemisfério sul', 'Porque tem muita floresta', 'Porque o solo é muito antigo e não se move'], why: 'Terremotos fortes concentram-se nas bordas das placas. O Brasil está em região intraplaca.' },
        { q: 'O encaixe entre o litoral da América do Sul e o da África é uma evidência de quê?', a: 'Da deriva continental: os continentes já estiveram unidos', w: ['Da expansão da atmosfera', 'Da ação dos ventos ao longo do tempo', 'Do aumento do nível do mar'], why: 'Wegener propôs a deriva continental com base nesse encaixe, em fósseis e em formações rochosas comuns aos dois continentes.' },
        { q: 'O que é um tsunami?', a: 'Uma onda gigante gerada por terremotos ou deslizamentos no fundo do mar', w: ['Um vento muito forte sobre o oceano', 'Uma corrente marinha quente', 'Uma maré provocada apenas pela Lua'], why: 'O deslocamento brusco do fundo oceânico desloca um enorme volume de água, gerando ondas que crescem ao chegar à costa.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci7-vacinas',
    grade: 7, subject: 'ciencias', bncc: 'EF07CI10',
    topic: 'Saúde e vacinação', level: 1, variants: 40,
    gen(r) {
      const itens = [
        { q: 'Como uma vacina protege o organismo?', a: 'Estimulando o sistema imunológico a produzir anticorpos e memória imunológica', w: ['Matando diretamente todos os vírus do corpo', 'Substituindo as células doentes por células novas', 'Aumentando a temperatura do corpo para queimar os micróbios'], why: 'A vacina apresenta ao corpo uma versão inofensiva do agente. O organismo produz anticorpos e guarda a "memória" para responder rápido numa infecção real.' },
        { q: 'O que é imunidade coletiva (de rebanho)?', a: 'A proteção indireta de quem não pode se vacinar, quando a maioria da população está vacinada', w: ['A imunidade que só os animais possuem', 'A resistência que o corpo ganha ao ficar doente várias vezes', 'A proteção dada por um único tipo de vacina para todas as doenças'], why: 'Com alta cobertura vacinal, o agente circula menos e protege também bebês e pessoas imunossuprimidas.' },
        { q: 'Qual destas doenças é causada por um VÍRUS?', a: 'Dengue', w: ['Tuberculose', 'Tétano', 'Cólera'], why: 'Dengue é viral (transmitida pelo Aedes aegypti). Tuberculose, tétano e cólera são bacterianas.' },
        { q: 'Antibióticos são eficazes contra:', a: 'Bactérias', w: ['Vírus', 'Qualquer micro-organismo', 'Somente fungos'], why: 'Antibióticos agem sobre bactérias. Tomá-los para gripe (vírus) não ajuda e favorece bactérias resistentes.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  // ======================================================= 8º ANO
  tpl({
    id: 'ci8-fontes-energia',
    grade: 8, subject: 'ciencias', bncc: ['EF08CI01', 'EF08CI06'],
    topic: 'Fontes de energia', level: 1, variants: 90,
    gen(r) {
      const renovaveis = ['energia solar', 'energia eólica', 'energia hidrelétrica', 'biomassa', 'energia geotérmica', 'energia das marés']
      const naoRenovaveis = ['carvão mineral', 'petróleo', 'gás natural', 'energia nuclear (urânio)', 'xisto betuminoso']
      const pedeRenovavel = r.chance()
      const certo = pedeRenovavel ? r.pick(renovaveis) : r.pick(naoRenovaveis)
      return mc({
        prompt: `Qual das fontes abaixo é ${pedeRenovavel ? 'RENOVÁVEL' : 'NÃO RENOVÁVEL'}?`,
        answer: certo,
        wrong: r.sample(pedeRenovavel ? naoRenovaveis : renovaveis, 3),
        why: pedeRenovavel
          ? `A ${certo} se repõe naturalmente numa escala de tempo humana, por isso é renovável.`
          : `O ${certo} leva milhões de anos para se formar (ou tem reserva finita), por isso é não renovável.`,
      })
    },
  }),

  tpl({
    id: 'ci8-consumo-energia',
    grade: 8, subject: 'ciencias', bncc: 'EF08CI04',
    topic: 'Consumo de energia elétrica', level: 3, variants: 2000,
    gen(r) {
      const aparelhos = [
        { nome: 'chuveiro elétrico', p: 5500 }, { nome: 'ar-condicionado', p: 1400 },
        { nome: 'ferro de passar', p: 1000 }, { nome: 'geladeira', p: 150 },
        { nome: 'televisor', p: 100 }, { nome: 'computador', p: 200 },
        { nome: 'micro-ondas', p: 1200 }, { nome: 'secador de cabelo', p: 1800 },
      ]
      const ap = r.pick(aparelhos)
      const horas = ap.p > 1500 ? r.int(1, 2) / 2 : r.int(1, 8)
      const dias = 30
      const kwh = (ap.p * horas * dias) / 1000
      const tarifa = r.pick([0.7, 0.75, 0.8, 0.85, 0.9])
      const pedeCusto = r.chance(0.5)
      const custo = Math.round(kwh * tarifa * 100) / 100
      return input({
        prompt: pedeCusto
          ? `Um ${ap.nome} de ${num(ap.p)} W é usado ${num(horas)} h por dia durante ${dias} dias. A tarifa é de R$ ${num(tarifa, 2)} por kWh.\nQual é o custo mensal, em reais?`
          : `Um ${ap.nome} de ${num(ap.p)} W é usado ${num(horas)} h por dia durante ${dias} dias.\nQual é o consumo mensal, em kWh?`,
        answer: pedeCusto ? num(custo, 2) : num(kwh, Number.isInteger(kwh) ? 0 : 1),
        unit: pedeCusto ? 'R$' : 'kWh',
        decimal: pedeCusto || !Number.isInteger(kwh),
        why: `Consumo = ${num(ap.p)} W × ${num(horas)} h × ${dias} dias = ${num(ap.p * horas * dias)} Wh = ${num(kwh)} kWh.${pedeCusto ? ` Custo = ${num(kwh)} × ${num(tarifa, 2)} = R$ ${num(custo, 2)}.` : ''}`,
      })
    },
  }),

  tpl({
    id: 'ci8-transformacao-energia',
    grade: 8, subject: 'ciencias', bncc: 'EF08CI03',
    topic: 'Transformações de energia', level: 2, variants: 80,
    gen(r) {
      const itens = [
        { ap: 'chuveiro elétrico', tr: 'Elétrica → térmica' },
        { ap: 'ventilador', tr: 'Elétrica → mecânica (cinética)' },
        { ap: 'lâmpada', f: true, tr: 'Elétrica → luminosa (e térmica)' },
        { ap: 'caixa de som', f: true, tr: 'Elétrica → sonora' },
        { ap: 'painel solar fotovoltaico', tr: 'Luminosa → elétrica' },
        { ap: 'pilha', f: true, tr: 'Química → elétrica' },
        { ap: 'usina hidrelétrica', f: true, tr: 'Mecânica (cinética) → elétrica' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Qual transformação de energia ocorre principalmente em ${item.f ? 'uma' : 'um'} ${item.ap}?`,
        answer: item.tr,
        wrong: pickWrong(r, itens.map((i) => i.tr), item.tr),
        why: `${item.f ? 'Na' : 'No'} ${item.ap} a transformação principal é: ${item.tr}.`,
      })
    },
  }),

  tpl({
    id: 'ci8-circuitos',
    grade: 8, subject: 'ciencias', bncc: 'EF08CI02',
    topic: 'Circuitos elétricos', level: 2, variants: 40,
    gen(r) {
      const itens = [
        { q: 'Num circuito em SÉRIE com duas lâmpadas, o que acontece se uma delas queimar?', a: 'A outra também apaga, pois o circuito é interrompido', w: ['A outra brilha mais forte', 'Nada muda', 'A outra pisca intermitentemente'], why: 'Em série há um único caminho para a corrente: se ele é interrompido em qualquer ponto, nada mais funciona.' },
        { q: 'Num circuito em PARALELO com duas lâmpadas, o que acontece se uma queimar?', a: 'A outra continua acesa, pois cada uma tem seu próprio caminho', w: ['As duas apagam', 'A outra apaga depois de alguns segundos', 'O fusível sempre queima'], why: 'Em paralelo cada componente tem um caminho independente para a corrente — é assim que a rede elétrica de uma casa é ligada.' },
        { q: 'O que é um material CONDUTOR elétrico?', a: 'Material que permite a passagem fácil da corrente elétrica, como o cobre', w: ['Material que impede totalmente a corrente, como a borracha', 'Material que armazena corrente, como a pilha', 'Material que transforma corrente em luz'], why: 'Metais como cobre e alumínio têm elétrons livres, o que facilita a condução. Isolantes (borracha, plástico, vidro) não têm.' },
        { q: 'Para que serve o fusível ou disjuntor numa instalação elétrica?', a: 'Interromper o circuito quando a corrente fica alta demais, evitando incêndios', w: ['Aumentar a tensão da rede', 'Economizar energia elétrica', 'Transformar corrente contínua em alternada'], why: 'É um dispositivo de proteção: ele "abre" o circuito antes que o aquecimento excessivo danifique a fiação.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci8-fases-lua',
    grade: 8, subject: 'ciencias', bncc: 'EF08CI12',
    topic: 'Fases da Lua e eclipses', level: 2, variants: 60,
    gen(r) {
      const itens = [
        { q: 'Em qual fase a Lua fica entre a Terra e o Sol, com a face iluminada voltada para o Sol?', a: 'Lua nova', w: ['Lua cheia', 'Quarto crescente', 'Quarto minguante'], why: 'Na Lua nova, a face iluminada está voltada para o Sol e não a vemos da Terra.' },
        { q: 'Quando ocorre um eclipse SOLAR?', a: 'Quando a Lua fica entre o Sol e a Terra, projetando sombra sobre a Terra', w: ['Quando a Terra fica entre o Sol e a Lua', 'Quando o Sol fica entre a Terra e a Lua', 'Quando a Lua entra na atmosfera terrestre'], why: 'O eclipse solar acontece na Lua nova, quando a Lua se alinha entre o Sol e a Terra.' },
        { q: 'Quando ocorre um eclipse LUNAR?', a: 'Quando a Terra fica entre o Sol e a Lua, projetando sombra sobre a Lua', w: ['Quando a Lua fica entre o Sol e a Terra', 'Durante a Lua nova, sempre', 'Quando a Lua se afasta demais da Terra'], why: 'O eclipse lunar acontece na Lua cheia, quando a Terra se alinha entre o Sol e a Lua.' },
        { q: 'Quanto tempo dura aproximadamente um ciclo completo das fases da Lua?', a: 'Cerca de 29,5 dias', w: ['Cerca de 7 dias', 'Cerca de 365 dias', 'Cerca de 24 horas'], why: 'O ciclo lunar (lunação) dura cerca de 29,5 dias — por isso cada fase dura aproximadamente uma semana.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci8-estacoes',
    grade: 8, subject: 'ciencias', bncc: ['EF08CI13', 'EF08CI15'],
    topic: 'Estações do ano e tempo', level: 2, variants: 50,
    gen(r) {
      const itens = [
        { q: 'O que causa as estações do ano?', a: 'A inclinação do eixo da Terra combinada com o movimento de translação', w: ['A variação da distância entre a Terra e o Sol', 'A rotação da Terra em 24 horas', 'As fases da Lua ao longo do ano'], why: 'A inclinação de ~23,5° faz com que cada hemisfério receba luz solar de forma mais direta ou mais inclinada ao longo do ano.' },
        { q: 'Qual é a diferença entre TEMPO e CLIMA?', a: 'Tempo é a condição momentânea; clima é o padrão observado ao longo de muitos anos', w: ['São sinônimos', 'Tempo vale para o Brasil e clima para o mundo todo', 'Clima muda todo dia e tempo é fixo'], why: 'Tempo responde "como está hoje?"; clima responde "como costuma ser aqui nas últimas décadas?".' },
        { q: 'Qual instrumento mede a pressão atmosférica?', a: 'Barômetro', w: ['Termômetro', 'Anemômetro', 'Pluviômetro'], why: 'Barômetro: pressão. Termômetro: temperatura. Anemômetro: velocidade do vento. Pluviômetro: chuva.' },
        { q: 'Quando é verão no hemisfério sul, no hemisfério norte é:', a: 'Inverno', w: ['Verão também', 'Primavera', 'Outono'], why: 'As estações são opostas nos dois hemisférios, por causa da inclinação do eixo terrestre.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci8-reproducao',
    grade: 8, subject: 'ciencias', bncc: ['EF08CI07', 'EF08CI08'],
    topic: 'Reprodução e puberdade', level: 2, variants: 60,
    gen(r) {
      const itens = [
        { q: 'Qual é a principal diferença entre reprodução sexuada e assexuada?', a: 'Na sexuada há união de gametas e variabilidade genética; na assexuada, os descendentes são geneticamente idênticos ao genitor', w: ['A assexuada só ocorre em animais', 'A sexuada é sempre mais rápida', 'Na assexuada os filhotes nascem maiores'], why: 'A variabilidade genética da reprodução sexuada é matéria-prima da evolução.' },
        { q: 'O que é polinização?', a: 'A transferência do pólen da antera para o estigma da flor', w: ['A germinação da semente no solo', 'A absorção de água pelas raízes', 'A produção de clorofila pelas folhas'], why: 'A polinização pode ser feita por insetos, aves, vento ou água, e antecede a fecundação.' },
        { q: 'Quais hormônios estão associados às transformações da puberdade?', a: 'Testosterona e estrogênio', w: ['Insulina e glucagon', 'Adrenalina e cortisol', 'Melatonina e serotonina'], why: 'Testosterona e estrogênio são os principais hormônios sexuais responsáveis pelas características sexuais secundárias.' },
        { q: 'Em qual órgão ocorre o desenvolvimento do embrião humano?', a: 'Útero', w: ['Ovário', 'Tuba uterina', 'Bexiga'], why: 'A fecundação costuma ocorrer na tuba uterina, mas o embrião se implanta e se desenvolve no útero.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  // ======================================================= 9º ANO
  tpl({
    id: 'ci9-estados-fisicos',
    grade: 9, subject: 'ciencias', bncc: 'EF09CI01',
    topic: 'Mudanças de estado', level: 1, variants: 60,
    gen(r) {
      const itens = [
        { mud: 'Fusão', de: 'sólido', para: 'líquido', ex: 'gelo derretendo' },
        { mud: 'Solidificação', de: 'líquido', para: 'sólido', ex: 'água virando gelo no congelador' },
        { mud: 'Vaporização', de: 'líquido', para: 'gasoso', ex: 'água fervendo na panela' },
        { mud: 'Condensação', de: 'gasoso', para: 'líquido', ex: 'gotas se formando num copo gelado' },
        { mud: 'Sublimação', de: 'sólido', para: 'gasoso', ex: 'naftalina desaparecendo no armário' },
      ]
      const item = r.pick(itens)
      const pedeNome = r.chance(0.6)
      if (pedeNome) {
        return mc({
          prompt: `Como se chama a mudança de estado de ${item.de} para ${item.para}?`,
          answer: item.mud,
          wrong: pickWrong(r, itens.map((i) => i.mud), item.mud),
          why: `${item.mud}: passagem de ${item.de} para ${item.para}. Exemplo: ${item.ex}.`,
        })
      }
      return mc({
        prompt: `"${item.ex.charAt(0).toUpperCase() + item.ex.slice(1)}" é um exemplo de qual mudança de estado?`,
        answer: item.mud,
        wrong: pickWrong(r, itens.map((i) => i.mud), item.mud),
        why: `Nesse processo a substância passa de ${item.de} para ${item.para}: ${item.mud.toLowerCase()}.`,
      })
    },
  }),

  tpl({
    id: 'ci9-lavoisier',
    grade: 9, subject: 'ciencias', bncc: 'EF09CI02',
    topic: 'Conservação da massa', level: 2, variants: 800,
    gen(r) {
      const reagente1 = r.int(10, 90)
      const reagente2 = r.int(10, 90)
      const produto1 = r.int(5, reagente1 + reagente2 - 5)
      const produto2 = reagente1 + reagente2 - produto1
      return input({
        prompt: `Numa reação química em recipiente fechado, ${reagente1} g de uma substância reagiram com ${reagente2} g de outra, formando dois produtos. Um dos produtos tem massa de ${produto1} g.\nQual é a massa do outro produto, em gramas?`,
        answer: produto2,
        unit: 'g',
        why: `Lei de Lavoisier (conservação da massa): a massa total dos reagentes é igual à dos produtos. ${reagente1} + ${reagente2} = ${reagente1 + reagente2} g. Então ${reagente1 + reagente2} − ${produto1} = ${produto2} g.`,
      })
    },
  }),

  tpl({
    id: 'ci9-atomo',
    grade: 9, subject: 'ciencias', bncc: 'EF09CI03',
    topic: 'Estrutura da matéria', level: 2, variants: 500,
    gen(r) {
      const elementos = [
        { s: 'H', n: 'Hidrogênio', z: 1, a: 1 }, { s: 'He', n: 'Hélio', z: 2, a: 4 },
        { s: 'C', n: 'Carbono', z: 6, a: 12 }, { s: 'N', n: 'Nitrogênio', z: 7, a: 14 },
        { s: 'O', n: 'Oxigênio', z: 8, a: 16 }, { s: 'Na', n: 'Sódio', z: 11, a: 23 },
        { s: 'Mg', n: 'Magnésio', z: 12, a: 24 }, { s: 'Al', n: 'Alumínio', z: 13, a: 27 },
        { s: 'Cl', n: 'Cloro', z: 17, a: 35 }, { s: 'Ca', n: 'Cálcio', z: 20, a: 40 },
        { s: 'Fe', n: 'Ferro', z: 26, a: 56 },
      ]
      const el = r.pick(elementos)
      const pergunta = r.pick(['neutrons', 'eletrons', 'simbolo'])
      if (pergunta === 'neutrons') {
        return input({
          prompt: `O ${el.n} (${el.s}) tem número atômico Z = ${el.z} e número de massa A = ${el.a}.\nQuantos nêutrons há no núcleo desse átomo?`,
          answer: el.a - el.z,
          why: `Nêutrons = A − Z = ${el.a} − ${el.z} = ${el.a - el.z}.`,
        })
      }
      if (pergunta === 'eletrons') {
        return input({
          prompt: `Um átomo neutro de ${el.n} tem número atômico Z = ${el.z}.\nQuantos elétrons ele possui?`,
          answer: el.z,
          why: `Num átomo NEUTRO, o número de elétrons é igual ao de prótons, que é o número atômico: ${el.z}.`,
        })
      }
      return mc({
        prompt: `Qual é o símbolo químico do elemento ${el.n}?`,
        answer: el.s,
        wrong: pickWrong(r, elementos.map((e) => e.s), el.s),
        why: `${el.n} tem símbolo ${el.s} (Z = ${el.z}).`,
      })
    },
  }),

  tpl({
    id: 'ci9-genetica',
    grade: 9, subject: 'ciencias', bncc: ['EF09CI08', 'EF09CI09'],
    topic: 'Genética mendeliana', level: 3, variants: 600,
    gen(r) {
      const caracteristicas = [
        { carac: 'cor da flor', dom: 'vermelha', rec: 'branca', letra: 'V' },
        { carac: 'cor da semente', dom: 'amarela', rec: 'verde', letra: 'A' },
        { carac: 'textura da semente', dom: 'lisa', rec: 'rugosa', letra: 'L' },
        { carac: 'cor da pelagem', dom: 'preta', rec: 'marrom', letra: 'P' },
      ]
      const c = r.pick(caracteristicas)
      const L = c.letra
      const cruzamento = r.pick(['heteroxhetero', 'heteroxrec', 'domxhetero'])
      if (cruzamento === 'heteroxhetero') {
        const pergunta = r.pick(['dominante', 'recessivo'])
        const [n, d] = pergunta === 'dominante' ? [3, 4] : [1, 4]
        return mc({
          prompt: `Cruzando duas plantas heterozigotas (${L}${L.toLowerCase()} × ${L}${L.toLowerCase()}) para a ${c.carac}, qual é a probabilidade de um descendente apresentar a característica ${pergunta === 'dominante' ? `${c.dom} (dominante)` : `${c.rec} (recessiva)`}?`,
          supportMono: true,
          support: `Quadro de Punnett:\n      ${L}        ${L.toLowerCase()}\n${L}   ${L}${L}      ${L}${L.toLowerCase()}\n${L.toLowerCase()}   ${L}${L.toLowerCase()}      ${L.toLowerCase()}${L.toLowerCase()}`,
          answer: `${n}/${d}`,
          wrong: pickWrong(r, ['1/4', '1/2', '3/4', '1/1', '2/3'], `${n}/${d}`),
          why: `O cruzamento ${L}${L.toLowerCase()} × ${L}${L.toLowerCase()} gera 1 ${L}${L} : 2 ${L}${L.toLowerCase()} : 1 ${L.toLowerCase()}${L.toLowerCase()}. ${pergunta === 'dominante' ? `Três dos quatro têm pelo menos um ${L}, logo 3/4 são ${c.dom}s.` : `Apenas ${L.toLowerCase()}${L.toLowerCase()} é ${c.rec}: 1/4.`}`,
        })
      }
      if (cruzamento === 'heteroxrec') {
        return mc({
          prompt: `Cruzando ${L}${L.toLowerCase()} × ${L.toLowerCase()}${L.toLowerCase()} para a ${c.carac}, qual é a proporção esperada de descendentes com a característica ${c.rec} (recessiva)?`,
          answer: '1/2',
          wrong: pickWrong(r, ['1/4', '3/4', '1/1', '2/3', '0'], '1/2'),
          why: `${L}${L.toLowerCase()} × ${L.toLowerCase()}${L.toLowerCase()} gera metade ${L}${L.toLowerCase()} (${c.dom}) e metade ${L.toLowerCase()}${L.toLowerCase()} (${c.rec}): 1/2.`,
        })
      }
      return mc({
        prompt: `Cruzando ${L}${L} × ${L}${L.toLowerCase()} para a ${c.carac}, qual é a proporção de descendentes com a característica ${c.dom} (dominante)?`,
        answer: '4/4 (todos)',
        wrong: ['1/2', '3/4', '1/4'],
        why: `Todos os descendentes recebem pelo menos um ${L} do genitor ${L}${L}, então 100% apresentam a característica ${c.dom}.`,
      })
    },
  }),

  tpl({
    id: 'ci9-evolucao',
    grade: 9, subject: 'ciencias', bncc: ['EF09CI10', 'EF09CI11'],
    topic: 'Evolução', level: 2, variants: 60,
    gen(r) {
      const itens = [
        { q: 'Qual é a ideia central da seleção natural de Darwin?', a: 'Os indivíduos mais adaptados ao ambiente têm mais chance de sobreviver e deixar descendentes', w: ['O uso e desuso dos órgãos transmite características aos filhos', 'Todas as espécies foram criadas já adaptadas', 'Os organismos escolhem conscientemente suas características'], why: 'A seleção natural atua sobre a variabilidade já existente na população.' },
        { q: 'Qual afirmação corresponde às ideias de LAMARCK?', a: 'Características adquiridas pelo uso e desuso são transmitidas aos descendentes', w: ['A variabilidade surge ao acaso e o ambiente seleciona', 'As espécies não mudam ao longo do tempo', 'A evolução ocorre apenas por migração'], why: 'Lamarck propôs a lei do uso e desuso e a transmissão de caracteres adquiridos — hipótese não sustentada pelas evidências atuais.' },
        { q: 'O que são fósseis e por que são importantes para o estudo da evolução?', a: 'Restos ou vestígios de seres do passado, que mostram como as espécies mudaram ao longo do tempo', w: ['Rochas formadas por lava vulcânica resfriada', 'Minerais usados para datar a idade do Sol', 'Sementes antigas que ainda germinam'], why: 'O registro fóssil é uma das principais evidências do processo evolutivo.' },
        { q: 'Por que o uso incorreto de antibióticos gera bactérias resistentes?', a: 'Porque sobrevivem e se multiplicam as bactérias que já eram naturalmente resistentes', w: ['Porque os antibióticos criam genes novos nas bactérias', 'Porque as bactérias aprendem a se defender', 'Porque o corpo humano produz resistência e passa às bactérias'], why: 'É seleção natural em ação: o antibiótico elimina as sensíveis e as resistentes se tornam maioria.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci9-radiacoes',
    grade: 9, subject: 'ciencias', bncc: ['EF09CI04', 'EF09CI06'],
    topic: 'Ondas e radiações', level: 2, variants: 70,
    gen(r) {
      const itens = [
        { q: 'Quais são as três cores primárias da LUZ?', a: 'Vermelho, verde e azul', w: ['Vermelho, amarelo e azul', 'Ciano, magenta e amarelo', 'Branco, preto e cinza'], why: 'Na síntese aditiva (luz), as primárias são vermelho, verde e azul (RGB). As cores primárias de pigmento são outras.' },
        { q: 'Por que uma folha de árvore parece verde?', a: 'Porque reflete principalmente a luz verde e absorve as demais cores', w: ['Porque emite luz verde própria', 'Porque absorve apenas a luz verde', 'Porque a clorofila transforma luz branca em verde'], why: 'A cor que vemos é a luz REFLETIDA pelo objeto.' },
        { q: 'Qual destas radiações tem a MAIOR frequência?', a: 'Raios gama', w: ['Ondas de rádio', 'Micro-ondas', 'Luz visível'], why: 'Na ordem crescente de frequência: rádio < micro-ondas < infravermelho < visível < ultravioleta < raios X < raios gama.' },
        { q: 'Qual tipo de radiação é usado no controle remoto da TV?', a: 'Infravermelho', w: ['Ultravioleta', 'Raios X', 'Ondas de rádio AM'], why: 'O controle remoto emite pulsos de luz infravermelha, invisível ao olho humano.' },
        { q: 'Por que o som NÃO se propaga no vácuo, mas a luz sim?', a: 'Porque o som é uma onda mecânica e precisa de um meio material; a luz é eletromagnética', w: ['Porque o som é mais lento que a luz', 'Porque no vácuo não há gravidade', 'Porque o som só existe dentro da atmosfera da Terra'], why: 'Ondas mecânicas precisam de partículas para vibrar; ondas eletromagnéticas não.' },
      ]
      const item = r.pick(itens)
      return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why })
    },
  }),

  tpl({
    id: 'ci9-sistema-solar',
    grade: 9, subject: 'ciencias', bncc: ['EF09CI14', 'EF09CI17'],
    topic: 'Sistema Solar', level: 1, variants: 80,
    gen(r) {
      const planetas = ['Mercúrio', 'Vênus', 'Terra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno']
      const pergunta = r.pick(['ordem', 'maior', 'tipo', 'sol'])
      if (pergunta === 'ordem') {
        const i = r.int(0, 7)
        return mc({
          prompt: `Qual é o ${i + 1}º planeta a partir do Sol?`,
          answer: planetas[i],
          wrong: r.sample(planetas.filter((_, idx) => idx !== i), 3),
          why: `A ordem é: ${planetas.join(', ')}.`,
        })
      }
      if (pergunta === 'maior') {
        return mc({
          prompt: 'Qual é o maior planeta do Sistema Solar?',
          answer: 'Júpiter',
          wrong: ['Saturno', 'Terra', 'Netuno'],
          why: 'Júpiter é o maior: mais de 1.300 Terras caberiam dentro dele.',
        })
      }
      if (pergunta === 'tipo') {
        const rochosos = ['Mercúrio', 'Vênus', 'Terra', 'Marte']
        const gasosos = ['Júpiter', 'Saturno', 'Urano', 'Netuno']
        const pedeRochoso = r.chance()
        const certo = pedeRochoso ? r.pick(rochosos) : r.pick(gasosos)
        return mc({
          prompt: `Qual destes é um planeta ${pedeRochoso ? 'ROCHOSO (telúrico)' : 'GASOSO (joviano)'}?`,
          answer: certo,
          wrong: r.sample(pedeRochoso ? gasosos : rochosos, 3),
          why: `Rochosos: ${rochosos.join(', ')}. Gasosos: ${gasosos.join(', ')}.`,
        })
      }
      return mc({
        prompt: 'Qual é a principal fonte de energia do Sol?',
        answer: 'A fusão nuclear do hidrogênio em hélio no seu núcleo',
        wrong: ['A queima de hidrogênio com oxigênio', 'O atrito entre as camadas de gás', 'A fissão de átomos de urânio'],
        why: 'No núcleo solar, sob pressão e temperatura altíssimas, núcleos de hidrogênio se fundem formando hélio e liberando enorme quantidade de energia.',
      })
    },
  }),
]
