import {
  tpl, mc, input, numDistract, numDistractFmt, pickWrong, take3,
  num, gcd, reduceFraction, NAMES, ITEMS, CONTAINERS, FRUITS, SPORTS, PLACES,
} from './helpers.js'

/** Matemática — 6º ano. */
export default [
  // ----------------------------------------------------------------- Números
  tpl({
    id: 'ma6-comparar-naturais',
    grade: 6, subject: 'matematica', bncc: 'EF06MA01',
    topic: 'Comparação de naturais', level: 1, variants: 4000,
    gen(r) {
      const maior = r.chance()
      const base = r.int(100000, 899999)
      const set = new Set([base])
      while (set.size < 4) {
        const v = base + r.sign() * r.int(100, 90000)
        if (v > 10000) set.add(v)
      }
      const list = [...set]
      const alvo = maior ? Math.max(...list) : Math.min(...list)
      return mc({
        prompt: `Observe os números abaixo. Qual deles é o ${maior ? 'MAIOR' : 'MENOR'}?`,
        support: list.map(num).join('   ·   '),
        answer: num(alvo),
        wrong: list.filter((v) => v !== alvo).map(num),
        why: `Comparando casa a casa, ${num(alvo)} é o ${maior ? 'maior' : 'menor'} dos quatro números.`,
      })
    },
  }),

  tpl({
    id: 'ma6-valor-posicional',
    grade: 6, subject: 'matematica', bncc: 'EF06MA02',
    topic: 'Valor posicional', level: 1, variants: 2500,
    gen(r) {
      const digitos = Array.from({ length: 6 }, () => r.int(1, 9))
      const numero = Number(digitos.join(''))
      const pos = r.int(0, 5)
      const algarismo = digitos[pos]
      const valor = algarismo * Math.pow(10, 5 - pos)
      const nomes = ['centena de milhar', 'dezena de milhar', 'unidade de milhar', 'centena', 'dezena', 'unidade']
      return mc({
        prompt: `No número ${num(numero)}, qual é o valor posicional do algarismo ${algarismo} que ocupa a ordem das ${nomes[pos]}s?`,
        answer: num(valor),
        // Candidatos de sobra: quando o algarismo está na casa das dezenas,
        // `valor / 10` colapsa no próprio algarismo e sobrariam 2 alternativas.
        wrong: take3(num(valor), [
          num(algarismo),                       // ignorou a posição
          num(valor * 10),                      // errou uma casa para mais
          num(valor / 10),                      // errou uma casa para menos
          num(Math.pow(10, 5 - pos)),           // leu só a potência
          num(algarismo * 10),
          num(valor * 100),
        ]),
        why: `O algarismo ${algarismo} está na ordem das ${nomes[pos]}s, então vale ${algarismo} × ${num(Math.pow(10, 5 - pos))} = ${num(valor)}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-expressao-numerica',
    grade: 6, subject: 'matematica', bncc: 'EF06MA03',
    topic: 'Expressões numéricas', level: 2, variants: 3000,
    gen(r) {
      const a = r.int(2, 12)
      const b = r.int(2, 9)
      const c = r.int(2, 9)
      const d = r.int(2, 20)
      const resultado = a + b * c - d
      return input({
        prompt: `Calcule o valor da expressão:\n${a} + ${b} × ${c} − ${d}`,
        answer: resultado,
        why: `Primeiro a multiplicação: ${b} × ${c} = ${b * c}. Depois, da esquerda para a direita: ${a} + ${b * c} = ${a + b * c} e ${a + b * c} − ${d} = ${resultado}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-expressao-parenteses',
    grade: 6, subject: 'matematica', bncc: 'EF06MA03',
    topic: 'Expressões numéricas', level: 3, variants: 3000,
    gen(r) {
      const a = r.int(3, 15)
      const b = r.int(2, 9)
      const c = r.int(2, 8)
      const d = r.int(2, 6)
      const resultado = (a + b) * c - d * d
      // Distratores = erros clássicos: ignorar os parênteses e trocar potência por dobro.
      const errosTipicos = [a + b * c - d * d, (a + b) * c - d * 2, (a + b) * (c - d)]
      const vistos = new Set([resultado])
      const wrong = []
      for (const e of errosTipicos) {
        if (!vistos.has(e)) { vistos.add(e); wrong.push(e) }
      }
      for (const e of numDistract(r, resultado, { count: 3, avoid: [...vistos] })) {
        if (wrong.length >= 3) break
        if (!vistos.has(e)) { vistos.add(e); wrong.push(e) }
      }
      return mc({
        prompt: `Calcule: (${a} + ${b}) × ${c} − ${d}²`,
        answer: num(resultado),
        wrong: wrong.slice(0, 3).map((v) => num(v)),
        why: `Parênteses primeiro: ${a} + ${b} = ${a + b}. Depois a potência: ${d}² = ${d * d}. Então ${a + b} × ${c} = ${(a + b) * c} e ${(a + b) * c} − ${d * d} = ${resultado}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-problema-compra',
    grade: 6, subject: 'matematica', bncc: 'EF06MA03',
    topic: 'Problemas com naturais', level: 1, variants: 5000,
    gen(r) {
      const nome = r.pick(NAMES)
      const item = r.pick(ITEMS)
      const qtd = r.int(3, 12)
      const preco = r.int(4, 25)
      const pago = Math.ceil((qtd * preco + r.int(5, 40)) / 10) * 10
      const troco = pago - qtd * preco
      return input({
        prompt: `${nome} comprou ${qtd} ${item.p} ${r.pick(PLACES)}, cada ${item.s} custando R$ ${preco},00. ${r.chance() ? 'Ela' : 'Ele'} pagou com R$ ${pago},00.\nQuantos reais recebeu de troco?`,
        answer: troco,
        unit: 'R$',
        why: `Total da compra: ${qtd} × ${preco} = ${qtd * preco} reais. Troco: ${pago} − ${qtd * preco} = ${troco} reais.`,
      })
    },
  }),

  tpl({
    id: 'ma6-divisao-resto',
    grade: 6, subject: 'matematica', bncc: 'EF06MA03',
    topic: 'Divisão com resto', level: 2, variants: 2000,
    gen(r) {
      const cont = r.pick(CONTAINERS)
      const item = r.pick(ITEMS)
      const porCaixa = r.int(6, 24)
      const caixas = r.int(5, 18)
      const resto = r.int(1, porCaixa - 1)
      const total = porCaixa * caixas + resto
      const perguntaCaixas = r.chance()
      return input({
        prompt: `Uma fábrica tem ${num(total)} ${item.p} e quer guardá-los em ${cont.p} com ${porCaixa} ${item.p} em cada ${cont.s}.\n${perguntaCaixas ? `Quantas ${cont.p} ficarão completamente cheias?` : `Quantos ${item.p} vão sobrar fora das ${cont.p} cheias?`}`,
        answer: perguntaCaixas ? caixas : resto,
        why: `${num(total)} ÷ ${porCaixa} = ${caixas} com resto ${resto}. São ${caixas} ${cont.p} cheias e sobram ${resto} ${item.p}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-primos',
    grade: 6, subject: 'matematica', bncc: 'EF06MA05',
    topic: 'Números primos', level: 1, variants: 900,
    gen(r) {
      const primos = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
      const compostos = [12, 15, 16, 18, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 77, 81, 87, 91, 93, 95]
      const procurarPrimo = r.chance()
      const certo = procurarPrimo ? r.pick(primos) : r.pick(compostos)
      const errados = procurarPrimo ? r.sample(compostos, 3) : r.sample(primos, 3)
      const divisor = procurarPrimo ? null : [2, 3, 5, 7, 11].find((d) => certo % d === 0)
      return mc({
        prompt: `Qual dos números abaixo é um número ${procurarPrimo ? 'PRIMO' : 'COMPOSTO'}?`,
        answer: String(certo),
        wrong: errados.map(String),
        why: procurarPrimo
          ? `${certo} só é divisível por 1 e por ele mesmo — por isso é primo. Os outros têm mais divisores.`
          : `${certo} é divisível por ${divisor} (${certo} ÷ ${divisor} = ${certo / divisor}), então tem mais de dois divisores: é composto.`,
      })
    },
  }),

  tpl({
    id: 'ma6-divisores',
    grade: 6, subject: 'matematica', bncc: 'EF06MA05',
    topic: 'Divisores', level: 2, variants: 600,
    gen(r) {
      const n = r.pick([24, 30, 36, 40, 42, 48, 54, 56, 60, 72, 80, 90, 96, 100, 120])
      const divisores = []
      for (let i = 1; i <= n; i++) if (n % i === 0) divisores.push(i)
      return input({
        prompt: `Quantos divisores naturais o número ${n} tem?`,
        support: 'Dica: conte também o 1 e o próprio número.',
        answer: divisores.length,
        why: `Os divisores de ${n} são: ${divisores.join(', ')}. São ${divisores.length} divisores ao todo.`,
      })
    },
  }),

  tpl({
    id: 'ma6-multiplos-comuns',
    grade: 6, subject: 'matematica', bncc: 'EF06MA06',
    topic: 'Múltiplos comuns', level: 2, variants: 1200,
    gen(r) {
      const a = r.pick([4, 6, 8, 9, 10, 12, 15])
      const b = r.intExcept(3, 16, [a])
      const mmc = (a * b) / gcd(a, b)
      const nome1 = r.pick(NAMES)
      let nome2 = r.pick(NAMES)
      while (nome2 === nome1) nome2 = r.pick(NAMES)
      return input({
        prompt: `${nome1} vai à biblioteca a cada ${a} dias e ${nome2} vai a cada ${b} dias. Hoje os dois se encontraram lá.\nDaqui a quantos dias eles vão se encontrar na biblioteca novamente?`,
        answer: mmc,
        unit: 'dias',
        why: `Precisamos do menor múltiplo comum de ${a} e ${b}. Múltiplos de ${a}: ${[1, 2, 3, 4].map((k) => a * k).join(', ')}... Múltiplos de ${b}: ${[1, 2, 3, 4].map((k) => b * k).join(', ')}... O primeiro em comum é ${mmc}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-fracao-quantidade',
    grade: 6, subject: 'matematica', bncc: 'EF06MA09',
    topic: 'Fração de uma quantidade', level: 1, variants: 3000,
    gen(r) {
      const den = r.pick([3, 4, 5, 6, 8, 10])
      const nume = r.int(1, den - 1)
      const multi = r.int(3, 20)
      const total = den * multi
      const resultado = (total / den) * nume
      const nome = r.pick(NAMES)
      const item = r.pick(ITEMS)
      return input({
        prompt: `${nome} tem ${total} ${item.p} e deu ${nume}/${den} deles para a turma.\nQuantos ${item.p} ${nome} deu?`,
        answer: resultado,
        why: `${total} ÷ ${den} = ${total / den} (isso é 1/${den}). Como são ${nume}/${den}: ${total / den} × ${nume} = ${resultado}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-comparar-fracoes',
    grade: 6, subject: 'matematica', bncc: 'EF06MA07',
    topic: 'Comparação de frações', level: 2, variants: 1500,
    gen(r) {
      let a, b, c, d
      do {
        a = r.int(1, 9); b = r.int(2, 12)
        c = r.int(1, 9); d = r.int(2, 12)
      } while (a / b === c / d || a >= b || c >= d)
      const maior = a / b > c / d ? `${a}/${b}` : `${c}/${d}`
      const menor = maior === `${a}/${b}` ? `${c}/${d}` : `${a}/${b}`
      const mmc = (b * d) / gcd(b, d)
      return mc({
        prompt: `Qual das frações é MAIOR: ${a}/${b} ou ${c}/${d}?`,
        answer: maior,
        wrong: [menor, 'As duas são iguais', 'Não é possível comparar'],
        why: `Reduzindo ao mesmo denominador (${mmc}): ${a}/${b} = ${(a * mmc) / b}/${mmc} e ${c}/${d} = ${(c * mmc) / d}/${mmc}. Logo ${maior} é maior.`,
      })
    },
  }),

  tpl({
    id: 'ma6-fracao-decimal',
    grade: 6, subject: 'matematica', bncc: 'EF06MA08',
    topic: 'Fração e decimal', level: 1, variants: 400,
    gen(r) {
      const pares = [
        [1, 2, '0,5'], [1, 4, '0,25'], [3, 4, '0,75'], [1, 5, '0,2'], [2, 5, '0,4'],
        [3, 5, '0,6'], [4, 5, '0,8'], [1, 10, '0,1'], [7, 10, '0,7'], [1, 8, '0,125'],
        [3, 8, '0,375'], [5, 8, '0,625'], [1, 20, '0,05'], [3, 20, '0,15'], [9, 10, '0,9'],
        [1, 25, '0,04'], [1, 100, '0,01'], [13, 100, '0,13'],
      ]
      const [n, d, dec] = r.pick(pares)
      const paraDecimal = r.chance()
      if (paraDecimal) {
        return mc({
          prompt: `Qual é a forma decimal da fração ${n}/${d}?`,
          answer: dec,
          wrong: pickWrong(r, pares.map((p) => p[2]), dec),
          why: `${n} ÷ ${d} = ${dec}.`,
        })
      }
      return mc({
        prompt: `Qual fração corresponde ao número decimal ${dec}?`,
        answer: `${n}/${d}`,
        wrong: pickWrong(r, pares.map((p) => `${p[0]}/${p[1]}`), `${n}/${d}`),
        why: `${dec} = ${n}/${d}, porque ${n} ÷ ${d} = ${dec}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-soma-fracoes',
    grade: 6, subject: 'matematica', bncc: 'EF06MA10',
    topic: 'Soma de frações', level: 2, variants: 2000,
    gen(r) {
      const mesmoDen = r.chance(0.45)
      if (mesmoDen) {
        const d = r.pick([5, 6, 7, 8, 9, 10, 12])
        const a = r.int(1, d - 2)
        const b = r.int(1, d - a - 1) // garante a + b < d (resultado fica fração própria)
        const [sn, sd] = reduceFraction(a + b, d)
        const certo = `${sn}/${sd}`
        const simplificou = sn !== a + b
        return mc({
          prompt: `Calcule: ${a}/${d} + ${b}/${d}`,
          answer: certo,
          wrong: [`${a + b}/${d + d}`, `${a * b}/${d}`, `${a + b + 1}/${d}`, `${a}/${b}`]
            .filter((w, i, arr) => w !== certo && arr.indexOf(w) === i)
            .slice(0, 3),
          why: `Denominadores iguais: somam-se apenas os numeradores. ${a} + ${b} = ${a + b}, então ${a + b}/${d}${simplificou ? `, que simplificado dá ${certo}` : ''}.`,
        })
      }
      const d1 = r.pick([2, 3, 4, 5, 6])
      const d2 = r.pick([2, 3, 4, 5, 6, 8, 10].filter((x) => x !== d1))
      const n1 = r.int(1, d1 - 1)
      const n2 = r.int(1, d2 - 1)
      const mmc = (d1 * d2) / gcd(d1, d2)
      const soma = (n1 * mmc) / d1 + (n2 * mmc) / d2
      const [sn, sd] = reduceFraction(soma, mmc)
      const certo = sd === 1 ? String(sn) : `${sn}/${sd}`
      return mc({
        prompt: `Calcule: ${n1}/${d1} + ${n2}/${d2}`,
        answer: certo,
        wrong: [`${n1 + n2}/${d1 + d2}`, `${soma}/${mmc + 1}`, `${n1 + n2}/${mmc}`].filter((w) => w !== certo).slice(0, 3),
        why: `MMC(${d1}, ${d2}) = ${mmc}. Então ${n1}/${d1} = ${(n1 * mmc) / d1}/${mmc} e ${n2}/${d2} = ${(n2 * mmc) / d2}/${mmc}. Somando: ${soma}/${mmc} = ${certo}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-decimais-operacoes',
    grade: 6, subject: 'matematica', bncc: 'EF06MA11',
    topic: 'Operações com decimais', level: 2, variants: 4000,
    gen(r) {
      const nome = r.pick(NAMES)
      const preco = Math.round(r.int(150, 1800)) / 100
      const qtd = r.int(2, 9)
      const total = Math.round(preco * qtd * 100) / 100
      const item = r.pick(ITEMS)
      return input({
        prompt: `${nome} comprou ${qtd} ${item.p} a R$ ${num(preco, 2)} cada.\nQual foi o valor total da compra, em reais?`,
        answer: num(total, 2),
        unit: 'R$',
        decimal: true,
        why: `${num(preco, 2)} × ${qtd} = ${num(total, 2)}. Use vírgula na resposta (ex.: ${num(total, 2)}).`,
      })
    },
  }),

  tpl({
    id: 'ma6-arredondamento',
    grade: 6, subject: 'matematica', bncc: 'EF06MA12',
    topic: 'Estimativa e arredondamento', level: 1, variants: 900,
    gen(r) {
      const n = r.int(1200, 98000)
      const casas = r.pick([100, 1000])
      const arred = Math.round(n / casas) * casas
      return mc({
        prompt: `Arredondando ${num(n)} para a ${casas === 100 ? 'centena' : 'unidade de milhar'} mais próxima, obtemos:`,
        answer: num(arred),
        // Truncar e arredondar dão o mesmo valor em metade dos casos, por isso
        // a lista é maior do que o necessário.
        wrong: take3(num(arred), [
          num(arred + casas),                   // passou uma casa
          num(arred - casas),                   // voltou uma casa
          num(Math.floor(n / casas) * casas),   // truncou em vez de arredondar
          num(Math.ceil(n / casas) * casas),    // arredondou sempre para cima
          num(arred + 2 * casas),
          num(Math.round(n / (casas * 10)) * casas * 10), // arredondou na ordem errada
        ]),
        why: `Olhamos o algarismo seguinte à ${casas === 100 ? 'centena' : 'unidade de milhar'}: ${num(n)} fica mais perto de ${num(arred)}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-porcentagem',
    grade: 6, subject: 'matematica', bncc: 'EF06MA13',
    topic: 'Porcentagem', level: 2, variants: 2500,
    gen(r) {
      const pct = r.pick([10, 20, 25, 30, 40, 50, 60, 75])
      const total = r.int(4, 40) * 20
      const valor = (total * pct) / 100
      const contexto = r.chance()
      const nome = r.pick(NAMES)
      return input({
        prompt: contexto
          ? `Uma turma tem ${total} alunos e ${pct}% deles praticam ${r.pick(SPORTS)}.\nQuantos alunos praticam esse esporte?`
          : `${nome} tinha R$ ${num(total)},00 e gastou ${pct}% desse valor.\nQuantos reais ${nome} gastou?`,
        answer: valor,
        why: `${pct}% de ${num(total)} = ${num(total)} × ${pct} ÷ 100 = ${num(valor)}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-partilha',
    grade: 6, subject: 'matematica', bncc: 'EF06MA15',
    topic: 'Partilha em partes desiguais', level: 3, variants: 2000,
    gen(r) {
      const nome1 = r.pick(NAMES)
      let nome2 = r.pick(NAMES)
      while (nome2 === nome1) nome2 = r.pick(NAMES)
      const parteMenor = r.int(8, 60)
      const diferenca = r.int(5, 40)
      const total = parteMenor * 2 + diferenca
      const pedeMaior = r.chance()
      return input({
        prompt: `${nome1} e ${nome2} vão dividir ${num(total)} figurinhas. ${nome1} ficará com ${diferenca} figurinhas a mais que ${nome2}.\nQuantas figurinhas ${pedeMaior ? nome1 : nome2} vai receber?`,
        answer: pedeMaior ? parteMenor + diferenca : parteMenor,
        why: `Tirando a diferença: ${num(total)} − ${diferenca} = ${num(total - diferenca)}. Metade disso é ${parteMenor} (parte de ${nome2}). ${nome1} fica com ${parteMenor} + ${diferenca} = ${parteMenor + diferenca}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-plano-cartesiano',
    grade: 6, subject: 'matematica', bncc: 'EF06MA16',
    topic: 'Plano cartesiano', level: 2, variants: 800,
    gen(r) {
      const x = r.int(-6, 6)
      const y = r.intExcept(-6, 6, [0])
      const xx = x === 0 ? 1 : x
      const quad = xx > 0 ? (y > 0 ? '1º quadrante' : '4º quadrante') : y > 0 ? '2º quadrante' : '3º quadrante'
      return mc({
        prompt: `Em qual quadrante do plano cartesiano fica o ponto P(${xx}, ${y})?`,
        answer: quad,
        wrong: pickWrong(r, ['1º quadrante', '2º quadrante', '3º quadrante', '4º quadrante'], quad),
        why: `x = ${xx} é ${xx > 0 ? 'positivo' : 'negativo'} e y = ${y} é ${y > 0 ? 'positivo' : 'negativo'}, o que caracteriza o ${quad}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-euler',
    grade: 6, subject: 'matematica', bncc: 'EF06MA17',
    topic: 'Prismas e pirâmides', level: 3, variants: 60,
    gen(r) {
      // `art` evita "um pirâmide"; o rótulo carrega o próprio "Quantos/Quantas"
      // porque vértice é masculino e face/aresta são femininos.
      const solidos = [
        { nome: 'cubo', art: 'um', v: 8, f: 6, a: 12 },
        { nome: 'prisma de base triangular', art: 'um', v: 6, f: 5, a: 9 },
        { nome: 'prisma de base pentagonal', art: 'um', v: 10, f: 7, a: 15 },
        { nome: 'prisma de base hexagonal', art: 'um', v: 12, f: 8, a: 18 },
        { nome: 'pirâmide de base quadrada', art: 'uma', v: 5, f: 5, a: 8 },
        { nome: 'pirâmide de base triangular', art: 'uma', v: 4, f: 4, a: 6 },
        { nome: 'pirâmide de base pentagonal', art: 'uma', v: 6, f: 6, a: 10 },
        { nome: 'pirâmide de base hexagonal', art: 'uma', v: 7, f: 7, a: 12 },
      ]
      const s = r.pick(solidos)
      const campo = r.pick(['v', 'f', 'a'])
      const rotulo = { v: 'Quantos vértices', f: 'Quantas faces', a: 'Quantas arestas' }[campo]
      return input({
        prompt: `${rotulo} tem ${s.art} ${s.nome}?`,
        answer: s[campo],
        why: `${s.art === 'uma' ? 'A' : 'O'} ${s.nome} tem ${s.v} vértices, ${s.f} faces e ${s.a} arestas. Confere na relação de Euler: V + F − A = ${s.v} + ${s.f} − ${s.a} = 2.`,
      })
    },
  }),

  tpl({
    id: 'ma6-poligonos',
    grade: 6, subject: 'matematica', bncc: 'EF06MA18',
    topic: 'Polígonos', level: 1, variants: 120,
    gen(r) {
      const nomes = [
        [3, 'triângulo'], [4, 'quadrilátero'], [5, 'pentágono'], [6, 'hexágono'],
        [7, 'heptágono'], [8, 'octógono'], [9, 'eneágono'], [10, 'decágono'], [12, 'dodecágono'],
      ]
      const [lados, nome] = r.pick(nomes)
      const perguntaNome = r.chance()
      if (perguntaNome) {
        return mc({
          prompt: `Como se chama o polígono que tem ${lados} lados?`,
          answer: nome,
          wrong: pickWrong(r, nomes.map((n) => n[1]), nome),
          why: `O polígono de ${lados} lados é o ${nome}.`,
        })
      }
      return input({
        prompt: `Quantos lados tem um ${nome}?`,
        answer: lados,
        why: `O ${nome} tem ${lados} lados (e também ${lados} vértices e ${lados} ângulos internos).`,
      })
    },
  }),

  tpl({
    id: 'ma6-triangulos',
    grade: 6, subject: 'matematica', bncc: 'EF06MA19',
    topic: 'Classificação de triângulos', level: 2, variants: 900,
    gen(r) {
      const tipo = r.pick(['equilatero', 'isosceles', 'escaleno'])
      let lados
      if (tipo === 'equilatero') {
        const l = r.int(3, 20)
        lados = [l, l, l]
      } else if (tipo === 'isosceles') {
        const l = r.int(5, 20)
        const base = r.intExcept(Math.max(1, 2 * l - 2 * l + 1), 2 * l - 1, [l])
        lados = r.shuffle([l, l, Math.min(base, 2 * l - 1)])
      } else {
        let a, b, c
        do {
          a = r.int(4, 14); b = r.int(4, 14); c = r.int(4, 14)
        } while (a === b || b === c || a === c || a + b <= c || a + c <= b || b + c <= a)
        lados = [a, b, c]
      }
      const resposta = { equilatero: 'Equilátero', isosceles: 'Isósceles', escaleno: 'Escaleno' }[tipo]
      return mc({
        prompt: `Um triângulo tem lados medindo ${lados.join(' cm, ')} cm.\nQuanto aos lados, ele é classificado como:`,
        answer: resposta,
        wrong: pickWrong(r, ['Equilátero', 'Isósceles', 'Escaleno', 'Retângulo'], resposta),
        why: {
          equilatero: 'Os três lados são iguais: equilátero.',
          isosceles: 'Exatamente dois lados são iguais: isósceles.',
          escaleno: 'Os três lados são diferentes: escaleno.',
        }[tipo],
      })
    },
  }),

  tpl({
    id: 'ma6-quadrilateros',
    grade: 6, subject: 'matematica', bncc: 'EF06MA20',
    topic: 'Quadriláteros', level: 2, variants: 50,
    gen(r) {
      const itens = [
        { nome: 'quadrado', dica: 'quatro lados iguais e quatro ângulos retos' },
        { nome: 'retângulo', dica: 'lados opostos iguais e quatro ângulos retos' },
        { nome: 'losango', dica: 'quatro lados iguais, mas sem ângulos retos obrigatórios' },
        { nome: 'paralelogramo', dica: 'lados opostos paralelos e iguais, dois a dois' },
        { nome: 'trapézio', dica: 'apenas um par de lados paralelos' },
      ]
      const alvo = r.pick(itens)
      return mc({
        prompt: `Qual quadrilátero tem ${alvo.dica}?`,
        answer: alvo.nome,
        wrong: pickWrong(r, itens.map((i) => i.nome), alvo.nome),
        why: `Essa é a definição do ${alvo.nome}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-conversao-medidas',
    grade: 6, subject: 'matematica', bncc: 'EF06MA24',
    topic: 'Unidades de medida', level: 1, variants: 1500,
    gen(r) {
      const casos = [
        { de: 'm', para: 'cm', fator: 100 },
        { de: 'km', para: 'm', fator: 1000 },
        { de: 'kg', para: 'g', fator: 1000 },
        { de: 'L', para: 'mL', fator: 1000 },
        { de: 'h', para: 'min', fator: 60 },
        { de: 'min', para: 's', fator: 60 },
        { de: 'cm', para: 'mm', fator: 10 },
        { de: 't', para: 'kg', fator: 1000 },
      ]
      const c = r.pick(casos)
      const valor = r.int(2, 45)
      const resultado = valor * c.fator
      return input({
        prompt: `Converta: ${valor} ${c.de} equivalem a quantos ${c.para}?`,
        answer: resultado,
        unit: c.para,
        why: `1 ${c.de} = ${num(c.fator)} ${c.para}. Então ${valor} × ${num(c.fator)} = ${num(resultado)} ${c.para}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-perimetro',
    grade: 6, subject: 'matematica', bncc: 'EF06MA24',
    topic: 'Perímetro e área', level: 2, variants: 1600,
    gen(r) {
      const a = r.int(3, 25)
      const b = r.intExcept(3, 25, [a])
      const pedePerimetro = r.chance()
      return input({
        prompt: `Um terreno retangular mede ${a} m de comprimento por ${b} m de largura.\nQual é ${pedePerimetro ? 'o perímetro, em metros' : 'a área, em metros quadrados'}?`,
        answer: pedePerimetro ? 2 * (a + b) : a * b,
        unit: pedePerimetro ? 'm' : 'm²',
        why: pedePerimetro
          ? `Perímetro é a soma dos lados: 2 × (${a} + ${b}) = ${2 * (a + b)} m.`
          : `Área do retângulo é base × altura: ${a} × ${b} = ${a * b} m².`,
      })
    },
  }),

  tpl({
    id: 'ma6-angulos',
    grade: 6, subject: 'matematica', bncc: 'EF06MA25',
    topic: 'Ângulos', level: 1, variants: 350,
    gen(r) {
      const tipo = r.pick(['agudo', 'reto', 'obtuso', 'raso'])
      const medida = { agudo: r.int(5, 89), reto: 90, obtuso: r.int(91, 179), raso: 180 }[tipo]
      const resposta = { agudo: 'Agudo', reto: 'Reto', obtuso: 'Obtuso', raso: 'Raso' }[tipo]
      return mc({
        prompt: `Um ângulo mede ${medida}°. Como ele é classificado?`,
        answer: resposta,
        wrong: pickWrong(r, ['Agudo', 'Reto', 'Obtuso', 'Raso'], resposta),
        why: 'Agudo: menor que 90°. Reto: exatamente 90°. Obtuso: entre 90° e 180°. Raso: exatamente 180°.',
      })
    },
  }),

  tpl({
    id: 'ma6-angulos-complementares',
    grade: 6, subject: 'matematica', bncc: 'EF06MA25',
    topic: 'Ângulos', level: 2, variants: 350,
    gen(r) {
      const complementar = r.chance()
      const limite = complementar ? 90 : 180
      const a = r.int(10, limite - 10)
      return input({
        prompt: `Dois ângulos são ${complementar ? 'complementares' : 'suplementares'} e um deles mede ${a}°.\nQuantos graus mede o outro?`,
        answer: limite - a,
        unit: '°',
        why: `Ângulos ${complementar ? 'complementares somam 90°' : 'suplementares somam 180°'}. Então ${limite} − ${a} = ${limite - a}°.`,
      })
    },
  }),

  tpl({
    id: 'ma6-tabela-dados',
    grade: 6, subject: 'matematica', bncc: ['EF06MA29', 'EF06MA31'],
    topic: 'Leitura de dados', level: 2, variants: 2500,
    gen(r) {
      const frutas = r.sample(FRUITS, 4)
      const valores = frutas.map(() => r.int(6, 48))
      const total = valores.reduce((a, b) => a + b, 0)
      const maxIdx = valores.indexOf(Math.max(...valores))
      const pergunta = r.pick(['total', 'maior', 'diferenca'])
      const tabela = frutas.map((f, i) => `${f.padEnd(10, ' ')} ${valores[i]}`).join('\n')
      const minIdx = valores.indexOf(Math.min(...valores))
      if (pergunta === 'total') {
        return input({
          prompt: 'A tabela mostra quantas frutas foram vendidas numa feira.\nQuantas frutas foram vendidas no total?',
          support: `FRUTA      QTD\n${tabela}`,
          answer: total,
          why: `Somando: ${valores.join(' + ')} = ${total}.`,
        })
      }
      if (pergunta === 'maior') {
        return mc({
          prompt: 'Segundo a tabela, qual fruta foi a mais vendida?',
          support: `FRUTA      QTD\n${tabela}`,
          answer: frutas[maxIdx],
          wrong: frutas.filter((_, i) => i !== maxIdx),
          why: `${frutas[maxIdx]} aparece com ${valores[maxIdx]}, o maior valor da tabela.`,
        })
      }
      return input({
        prompt: 'Qual é a diferença entre a quantidade da fruta mais vendida e a da menos vendida?',
        support: `FRUTA      QTD\n${tabela}`,
        answer: valores[maxIdx] - valores[minIdx],
        why: `Mais vendida: ${frutas[maxIdx]} (${valores[maxIdx]}). Menos vendida: ${frutas[minIdx]} (${valores[minIdx]}). Diferença: ${valores[maxIdx]} − ${valores[minIdx]} = ${valores[maxIdx] - valores[minIdx]}.`,
      })
    },
  }),

  tpl({
    id: 'ma6-igualdade',
    grade: 6, subject: 'matematica', bncc: 'EF06MA14',
    topic: 'Igualdade e balança', level: 2, variants: 900,
    gen(r) {
      const x = r.int(2, 30)
      const a = r.int(2, 20)
      const b = r.int(2, 12)
      const total = b * x + a
      return input({
        prompt: `Uma balança está equilibrada. De um lado há ${b} caixas iguais e um peso de ${a} kg; do outro lado, ${total} kg.\nQuanto pesa cada caixa, em kg?`,
        answer: x,
        unit: 'kg',
        why: `Tirando ${a} kg dos dois lados: ${b} caixas = ${total - a} kg. Dividindo por ${b}: cada caixa pesa ${x} kg.`,
      })
    },
  }),
]
