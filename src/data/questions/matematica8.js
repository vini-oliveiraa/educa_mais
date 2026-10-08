import {
  tpl, mc, input, pickWrong, take3,
  num, reduceFraction, NAMES, ITEMS,
} from './helpers.js'

/** Matemática — 8º ano. */
export default [
  tpl({
    id: 'ma8-potencias',
    grade: 8, subject: 'matematica', bncc: 'EF08MA01',
    topic: 'Potenciação', level: 1, variants: 900,
    gen(r) {
      const base = r.int(2, 9)
      const e1 = r.int(2, 6)
      const e2 = r.int(1, 4)
      const op = r.pick(['mult', 'div', 'pot'])
      if (op === 'mult') {
        const exp = e1 + e2
        return mc({
          prompt: `Simplifique usando as propriedades da potenciação:\n${base}^${e1} × ${base}^${e2}`,
          answer: `${base}^${exp}`,
          wrong: take3(`${base}^${exp}`, [
            `${base}^${e1 * e2}`, `${base * base}^${exp}`, `${base}^${Math.abs(e1 - e2)}`,
            `${base * 2}^${exp}`, `${base}^${exp + 1}`,
          ]),
          why: `Na multiplicação de potências de mesma base, conserva-se a base e somam-se os expoentes: ${e1} + ${e2} = ${exp}.`,
        })
      }
      if (op === 'div') {
        const maior = Math.max(e1, e2) + 2
        const menor = Math.min(e1, e2)
        return mc({
          prompt: `Simplifique:\n${base}^${maior} ÷ ${base}^${menor}`,
          answer: `${base}^${maior - menor}`,
          wrong: take3(`${base}^${maior - menor}`, [
            `${base}^${maior + menor}`, `${base}^${maior * menor}`, `1^${maior - menor}`,
            `${base}^${maior}`, `${base * 2}^${maior - menor}`,
          ]),
          why: `Na divisão de potências de mesma base, subtraem-se os expoentes: ${maior} − ${menor} = ${maior - menor}.`,
        })
      }
      return mc({
        prompt: `Simplifique:\n(${base}^${e1})^${e2}`,
        answer: `${base}^${e1 * e2}`,
        wrong: take3(`${base}^${e1 * e2}`, [
          `${base}^${e1 + e2}`, `${base}^${e1}`, `${base * e2}^${e1}`,
          `${base}^${e2}`, `${base}^${e1 * e2 + 1}`,
        ]),
        why: `Potência de potência: multiplicam-se os expoentes: ${e1} × ${e2} = ${e1 * e2}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-potencia-negativa',
    grade: 8, subject: 'matematica', bncc: 'EF08MA01',
    topic: 'Expoente negativo', level: 3, variants: 200,
    gen(r) {
      const base = r.int(2, 10)
      const exp = r.int(1, 3)
      const valor = Math.pow(base, exp)
      return mc({
        prompt: `Qual é o valor de ${base}^(−${exp})?`,
        answer: `1/${valor}`,
        wrong: [`−${valor}`, `${valor}`, `−1/${valor}`],
        why: `Expoente negativo inverte a base: ${base}^(−${exp}) = 1 ÷ ${base}^${exp} = 1/${valor}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-raiz',
    grade: 8, subject: 'matematica', bncc: 'EF08MA02',
    topic: 'Radiciação', level: 1, variants: 60,
    gen(r) {
      const quadrada = r.chance(0.65)
      if (quadrada) {
        const raiz = r.int(4, 30)
        return input({
          prompt: `Calcule a raiz quadrada de ${num(raiz * raiz)}.`,
          answer: raiz,
          why: `${raiz} × ${raiz} = ${num(raiz * raiz)}, então √${num(raiz * raiz)} = ${raiz}.`,
        })
      }
      const raiz = r.int(2, 10)
      return input({
        prompt: `Calcule a raiz cúbica de ${num(raiz ** 3)}.`,
        answer: raiz,
        why: `${raiz} × ${raiz} × ${raiz} = ${num(raiz ** 3)}, então ∛${num(raiz ** 3)} = ${raiz}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-contagem',
    grade: 8, subject: 'matematica', bncc: 'EF08MA03',
    topic: 'Princípio multiplicativo', level: 2, variants: 1500,
    gen(r) {
      const cenario = r.pick(['roupa', 'senha', 'cardapio'])
      if (cenario === 'roupa') {
        const camisas = r.int(3, 9)
        const calcas = r.int(2, 7)
        const tenis = r.int(2, 5)
        return input({
          prompt: `${r.pick(NAMES)} tem ${camisas} camisetas, ${calcas} calças e ${tenis} pares de tênis.\nDe quantas maneiras diferentes pode se vestir usando uma peça de cada?`,
          answer: camisas * calcas * tenis,
          why: `Pelo princípio multiplicativo: ${camisas} × ${calcas} × ${tenis} = ${num(camisas * calcas * tenis)} combinações.`,
        })
      }
      if (cenario === 'senha') {
        const digitos = r.int(2, 4)
        return input({
          prompt: `Quantas senhas diferentes de ${digitos} algarismos podem ser formadas usando os dígitos de 0 a 9, podendo repetir?`,
          answer: Math.pow(10, digitos),
          why: `Cada posição tem 10 opções: 10${digitos > 1 ? ` × 10`.repeat(digitos - 1) : ''} = 10^${digitos} = ${num(Math.pow(10, digitos))}.`,
        })
      }
      const entradas = r.int(2, 5)
      const pratos = r.int(3, 7)
      const sobremesas = r.int(2, 6)
      return input({
        prompt: `Um restaurante oferece ${entradas} entradas, ${pratos} pratos principais e ${sobremesas} sobremesas.\nQuantos menus completos diferentes é possível montar?`,
        answer: entradas * pratos * sobremesas,
        why: `${entradas} × ${pratos} × ${sobremesas} = ${num(entradas * pratos * sobremesas)} menus.`,
      })
    },
  }),

  tpl({
    id: 'ma8-juros-simples',
    grade: 8, subject: 'matematica', bncc: 'EF08MA04',
    topic: 'Juros simples', level: 3, variants: 1600,
    gen(r) {
      const capital = r.int(5, 40) * 100
      const taxa = r.pick([1, 2, 2.5, 3, 4, 5])
      const meses = r.int(3, 18)
      const juros = (capital * taxa * meses) / 100
      const pedeMontante = r.chance()
      const valor = pedeMontante ? capital + juros : juros
      return input({
        prompt: `${r.pick(NAMES)} aplicou R$ ${num(capital)},00 a juros simples de ${num(taxa)}% ao mês, durante ${meses} meses.\nQual foi ${pedeMontante ? 'o montante final' : 'o valor dos juros'}, em reais?`,
        answer: num(valor, Number.isInteger(valor) ? 0 : 2),
        unit: 'R$',
        decimal: !Number.isInteger(valor),
        why: `J = C × i × t = ${num(capital)} × ${num(taxa)}% × ${meses} = ${num(juros)}.${pedeMontante ? ` Montante = ${num(capital)} + ${num(juros)} = ${num(capital + juros)}.` : ''}`,
      })
    },
  }),

  tpl({
    id: 'ma8-porcentagem-sucessiva',
    grade: 8, subject: 'matematica', bncc: 'EF08MA04',
    topic: 'Variação percentual', level: 3, variants: 900,
    gen(r) {
      const preco = r.int(10, 60) * 50
      const p1 = r.pick([10, 20, 25, 50])
      const p2 = r.pick([10, 20, 25, 50])
      const final = preco * (1 + p1 / 100) * (1 - p2 / 100)
      return input({
        prompt: `Um produto custava R$ ${num(preco)},00. Ele sofreu um aumento de ${p1}% e, depois, um desconto de ${p2}% sobre o novo preço.\nQual é o preço final, em reais?`,
        answer: num(Math.round(final * 100) / 100, Number.isInteger(final) ? 0 : 2),
        unit: 'R$',
        decimal: !Number.isInteger(final),
        why: `Após o aumento: ${num(preco)} × ${num(1 + p1 / 100, 2)} = ${num(preco * (1 + p1 / 100))}. Após o desconto: ${num(preco * (1 + p1 / 100))} × ${num(1 - p2 / 100, 2)} = ${num(Math.round(final * 100) / 100)}. Atenção: aumentar ${p1}% e tirar ${p2}% NÃO volta ao preço inicial.`,
      })
    },
  }),

  tpl({
    id: 'ma8-dizima',
    grade: 8, subject: 'matematica', bncc: 'EF08MA05',
    topic: 'Fração geratriz', level: 3, variants: 40,
    gen(r) {
      const d = r.int(1, 8)
      const simples = r.chance(0.6)
      if (simples) {
        const [n, den] = reduceFraction(d, 9)
        return mc({
          prompt: `Qual é a fração geratriz da dízima periódica 0,${d}${d}${d}... ?`,
          answer: `${n}/${den}`,
          wrong: [`${d}/10`, `${d}/99`, `${d}/100`].filter((w) => w !== `${n}/${den}`).slice(0, 3),
          why: `Numa dízima simples de um algarismo no período, o numerador é o período e o denominador é 9: ${d}/9 = ${n}/${den}.`,
        })
      }
      const d2 = r.int(1, 9)
      const periodo = Number(`${d}${d2}`)
      const [n, den] = reduceFraction(periodo, 99)
      return mc({
        prompt: `Qual é a fração geratriz da dízima periódica 0,${d}${d2}${d}${d2}... ?`,
        answer: `${n}/${den}`,
        wrong: [`${periodo}/100`, `${periodo}/9`, `${periodo}/999`].filter((w) => w !== `${n}/${den}`).slice(0, 3),
        why: `Período com dois algarismos: denominador 99. Então ${periodo}/99 = ${n}/${den}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-valor-numerico',
    grade: 8, subject: 'matematica', bncc: 'EF08MA06',
    topic: 'Expressões algébricas', level: 2, variants: 4000,
    gen(r) {
      const a = r.int(2, 8)
      const b = r.int(2, 9)
      const x = r.int(-5, 8)
      const y = r.int(-4, 7)
      const resultado = a * x * x + b * x * y - y
      return input({
        prompt: `Calcule o valor numérico de ${a}x² + ${b}xy − y para x = ${x} e y = ${y}.`,
        answer: resultado,
        why: `${a}·(${x})² + ${b}·(${x})·(${y}) − (${y}) = ${a * x * x} ${b * x * y >= 0 ? '+' : '−'} ${Math.abs(b * x * y)} ${-y >= 0 ? '+' : '−'} ${Math.abs(y)} = ${resultado}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-monomios',
    grade: 8, subject: 'matematica', bncc: 'EF08MA06',
    topic: 'Monômios e polinômios', level: 2, variants: 1200,
    gen(r) {
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      const e1 = r.int(1, 4)
      const e2 = r.int(1, 4)
      return mc({
        prompt: `Multiplique os monômios:\n(${a}x^${e1}) × (${b}x^${e2})`,
        answer: `${a * b}x^${e1 + e2}`,
        wrong: take3(`${a * b}x^${e1 + e2}`, [
          `${a * b}x^${e1 * e2}`, `${a + b}x^${e1 + e2}`, `${a * b}x^${Math.abs(e1 - e2)}`,
          `${a + b}x^${e1 * e2}`, `${a * b}x^${e1 + e2 + 1}`,
        ]),
        why: `Multiplicam-se os coeficientes (${a} × ${b} = ${a * b}) e somam-se os expoentes (${e1} + ${e2} = ${e1 + e2}).`,
      })
    },
  }),

  tpl({
    id: 'ma8-sistema',
    grade: 8, subject: 'matematica', bncc: 'EF08MA08',
    topic: 'Sistemas de equações', level: 3, variants: 2500,
    gen(r) {
      const x = r.int(1, 15)
      const y = r.intExcept(1, 15, [x]) // x ≠ y mantém o problema interessante
      const soma = x + y
      const dif = Math.abs(x - y)
      const maior = Math.max(x, y)
      const menor = Math.min(x, y)
      const pedeMaior = r.chance()
      return input({
        prompt: `A soma de dois números é ${soma} e a diferença entre eles é ${dif}.\nQual é o ${pedeMaior ? 'MAIOR' : 'MENOR'} deles?`,
        support: `Sistema: x + y = ${soma}\n         x − y = ${dif}`,
        answer: pedeMaior ? maior : menor,
        why: `Somando as duas equações: 2x = ${soma + dif}, logo x = ${maior}. Substituindo: y = ${soma} − ${maior} = ${menor}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-sistema-contexto',
    grade: 8, subject: 'matematica', bncc: 'EF08MA08',
    topic: 'Sistemas aplicados', level: 3, variants: 1800,
    gen(r) {
      const precoA = r.int(3, 15)
      const precoB = r.intExcept(3, 15, [precoA]) // preços diferentes: o sistema tem solução única
      const qtdA = r.int(2, 9)
      const qtdB = r.int(2, 9)
      const total = precoA * qtdA + precoB * qtdB
      const totalItens = qtdA + qtdB
      return input({
        prompt: `Numa lanchonete, o salgado custa R$ ${precoA},00 e o suco custa R$ ${precoB},00. ${r.pick(NAMES)} comprou ${totalItens} itens no total (entre salgados e sucos) e gastou R$ ${num(total)},00.\nQuantos salgados ${r.chance() ? 'ela' : 'ele'} comprou?`,
        answer: qtdA,
        why: `Seja s o número de salgados e u o de sucos: s + u = ${totalItens} e ${precoA}s + ${precoB}u = ${total}. Substituindo u = ${totalItens} − s: ${precoA}s + ${precoB}(${totalItens} − s) = ${total} → ${precoA - precoB}s = ${total - precoB * totalItens} → s = ${qtdA}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-sequencia-lei',
    grade: 8, subject: 'matematica', bncc: 'EF08MA10',
    topic: 'Lei de formação', level: 2, variants: 1200,
    gen(r) {
      const a = r.int(2, 9)
      const b = r.int(-8, 12)
      const termos = [1, 2, 3, 4].map((n) => a * n + b)
      const posicao = r.int(8, 40)
      return input({
        prompt: `A sequência abaixo segue uma lei de formação.\n${termos.join(', ')}, ...\nQual é o ${posicao}º termo?`,
        answer: a * posicao + b,
        why: `A lei é aₙ = ${a}n ${b >= 0 ? '+' : '−'} ${Math.abs(b)}. Para n = ${posicao}: ${a} × ${posicao} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a * posicao + b}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-proporcionalidade',
    grade: 8, subject: 'matematica', bncc: 'EF08MA13',
    topic: 'Grandezas proporcionais', level: 2, variants: 1200,
    gen(r) {
      const receitaPessoas = r.pick([4, 5, 6, 8, 10])
      const novasPessoas = receitaPessoas * r.int(2, 4)
      const ingrediente = r.pick(['xícaras de farinha', 'ovos', 'colheres de açúcar', 'litros de leite'])
      const qtd = r.int(2, 8)
      const nova = (qtd * novasPessoas) / receitaPessoas
      return input({
        prompt: `Uma receita para ${receitaPessoas} pessoas usa ${qtd} ${ingrediente}.\nPara ${novasPessoas} pessoas, quantos ${ingrediente} serão necessários?`,
        answer: nova,
        why: `As grandezas são diretamente proporcionais: ${qtd} ÷ ${receitaPessoas} = ${num(qtd / receitaPessoas)} por pessoa. Para ${novasPessoas} pessoas: ${num(qtd / receitaPessoas)} × ${novasPessoas} = ${num(nova)}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-quadrilateros-prop',
    grade: 8, subject: 'matematica', bncc: 'EF08MA14',
    topic: 'Propriedades de quadriláteros', level: 2, variants: 40,
    gen(r) {
      const afirmacoes = [
        { txt: 'As diagonais de um retângulo são congruentes (têm a mesma medida).', v: true },
        { txt: 'As diagonais de um losango se cruzam formando ângulo reto.', v: true },
        { txt: 'Todo quadrado é também um retângulo e um losango.', v: true },
        { txt: 'Num paralelogramo, os ângulos opostos são congruentes.', v: true },
        { txt: 'A soma dos ângulos internos de qualquer quadrilátero é 360°.', v: true },
        { txt: 'Todo retângulo é um quadrado.', v: false },
        { txt: 'As diagonais de um trapézio qualquer são sempre congruentes.', v: false },
        { txt: 'Num losango, todos os ângulos internos são retos.', v: false },
        { txt: 'A soma dos ângulos internos de um quadrilátero é 180°.', v: false },
        { txt: 'Todo paralelogramo tem exatamente um par de lados paralelos.', v: false },
      ]
      const a = r.pick(afirmacoes)
      return mc({
        prompt: `A afirmação abaixo é verdadeira ou falsa?\n"${a.txt}"`,
        answer: a.v ? 'Verdadeira' : 'Falsa',
        wrong: [a.v ? 'Falsa' : 'Verdadeira'],
        why: a.v
          ? 'A afirmação está correta: é uma propriedade válida desses quadriláteros.'
          : 'A afirmação está incorreta. Reveja as propriedades: nem toda figura de uma família herda as propriedades da outra.',
      })
    },
  }),

  tpl({
    id: 'ma8-area-composta',
    grade: 8, subject: 'matematica', bncc: 'EF08MA19',
    topic: 'Área de figuras compostas', level: 3, variants: 1500,
    gen(r) {
      const L = r.int(10, 30)
      const W = r.int(8, 25)
      const l = r.int(2, Math.min(L, W) - 3)
      const area = L * W - l * l
      return input({
        prompt: `Uma placa retangular mede ${L} cm por ${W} cm. Dela foi recortado um quadrado de ${l} cm de lado.\nQual é a área restante, em cm²?`,
        answer: area,
        unit: 'cm²',
        why: `Área do retângulo: ${L} × ${W} = ${num(L * W)} cm². Área do quadrado: ${l}² = ${l * l} cm². Restante: ${num(L * W)} − ${l * l} = ${num(area)} cm².`,
      })
    },
  }),

  tpl({
    id: 'ma8-litro-dm3',
    grade: 8, subject: 'matematica', bncc: ['EF08MA20', 'EF08MA21'],
    topic: 'Volume e capacidade', level: 2, variants: 1500,
    gen(r) {
      const a = r.int(2, 12), b = r.int(2, 12), c = r.int(2, 12)
      const litros = a * b * c
      const emM3 = r.chance(0.35)
      if (emM3) {
        const volM3 = (a * b * c) / 1000
        return input({
          prompt: `Um reservatório tem ${a} dm × ${b} dm × ${c} dm.\nQual é o volume em metros cúbicos (m³)? (1 m³ = 1000 dm³)`,
          answer: num(volM3, 3).replace(/,?0+$/, ''),
          unit: 'm³',
          decimal: true,
          why: `Volume = ${a} × ${b} × ${c} = ${num(litros)} dm³. Dividindo por 1000: ${num(volM3, 3)} m³.`,
        })
      }
      return input({
        prompt: `Uma caixa tem ${a} dm de comprimento, ${b} dm de largura e ${c} dm de altura.\nQuantos litros de água ela comporta? (1 dm³ = 1 L)`,
        answer: litros,
        unit: 'L',
        why: `Volume = ${a} × ${b} × ${c} = ${num(litros)} dm³. Como 1 dm³ = 1 L, cabem ${num(litros)} litros.`,
      })
    },
  }),

  tpl({
    id: 'ma8-probabilidade',
    grade: 8, subject: 'matematica', bncc: 'EF08MA22',
    topic: 'Probabilidade', level: 3, variants: 700,
    gen(r) {
      const cenario = r.pick(['moedas', 'dados', 'cartas'])
      if (cenario === 'moedas') {
        const n = r.int(2, 3)
        const total = Math.pow(2, n)
        const evento = r.pick([
          { txt: 'sair cara em todos os lançamentos', casos: 1 },
          { txt: 'sair coroa em todos os lançamentos', casos: 1 },
          { txt: 'sair exatamente uma cara', casos: n },
        ])
        const [p, q] = reduceFraction(evento.casos, total)
        return mc({
          prompt: `Uma moeda é lançada ${n} vezes. Qual é a probabilidade de ${evento.txt}?`,
          answer: `${p}/${q}`,
          wrong: pickWrong(r, ['1/2', '1/3', '1/4', '1/8', '3/8', '2/3', '3/4'], `${p}/${q}`),
          why: `São ${total} resultados possíveis (2^${n}) e ${evento.casos} favorável(is): ${evento.casos}/${total} = ${p}/${q}.`,
        })
      }
      if (cenario === 'dados') {
        const soma = r.pick([5, 6, 7, 8, 9])
        let casos = 0
        for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === soma) casos++
        const [p, q] = reduceFraction(casos, 36)
        return mc({
          prompt: `Dois dados comuns são lançados. Qual é a probabilidade de a soma dos resultados ser ${soma}?`,
          answer: `${p}/${q}`,
          wrong: pickWrong(r, ['1/6', '1/9', '1/12', '5/36', '1/18', '1/36', '1/4'], `${p}/${q}`),
          why: `Há 36 resultados possíveis e ${casos} com soma ${soma}: ${casos}/36 = ${p}/${q}.`,
        })
      }
      const evento = r.pick([
        { txt: 'uma carta de copas', casos: 13 },
        { txt: 'um ás', casos: 4 },
        { txt: 'uma carta vermelha', casos: 26 },
        { txt: 'uma figura (valete, dama ou rei)', casos: 12 },
      ])
      const [p, q] = reduceFraction(evento.casos, 52)
      return mc({
        prompt: `De um baralho comum de 52 cartas, retira-se uma ao acaso. Qual é a probabilidade de ser ${evento.txt}?`,
        answer: `${p}/${q}`,
        wrong: pickWrong(r, ['1/4', '1/13', '1/2', '3/13', '1/52', '1/26'], `${p}/${q}`),
        why: `${evento.casos} cartas favoráveis em 52: ${evento.casos}/52 = ${p}/${q}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-media-moda-mediana',
    grade: 8, subject: 'matematica', bncc: 'EF08MA25',
    topic: 'Média, moda e mediana', level: 2, variants: 3000,
    gen(r) {
      const n = r.pick([5, 7])
      const valores = []
      const repetido = r.int(3, 9)
      valores.push(repetido, repetido)
      while (valores.length < n) {
        const v = r.intExcept(1, 10, [repetido, ...valores])
        valores.push(v)
      }
      const lista = r.shuffle(valores)
      const ordenada = [...lista].sort((a, b) => a - b)
      const soma = lista.reduce((a, b) => a + b, 0)
      const media = soma / n
      const mediana = ordenada[(n - 1) / 2]
      const medida = r.pick(['media', 'moda', 'mediana'])
      const resposta = medida === 'media' ? Math.round(media * 100) / 100 : medida === 'moda' ? repetido : mediana
      const rotulo = { media: 'a média', moda: 'a moda', mediana: 'a mediana' }[medida]
      return input({
        prompt: `Observe as notas de ${r.pick(NAMES)} em ${n} provas:\n${lista.join(', ')}\nQual é ${rotulo} desses valores?`,
        answer: num(resposta, Number.isInteger(resposta) ? 0 : 2),
        decimal: !Number.isInteger(resposta),
        why: medida === 'media'
          ? `Soma: ${lista.join(' + ')} = ${soma}. Média: ${soma} ÷ ${n} = ${num(Math.round(media * 100) / 100)}.`
          : medida === 'moda'
            ? `A moda é o valor que mais se repete: ${repetido}.`
            : `Em ordem: ${ordenada.join(', ')}. O valor do meio (${(n + 1) / 2}ª posição) é ${mediana}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-reta-cartesiana',
    grade: 8, subject: 'matematica', bncc: 'EF08MA07',
    topic: 'Equação da reta', level: 3, variants: 1200,
    gen(r) {
      const a = r.intExcept(-5, 5, [0])
      const b = r.int(-10, 10)
      const x = r.intExcept(-6, 6, [0])
      const y = a * x + b
      const pedeY = r.chance()
      if (pedeY) {
        return input({
          prompt: `Considere a equação y = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}.\nQual é o valor de y quando x = ${x}?`,
          answer: y,
          why: `Substituindo x = ${x}: y = ${a} × (${x}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${y}.`,
        })
      }
      return mc({
        prompt: `O ponto (${x}, ${y}) pertence à reta de equação y = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}?`,
        answer: 'Sim, pertence',
        wrong: ['Não pertence', 'Só se x for positivo', 'Não é possível saber'],
        why: `Substituindo x = ${x}: ${a} × (${x}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${y}, que é exatamente o y do ponto. Logo ele pertence à reta.`,
      })
    },
  }),

  tpl({
    id: 'ma8-energia-consumo',
    grade: 8, subject: 'matematica', bncc: 'EF08MA13',
    topic: 'Grandezas no cotidiano', level: 3, variants: 1400,
    gen(r) {
      const potencia = r.pick([60, 100, 150, 200, 500, 800, 1000, 1200, 1500])
      const horas = r.int(1, 8)
      const dias = r.pick([10, 15, 20, 30])
      const kwh = (potencia * horas * dias) / 1000
      return input({
        prompt: `Um aparelho de ${num(potencia)} W fica ligado ${horas} h por dia, durante ${dias} dias.\nQual é o consumo total, em kWh?`,
        answer: num(kwh, Number.isInteger(kwh) ? 0 : 2),
        unit: 'kWh',
        decimal: !Number.isInteger(kwh),
        why: `Energia = potência × tempo = ${num(potencia)} W × ${horas} h × ${dias} dias = ${num(potencia * horas * dias)} Wh. Dividindo por 1000: ${num(kwh)} kWh.`,
      })
    },
  }),

  tpl({
    id: 'ma8-escala',
    grade: 8, subject: 'matematica', bncc: 'EF08MA12',
    topic: 'Escala e proporção', level: 2, variants: 900,
    gen(r) {
      const escala = r.pick([100, 500, 1000, 2000, 5000, 10000, 50000])
      const cmMapa = r.int(2, 25)
      const metros = (cmMapa * escala) / 100
      const emKm = metros >= 1000
      return input({
        prompt: `Num mapa de escala 1 : ${num(escala)}, a distância entre dois pontos é de ${cmMapa} cm.\nQual é a distância real, em ${emKm ? 'quilômetros' : 'metros'}?`,
        answer: emKm ? num(metros / 1000, Number.isInteger(metros / 1000) ? 0 : 2) : metros,
        unit: emKm ? 'km' : 'm',
        decimal: emKm && !Number.isInteger(metros / 1000),
        why: `1 cm no mapa = ${num(escala)} cm reais. Então ${cmMapa} × ${num(escala)} = ${num(cmMapa * escala)} cm = ${num(metros)} m${emKm ? ` = ${num(metros / 1000)} km` : ''}.`,
      })
    },
  }),

  tpl({
    id: 'ma8-mediatriz-bissetriz',
    grade: 8, subject: 'matematica', bncc: 'EF08MA15',
    topic: 'Construções geométricas', level: 1, variants: 30,
    gen(r) {
      const itens = [
        { nome: 'mediatriz', def: 'a reta perpendicular a um segmento que passa pelo seu ponto médio' },
        { nome: 'bissetriz', def: 'a semirreta que divide um ângulo em dois ângulos congruentes' },
        { nome: 'altura de um triângulo', def: 'o segmento perpendicular de um vértice ao lado oposto' },
        { nome: 'mediana de um triângulo', def: 'o segmento que liga um vértice ao ponto médio do lado oposto' },
      ]
      const alvo = r.pick(itens)
      return mc({
        prompt: `Qual elemento geométrico é definido como ${alvo.def}?`,
        answer: alvo.nome,
        wrong: pickWrong(r, itens.map((i) => i.nome), alvo.nome),
        why: `Essa é a definição de ${alvo.nome}.`,
      })
    },
  }),
]
