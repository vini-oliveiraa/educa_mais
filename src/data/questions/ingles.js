import { tpl, mc, pickWrong, take3 } from './helpers.js'

/** Língua Inglesa — 6º ao 9º ano. */

const PRONOUNS = [
  { p: 'I', be: 'am', has: 'have', s: false, obj: 'me', poss: 'my' },
  { p: 'You', be: 'are', has: 'have', s: false, obj: 'you', poss: 'your' },
  { p: 'He', be: 'is', has: 'has', s: true, obj: 'him', poss: 'his' },
  { p: 'She', be: 'is', has: 'has', s: true, obj: 'her', poss: 'her' },
  { p: 'It', be: 'is', has: 'has', s: true, obj: 'it', poss: 'its' },
  { p: 'We', be: 'are', has: 'have', s: false, obj: 'us', poss: 'our' },
  { p: 'They', be: 'are', has: 'have', s: false, obj: 'them', poss: 'their' },
]

const VERBS_REGULAR = [
  { inf: 'play', third: 'plays', ing: 'playing', past: 'played', pt: 'jogar / tocar' },
  { inf: 'work', third: 'works', ing: 'working', past: 'worked', pt: 'trabalhar' },
  { inf: 'study', third: 'studies', ing: 'studying', past: 'studied', pt: 'estudar' },
  { inf: 'watch', third: 'watches', ing: 'watching', past: 'watched', pt: 'assistir' },
  { inf: 'live', third: 'lives', ing: 'living', past: 'lived', pt: 'morar / viver' },
  { inf: 'travel', third: 'travels', ing: 'travelling', past: 'travelled', pt: 'viajar' },
  { inf: 'help', third: 'helps', ing: 'helping', past: 'helped', pt: 'ajudar' },
  { inf: 'open', third: 'opens', ing: 'opening', past: 'opened', pt: 'abrir' },
]

const VERBS_IRREGULAR = [
  { inf: 'go', third: 'goes', ing: 'going', past: 'went', pt: 'ir' },
  { inf: 'have', third: 'has', ing: 'having', past: 'had', pt: 'ter' },
  { inf: 'make', third: 'makes', ing: 'making', past: 'made', pt: 'fazer' },
  { inf: 'take', third: 'takes', ing: 'taking', past: 'took', pt: 'pegar / levar' },
  { inf: 'eat', third: 'eats', ing: 'eating', past: 'ate', pt: 'comer' },
  { inf: 'write', third: 'writes', ing: 'writing', past: 'wrote', pt: 'escrever' },
  { inf: 'see', third: 'sees', ing: 'seeing', past: 'saw', pt: 'ver' },
  { inf: 'buy', third: 'buys', ing: 'buying', past: 'bought', pt: 'comprar' },
  { inf: 'speak', third: 'speaks', ing: 'speaking', past: 'spoke', pt: 'falar' },
  { inf: 'drink', third: 'drinks', ing: 'drinking', past: 'drank', pt: 'beber' },
  { inf: 'read', third: 'reads', ing: 'reading', past: 'read', pt: 'ler' },
  { inf: 'teach', third: 'teaches', ing: 'teaching', past: 'taught', pt: 'ensinar' },
]

const ADJECTIVES = [
  { adj: 'tall', comp: 'taller', sup: 'the tallest', pt: 'alto' },
  { adj: 'big', comp: 'bigger', sup: 'the biggest', pt: 'grande' },
  { adj: 'happy', comp: 'happier', sup: 'the happiest', pt: 'feliz' },
  { adj: 'fast', comp: 'faster', sup: 'the fastest', pt: 'rápido' },
  { adj: 'expensive', comp: 'more expensive', sup: 'the most expensive', pt: 'caro' },
  { adj: 'beautiful', comp: 'more beautiful', sup: 'the most beautiful', pt: 'bonito' },
  { adj: 'good', comp: 'better', sup: 'the best', pt: 'bom' },
  { adj: 'bad', comp: 'worse', sup: 'the worst', pt: 'ruim' },
  { adj: 'interesting', comp: 'more interesting', sup: 'the most interesting', pt: 'interessante' },
]

const VOCAB = [
  { en: 'book', pt: 'livro', tema: 'escola' }, { en: 'notebook', pt: 'caderno', tema: 'escola' },
  { en: 'teacher', pt: 'professor(a)', tema: 'escola' }, { en: 'pencil', pt: 'lápis', tema: 'escola' },
  { en: 'eraser', pt: 'borracha', tema: 'escola' }, { en: 'ruler', pt: 'régua', tema: 'escola' },
  { en: 'kitchen', pt: 'cozinha', tema: 'casa' }, { en: 'bedroom', pt: 'quarto', tema: 'casa' },
  { en: 'bathroom', pt: 'banheiro', tema: 'casa' }, { en: 'living room', pt: 'sala de estar', tema: 'casa' },
  { en: 'brother', pt: 'irmão', tema: 'família' }, { en: 'sister', pt: 'irmã', tema: 'família' },
  { en: 'grandmother', pt: 'avó', tema: 'família' }, { en: 'uncle', pt: 'tio', tema: 'família' },
  { en: 'cousin', pt: 'primo(a)', tema: 'família' }, { en: 'daughter', pt: 'filha', tema: 'família' },
  { en: 'Monday', pt: 'segunda-feira', tema: 'dias' }, { en: 'Wednesday', pt: 'quarta-feira', tema: 'dias' },
  { en: 'Thursday', pt: 'quinta-feira', tema: 'dias' }, { en: 'Saturday', pt: 'sábado', tema: 'dias' },
  { en: 'breakfast', pt: 'café da manhã', tema: 'rotina' }, { en: 'homework', pt: 'dever de casa', tema: 'rotina' },
]

export default [
  // ======================================================= 6º ANO
  tpl({
    id: 'en6-verb-to-be',
    grade: 6, subject: 'ingles', bncc: 'EF06LI18',
    topic: 'Verb to be', level: 1, variants: 300,
    gen(r) {
      const pr = r.pick(PRONOUNS)
      const complementos = ['a student.', 'happy today.', 'from Brazil.', 'at school.', 'twelve years old.', 'my best friend.']
      const negativa = r.chance(0.25)
      const frase = `${pr.p} ___ ${r.pick(complementos)}`
      const certo = negativa ? `${pr.be} not` : pr.be
      return mc({
        prompt: `Complete the sentence with the correct form of the verb TO BE${negativa ? ' in the NEGATIVE form' : ''}:\n\n${frase}`,
        answer: certo,
        wrong: take3(certo, negativa
          ? ['am not', 'is not', 'are not', 'not is'].filter((x) => x !== certo)
          : ['am', 'is', 'are', 'be'].filter((x) => x !== certo)),
        why: `Com o pronome "${pr.p}" usamos "${pr.be}"${negativa ? `, e a negativa se forma com "not" depois do verbo: "${pr.be} not".` : '.'} (I → am; He/She/It → is; You/We/They → are)`,
      })
    },
  }),

  tpl({
    id: 'en6-simple-present',
    grade: 6, subject: 'ingles', bncc: 'EF06LI18',
    topic: 'Simple present', level: 2, variants: 500,
    gen(r) {
      const pr = r.pick(PRONOUNS)
      const v = r.pick([...VERBS_REGULAR, ...VERBS_IRREGULAR])
      const certo = pr.s ? v.third : v.inf
      const complementos = { play: 'soccer every weekend.', work: 'in a hospital.', study: 'English on Mondays.', watch: 'TV after dinner.', live: 'in São Paulo.', travel: 'to the beach in January.', help: 'the neighbours.', open: 'the window every morning.', go: 'to school by bus.', have: 'two brothers.', make: 'a cake on Sundays.', take: 'the bus at 7 a.m.', eat: 'rice and beans for lunch.', write: 'poems in a notebook.', see: 'the ocean from the window.', buy: 'bread at the bakery.', speak: 'three languages.', drink: 'milk in the morning.', read: 'comic books at night.', teach: 'Maths at my school.' }
      return mc({
        prompt: `Complete the sentence in the SIMPLE PRESENT:\n\n${pr.p} ___ ${complementos[v.inf] ?? 'every day.'}`,
        support: `${v.inf} = ${v.pt}`,
        answer: certo,
        wrong: take3(certo, [pr.s ? v.inf : v.third, v.ing, v.past, `${v.inf}ed`]),
        why: pr.s
          ? `Na 3ª pessoa do singular (He / She / It) o verbo no simple present recebe -s / -es / -ies: "${v.inf}" → "${v.third}".`
          : `Com "${pr.p}" o verbo fica na forma base, sem -s: "${v.inf}".`,
      })
    },
  }),

  tpl({
    id: 'en6-articles',
    grade: 6, subject: 'ingles', bncc: 'EF06LI23',
    topic: 'Articles a / an', level: 1, variants: 120,
    gen(r) {
      const palavras = [
        { w: 'apple', a: 'an' }, { w: 'book', a: 'a' }, { w: 'orange', a: 'an' },
        { w: 'teacher', a: 'a' }, { w: 'umbrella', a: 'an' }, { w: 'elephant', a: 'an' },
        { w: 'house', a: 'a' }, { w: 'egg', a: 'an' }, { w: 'computer', a: 'a' },
        { w: 'hour', a: 'an' }, { w: 'university', a: 'a' }, { w: 'island', a: 'an' },
      ]
      const item = r.pick(palavras)
      return mc({
        prompt: `Choose the correct article:\n\nThis is ___ ${item.w}.`,
        answer: item.a,
        wrong: take3(item.a, ['a', 'an', 'the', 'any']),
        why: item.w === 'hour'
          ? 'Usamos "an" antes de SOM de vogal. "Hour" começa com "h" mudo, então o som é de vogal.'
          : item.w === 'university'
            ? 'Usamos "a" porque "university" começa com som de /ju/ — som de consoante, apesar da letra "u".'
            : `Usamos "${item.a}" porque "${item.w}" começa com som de ${item.a === 'an' ? 'vogal' : 'consoante'}.`,
      })
    },
  }),

  tpl({
    id: 'en6-plural',
    grade: 6, subject: 'ingles', bncc: 'EF06LI17',
    topic: 'Plural of nouns', level: 2, variants: 150,
    gen(r) {
      const nouns = [
        { s: 'child', p: 'children' }, { s: 'man', p: 'men' }, { s: 'woman', p: 'women' },
        { s: 'foot', p: 'feet' }, { s: 'tooth', p: 'teeth' }, { s: 'person', p: 'people' },
        { s: 'box', p: 'boxes' }, { s: 'city', p: 'cities' }, { s: 'baby', p: 'babies' },
        { s: 'knife', p: 'knives' }, { s: 'leaf', p: 'leaves' }, { s: 'bus', p: 'buses' },
        { s: 'watch', p: 'watches' }, { s: 'mouse', p: 'mice' }, { s: 'potato', p: 'potatoes' },
      ]
      const item = r.pick(nouns)
      return mc({
        prompt: `What is the plural of "${item.s}"?`,
        answer: item.p,
        wrong: take3(item.p, [`${item.s}s`, `${item.s}es`, item.s, ...r.sample(nouns.filter((n) => n.p !== item.p).map((n) => n.p), 2)]),
        why: `O plural de "${item.s}" é "${item.p}".`,
      })
    },
  }),

  tpl({
    id: 'en6-vocabulary',
    grade: 6, subject: 'ingles', bncc: ['EF06LI17', 'EF06LI16'],
    topic: 'Vocabulary', level: 1, variants: 300,
    gen(r) {
      const item = r.pick(VOCAB)
      const enToPt = r.chance()
      if (enToPt) {
        return mc({
          prompt: `What does "${item.en}" mean in Portuguese?`,
          answer: item.pt,
          wrong: pickWrong(r, VOCAB.map((v) => v.pt), item.pt),
          why: `"${item.en}" = ${item.pt} (tema: ${item.tema}).`,
        })
      }
      return mc({
        prompt: `How do you say "${item.pt}" in English?`,
        answer: item.en,
        wrong: pickWrong(r, VOCAB.map((v) => v.en), item.en),
        why: `${item.pt} = "${item.en}" (tema: ${item.tema}).`,
      })
    },
  }),

  tpl({
    id: 'en6-genitive',
    grade: 6, subject: 'ingles', bncc: 'EF06LI22',
    topic: "Genitive case ('s)", level: 2, variants: 100,
    gen(r) {
      // `pt` já vem com a preposição contraída (de + o = do, de + os = dos),
      // senão o enunciado sairia como "o livro de o professor".
      const donos = [
        { en: 'Peter', pt: 'de Peter', pl: false },
        { en: 'Maria', pt: 'de Maria', pl: false },
        { en: 'my sister', pt: 'da minha irmã', pl: false },
        { en: 'the teacher', pt: 'do professor', pl: false },
        { en: 'Lucas', pt: 'de Lucas', pl: false },
        { en: 'my parents', pt: 'dos meus pais', pl: true },
        { en: 'the students', pt: 'dos alunos', pl: true },
      ]
      // `g` é o gênero do substantivo em português, para o artigo concordar.
      const coisas = [
        { en: 'book', pt: 'livro', g: 'o' }, { en: 'car', pt: 'carro', g: 'o' },
        { en: 'house', pt: 'casa', g: 'a' }, { en: 'backpack', pt: 'mochila', g: 'a' },
        { en: 'phone', pt: 'celular', g: 'o' }, { en: 'bicycle', pt: 'bicicleta', g: 'a' },
      ]
      const dono = r.pick(donos)
      const coisa = r.pick(coisas)
      // Plural terminado em -s leva só o apóstrofo; os demais levam 's.
      const certo = dono.pl ? `${dono.en}' ${coisa.en}` : `${dono.en}'s ${coisa.en}`
      return mc({
        prompt: `Choose the correct way to express possession:\n\n"${coisa.g} ${coisa.pt} ${dono.pt}"`,
        answer: certo,
        wrong: take3(certo, [
          dono.pl ? `${dono.en}'s ${coisa.en}` : `${dono.en}' ${coisa.en}`,
          `${coisa.en} of ${dono.en}`,
          `${coisa.en}'s ${dono.en}`,
          `the ${coisa.en} ${dono.en}`,
        ]),
        why: dono.pl
          ? `Com substantivos no PLURAL terminados em -s acrescentamos apenas o apóstrofo: "${dono.en}' ${coisa.en}".`
          : `O genitivo ('s) indica posse e vem depois do DONO: "${dono.en}'s ${coisa.en}".`,
      })
    },
  }),

  tpl({
    // Present continuous é habilidade do 6º ano na BNCC (EF06LI19); fica aqui,
    // e o 7º retoma a estrutura dentro dos tempos do passado.
    id: 'en6-present-continuous',
    grade: 6, subject: 'ingles', bncc: 'EF06LI19',
    topic: 'Present continuous', level: 2, variants: 400,
    gen(r) {
      const pr = r.pick(PRONOUNS)
      const v = r.pick([...VERBS_REGULAR, ...VERBS_IRREGULAR])
      const certo = `${pr.be} ${v.ing}`
      return mc({
        prompt: `Complete the sentence in the PRESENT CONTINUOUS:\n\n${pr.p} ___ right now.`,
        support: `${v.inf} = ${v.pt}`,
        answer: certo,
        wrong: take3(certo, [
          `${pr.be} ${v.inf}`,
          `${pr.has} ${v.ing}`,
          `${v.ing}`,
          `${pr.be === 'am' ? 'is' : 'am'} ${v.ing}`,
        ]),
        why: `Present continuous = verbo TO BE + verbo com -ING. Com "${pr.p}" usamos "${pr.be}", e "${v.inf}" vira "${v.ing}".`,
      })
    },
  }),

  // ======================================================= 7º ANO
  tpl({
    id: 'en7-frequency',
    grade: 7, subject: 'ingles', bncc: 'EF07LI17',
    topic: 'Adverbs of frequency', level: 2, variants: 160,
    gen(r) {
      const itens = [
        { adv: 'always', pct: '100% do tempo', ex: 'She always brushes her teeth before bed.' },
        { adv: 'usually', pct: 'quase sempre (cerca de 80%)', ex: 'I usually walk to school.' },
        { adv: 'often', pct: 'com frequência (cerca de 60%)', ex: 'We often play football on Fridays.' },
        { adv: 'sometimes', pct: 'às vezes (cerca de 40%)', ex: 'He sometimes forgets his homework.' },
        { adv: 'rarely', pct: 'raramente (cerca de 10%)', ex: 'They rarely eat fast food.' },
        { adv: 'never', pct: 'nunca (0%)', ex: 'My brother never drinks coffee.' },
      ]
      const item = r.pick(itens)
      const pedeSentido = r.chance(0.6)
      if (pedeSentido) {
        return mc({
          prompt: `What does the adverb "${item.adv}" indicate?\n\n"${item.ex}"`,
          answer: item.pct,
          wrong: pickWrong(r, itens.map((i) => i.pct), item.pct),
          why: `"${item.adv}" indica ${item.pct}. Advérbios de frequência vêm ANTES do verbo principal, mas DEPOIS do verbo to be.`,
        })
      }
      return mc({
        prompt: `Which adverb means "${item.pct}"?`,
        answer: item.adv,
        wrong: pickWrong(r, itens.map((i) => i.adv), item.adv),
        why: `Exemplo: "${item.ex}"`,
      })
    },
  }),

  tpl({
    id: 'en7-simple-past',
    grade: 7, subject: 'ingles', bncc: ['EF07LI14', 'EF07LI17'],
    topic: 'Simple past', level: 2, variants: 400,
    gen(r) {
      const v = r.pick([...VERBS_REGULAR, ...VERBS_IRREGULAR])
      const pr = r.pick(PRONOUNS)
      const tempos = ['yesterday.', 'last week.', 'two days ago.', 'last summer.', 'in 2019.']
      return mc({
        prompt: `Complete the sentence in the SIMPLE PAST:\n\n${pr.p} ___ ${r.pick(tempos)}`,
        support: `${v.inf} = ${v.pt}`,
        answer: v.past,
        wrong: take3(v.past, [v.inf, v.third, v.ing, `${v.inf}ed`, `did ${v.past}`]),
        why: VERBS_REGULAR.includes(v)
          ? `"${v.inf}" é um verbo REGULAR: o passado se forma com -ed → "${v.past}".`
          : `"${v.inf}" é um verbo IRREGULAR: o passado é "${v.past}" (não segue a regra do -ed).`,
      })
    },
  }),

  tpl({
    id: 'en7-past-negative',
    grade: 7, subject: 'ingles', bncc: 'EF07LI14',
    topic: 'Past: negative and questions', level: 3, variants: 250,
    gen(r) {
      const v = r.pick([...VERBS_REGULAR, ...VERBS_IRREGULAR])
      const pr = r.pick(PRONOUNS)
      const pergunta = r.chance()
      if (pergunta) {
        return mc({
          prompt: `Choose the correct QUESTION in the simple past:`,
          support: `${v.inf} = ${v.pt}`,
          answer: `Did ${pr.p.toLowerCase()} ${v.inf}?`,
          wrong: take3(`Did ${pr.p.toLowerCase()} ${v.inf}?`, [
            `Did ${pr.p.toLowerCase()} ${v.past}?`,
            `${pr.p} did ${v.inf}?`,
            `Does ${pr.p.toLowerCase()} ${v.past}?`,
            `Did ${pr.p.toLowerCase()} ${v.ing}?`,
          ]),
          why: `Na interrogativa do simple past usamos DID + sujeito + verbo na FORMA BASE (sem passado): "Did ${pr.p.toLowerCase()} ${v.inf}?".`,
        })
      }
      return mc({
        prompt: `Choose the correct NEGATIVE sentence in the simple past:`,
        support: `${v.inf} = ${v.pt}`,
        answer: `${pr.p} didn't ${v.inf}.`,
        wrong: take3(`${pr.p} didn't ${v.inf}.`, [
          `${pr.p} didn't ${v.past}.`,
          `${pr.p} don't ${v.past}.`,
          `${pr.p} not ${v.past}.`,
          `${pr.p} doesn't ${v.inf}.`,
        ]),
        why: `Na negativa do simple past: sujeito + DIDN'T + verbo na forma base. O passado já está marcado em "did".`,
      })
    },
  }),

  tpl({
    id: 'en7-pronouns',
    grade: 7, subject: 'ingles', bncc: 'EF07LI15',
    topic: 'Subject and object pronouns', level: 2, variants: 200,
    gen(r) {
      const pr = r.pick(PRONOUNS)
      const tipo = r.pick(['obj', 'poss'])
      if (tipo === 'obj') {
        return mc({
          prompt: `Which OBJECT pronoun replaces "${pr.p}"?\n\nExample: I saw ___ at the party.`,
          answer: pr.obj,
          wrong: pickWrong(r, PRONOUNS.map((p) => p.obj), pr.obj),
          why: `Pronome sujeito "${pr.p}" → pronome objeto "${pr.obj}". O pronome objeto vem DEPOIS do verbo ou de uma preposição.`,
        })
      }
      return mc({
        prompt: `Which POSSESSIVE adjective corresponds to "${pr.p}"?\n\nExample: ___ backpack is blue.`,
        answer: pr.poss,
        wrong: pickWrong(r, PRONOUNS.map((p) => p.poss), pr.poss),
        why: `"${pr.p}" → "${pr.poss}". O adjetivo possessivo vem antes do substantivo.`,
      })
    },
  }),

  tpl({
    id: 'en7-there-be',
    grade: 7, subject: 'ingles', bncc: 'EF07LI08',
    topic: 'There is / There are', level: 1, variants: 150,
    gen(r) {
      const itens = [
        { n: 'a book on the table', pl: false }, { n: 'three students in the room', pl: true },
        { n: 'some apples in the basket', pl: true }, { n: 'a cat under the chair', pl: false },
        { n: 'many cars in the street', pl: true }, { n: 'an old house on the corner', pl: false },
        { n: 'two windows in my bedroom', pl: true }, { n: 'a problem with the computer', pl: false },
      ]
      const item = r.pick(itens)
      const certo = item.pl ? 'There are' : 'There is'
      return mc({
        prompt: `Complete the sentence:\n\n___ ${item.n}.`,
        answer: certo,
        wrong: take3(certo, ['There is', 'There are', 'It is', 'They are', 'Have']),
        why: `Usamos "There is" para singular e "There are" para plural. "${item.n}" está no ${item.pl ? 'plural' : 'singular'}.`,
      })
    },
  }),

  // ======================================================= 8º ANO
  tpl({
    id: 'en8-comparatives',
    grade: 8, subject: 'ingles', bncc: 'EF08LI15',
    topic: 'Comparatives and superlatives', level: 2, variants: 300,
    gen(r) {
      const a = r.pick(ADJECTIVES)
      const comparativo = r.chance(0.6)
      const certo = comparativo ? a.comp : a.sup
      return mc({
        prompt: comparativo
          ? `Complete with the COMPARATIVE form of "${a.adj}":\n\nMy house is ___ than yours.`
          : `Complete with the SUPERLATIVE form of "${a.adj}":\n\nThis is ___ building in the city.`,
        support: `${a.adj} = ${a.pt}`,
        answer: certo,
        wrong: take3(certo, [
          comparativo ? a.sup : a.comp,
          `more ${a.adj}`,
          `the most ${a.adj}`,
          `${a.adj}er`,
          `more ${a.adj}er`,
        ]),
        why: a.comp.startsWith('more')
          ? `Adjetivos longos (3+ sílabas) usam "more" no comparativo e "the most" no superlativo: ${a.comp} / ${a.sup}.`
          : a.adj === 'good' || a.adj === 'bad'
            ? `"${a.adj}" é irregular: ${a.comp} / ${a.sup}.`
            : `Adjetivos curtos recebem -er no comparativo e the ...-est no superlativo: ${a.comp} / ${a.sup}.`,
      })
    },
  }),

  tpl({
    id: 'en8-future',
    grade: 8, subject: 'ingles', bncc: ['EF08LI14', 'EF08LI16'],
    topic: 'Future: will / be going to', level: 2, variants: 200,
    gen(r) {
      const situacoes = [
        { s: 'Look at those dark clouds! It ___ rain.', a: 'is going to', why: 'Usamos "be going to" quando há EVIDÊNCIA no presente de que algo vai acontecer.' },
        { s: 'I have decided: I ___ study abroad next year.', a: 'am going to', why: '"Be going to" expressa planos e intenções já decididos.' },
        { s: "The phone is ringing. I ___ answer it!", a: 'will', why: '"Will" expressa decisões tomadas no momento da fala.' },
        { s: 'I think our team ___ win the championship.', a: 'will', why: '"Will" é usado para previsões baseadas em opinião ou crença.' },
        { s: 'She bought the tickets. She ___ travel to Japan in July.', a: 'is going to', why: 'Há um plano concreto já organizado: "be going to".' },
        { s: 'Maybe it ___ be sunny tomorrow.', a: 'will', why: 'Previsão incerta, sem evidência concreta: "will".' },
      ]
      const item = r.pick(situacoes)
      return mc({
        prompt: `Choose the best option to complete the sentence:\n\n${item.s}`,
        answer: item.a,
        wrong: take3(item.a, ['will', 'is going to', 'am going to', 'are going to', 'would']),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'en8-affixes',
    grade: 8, subject: 'ingles', bncc: 'EF08LI13',
    topic: 'Prefixes and suffixes', level: 3, variants: 150,
    gen(r) {
      const itens = [
        { w: 'unhappy', base: 'happy', af: 'un-', mean: 'negação (não feliz)' },
        { w: 'teacher', base: 'teach', af: '-er', mean: 'pessoa que faz a ação' },
        { w: 'careful', base: 'care', af: '-ful', mean: 'cheio de / com' },
        { w: 'careless', base: 'care', af: '-less', mean: 'sem / falta de' },
        { w: 'rewrite', base: 'write', af: 're-', mean: 'repetição' },
        { w: 'impossible', base: 'possible', af: 'im-', mean: 'negação' },
        { w: 'quickly', base: 'quick', af: '-ly', mean: 'advérbio de modo' },
        { w: 'friendship', base: 'friend', af: '-ship', mean: 'estado ou condição' },
        { w: 'disagree', base: 'agree', af: 'dis-', mean: 'oposição / negação' },
      ]
      const item = r.pick(itens)
      const pedeSentido = r.chance(0.6)
      if (pedeSentido) {
        return mc({
          prompt: `What does the affix "${item.af}" add to the word "${item.w}"?`,
          answer: item.mean,
          wrong: pickWrong(r, itens.map((i) => i.mean), item.mean),
          why: `"${item.w}" = "${item.base}" + "${item.af}", que indica ${item.mean}.`,
        })
      }
      return mc({
        prompt: `What is the BASE word of "${item.w}"?`,
        answer: item.base,
        wrong: pickWrong(r, itens.map((i) => i.base), item.base),
        why: `"${item.w}" é formada a partir de "${item.base}" com o afixo "${item.af}".`,
      })
    },
  }),

  tpl({
    id: 'en8-prepositions',
    grade: 8, subject: 'ingles', bncc: 'EF08LI11',
    topic: 'Prepositions of time', level: 2, variants: 150,
    gen(r) {
      const itens = [
        { t: 'Monday', p: 'on' }, { t: 'July', p: 'in' }, { t: '8 o\'clock', p: 'at' },
        { t: '2024', p: 'in' }, { t: 'my birthday', p: 'on' }, { t: 'night', p: 'at' },
        { t: 'the morning', p: 'in' }, { t: 'Christmas Day', p: 'on' }, { t: 'the weekend', p: 'at' },
        { t: 'winter', p: 'in' }, { t: 'noon', p: 'at' }, { t: 'Friday afternoon', p: 'on' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Choose the correct preposition:\n\nThe party is ___ ${item.t}.`,
        answer: item.p,
        wrong: take3(item.p, ['in', 'on', 'at', 'to']),
        why: 'Regra geral: IN para períodos longos (meses, anos, estações, partes do dia), ON para dias e datas, AT para horas e momentos específicos.',
      })
    },
  }),

  // ======================================================= 9º ANO
  tpl({
    id: 'en9-conditionals',
    grade: 9, subject: 'ingles', bncc: 'EF09LI15',
    topic: 'Conditionals', level: 3, variants: 200,
    gen(r) {
      const itens = [
        { s: 'If it rains tomorrow, we ___ at home.', a: 'will stay', t: 1, why: 'First conditional: If + simple present, will + verbo base. Situação real e possível.' },
        { s: 'If I ___ rich, I would travel the world.', a: 'were', t: 2, why: 'Second conditional: If + simple past (were para todas as pessoas), would + verbo base. Situação hipotética.' },
        { s: 'If you study hard, you ___ the exam.', a: 'will pass', t: 1, why: 'First conditional: condição real no presente, consequência com "will".' },
        { s: 'If she had more time, she ___ a new language.', a: 'would learn', t: 2, why: 'Second conditional: hipótese improvável no presente → would + verbo base.' },
        { s: 'If we ___ now, we will catch the bus.', a: 'leave', t: 1, why: 'Na oração com IF do first conditional usamos o simple present, não "will".' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Complete the sentence:\n\n${item.s}`,
        answer: item.a,
        wrong: take3(item.a, ['will stay', 'would stay', 'were', 'was', 'will pass', 'would pass', 'would learn', 'will learn', 'leave', 'will leave'].filter((x) => x !== item.a)),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'en9-modals',
    grade: 9, subject: 'ingles', bncc: 'EF09LI16',
    topic: 'Modal verbs', level: 2, variants: 200,
    gen(r) {
      const itens = [
        { s: 'You ___ wear a helmet when riding a motorcycle. It is the law.', a: 'must', why: '"Must" expressa obrigação forte, muitas vezes imposta por lei ou regra.' },
        { s: 'You ___ drink more water. It would be good for your health.', a: 'should', why: '"Should" dá conselho ou recomendação.' },
        { s: 'It ___ rain later — the sky is getting dark.', a: 'might', why: '"Might" expressa possibilidade incerta.' },
        { s: 'Students ___ use their phones during the test. It is forbidden.', a: "mustn't", why: '"Mustn\'t" expressa proibição.' },
        { s: 'I ___ go to the dentist tomorrow; I have an appointment.', a: 'have to', why: '"Have to" expressa obrigação vinda de circunstâncias externas.' },
        { s: '___ you help me with this exercise, please?', a: 'Could', why: '"Could" é usado em pedidos educados.' },
      ]
      const item = r.pick(itens)
      return mc({
        prompt: `Choose the best modal verb:\n\n${item.s}`,
        answer: item.a,
        wrong: take3(item.a, ['must', 'should', 'might', "mustn't", 'have to', 'Could', 'can'].filter((x) => x !== item.a)),
        why: item.why,
      })
    },
  }),

  tpl({
    id: 'en9-passive',
    grade: 9, subject: 'ingles', bncc: 'EF09LI12',
    topic: 'Passive voice', level: 3, variants: 150,
    gen(r) {
      const itens = [
        { ativa: 'Shakespeare wrote Romeo and Juliet.', passiva: 'Romeo and Juliet was written by Shakespeare.' },
        { ativa: 'They build new schools every year.', passiva: 'New schools are built every year.' },
        { ativa: 'The chef prepares the meals.', passiva: 'The meals are prepared by the chef.' },
        { ativa: 'Someone stole my bike yesterday.', passiva: 'My bike was stolen yesterday.' },
        { ativa: 'Millions of people speak English.', passiva: 'English is spoken by millions of people.' },
      ]
      const item = r.pick(itens)
      const sujeito = item.passiva.split(' ')[0]
      return mc({
        prompt: `Choose the PASSIVE VOICE equivalent of:\n\n"${item.ativa}"`,
        answer: item.passiva,
        wrong: take3(item.passiva, [
          item.passiva.replace(' was ', ' were ').replace(' are ', ' is '),
          item.ativa,
          ...r.sample(itens.filter((i) => i !== item).map((i) => i.passiva), 2),
        ]),
        why: `Na voz passiva o OBJETO vira sujeito: "${sujeito}...". Estrutura: to be (no tempo da ativa) + particípio passado + by + agente (opcional).`,
      })
    },
  }),

  tpl({
    id: 'en9-connectors',
    grade: 9, subject: 'ingles', bncc: 'EF09LI14',
    topic: 'Connectors', level: 2, variants: 180,
    gen(r) {
      const itens = [
        { c: 'however', rel: 'Contraste / oposição', ex: 'I studied a lot; however, I failed the test.' },
        { c: 'therefore', rel: 'Conclusão / consequência', ex: 'It was raining; therefore, we stayed home.' },
        { c: 'because', rel: 'Causa', ex: 'She is tired because she worked all night.' },
        { c: 'in addition', rel: 'Adição', ex: 'The hotel is cheap. In addition, it is close to the beach.' },
        { c: 'although', rel: 'Concessão', ex: 'Although it was cold, we went swimming.' },
        { c: 'for example', rel: 'Exemplificação', ex: 'Some animals hibernate — bears, for example.' },
        { c: 'in order to', rel: 'Finalidade', ex: 'He woke up early in order to catch the train.' },
      ]
      const item = r.pick(itens)
      const pedeRelacao = r.chance(0.6)
      if (pedeRelacao) {
        return mc({
          prompt: `What relationship does the connector "${item.c}" express?\n\n"${item.ex}"`,
          answer: item.rel,
          wrong: pickWrong(r, itens.map((i) => i.rel), item.rel),
          why: `"${item.c}" indica ${item.rel.toLowerCase()}.`,
        })
      }
      return mc({
        prompt: `Which connector expresses ${item.rel.toLowerCase()}?`,
        answer: item.c,
        wrong: pickWrong(r, itens.map((i) => i.c), item.c),
        why: `Exemplo: "${item.ex}"`,
      })
    },
  }),

  tpl({
    id: 'en9-reading',
    grade: 9, subject: 'ingles', bncc: 'EF09LI17',
    topic: 'Reading comprehension', level: 3, variants: 40,
    gen(r) {
      const textos = [
        {
          t: 'Recycling is one of the simplest ways to protect the environment. When we recycle paper, plastic and glass, we reduce the amount of waste sent to landfills and save energy. In Brazil, aluminium cans have one of the highest recycling rates in the world: more than 97% of them are collected and reused.',
          q: 'According to the text, what is TRUE about aluminium cans in Brazil?',
          a: 'More than 97% of them are collected and reused',
          w: ['They are never recycled in Brazil', 'Only 50% of them are recycled', 'They are mostly sent to landfills'],
          why: 'O texto afirma explicitamente: "more than 97% of them are collected and reused".',
        },
        {
          t: 'Many teenagers spend more than five hours a day on social media. Experts say that this habit can affect sleep, concentration and even self-esteem. They recommend setting time limits and avoiding screens at least one hour before bedtime.',
          q: 'What do the experts RECOMMEND?',
          a: 'Setting time limits and avoiding screens before bedtime',
          w: ['Using social media only at night', 'Spending more than five hours online', 'Deleting all social media accounts'],
          why: 'A recomendação está na última frase: "setting time limits and avoiding screens at least one hour before bedtime".',
        },
        {
          t: 'The Amazon rainforest produces about 20% of the oxygen released by forests on Earth and is home to more than three million species. However, deforestation has increased in recent decades, mainly because of cattle ranching and illegal logging.',
          q: 'According to the text, what is the MAIN cause of deforestation?',
          a: 'Cattle ranching and illegal logging',
          w: ['Tourism and road building', 'Climate change and droughts', 'The growth of indigenous populations'],
          why: 'O texto diz: "mainly because of cattle ranching and illegal logging".',
        },
      ]
      const item = r.pick(textos)
      return mc({ prompt: item.q, support: item.t, answer: item.a, wrong: item.w, why: item.why })
    },
  }),
]
