import {
  tpl, mc, input, numDistract, pickWrong,
  num, gcd, reduceFraction, NAMES, ITEMS, CITIES, SPORTS, FRUITS,
} from './helpers.js'

/** Matemática — 7º ano. */
export default [
  tpl({
    id: 'ma7-mmc-mdc',
    grade: 7, subject: 'matematica', bncc: 'EF07MA01',
    topic: 'MMC e MDC', level: 2, variants: 1400,
    gen(r) {
      const a = r.pick([12, 15, 16, 18, 20, 24, 28, 30, 36, 40, 45, 48, 60])
      const b = r.pick([8, 10, 12, 14, 18, 20, 24, 27, 32, 36, 42, 50].filter((x) => x !== a))
      const pedeMmc = r.chance()
      const d = gcd(a, b)
      const m = (a * b) / d
      return input({
        prompt: `Calcule o ${pedeMmc ? 'MMC (mínimo múltiplo comum)' : 'MDC (máximo divisor comum)'} entre ${a} e ${b}.`,
        answer: pedeMmc ? m : d,
        why: pedeMmc
          ? `MDC(${a}, ${b}) = ${d}. Como MMC × MDC = ${a} × ${b}, temos MMC = ${a} × ${b} ÷ ${d} = ${m}.`
          : `Os divisores comuns de ${a} e ${b} têm como maior valor ${d}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-mdc-problema',
    grade: 7, subject: 'matematica', bncc: 'EF07MA01',
    topic: 'MDC aplicado', level: 3, variants: 900,
    gen(r) {
      const d = r.pick([4, 5, 6, 8, 9, 12])
      let p, q
      do {
        p = r.int(2, 11); q = r.int(2, 11)
      } while (gcd(p, q) !== 1 || p === q)
      const a = d * p
      const b = d * q
      const item1 = r.pick(ITEMS)
      let item2 = r.pick(ITEMS)
      while (item2.p === item1.p) item2 = r.pick(ITEMS)
      return input({
        prompt: `Uma professora tem ${a} ${item1.p} e ${b} ${item2.p}. Ela quer montar o maior número possível de kits iguais, usando tudo, sem sobrar nada.\nQuantos kits ela conseguirá montar?`,
        answer: d,
        why: `O número de kits é o MDC de ${a} e ${b}, que é ${d}. Cada kit fica com ${p} ${item1.p} e ${q} ${item2.p}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-inteiros-operacoes',
    grade: 7, subject: 'matematica', bncc: 'EF07MA04',
    topic: 'Números inteiros', level: 1, variants: 4000,
    gen(r) {
      const op = r.pick(['+', '−', '×'])
      const limite = op === '×' ? 12 : 30
      const a = r.intExcept(-limite, limite, [0])
      const b = r.intExcept(-limite, limite, [0])
      const resultado = op === '+' ? a + b : op === '−' ? a - b : a * b
      const sinaisIguais = a < 0 === b < 0
      return input({
        prompt: `Calcule: (${a}) ${op} (${b})`,
        answer: resultado,
        why:
          op === '×'
            ? `Sinais ${sinaisIguais ? 'iguais dão resultado positivo' : 'diferentes dão resultado negativo'}: ${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}, logo ${resultado}.`
            : `${a} ${op} ${b < 0 ? `(${b})` : b} = ${resultado}. Lembre: subtrair um número negativo é o mesmo que somar.`,
      })
    },
  }),

  tpl({
    id: 'ma7-inteiros-contexto',
    grade: 7, subject: 'matematica', bncc: ['EF07MA03', 'EF07MA04'],
    topic: 'Inteiros no cotidiano', level: 2, variants: 2000,
    gen(r) {
      const cenario = r.pick(['temperatura', 'conta', 'elevador'])
      if (cenario === 'temperatura') {
        const inicial = r.int(-15, 5)
        const variacao = r.int(4, 22)
        const sobe = r.chance()
        const final = sobe ? inicial + variacao : inicial - variacao
        return input({
          prompt: `Em ${r.pick(['Bariloche', 'Ushuaia', 'Moscou', 'Oslo', 'Montreal'])}, a temperatura era de ${inicial} °C de manhã e ${sobe ? 'subiu' : 'caiu'} ${variacao} °C até a tarde.\nQual era a temperatura à tarde, em °C?`,
          answer: final,
          unit: '°C',
          why: `${inicial} ${sobe ? '+' : '−'} ${variacao} = ${final} °C.`,
        })
      }
      if (cenario === 'conta') {
        const saldo = -r.int(50, 400)
        const deposito = r.int(100, 800)
        return input({
          prompt: `${r.pick(NAMES)} estava com saldo de R$ ${saldo},00 na conta (negativo) e depositou R$ ${deposito},00.\nQual é o novo saldo, em reais?`,
          answer: saldo + deposito,
          unit: 'R$',
          why: `${saldo} + ${deposito} = ${saldo + deposito} reais.`,
        })
      }
      const sub = r.int(2, 8)
      const desce = r.int(4, 12)
      return input({
        prompt: `Um elevador está no subsolo ${sub} (andar −${sub}). Ele sobe ${desce} andares.\nEm que andar ele para? (use número negativo se continuar no subsolo)`,
        answer: -sub + desce,
        why: `−${sub} + ${desce} = ${-sub + desce}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-razao',
    grade: 7, subject: 'matematica', bncc: 'EF07MA09',
    topic: 'Razão e proporção', level: 2, variants: 1200,
    gen(r) {
      const k = r.int(2, 12)
      const p = r.int(2, 9)
      const q = r.intExcept(2, 9, [p])
      const a = k * p
      const b = k * q
      const [sp, sq] = reduceFraction(a, b)
      return mc({
        prompt: `Numa turma há ${a} meninas e ${b} meninos. Qual é a razão entre o número de meninas e o de meninos, na forma mais simples?`,
        answer: `${sp}/${sq}`,
        wrong: [`${sq}/${sp}`, `${a}/${a + b}`, `${sp + 1}/${sq}`].filter((w, i, arr) => w !== `${sp}/${sq}` && arr.indexOf(w) === i).slice(0, 3),
        why: `${a}/${b}, dividindo os dois por ${gcd(a, b)}, dá ${sp}/${sq}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-regra-tres-direta',
    grade: 7, subject: 'matematica', bncc: 'EF07MA17',
    topic: 'Proporcionalidade direta', level: 2, variants: 2500,
    gen(r) {
      const unit = r.int(2, 15)
      const q1 = r.int(2, 9)
      const q2 = r.int(3, 20)
      const total1 = unit * q1
      const total2 = unit * q2
      const item = r.pick(ITEMS)
      return input({
        prompt: `Se ${q1} ${item.p} custam R$ ${num(total1)},00, quanto custam ${q2} ${item.p} (em reais), mantendo o mesmo preço por unidade?`,
        answer: total2,
        unit: 'R$',
        why: `Preço de 1 ${item.s}: ${total1} ÷ ${q1} = ${unit} reais. Então ${q2} × ${unit} = ${total2} reais.`,
      })
    },
  }),

  tpl({
    id: 'ma7-regra-tres-inversa',
    grade: 7, subject: 'matematica', bncc: 'EF07MA17',
    topic: 'Proporcionalidade inversa', level: 3, variants: 1200,
    gen(r) {
      const produto = r.pick([48, 60, 72, 90, 120, 144, 180, 240])
      const divisores = []
      for (let i = 2; i <= 20; i++) if (produto % i === 0) divisores.push(i)
      const p1 = r.pick(divisores)
      const p2 = r.pick(divisores.filter((d) => d !== p1))
      const d1 = produto / p1
      const d2 = produto / p2
      return input({
        prompt: `${p1} pedreiros levam ${d1} dias para construir um muro.\nMantendo o mesmo ritmo, quantos dias levariam ${p2} pedreiros?`,
        answer: d2,
        unit: 'dias',
        why: `Grandezas inversamente proporcionais: pedreiros × dias é constante. ${p1} × ${d1} = ${produto}. Logo ${p2} × d = ${produto} e d = ${d2} dias.`,
      })
    },
  }),

  tpl({
    id: 'ma7-porcentagem-desconto',
    grade: 7, subject: 'matematica', bncc: 'EF07MA02',
    topic: 'Porcentagem', level: 2, variants: 2200,
    gen(r) {
      const preco = r.int(4, 50) * 20
      const pct = r.pick([5, 10, 15, 20, 25, 30, 40, 50])
      const desconto = r.chance()
      const valorFinal = desconto ? preco * (1 - pct / 100) : preco * (1 + pct / 100)
      return input({
        prompt: `Um produto custa R$ ${num(preco)},00 e teve ${desconto ? `um desconto de ${pct}%` : `um aumento de ${pct}%`}.\nQual passou a ser o preço, em reais?`,
        answer: num(valorFinal, Number.isInteger(valorFinal) ? 0 : 2),
        unit: 'R$',
        decimal: !Number.isInteger(valorFinal),
        why: `${pct}% de ${num(preco)} = ${num((preco * pct) / 100)}. ${desconto ? `Subtraindo: ${num(preco)} − ${num((preco * pct) / 100)}` : `Somando: ${num(preco)} + ${num((preco * pct) / 100)}`} = ${num(valorFinal)}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-racionais-mult',
    grade: 7, subject: 'matematica', bncc: 'EF07MA11',
    topic: 'Multiplicação de frações', level: 2, variants: 1500,
    gen(r) {
      const a = r.int(1, 8), b = r.int(2, 9), c = r.int(1, 8), d = r.int(2, 9)
      const dividir = r.chance(0.4)
      const [pn, pd] = dividir ? reduceFraction(a * d, b * c) : reduceFraction(a * c, b * d)
      const certo = pd === 1 ? String(pn) : `${pn}/${pd}`
      const valorCerto = pn / pd

      // Distratores: erros típicos (somar numeradores, esquecer de inverter...).
      // Filtramos pelo VALOR, não pelo texto: "2/12" seria uma segunda resposta
      // certa disfarçada se a fração correta fosse 1/6.
      const candidatos = [
        [a + c, b + d],
        [dividir ? a * c : a * d, dividir ? b * d : b * c],
        [b * c, a * d],
        [a * c + 1, b * d],
        [pn + 1, pd],
      ]
      const wrong = []
      const vistos = new Set([valorCerto])
      for (const [n, dd] of candidatos) {
        if (wrong.length >= 3 || dd === 0 || n <= 0) continue
        const [rn, rd] = reduceFraction(n, dd)
        const v = rn / rd
        if (vistos.has(v)) continue
        vistos.add(v)
        wrong.push(rd === 1 ? String(rn) : `${rn}/${rd}`)
      }
      return mc({
        prompt: `Calcule: ${a}/${b} ${dividir ? '÷' : '×'} ${c}/${d}`,
        answer: certo,
        wrong,
        why: dividir
          ? `Dividir é multiplicar pelo inverso: ${a}/${b} × ${d}/${c} = ${a * d}/${b * c} = ${certo}.`
          : `Multiplica-se numerador com numerador e denominador com denominador: ${a * c}/${b * d} = ${certo}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-equacao-1grau',
    grade: 7, subject: 'matematica', bncc: 'EF07MA18',
    topic: 'Equação do 1º grau', level: 2, variants: 3500,
    gen(r) {
      const x = r.int(-12, 20)
      const a = r.int(2, 12)
      const b = r.int(-20, 20)
      const c = r.intExcept(-15, 15, [a]) // c ≠ a garante solução única
      const d = a * x + b - c * x // a·x + b = c·x + d
      const termoD = d
      return input({
        prompt: `Resolva a equação e informe o valor de x:\n${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${c}x ${termoD >= 0 ? '+' : '−'} ${Math.abs(termoD)}`,
        answer: x,
        why: `Passando os x para a esquerda e os números para a direita: (${a} − ${c})x = ${termoD} − ${b}, ou seja ${a - c}x = ${termoD - b}. Logo x = ${x}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-equacao-problema',
    grade: 7, subject: 'matematica', bncc: 'EF07MA18',
    topic: 'Equação aplicada', level: 3, variants: 2000,
    gen(r) {
      const nome = r.pick(NAMES)
      const idadeFilho = r.int(8, 18)
      const fator = r.int(2, 4)
      const mais = r.int(2, 12)
      const idadePai = fator * idadeFilho + mais
      const soma = idadeFilho + idadePai
      return input({
        prompt: `A idade de ${nome} é ${fator} vezes a idade de seu irmão mais ${mais} anos. Juntos, somam ${soma} anos.\nQuantos anos tem o irmão mais novo?`,
        answer: idadeFilho,
        unit: 'anos',
        why: `Chamando a idade do irmão de x: x + (${fator}x + ${mais}) = ${soma} → ${fator + 1}x = ${soma - mais} → x = ${idadeFilho}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-sequencias',
    grade: 7, subject: 'matematica', bncc: ['EF07MA14', 'EF07MA15'],
    topic: 'Sequências', level: 2, variants: 1800,
    gen(r) {
      const tipo = r.pick(['aritmetica', 'geometrica', 'quadrados'])
      if (tipo === 'aritmetica') {
        const a0 = r.int(1, 20)
        const razao = r.intExcept(2, 12, [0])
        const termos = [0, 1, 2, 3, 4].map((i) => a0 + i * razao)
        const proximo = a0 + 5 * razao
        return input({
          prompt: `Observe a sequência e descubra o próximo termo:\n${termos.join(', ')}, ...`,
          answer: proximo,
          why: `Cada termo aumenta ${razao}. Então o próximo é ${termos[4]} + ${razao} = ${proximo}.`,
        })
      }
      if (tipo === 'geometrica') {
        const a0 = r.int(1, 6)
        const razao = r.pick([2, 3])
        const termos = [0, 1, 2, 3].map((i) => a0 * Math.pow(razao, i))
        const proximo = a0 * Math.pow(razao, 4)
        return input({
          prompt: `Descubra o próximo termo da sequência:\n${termos.join(', ')}, ...`,
          answer: proximo,
          why: `Cada termo é o anterior multiplicado por ${razao}: ${termos[3]} × ${razao} = ${proximo}.`,
        })
      }
      const inicio = r.int(1, 6)
      const termos = [0, 1, 2, 3].map((i) => Math.pow(inicio + i, 2))
      const proximo = Math.pow(inicio + 4, 2)
      return input({
        prompt: `Descubra o próximo termo da sequência:\n${termos.join(', ')}, ...`,
        answer: proximo,
        why: `São quadrados perfeitos: ${inicio}², ${inicio + 1}², ${inicio + 2}², ${inicio + 3}². O próximo é ${inicio + 4}² = ${proximo}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-valor-numerico',
    grade: 7, subject: 'matematica', bncc: 'EF07MA13',
    topic: 'Valor numérico', level: 2, variants: 3000,
    gen(r) {
      const a = r.int(2, 9)
      const b = r.int(2, 12)
      const x = r.int(-6, 9)
      const resultado = a * x * x - b * x + a
      return input({
        prompt: `Calcule o valor numérico da expressão ${a}x² − ${b}x + ${a} para x = ${x}.`,
        answer: resultado,
        why: `Substituindo: ${a}·(${x})² − ${b}·(${x}) + ${a} = ${a}·${x * x} ${-b * x >= 0 ? '+' : '−'} ${Math.abs(b * x)} + ${a} = ${resultado}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-angulos-triangulo',
    grade: 7, subject: 'matematica', bncc: 'EF07MA24',
    topic: 'Ângulos no triângulo', level: 1, variants: 1500,
    gen(r) {
      const a = r.int(25, 85)
      const b = r.int(25, 170 - a)
      const c = 180 - a - b
      return input({
        prompt: `Num triângulo, dois ângulos internos medem ${a}° e ${b}°.\nQuantos graus mede o terceiro ângulo?`,
        answer: c,
        unit: '°',
        why: `A soma dos ângulos internos de um triângulo é 180°. Então 180 − ${a} − ${b} = ${c}°.`,
      })
    },
  }),

  tpl({
    id: 'ma7-paralelas',
    grade: 7, subject: 'matematica', bncc: 'EF07MA23',
    topic: 'Retas paralelas', level: 3, variants: 800,
    gen(r) {
      const a = r.int(35, 145)
      const tipo = r.pick(['correspondentes', 'alternos internos', 'colaterais internos'])
      const resposta = tipo === 'colaterais internos' ? 180 - a : a
      return input({
        prompt: `Duas retas paralelas são cortadas por uma transversal. Um ângulo mede ${a}°.\nQuanto mede o ângulo ${tipo} a ele?`,
        answer: resposta,
        unit: '°',
        why: tipo === 'colaterais internos'
          ? `Ângulos colaterais internos são suplementares: 180 − ${a} = ${resposta}°.`
          : `Ângulos ${tipo} entre paralelas são congruentes (iguais): ${resposta}°.`,
      })
    },
  }),

  tpl({
    id: 'ma7-poligono-regular',
    grade: 7, subject: 'matematica', bncc: 'EF07MA27',
    topic: 'Polígonos regulares', level: 3, variants: 60,
    gen(r) {
      const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12])
      const nomes = { 3: 'triângulo equilátero', 4: 'quadrado', 5: 'pentágono', 6: 'hexágono', 8: 'octógono', 9: 'eneágono', 10: 'decágono', 12: 'dodecágono' }
      const soma = (n - 2) * 180
      const interno = soma / n
      const pedeSoma = r.chance(0.4)
      return input({
        prompt: pedeSoma
          ? `Qual é a soma dos ângulos internos de um ${nomes[n]} (${n} lados)?`
          : `Quanto mede cada ângulo interno de um ${nomes[n]} regular?`,
        answer: pedeSoma ? soma : interno,
        unit: '°',
        why: `Soma dos ângulos internos: (n − 2) × 180° = (${n} − 2) × 180° = ${soma}°.${pedeSoma ? '' : ` Dividindo pelos ${n} ângulos iguais: ${soma} ÷ ${n} = ${interno}°.`}`,
      })
    },
  }),

  tpl({
    id: 'ma7-area-triangulo',
    grade: 7, subject: 'matematica', bncc: 'EF07MA31',
    topic: 'Área de triângulo', level: 2, variants: 900,
    gen(r) {
      const base = r.int(4, 30) * (r.chance() ? 1 : 2)
      const altura = r.int(3, 24)
      const area = (base * altura) / 2
      return input({
        prompt: `Um triângulo tem base de ${base} cm e altura de ${altura} cm.\nQual é a sua área, em cm²?`,
        answer: num(area, Number.isInteger(area) ? 0 : 1),
        unit: 'cm²',
        decimal: !Number.isInteger(area),
        why: `Área do triângulo = (base × altura) ÷ 2 = (${base} × ${altura}) ÷ 2 = ${num(area)} cm².`,
      })
    },
  }),

  tpl({
    id: 'ma7-area-trapezio',
    grade: 7, subject: 'matematica', bncc: 'EF07MA32',
    topic: 'Área de quadriláteros', level: 3, variants: 1200,
    gen(r) {
      const figura = r.pick(['trapézio', 'paralelogramo', 'losango'])
      if (figura === 'trapézio') {
        const B = r.int(10, 30)
        const b = r.int(3, B - 2)
        const h = r.int(2, 16) * 2
        const area = ((B + b) * h) / 2
        return input({
          prompt: `Um trapézio tem base maior ${B} cm, base menor ${b} cm e altura ${h} cm.\nQual é a sua área, em cm²?`,
          answer: area, unit: 'cm²',
          why: `Área do trapézio = (B + b) × h ÷ 2 = (${B} + ${b}) × ${h} ÷ 2 = ${area} cm².`,
        })
      }
      if (figura === 'paralelogramo') {
        const b = r.int(5, 28), h = r.int(3, 20)
        return input({
          prompt: `Um paralelogramo tem base ${b} cm e altura ${h} cm.\nQual é a sua área, em cm²?`,
          answer: b * h, unit: 'cm²',
          why: `Área do paralelogramo = base × altura = ${b} × ${h} = ${b * h} cm².`,
        })
      }
      const D = r.int(6, 30), d = r.int(4, D - 1)
      const area = (D * d) / 2
      return input({
        prompt: `Um losango tem diagonais de ${D} cm e ${d} cm.\nQual é a sua área, em cm²?`,
        answer: num(area, Number.isInteger(area) ? 0 : 1), unit: 'cm²',
        decimal: !Number.isInteger(area),
        why: `Área do losango = (D × d) ÷ 2 = (${D} × ${d}) ÷ 2 = ${num(area)} cm².`,
      })
    },
  }),

  tpl({
    id: 'ma7-circunferencia',
    grade: 7, subject: 'matematica', bncc: ['EF07MA33', 'EF07MA34'],
    topic: 'Circunferência e círculo', level: 3, variants: 60,
    gen(r) {
      const raio = r.int(2, 25)
      const pedeArea = r.chance()
      const comprimento = 2 * 3.14 * raio
      const area = 3.14 * raio * raio
      const valor = pedeArea ? area : comprimento
      return input({
        prompt: `Uma circunferência tem raio de ${raio} cm. Use π = 3,14.\nQual é ${pedeArea ? 'a área do círculo, em cm²' : 'o comprimento da circunferência, em cm'}?`,
        answer: num(Math.round(valor * 100) / 100, 2),
        unit: pedeArea ? 'cm²' : 'cm',
        decimal: true,
        why: pedeArea
          ? `A = π·r² = 3,14 × ${raio}² = 3,14 × ${raio * raio} = ${num(Math.round(area * 100) / 100, 2)} cm².`
          : `C = 2·π·r = 2 × 3,14 × ${raio} = ${num(Math.round(comprimento * 100) / 100, 2)} cm.`,
      })
    },
  }),

  tpl({
    id: 'ma7-volume-bloco',
    grade: 7, subject: 'matematica', bncc: 'EF07MA30',
    topic: 'Volume', level: 2, variants: 1400,
    gen(r) {
      const a = r.int(2, 20), b = r.int(2, 20), c = r.int(2, 20)
      const vol = a * b * c
      const emLitros = r.chance(0.35)
      return input({
        prompt: emLitros
          ? `Uma caixa-d'água tem ${a} dm × ${b} dm × ${c} dm.\nQuantos litros ela comporta? (1 dm³ = 1 L)`
          : `Uma caixa tem ${a} cm de comprimento, ${b} cm de largura e ${c} cm de altura.\nQual é o seu volume, em cm³?`,
        answer: vol,
        unit: emLitros ? 'L' : 'cm³',
        why: `Volume do bloco retangular = comprimento × largura × altura = ${a} × ${b} × ${c} = ${num(vol)}${emLitros ? ' dm³, ou seja, ' + num(vol) + ' litros.' : ' cm³.'}`,
      })
    },
  }),

  tpl({
    id: 'ma7-velocidade',
    grade: 7, subject: 'matematica', bncc: 'EF07MA29',
    topic: 'Velocidade média', level: 2, variants: 1600,
    gen(r) {
      const v = r.pick([40, 50, 60, 72, 80, 90, 100, 120])
      const t = r.pick([2, 3, 4, 5, 6])
      const d = v * t
      const pede = r.pick(['distancia', 'velocidade', 'tempo'])
      const cidade = r.pick(CITIES)
      if (pede === 'distancia') {
        return input({
          prompt: `Um ônibus saiu de ${cidade} a ${v} km/h e viajou durante ${t} horas sem parar.\nQuantos quilômetros ele percorreu?`,
          answer: d, unit: 'km',
          why: `d = v × t = ${v} × ${t} = ${num(d)} km.`,
        })
      }
      if (pede === 'velocidade') {
        return input({
          prompt: `Um carro percorreu ${num(d)} km em ${t} horas.\nQual foi a velocidade média, em km/h?`,
          answer: v, unit: 'km/h',
          why: `v = d ÷ t = ${num(d)} ÷ ${t} = ${v} km/h.`,
        })
      }
      return input({
        prompt: `Um trem percorreu ${num(d)} km a uma velocidade média de ${v} km/h.\nQuantas horas durou a viagem?`,
        answer: t, unit: 'h',
        why: `t = d ÷ v = ${num(d)} ÷ ${v} = ${t} horas.`,
      })
    },
  }),

  tpl({
    id: 'ma7-probabilidade',
    grade: 7, subject: 'matematica', bncc: 'EF07MA35',
    topic: 'Probabilidade', level: 2, variants: 900,
    gen(r) {
      const cenario = r.pick(['dado', 'urna'])
      if (cenario === 'dado') {
        const evento = r.pick([
          { txt: 'sair um número par', casos: 3 },
          { txt: 'sair um número maior que 4', casos: 2 },
          { txt: 'sair o número 5', casos: 1 },
          { txt: 'sair um número primo', casos: 3 },
          { txt: 'sair um múltiplo de 3', casos: 2 },
        ])
        const [n, d] = reduceFraction(evento.casos, 6)
        return mc({
          prompt: `Ao lançar um dado comum de 6 faces, qual é a probabilidade de ${evento.txt}?`,
          answer: `${n}/${d}`,
          wrong: pickWrong(r, ['1/6', '1/3', '1/2', '2/3', '5/6', '1/4'], `${n}/${d}`),
          why: `São ${evento.casos} casos favoráveis em 6 possíveis: ${evento.casos}/6 = ${n}/${d}.`,
        })
      }
      const azuis = r.int(2, 9), vermelhas = r.int(2, 9), verdes = r.int(1, 6)
      const total = azuis + vermelhas + verdes
      const cor = r.pick([['azul', azuis], ['vermelha', vermelhas], ['verde', verdes]])
      const [n, d] = reduceFraction(cor[1], total)
      return mc({
        prompt: `Uma urna tem ${azuis} bolas azuis, ${vermelhas} vermelhas e ${verdes} verdes. Retirando uma bola ao acaso, qual a probabilidade de ser ${cor[0]}?`,
        answer: `${n}/${d}`,
        wrong: [`${cor[1]}/${total + 1}`, `${total}/${cor[1]}`, `${cor[1] + 1}/${total}`].filter((w, i, a) => w !== `${n}/${d}` && a.indexOf(w) === i).slice(0, 3),
        why: `Favoráveis: ${cor[1]}. Total: ${total}. Probabilidade = ${cor[1]}/${total} = ${n}/${d}.`,
      })
    },
  }),

  tpl({
    id: 'ma7-grafico-setores',
    grade: 7, subject: 'matematica', bncc: 'EF07MA37',
    topic: 'Gráfico de setores', level: 3, variants: 800,
    gen(r) {
      const esportes = r.sample(SPORTS, 4)
      const pcts = [0, 0, 0, 0]
      do {
        pcts[0] = r.int(15, 40); pcts[1] = r.int(15, 35); pcts[2] = r.int(10, 30)
        pcts[3] = 100 - pcts[0] - pcts[1] - pcts[2]
      } while (pcts[3] < 5)
      const total = r.int(4, 20) * 50
      const idx = r.int(0, 3)
      return input({
        prompt: `Um gráfico de setores mostra o esporte preferido de ${num(total)} alunos.\nQuantos alunos preferem ${esportes[idx]}?`,
        support: esportes.map((e, i) => `${e}: ${pcts[i]}%`).join('\n'),
        answer: (total * pcts[idx]) / 100,
        why: `${pcts[idx]}% de ${num(total)} = ${num(total)} × ${pcts[idx]} ÷ 100 = ${num((total * pcts[idx]) / 100)} alunos.`,
      })
    },
  }),

  tpl({
    id: 'ma7-densidade',
    grade: 7, subject: 'matematica', bncc: 'EF07MA29',
    topic: 'Densidade demográfica', level: 3, variants: 700,
    gen(r) {
      const dens = r.pick([20, 25, 40, 50, 60, 80, 100, 125])
      const area = r.int(3, 40) * 100
      const pop = dens * area
      const pedeDens = r.chance()
      const cidade = r.pick(CITIES)
      return input({
        prompt: pedeDens
          ? `${cidade} tem ${num(pop)} habitantes e área de ${num(area)} km².\nQual é a densidade demográfica, em hab/km²?`
          : `Um município tem densidade de ${dens} hab/km² e área de ${num(area)} km².\nQuantos habitantes tem o município?`,
        answer: pedeDens ? dens : pop,
        unit: pedeDens ? 'hab/km²' : 'hab',
        why: pedeDens
          ? `Densidade = população ÷ área = ${num(pop)} ÷ ${num(area)} = ${dens} hab/km².`
          : `População = densidade × área = ${dens} × ${num(area)} = ${num(pop)} habitantes.`,
      })
    },
  }),

  tpl({
    id: 'ma7-fracao-decimal-pct',
    grade: 7, subject: 'matematica', bncc: 'EF07MA10',
    topic: 'Frações, decimais e %', level: 1, variants: 300,
    gen(r) {
      const tabela = [
        ['1/2', '0,5', '50%'], ['1/4', '0,25', '25%'], ['3/4', '0,75', '75%'],
        ['1/5', '0,2', '20%'], ['2/5', '0,4', '40%'], ['3/5', '0,6', '60%'],
        ['1/10', '0,1', '10%'], ['3/10', '0,3', '30%'], ['7/10', '0,7', '70%'],
        ['1/20', '0,05', '5%'], ['1/100', '0,01', '1%'], ['1/8', '0,125', '12,5%'],
      ]
      const linha = r.pick(tabela)
      const de = r.int(0, 2)
      let para = r.int(0, 2)
      while (para === de) para = r.int(0, 2)
      const rotulos = ['fração', 'número decimal', 'porcentagem']
      return mc({
        prompt: `Qual ${rotulos[para]} equivale a ${linha[de]}?`,
        answer: linha[para],
        wrong: pickWrong(r, tabela.map((t) => t[para]), linha[para]),
        why: `${linha[0]} = ${linha[1]} = ${linha[2]}.`,
      })
    },
  }),
]
