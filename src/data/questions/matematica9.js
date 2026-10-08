import {
  tpl, mc, input, pickWrong, take3,
  num, reduceFraction, NAMES, CITIES,
} from './helpers.js'

/** Matemática — 9º ano. */
export default [
  tpl({
    id: 'ma9-irracionais',
    grade: 9, subject: 'matematica', bncc: 'EF09MA02',
    topic: 'Números reais', level: 1, variants: 300,
    gen(r) {
      const irracionais = ['√2', '√3', '√5', '√7', '√10', 'π', '√11', '2√3']
      const racionais = ['√4', '√9', '√16', '√25', '0,333...', '3/7', '−8', '2,75', '0,121212...', '√100']
      const procuraIrracional = r.chance()
      const certo = procuraIrracional ? r.pick(irracionais) : r.pick(racionais)
      const errados = procuraIrracional ? r.sample(racionais, 3) : r.sample(irracionais, 3)
      return mc({
        prompt: `Qual dos números abaixo é ${procuraIrracional ? 'IRRACIONAL' : 'RACIONAL'}?`,
        answer: certo,
        wrong: errados,
        why: procuraIrracional
          ? `${certo} tem representação decimal infinita e NÃO periódica, por isso é irracional. Os demais podem ser escritos como fração.`
          : `${certo} pode ser escrito como fração (decimal exato ou dízima periódica), então é racional.`,
      })
    },
  }),

  tpl({
    id: 'ma9-radicais',
    grade: 9, subject: 'matematica', bncc: 'EF09MA03',
    topic: 'Radicais', level: 2, variants: 300,
    gen(r) {
      const fator = r.pick([2, 3, 5, 6, 7, 10, 11])
      const quadrado = r.int(2, 9)
      const radicando = fator * quadrado * quadrado
      return mc({
        prompt: `Simplifique o radical: √${num(radicando)}`,
        answer: `${quadrado}√${fator}`,
        wrong: take3(`${quadrado}√${fator}`, [
          `${fator}√${quadrado}`,
          `${quadrado * fator}`,
          `${quadrado * quadrado}√${fator}`,
          `${quadrado}√${fator * 2}`,
        ]),
        why: `${num(radicando)} = ${quadrado * quadrado} × ${fator}. Como √${quadrado * quadrado} = ${quadrado}, sobra ${quadrado}√${fator}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-expoente-fracionario',
    grade: 9, subject: 'matematica', bncc: 'EF09MA03',
    topic: 'Expoente fracionário', level: 3, variants: 80,
    gen(r) {
      const base = r.pick([4, 8, 9, 16, 25, 27, 32, 36, 49, 64, 81, 100, 125])
      const raizes = { 4: [2, 2], 9: [2, 3], 16: [2, 4], 25: [2, 5], 36: [2, 6], 49: [2, 7], 64: [2, 8], 81: [2, 9], 100: [2, 10], 8: [3, 2], 27: [3, 3], 125: [3, 5], 32: [5, 2] }
      const [indice, valor] = raizes[base]
      return input({
        prompt: `Calcule o valor de ${base}^(1/${indice}).`,
        answer: valor,
        why: `Expoente fracionário 1/${indice} significa raiz de índice ${indice}: ${indice === 2 ? '√' : `raiz ${indice}ª de `}${base} = ${valor}, pois ${valor}${'^' + indice} = ${base}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-notacao-cientifica',
    grade: 9, subject: 'matematica', bncc: ['EF09MA04', 'EF09MA18'],
    topic: 'Notação científica', level: 2, variants: 600,
    gen(r) {
      const mantissa = Math.round(r.int(10, 99)) / 10
      const exp = r.intExcept(-8, 9, [0, 1])
      const valorTexto = exp > 0
        ? num(mantissa * Math.pow(10, exp))
        : num(mantissa * Math.pow(10, exp), Math.abs(exp) + 1)
      const paraNotacao = r.chance()
      if (paraNotacao) {
        return mc({
          prompt: `Escreva o número ${valorTexto} em notação científica.`,
          answer: `${num(mantissa, 1)} × 10^${exp}`,
          wrong: take3(`${num(mantissa, 1)} × 10^${exp}`, [
            `${num(mantissa, 1)} × 10^${-exp}`,
            `${num(mantissa * 10, 0)} × 10^${exp - 1}`,
            `${num(mantissa / 10, 2)} × 10^${exp + 1}`,
            `${num(mantissa, 1)} × 10^${exp + 2}`,
          ]),
          why: `Na notação científica a mantissa fica entre 1 e 10: ${num(mantissa, 1)}. Contando as casas decimais deslocadas, o expoente é ${exp}.`,
        })
      }
      return mc({
        prompt: `Qual é a forma decimal de ${num(mantissa, 1)} × 10^${exp}?`,
        answer: valorTexto,
        wrong: take3(valorTexto, [
          num(mantissa * Math.pow(10, -exp), exp > 0 ? exp + 1 : 0),
          num(mantissa * Math.pow(10, exp + 1), exp > 0 ? 0 : Math.abs(exp)),
          num(mantissa * Math.pow(10, exp - 1), exp > 0 ? 0 : Math.abs(exp) + 2),
        ]),
        why: `10^${exp} ${exp > 0 ? `desloca a vírgula ${exp} casas para a direita` : `desloca a vírgula ${Math.abs(exp)} casas para a esquerda`}, resultando em ${valorTexto}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-juros-compostos',
    grade: 9, subject: 'matematica', bncc: 'EF09MA05',
    topic: 'Juros compostos', level: 3, variants: 800,
    gen(r) {
      const capital = r.int(5, 40) * 100
      const taxa = r.pick([5, 10, 20, 25])
      const tempo = r.int(2, 3)
      const montante = capital * Math.pow(1 + taxa / 100, tempo)
      const arredondado = Math.round(montante * 100) / 100
      return input({
        prompt: `${r.pick(NAMES)} investiu R$ ${num(capital)},00 a juros compostos de ${taxa}% ao ano, por ${tempo} anos.\nQual é o montante final, em reais?`,
        answer: num(arredondado, Number.isInteger(arredondado) ? 0 : 2),
        unit: 'R$',
        decimal: !Number.isInteger(arredondado),
        why: `M = C × (1 + i)^t = ${num(capital)} × (1 + ${num(taxa / 100, 2)})^${tempo} = ${num(capital)} × ${num(Math.pow(1 + taxa / 100, tempo), 4)} = ${num(arredondado)}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-produtos-notaveis',
    grade: 9, subject: 'matematica', bncc: 'EF09MA10',
    topic: 'Produtos notáveis', level: 2, variants: 600,
    gen(r) {
      const a = r.int(1, 9)
      const tipo = r.pick(['quadrado-soma', 'quadrado-dif', 'diferenca-quadrados'])
      if (tipo === 'diferenca-quadrados') {
        return mc({
          prompt: `Desenvolva: (x + ${a})(x − ${a})`,
          answer: `x² − ${a * a}`,
          wrong: take3(`x² − ${a * a}`, [
            `x² + ${a * a}`, `x² − ${2 * a}x − ${a * a}`, `x² − ${a}`, `x² + ${2 * a}x − ${a * a}`,
          ]),
          why: `Produto da soma pela diferença: (x + a)(x − a) = x² − a² = x² − ${a * a}.`,
        })
      }
      const sinal = tipo === 'quadrado-soma' ? '+' : '−'
      const certo = `x² ${sinal} ${2 * a}x + ${a * a}`
      return mc({
        prompt: `Desenvolva: (x ${sinal} ${a})²`,
        answer: certo,
        wrong: take3(certo, [
          `x² ${sinal} ${a * a}`,
          `x² + ${a * a}`,
          `x² ${sinal} ${a}x + ${a * a}`,
          `x² ${sinal === '+' ? '−' : '+'} ${2 * a}x + ${a * a}`,
        ]),
        why: `Quadrado da ${tipo === 'quadrado-soma' ? 'soma' : 'diferença'}: (x ${sinal} a)² = x² ${sinal} 2·a·x + a² = x² ${sinal} ${2 * a}x + ${a * a}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-fatoracao',
    grade: 9, subject: 'matematica', bncc: 'EF09MA09',
    topic: 'Fatoração', level: 3, variants: 400,
    gen(r) {
      const tipo = r.pick(['comum', 'diferenca', 'trinomio'])
      if (tipo === 'comum') {
        const k = r.int(2, 9)
        const b = r.int(2, 9)
        return mc({
          prompt: `Fatore a expressão: ${k}x + ${k * b}`,
          answer: `${k}(x + ${b})`,
          wrong: take3(`${k}(x + ${b})`, [`${k}(x + ${k * b})`, `x(${k} + ${k * b})`, `${k * b}(x + ${k})`, `${k}(x − ${b})`]),
          why: `O fator comum é ${k}: ${k}x + ${k * b} = ${k}(x + ${b}).`,
        })
      }
      if (tipo === 'diferenca') {
        const a = r.int(2, 12)
        return mc({
          prompt: `Fatore a expressão: x² − ${a * a}`,
          answer: `(x + ${a})(x − ${a})`,
          wrong: take3(`(x + ${a})(x − ${a})`, [`(x − ${a})²`, `(x + ${a})²`, `(x + ${a * a})(x − 1)`, `x(x − ${a * a})`]),
          why: `Diferença de dois quadrados: x² − a² = (x + a)(x − a), com a = ${a}.`,
        })
      }
      const a = r.int(2, 9)
      return mc({
        prompt: `Fatore o trinômio quadrado perfeito: x² + ${2 * a}x + ${a * a}`,
        answer: `(x + ${a})²`,
        wrong: take3(`(x + ${a})²`, [`(x − ${a})²`, `(x + ${a * a})²`, `(x + ${a})(x − ${a})`, `(x + ${2 * a})²`]),
        why: `x² + ${2 * a}x + ${a * a} = (x + ${a})², pois 2·${a} = ${2 * a} e ${a}² = ${a * a}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-bhaskara',
    grade: 9, subject: 'matematica', bncc: 'EF09MA11',
    topic: 'Equação do 2º grau', level: 3, variants: 2000,
    gen(r) {
      const r1 = r.int(-9, 9)
      const r2 = r.intExcept(-9, 9, [r1])
      const b = -(r1 + r2)
      const c = r1 * r2
      const maior = Math.max(r1, r2)
      const menor = Math.min(r1, r2)
      const pedeMaior = r.chance()
      const sinalB = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
      const sinalC = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`
      return input({
        prompt: `Resolva a equação do 2º grau e informe a ${pedeMaior ? 'MAIOR' : 'MENOR'} raiz:\nx² ${sinalB}x ${sinalC} = 0`,
        answer: pedeMaior ? maior : menor,
        why: `Δ = b² − 4ac = ${b}² − 4·1·(${c}) = ${b * b - 4 * c}. √Δ = ${Math.sqrt(b * b - 4 * c)}. x = (${-b} ± ${Math.sqrt(b * b - 4 * c)}) ÷ 2, dando as raízes ${menor} e ${maior}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-bhaskara-problema',
    grade: 9, subject: 'matematica', bncc: 'EF09MA11',
    topic: 'Equação do 2º grau aplicada', level: 3, variants: 900,
    gen(r) {
      const largura = r.int(3, 20)
      const extra = r.int(2, 12)
      const comprimento = largura + extra
      const area = largura * comprimento
      return input({
        prompt: `Um terreno retangular tem área de ${num(area)} m². O comprimento tem ${extra} m a mais que a largura.\nQuantos metros mede a largura?`,
        answer: largura,
        unit: 'm',
        why: `Seja x a largura: x(x + ${extra}) = ${num(area)} → x² + ${extra}x − ${num(area)} = 0. Resolvendo, a raiz positiva é x = ${largura} m (e o comprimento, ${comprimento} m).`,
      })
    },
  }),

  tpl({
    id: 'ma9-funcao-1grau',
    grade: 9, subject: 'matematica', bncc: ['EF09MA06', 'EF09MA12'],
    topic: 'Função do 1º grau', level: 2, variants: 2000,
    gen(r) {
      const a = r.intExcept(-8, 10, [0])
      const b = r.int(-15, 25)
      const pergunta = r.pick(['valor', 'raiz', 'crescente'])
      if (pergunta === 'valor') {
        const x = r.intExcept(-8, 10, [0])
        return input({
          prompt: `Dada a função f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}, calcule f(${x}).`,
          answer: a * x + b,
          why: `f(${x}) = ${a}·(${x}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x + b}.`,
        })
      }
      if (pergunta === 'crescente') {
        return mc({
          prompt: `A função f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} é crescente ou decrescente?`,
          answer: a > 0 ? 'Crescente' : 'Decrescente',
          wrong: [a > 0 ? 'Decrescente' : 'Crescente', 'Constante'],
          why: `O coeficiente angular é ${a}. Quando ele é ${a > 0 ? 'positivo, a função cresce' : 'negativo, a função decresce'}.`,
        })
      }
      // Garante raiz inteira
      const aa = r.pick([1, 2, 3, 4, 5])
      const raiz = r.intExcept(-9, 9, [0])
      const bb = -aa * raiz
      return input({
        prompt: `Qual é a raiz (zero) da função f(x) = ${aa}x ${bb >= 0 ? '+' : '−'} ${Math.abs(bb)}?`,
        answer: raiz,
        why: `A raiz é o x que zera a função: ${aa}x ${bb >= 0 ? '+' : '−'} ${Math.abs(bb)} = 0 → x = ${-bb}/${aa} = ${raiz}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-pitagoras',
    grade: 9, subject: 'matematica', bncc: 'EF09MA14',
    topic: 'Teorema de Pitágoras', level: 2, variants: 400,
    gen(r) {
      const ternas = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20], [10, 24, 26], [15, 20, 25], [9, 40, 41]]
      const [a, b, c] = r.pick(ternas)
      const k = r.pick([1, 1, 1, 2])
      const A = a * k, B = b * k, C = c * k
      const pedeHipotenusa = r.chance(0.6)
      return input({
        prompt: pedeHipotenusa
          ? `Um triângulo retângulo tem catetos de ${A} cm e ${B} cm.\nQuantos centímetros mede a hipotenusa?`
          : `Um triângulo retângulo tem hipotenusa de ${C} cm e um cateto de ${A} cm.\nQuantos centímetros mede o outro cateto?`,
        answer: pedeHipotenusa ? C : B,
        unit: 'cm',
        why: pedeHipotenusa
          ? `a² + b² = c²: ${A}² + ${B}² = ${A * A} + ${B * B} = ${C * C}. Logo c = √${C * C} = ${C} cm.`
          : `c² − a² = b²: ${C}² − ${A}² = ${C * C} − ${A * A} = ${B * B}. Logo b = √${B * B} = ${B} cm.`,
      })
    },
  }),

  tpl({
    id: 'ma9-pitagoras-aplicado',
    grade: 9, subject: 'matematica', bncc: 'EF09MA14',
    topic: 'Pitágoras aplicado', level: 3, variants: 400,
    gen(r) {
      const ternas = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]]
      const [a, b, c] = r.pick(ternas)
      const cenario = r.pick(['escada', 'tv', 'campo'])
      if (cenario === 'escada') {
        return input({
          prompt: `Uma escada de ${c} m está apoiada numa parede, com a base afastada ${a} m do pé da parede.\nA que altura, em metros, a escada toca a parede?`,
          answer: b, unit: 'm',
          why: `A escada é a hipotenusa: ${c}² = ${a}² + h² → h² = ${c * c} − ${a * a} = ${b * b} → h = ${b} m.`,
        })
      }
      if (cenario === 'tv') {
        return input({
          prompt: `Uma tela retangular mede ${a * 5} cm por ${b * 5} cm.\nQuantos centímetros mede a diagonal?`,
          answer: c * 5, unit: 'cm',
          why: `d² = ${a * 5}² + ${b * 5}² = ${a * a * 25} + ${b * b * 25} = ${c * c * 25} → d = ${c * 5} cm.`,
        })
      }
      return input({
        prompt: `Um campo retangular tem ${a * 10} m de largura e ${b * 10} m de comprimento. Um jogador corre de um canto ao canto oposto, em linha reta.\nQuantos metros ele percorre?`,
        answer: c * 10, unit: 'm',
        why: `A trajetória é a diagonal: d² = ${a * 10}² + ${b * 10}² = ${c * c * 100} → d = ${c * 10} m.`,
      })
    },
  }),

  tpl({
    id: 'ma9-semelhanca',
    grade: 9, subject: 'matematica', bncc: 'EF09MA15',
    topic: 'Semelhança de triângulos', level: 3, variants: 1200,
    gen(r) {
      const k = r.pick([2, 3, 4, 1.5, 2.5])
      const a = r.int(3, 15)
      const b = r.int(3, 15)
      const A = a * k
      const B = Math.round(b * k * 100) / 100
      return input({
        prompt: `Dois triângulos são semelhantes. No menor, dois lados medem ${a} cm e ${b} cm. No maior, o lado correspondente ao de ${a} cm mede ${num(A)} cm.\nQuanto mede, em cm, o lado correspondente ao de ${b} cm?`,
        answer: num(B, Number.isInteger(B) ? 0 : 2),
        unit: 'cm',
        decimal: !Number.isInteger(B),
        why: `A razão de semelhança é ${num(A)} ÷ ${a} = ${num(k)}. Então o outro lado mede ${b} × ${num(k)} = ${num(B)} cm.`,
      })
    },
  }),

  tpl({
    id: 'ma9-relacoes-metricas',
    grade: 9, subject: 'matematica', bncc: 'EF09MA15',
    topic: 'Relações métricas', level: 3, variants: 60,
    gen(r) {
      const ternas = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]
      const [a, b, c] = r.pick(ternas)
      const altura = Math.round(((a * b) / c) * 100) / 100
      return input({
        prompt: `Num triângulo retângulo de catetos ${a} cm e ${b} cm e hipotenusa ${c} cm, qual é a altura relativa à hipotenusa, em cm?`,
        answer: num(altura, Number.isInteger(altura) ? 0 : 2),
        unit: 'cm',
        decimal: !Number.isInteger(altura),
        why: `Relação métrica: a·b = c·h → ${a} × ${b} = ${c} × h → h = ${a * b} ÷ ${c} = ${num(altura)} cm.`,
      })
    },
  }),

  tpl({
    id: 'ma9-volume-cilindro',
    grade: 9, subject: 'matematica', bncc: 'EF09MA19',
    topic: 'Volume de prismas e cilindros', level: 3, variants: 600,
    gen(r) {
      const cilindro = r.chance(0.6)
      if (cilindro) {
        const raio = r.int(2, 15)
        const altura = r.int(3, 30)
        const vol = Math.round(3.14 * raio * raio * altura * 100) / 100
        return input({
          prompt: `Um cilindro tem raio da base ${raio} cm e altura ${altura} cm. Use π = 3,14.\nQual é o seu volume, em cm³?`,
          answer: num(vol, Number.isInteger(vol) ? 0 : 2),
          unit: 'cm³',
          decimal: !Number.isInteger(vol),
          why: `V = π·r²·h = 3,14 × ${raio}² × ${altura} = 3,14 × ${raio * raio} × ${altura} = ${num(vol)} cm³.`,
        })
      }
      const base = r.int(3, 20)
      const altBase = r.int(3, 20)
      const h = r.int(4, 25)
      const vol = ((base * altBase) / 2) * h
      return input({
        prompt: `Um prisma tem base triangular com ${base} cm de base e ${altBase} cm de altura, e altura do prisma de ${h} cm.\nQual é o seu volume, em cm³?`,
        answer: num(vol, Number.isInteger(vol) ? 0 : 1),
        unit: 'cm³',
        decimal: !Number.isInteger(vol),
        why: `Área da base = (${base} × ${altBase}) ÷ 2 = ${num((base * altBase) / 2)} cm². Volume = área da base × altura = ${num((base * altBase) / 2)} × ${h} = ${num(vol)} cm³.`,
      })
    },
  }),

  tpl({
    id: 'ma9-prob-independentes',
    grade: 9, subject: 'matematica', bncc: 'EF09MA20',
    topic: 'Eventos independentes', level: 3, variants: 500,
    gen(r) {
      const cenario = r.pick(['dados', 'urna-com', 'urna-sem'])
      if (cenario === 'dados') {
        const n1 = r.int(1, 6)
        const n2 = r.int(1, 6)
        return mc({
          prompt: `Dois dados são lançados. Qual é a probabilidade de sair ${n1} no primeiro E ${n2} no segundo?`,
          answer: '1/36',
          wrong: pickWrong(r, ['1/6', '1/12', '2/6', '1/18', '1/3'], '1/36'),
          why: `São eventos independentes: P = 1/6 × 1/6 = 1/36.`,
        })
      }
      const brancas = r.int(3, 8)
      const pretas = r.int(3, 8)
      const total = brancas + pretas
      if (cenario === 'urna-com') {
        const [p, q] = reduceFraction(brancas * brancas, total * total)
        return mc({
          prompt: `Uma urna tem ${brancas} bolas brancas e ${pretas} pretas. Retira-se uma bola, anota-se a cor e ela VOLTA para a urna. Depois retira-se outra.\nQual é a probabilidade de as duas serem brancas?`,
          answer: `${p}/${q}`,
          wrong: take3(`${p}/${q}`, [
            `${brancas}/${total}`,
            `${brancas * (brancas - 1)}/${total * (total - 1)}`,
            `${brancas * 2}/${total * 2}`,
            `${p + 1}/${q}`,
          ]),
          why: `Com reposição os eventos são independentes: ${brancas}/${total} × ${brancas}/${total} = ${brancas * brancas}/${total * total} = ${p}/${q}.`,
        })
      }
      const [p, q] = reduceFraction(brancas * (brancas - 1), total * (total - 1))
      return mc({
        prompt: `Uma urna tem ${brancas} bolas brancas e ${pretas} pretas. Retiram-se duas bolas, SEM reposição.\nQual é a probabilidade de as duas serem brancas?`,
        answer: `${p}/${q}`,
        wrong: take3(`${p}/${q}`, [
          `${brancas * brancas}/${total * total}`,
          `${brancas}/${total}`,
          `${brancas - 1}/${total - 1}`,
          `${p + 1}/${q}`,
        ]),
        why: `Sem reposição o segundo sorteio muda: ${brancas}/${total} × ${brancas - 1}/${total - 1} = ${brancas * (brancas - 1)}/${total * (total - 1)} = ${p}/${q}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-proporcionalidade',
    grade: 9, subject: 'matematica', bncc: ['EF09MA07', 'EF09MA08'],
    topic: 'Razão entre grandezas', level: 2, variants: 1000,
    gen(r) {
      const cenario = r.pick(['vazao', 'consumo', 'escala'])
      if (cenario === 'vazao') {
        const vazao = r.pick([5, 8, 10, 12, 15, 20, 25])
        const minutos = r.int(6, 40)
        return input({
          prompt: `Uma torneira despeja ${vazao} litros por minuto numa caixa-d'água.\nQuantos litros ela despeja em ${minutos} minutos?`,
          answer: vazao * minutos, unit: 'L',
          why: `${vazao} L/min × ${minutos} min = ${num(vazao * minutos)} litros.`,
        })
      }
      if (cenario === 'consumo') {
        const kmPorLitro = r.pick([8, 10, 12, 14, 15])
        const litros = r.int(5, 50)
        return input({
          prompt: `Um carro faz ${kmPorLitro} km com 1 litro de combustível.\nQuantos quilômetros ele percorre com ${litros} litros?`,
          answer: kmPorLitro * litros, unit: 'km',
          why: `${kmPorLitro} km/L × ${litros} L = ${num(kmPorLitro * litros)} km.`,
        })
      }
      const pessoas = r.int(2, 8)
      const dias = r.int(4, 20)
      const novasPessoas = r.int(2, 8)
      const total = pessoas * dias
      const novoDias = Math.round((total / novasPessoas) * 100) / 100
      return input({
        prompt: `${pessoas} pintores levam ${dias} dias para pintar um prédio em ${r.pick(CITIES)}.\nMantendo o ritmo, quantos dias levariam ${novasPessoas} pintores?`,
        answer: num(novoDias, Number.isInteger(novoDias) ? 0 : 2),
        unit: 'dias',
        decimal: !Number.isInteger(novoDias),
        why: `Grandezas inversamente proporcionais: pessoas × dias é constante = ${pessoas} × ${dias} = ${total}. Logo ${novasPessoas} × d = ${total} → d = ${num(novoDias)} dias.`,
      })
    },
  }),

  tpl({
    id: 'ma9-graficos-enganosos',
    grade: 9, subject: 'matematica', bncc: 'EF09MA22',
    topic: 'Leitura crítica de gráficos', level: 2, variants: 20,
    gen(r) {
      const casos = [
        { txt: 'Um gráfico de barras cujo eixo vertical NÃO começa no zero', efeito: 'Exagera visualmente as diferenças entre as barras' },
        { txt: 'Um gráfico de setores cuja soma das fatias passa de 100%', efeito: 'Indica erro nos dados ou categorias sobrepostas' },
        { txt: 'Um gráfico de linha com intervalos de tempo desiguais no eixo horizontal', efeito: 'Distorce a percepção da velocidade da mudança' },
        { txt: 'Um gráfico que usa figuras cujo tamanho cresce em largura E altura', efeito: 'Faz a diferença parecer muito maior do que é' },
      ]
      const c = r.pick(casos)
      return mc({
        prompt: `Qual é o principal problema do seguinte gráfico?\n"${c.txt}"`,
        answer: c.efeito,
        wrong: pickWrong(r, casos.map((x) => x.efeito), c.efeito),
        why: `${c.txt} → ${c.efeito.toLowerCase()}. Ler gráficos com atenção ao eixo evita conclusões erradas.`,
      })
    },
  }),

  tpl({
    id: 'ma9-unidades-extremas',
    grade: 9, subject: 'matematica', bncc: 'EF09MA18',
    topic: 'Unidades de medida', level: 1, variants: 40,
    gen(r) {
      const prefixos = [
        { nome: 'quilo', simbolo: 'k', fator: '10³' },
        { nome: 'mega', simbolo: 'M', fator: '10⁶' },
        { nome: 'giga', simbolo: 'G', fator: '10⁹' },
        { nome: 'tera', simbolo: 'T', fator: '10¹²' },
        { nome: 'mili', simbolo: 'm', fator: '10⁻³' },
        { nome: 'micro', simbolo: 'µ', fator: '10⁻⁶' },
        { nome: 'nano', simbolo: 'n', fator: '10⁻⁹' },
      ]
      const p = r.pick(prefixos)
      return mc({
        prompt: `A que potência de 10 corresponde o prefixo "${p.nome}"?`,
        answer: p.fator,
        wrong: pickWrong(r, prefixos.map((x) => x.fator), p.fator),
        why: `O prefixo ${p.nome} (${p.simbolo}) vale ${p.fator}.`,
      })
    },
  }),

  tpl({
    id: 'ma9-porcentagem-reversa',
    grade: 9, subject: 'matematica', bncc: 'EF09MA05',
    topic: 'Porcentagem reversa', level: 3, variants: 700,
    gen(r) {
      // Múltiplo de 200 garante que o preço com desconto também seja inteiro.
      const original = r.int(2, 25) * 200
      const pct = r.pick([10, 20, 25, 40, 50])
      const comDesconto = original * (1 - pct / 100)
      return input({
        prompt: `Após um desconto de ${pct}%, um produto passou a custar R$ ${num(comDesconto)},00.\nQual era o preço original, em reais?`,
        answer: original,
        unit: 'R$',
        why: `O preço com desconto representa ${100 - pct}% do original. Então original = ${num(comDesconto)} ÷ ${num((100 - pct) / 100, 2)} = ${num(original)}. Cuidado: somar ${pct}% ao preço com desconto NÃO volta ao original.`,
      })
    },
  }),
]
