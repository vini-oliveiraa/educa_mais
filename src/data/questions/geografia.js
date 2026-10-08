import { tpl, mc, input, pickWrong, take3, num, CITIES } from './helpers.js'

function fromBank(bank) {
  return (r) => {
    const item = r.pick(bank)
    return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why, support: item.s })
  }
}

/** Geografia — 6º ao 9º ano. */
export default [
  // ======================================================= 6º ANO
  tpl({
    id: 'ge6-coordenadas',
    grade: 6, subject: 'geografia', bncc: 'EF06GE09',
    topic: 'Coordenadas geográficas', level: 2, variants: 60,
    gen: fromBank([
      { q: 'O que são os PARALELOS?', a: 'Linhas imaginárias horizontais, paralelas à Linha do Equador', w: ['Linhas verticais que ligam os polos', 'Linhas que marcam os fusos horários', 'As fronteiras entre os continentes'], why: 'Os paralelos medem a LATITUDE. O principal é o Equador (0°).' },
      { q: 'O que são os MERIDIANOS?', a: 'Linhas imaginárias verticais que vão de um polo ao outro', w: ['Linhas horizontais paralelas ao Equador', 'As curvas de nível de um mapa', 'Os limites entre as placas tectônicas'], why: 'Os meridianos medem a LONGITUDE. O principal é o de Greenwich (0°).' },
      { q: 'A LATITUDE de um lugar é medida a partir de qual linha?', a: 'Da Linha do Equador', w: ['Do Meridiano de Greenwich', 'Do Trópico de Câncer', 'Do Círculo Polar Ártico'], why: 'Latitude: distância angular ao Equador (0° a 90° N ou S). Longitude: distância a Greenwich (0° a 180° L ou O).' },
      { q: 'Um ponto com coordenadas 15° S e 47° O está em qual hemisfério?', a: 'Hemisfério Sul e Ocidental', w: ['Hemisfério Norte e Oriental', 'Hemisfério Sul e Oriental', 'Hemisfério Norte e Ocidental'], why: '"S" indica sul do Equador e "O" indica oeste de Greenwich — é aproximadamente a posição de Brasília.' },
      { q: 'Qual trópico passa pelo Brasil?', a: 'Trópico de Capricórnio', w: ['Trópico de Câncer', 'Círculo Polar Antártico', 'Círculo Polar Ártico'], why: 'O Trópico de Capricórnio (23°27\' S) corta São Paulo, Paraná e Mato Grosso do Sul.' },
    ]),
  }),

  tpl({
    id: 'ge6-escala',
    grade: 6, subject: 'geografia', bncc: 'EF06GE08',
    topic: 'Escala cartográfica', level: 3, variants: 800,
    gen(r) {
      const escala = r.pick([1000, 5000, 10000, 25000, 50000, 100000, 250000])
      const cm = r.int(2, 30)
      const metros = (cm * escala) / 100
      const km = metros / 1000
      const emKm = km >= 1
      return input({
        prompt: `Num mapa de escala 1 : ${num(escala)}, dois pontos estão a ${cm} cm de distância.\nQual é a distância real, em ${emKm ? 'quilômetros' : 'metros'}?`,
        answer: emKm ? num(km, Number.isInteger(km) ? 0 : 2) : num(metros, Number.isInteger(metros) ? 0 : 1),
        unit: emKm ? 'km' : 'm',
        decimal: emKm ? !Number.isInteger(km) : !Number.isInteger(metros),
        why: `Cada 1 cm do mapa vale ${num(escala)} cm reais. ${cm} × ${num(escala)} = ${num(cm * escala)} cm = ${num(metros)} m${emKm ? ` = ${num(km)} km` : ''}.`,
      })
    },
  }),

  tpl({
    id: 'ge6-escala-tipo',
    grade: 6, subject: 'geografia', bncc: 'EF06GE08',
    topic: 'Tipos de escala', level: 2, variants: 60,
    gen(r) {
      const a = r.pick([1000, 10000, 50000])
      const b = r.pick([500000, 1000000, 5000000, 25000000])
      const pedeMaior = r.chance()
      return mc({
        prompt: `Entre as escalas 1 : ${num(a)} e 1 : ${num(b)}, qual delas mostra o território com ${pedeMaior ? 'MAIS detalhes' : 'MENOS detalhes'}?`,
        answer: `1 : ${num(pedeMaior ? a : b)}`,
        wrong: [`1 : ${num(pedeMaior ? b : a)}`, 'As duas mostram o mesmo nível de detalhe', 'Depende apenas do tamanho do papel'],
        why: `Quanto MENOR o denominador, MAIOR a escala e mais detalhes. 1 : ${num(a)} detalha mais que 1 : ${num(b)}, mas cobre uma área menor.`,
      })
    },
  }),

  tpl({
    id: 'ge6-clima-relevo',
    grade: 6, subject: 'geografia', bncc: ['EF06GE03', 'EF06GE05', 'EF06GE04'],
    topic: 'Clima, relevo e água', level: 2, variants: 90,
    gen: fromBank([
      { q: 'Qual é a diferença entre TEMPO e CLIMA?', a: 'Tempo é o estado da atmosfera num momento; clima é o padrão médio ao longo de décadas', w: ['Tempo é no inverno e clima é no verão', 'Tempo vale para cidades e clima para países', 'São exatamente a mesma coisa'], why: 'Tempo muda de hora em hora; clima se define por médias de 30 anos ou mais.' },
      { q: 'Qual processo do ciclo da água transforma água líquida em vapor?', a: 'Evaporação', w: ['Condensação', 'Precipitação', 'Infiltração'], why: 'Ciclo: evaporação → condensação (nuvens) → precipitação (chuva) → escoamento e infiltração.' },
      { q: 'Por que a impermeabilização do solo nas cidades aumenta as enchentes?', a: 'Porque a água da chuva não infiltra e escoa rapidamente pela superfície', w: ['Porque faz chover mais na região', 'Porque aumenta a evaporação dos rios', 'Porque resfria o solo e condensa mais vapor'], why: 'Asfalto e concreto impedem a infiltração: toda a água vai para bueiros e córregos de uma vez.' },
      { q: 'O que são as formas de relevo chamadas PLANALTOS?', a: 'Áreas elevadas e relativamente planas, onde predomina o desgaste (erosão)', w: ['Áreas baixas e planas formadas por acúmulo de sedimentos', 'Áreas de altitudes muito elevadas e picos pontiagudos', 'Áreas abaixo do nível do mar'], why: 'Planícies: acumulação de sedimentos. Planaltos: erosão. Depressões: áreas rebaixadas em relação ao entorno.' },
      { q: 'O que é uma BACIA HIDROGRÁFICA?', a: 'A área drenada por um rio principal e seus afluentes', w: ['Um reservatório artificial de água potável', 'Um lago formado pelo degelo de geleiras', 'A foz de um rio ao encontrar o mar'], why: 'A maior bacia do Brasil e do mundo é a Amazônica.' },
      { q: 'Qual fator explica o clima mais frio no alto de uma montanha?', a: 'A altitude: quanto mais alto, menor a temperatura média', w: ['A latitude, que muda com a altura', 'A maior proximidade do Sol', 'A ausência de vento nas montanhas'], why: 'A temperatura cai cerca de 0,6 °C a cada 100 m de altitude.' },
    ]),
  }),

  // ======================================================= 7º ANO
  tpl({
    id: 'ge7-regioes-brasil',
    grade: 7, subject: 'geografia', bncc: ['EF07GE02', 'EF07GE04'],
    topic: 'Regiões do Brasil', level: 1, variants: 150,
    gen(r) {
      const regioes = {
        Norte: ['Amazonas', 'Pará', 'Acre', 'Rondônia', 'Roraima', 'Amapá', 'Tocantins'],
        Nordeste: ['Bahia', 'Pernambuco', 'Ceará', 'Maranhão', 'Piauí', 'Paraíba', 'Alagoas', 'Sergipe', 'Rio Grande do Norte'],
        'Centro-Oeste': ['Goiás', 'Mato Grosso', 'Mato Grosso do Sul', 'Distrito Federal'],
        Sudeste: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Espírito Santo'],
        Sul: ['Paraná', 'Santa Catarina', 'Rio Grande do Sul'],
      }
      const nomes = Object.keys(regioes)
      const reg = r.pick(nomes)
      const estado = r.pick(regioes[reg])
      return mc({
        prompt: `A qual região brasileira pertence o estado de ${estado}?`,
        answer: reg,
        wrong: pickWrong(r, nomes, reg),
        why: `${estado} fica na região ${reg}. O Brasil é dividido pelo IBGE em cinco regiões: ${nomes.join(', ')}.`,
      })
    },
  }),

  tpl({
    id: 'ge7-populacao',
    grade: 7, subject: 'geografia', bncc: 'EF07GE04',
    topic: 'População brasileira', level: 2, variants: 60,
    gen: fromBank([
      { q: 'Qual é a região mais POPULOSA do Brasil?', a: 'Sudeste', w: ['Norte', 'Centro-Oeste', 'Sul'], why: 'O Sudeste concentra cerca de 42% da população brasileira, em apenas 11% do território.' },
      { q: 'Qual é a região com a MENOR densidade demográfica do Brasil?', a: 'Norte', w: ['Sudeste', 'Nordeste', 'Sul'], why: 'O Norte é o maior em área e tem poucos habitantes por km² — população concentrada em Manaus e Belém.' },
      { q: 'O que é ÊXODO RURAL?', a: 'A migração da população do campo para as cidades', w: ['A saída de brasileiros para outros países', 'O retorno de moradores da cidade para o campo', 'O deslocamento diário de trabalhadores'], why: 'No Brasil, o êxodo rural se intensificou entre 1950 e 1980, com a mecanização agrícola e a industrialização.' },
      { q: 'O que mostra uma PIRÂMIDE ETÁRIA com base estreita e topo largo?', a: 'Uma população envelhecida, com baixa natalidade', w: ['Uma população muito jovem e em crescimento rápido', 'Uma população com mais homens do que mulheres', 'Uma população concentrada no campo'], why: 'Base = jovens, topo = idosos. Base estreita indica queda da natalidade — tendência atual do Brasil.' },
      { q: 'O que caracteriza a migração de "retorno" no Brasil?', a: 'O regresso de nordestinos que haviam migrado para o Sudeste de volta à sua região', w: ['A chegada de imigrantes europeus no século XIX', 'A ida de brasileiros para o Japão', 'A mudança de pessoas da cidade para o campo'], why: 'A partir dos anos 2000, o crescimento econômico do Nordeste estimulou esse movimento de volta.' },
    ]),
  }),

  tpl({
    id: 'ge7-densidade',
    grade: 7, subject: 'geografia', bncc: 'EF07GE04',
    topic: 'Densidade demográfica', level: 2, variants: 700,
    gen(r) {
      const dens = r.pick([2, 5, 10, 20, 25, 50, 80, 100])
      const area = r.int(5, 60) * 1000
      const pop = dens * area
      const pedeDens = r.chance(0.6)
      return input({
        prompt: pedeDens
          ? `Um estado tem ${num(pop)} habitantes e área de ${num(area)} km².\nQual é a densidade demográfica, em hab/km²?`
          : `Um estado tem densidade demográfica de ${dens} hab/km² e área de ${num(area)} km².\nQual é a sua população?`,
        answer: pedeDens ? dens : pop,
        unit: pedeDens ? 'hab/km²' : 'habitantes',
        why: pedeDens
          ? `Densidade = população ÷ área = ${num(pop)} ÷ ${num(area)} = ${dens} hab/km².`
          : `População = densidade × área = ${dens} × ${num(area)} = ${num(pop)} habitantes.`,
      })
    },
  }),

  tpl({
    id: 'ge7-biomas-economia',
    grade: 7, subject: 'geografia', bncc: ['EF07GE08', 'EF07GE11', 'EF07GE12'],
    topic: 'Território e economia', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que é AGRONEGÓCIO?', a: 'O conjunto de atividades ligadas à produção agropecuária em larga escala, da máquina à exportação', w: ['A agricultura praticada apenas por pequenas famílias', 'O comércio de alimentos apenas no mercado interno', 'A criação de animais domésticos em áreas urbanas'], why: 'Envolve insumos, produção, processamento, transporte e comercialização — forte no Centro-Oeste.' },
      { q: 'O que diferencia agricultura FAMILIAR do agronegócio?', a: 'Usa mão de obra da própria família, em propriedades menores, e abastece boa parte do mercado interno', w: ['Produz apenas para exportação', 'Usa exclusivamente máquinas importadas', 'Ocupa a maior parte das terras agrícolas do país'], why: 'A agricultura familiar responde por boa parte dos alimentos consumidos no Brasil (feijão, mandioca, leite).' },
      { q: 'Qual região brasileira concentra o maior parque industrial?', a: 'Sudeste', w: ['Norte', 'Centro-Oeste', 'Nordeste'], why: 'São Paulo lidera a produção industrial, embora haja desconcentração para outras regiões desde os anos 1990.' },
      { q: 'O que é a Zona Franca de Manaus?', a: 'Uma área de livre comércio com incentivos fiscais para atrair indústrias à Amazônia', w: ['Uma reserva ambiental fechada à atividade econômica', 'Um porto exclusivo para exportação de minério', 'Uma área urbana sem cobrança de aluguel'], why: 'Criada em 1967, concentra indústrias eletroeletrônicas e de motocicletas.' },
      { q: 'O que é uma Unidade de Conservação de PROTEÇÃO INTEGRAL?', a: 'Área onde só se admite o uso indireto dos recursos, como pesquisa e visitação controlada', w: ['Área onde qualquer atividade econômica é permitida', 'Área urbana destinada a parques de lazer', 'Área reservada exclusivamente à mineração'], why: 'Exemplos: Parques Nacionais e Reservas Biológicas. Já as de Uso Sustentável admitem uso direto controlado.' },
    ]),
  }),

  // ======================================================= 8º ANO
  tpl({
    id: 'ge8-america',
    grade: 8, subject: 'geografia', bncc: ['EF08GE04', 'EF08GE16', 'EF08GE23'],
    topic: 'América Latina', level: 2, variants: 90,
    gen: fromBank([
      { q: 'O que é a AMÉRICA LATINA?', a: 'O conjunto de países americanos cujas línguas derivam do latim (espanhol, português, francês)', w: ['Apenas os países da América do Sul', 'Os países localizados ao sul do Equador', 'Os países que foram colônias da Inglaterra'], why: 'É um critério cultural e linguístico — por isso inclui México e parte do Caribe, mas não os EUA.' },
      { q: 'Qual é a principal cadeia montanhosa da América do Sul?', a: 'Cordilheira dos Andes', w: ['Montanhas Rochosas', 'Himalaia', 'Serra do Mar'], why: 'Os Andes têm cerca de 7.000 km e são resultado do choque entre as placas de Nazca e Sul-Americana.' },
      { q: 'O que é a MEGALÓPOLE?', a: 'A união de várias metrópoles e suas regiões urbanas num contínuo urbanizado', w: ['Uma cidade com mais de 1 milhão de habitantes', 'A capital política de um país', 'Uma cidade planejada construída do zero'], why: 'Exemplo clássico: Boswash (Boston–Washington), nos EUA.' },
      { q: 'O que é SEGREGAÇÃO SOCIOESPACIAL nas cidades latino-americanas?', a: 'A separação dos grupos sociais no espaço urbano, com periferias carentes de infraestrutura', w: ['A divisão das cidades em bairros por ordem alfabética', 'A separação entre área rural e urbana por lei', 'A proibição de construir prédios altos no centro'], why: 'Reflete desigualdade de renda e de acesso a transporte, saneamento e serviços públicos.' },
      { q: 'O que é o MERCOSUL?', a: 'Um bloco econômico de integração entre países da América do Sul', w: ['Uma organização militar do continente americano', 'Um acordo ambiental sobre a Amazônia', 'Um banco de desenvolvimento europeu'], why: 'Criado em 1991 pelo Tratado de Assunção, com Brasil, Argentina, Uruguai e Paraguai.' },
    ]),
  }),

  tpl({
    id: 'ge8-demografia',
    grade: 8, subject: 'geografia', bncc: 'EF08GE03',
    topic: 'Dinâmica demográfica', level: 3, variants: 900,
    gen(r) {
      const pergunta = r.pick(['crescimento', 'imr', 'expectativa'])
      if (pergunta === 'crescimento') {
        const nascimentos = r.int(12, 28)
        const obitos = r.int(5, 11)
        return input({
          prompt: `Em um país, a taxa de natalidade é de ${nascimentos} nascimentos por mil habitantes e a de mortalidade é de ${obitos} óbitos por mil habitantes.\nQual é o crescimento vegetativo (natural), por mil habitantes?`,
          answer: nascimentos - obitos,
          unit: '‰',
          why: `Crescimento vegetativo = natalidade − mortalidade = ${nascimentos} − ${obitos} = ${nascimentos - obitos} por mil habitantes. Ele NÃO considera as migrações.`,
        })
      }
      if (pergunta === 'imr') {
        const pop = r.int(2, 40) * 100000
        const taxa = r.pick([10, 12, 15, 18, 20, 25])
        const nascidos = r.int(10, 60) * 1000
        const obitosInfantis = (nascidos * taxa) / 1000
        return input({
          prompt: `Em uma cidade nasceram ${num(nascidos)} crianças em um ano e a taxa de mortalidade infantil foi de ${taxa} por mil nascidos vivos.\nQuantas crianças morreram antes de completar 1 ano?`,
          answer: obitosInfantis,
          why: `${taxa} por mil significa ${taxa} ÷ 1000. Então ${num(nascidos)} × ${taxa} ÷ 1000 = ${num(obitosInfantis)} crianças.`,
        })
      }
      return mc({
        prompt: 'O que indica uma alta expectativa de vida em um país?',
        answer: 'Boas condições de saúde, saneamento, alimentação e renda',
        wrong: ['Uma população com altíssima natalidade', 'Um território de grande extensão', 'Um clima predominantemente frio'],
        why: 'A expectativa de vida é um dos três indicadores do IDH, junto com educação e renda.',
      })
    },
  }),

  tpl({
    id: 'ge8-fusos',
    grade: 8, subject: 'geografia', bncc: 'EF08GE19',
    topic: 'Fusos horários', level: 3, variants: 600,
    gen(r) {
      const cidades = [
        { c: 'Brasília', f: -3 }, { c: 'Londres', f: 0 }, { c: 'Nova York', f: -5 },
        { c: 'Tóquio', f: 9 }, { c: 'Paris', f: 1 }, { c: 'Sydney', f: 10 },
        { c: 'Manaus', f: -4 }, { c: 'Lisboa', f: 0 }, { c: 'Pequim', f: 8 },
      ]
      const a = r.pick(cidades)
      let b = r.pick(cidades)
      while (b.f === a.f) b = r.pick(cidades)
      const hora = r.int(0, 23)
      const diff = b.f - a.f
      let horaB = (hora + diff) % 24
      if (horaB < 0) horaB += 24
      return input({
        prompt: `Em ${a.c} (UTC${a.f >= 0 ? '+' : ''}${a.f}) são ${hora}h.\nQue horas são em ${b.c} (UTC${b.f >= 0 ? '+' : ''}${b.f})? (responda apenas o número da hora, de 0 a 23)`,
        answer: horaB,
        unit: 'h',
        why: `A diferença entre os fusos é de ${diff > 0 ? '+' : ''}${diff} hora(s). ${hora} ${diff >= 0 ? '+' : '−'} ${Math.abs(diff)} = ${hora + diff}${hora + diff >= 24 ? `, e ${hora + diff} − 24 = ${horaB} (já é o dia seguinte)` : hora + diff < 0 ? `, e ${hora + diff} + 24 = ${horaB} (ainda é o dia anterior)` : ''}.`,
      })
    },
  }),

  tpl({
    id: 'ge8-globalizacao',
    grade: 8, subject: 'geografia', bncc: ['EF08GE06', 'EF08GE09'],
    topic: 'Economia mundial', level: 2, variants: 70,
    gen: fromBank([
      { q: 'O que é um BLOCO ECONÔMICO?', a: 'Um acordo entre países para facilitar o comércio e a integração entre eles', w: ['Uma aliança militar entre países vizinhos', 'Um grupo de empresas de um mesmo setor', 'Uma organização de proteção ambiental'], why: 'Exemplos: União Europeia, Mercosul, USMCA, ASEAN.' },
      { q: 'O que significa a sigla PIB?', a: 'Produto Interno Bruto: a soma de tudo que um país produz em um ano', w: ['População Interna Brasileira', 'Projeto de Integração Bancária', 'Produção Industrial Básica'], why: 'O PIB per capita (PIB ÷ população) dá uma ideia melhor do padrão médio de vida, mas não mostra a desigualdade.' },
      { q: 'O que é o IDH?', a: 'Um índice que combina renda, educação e expectativa de vida, variando de 0 a 1', w: ['O índice que mede apenas a riqueza de um país', 'A taxa de crescimento populacional anual', 'O índice de poluição das grandes cidades'], why: 'Criado pela ONU, o IDH busca medir desenvolvimento humano, não apenas crescimento econômico.' },
      { q: 'O que caracteriza uma empresa MULTINACIONAL (transnacional)?', a: 'Atua em vários países, com produção distribuída globalmente', w: ['Pertence a vários governos ao mesmo tempo', 'Só pode vender produtos no país de origem', 'É controlada pela Organização das Nações Unidas'], why: 'Elas buscam mão de obra barata, incentivos fiscais e proximidade de mercados consumidores.' },
    ]),
  }),

  // ======================================================= 9º ANO
  tpl({
    id: 'ge9-continentes',
    grade: 9, subject: 'geografia', bncc: ['EF09GE04', 'EF09GE07', 'EF09GE09'],
    topic: 'Europa, Ásia e Oceania', level: 2, variants: 100,
    gen: fromBank([
      { q: 'O que é a EURÁSIA?', a: 'A massa continental única formada por Europa e Ásia', w: ['Um bloco econômico entre Rússia e China', 'Uma cordilheira entre a Europa e a África', 'Um mar interior entre a Turquia e a Grécia'], why: 'A divisão entre Europa e Ásia é cultural e histórica; os Montes Urais são o limite convencional.' },
      { q: 'Qual é a cordilheira que abriga o monte Everest?', a: 'Himalaia', w: ['Andes', 'Alpes', 'Montes Urais'], why: 'O Himalaia resulta do choque entre as placas Indiana e Euro-asiática e ainda está crescendo.' },
      { q: 'O que são os "Tigres Asiáticos"?', a: 'Países do Leste e Sudeste Asiático que se industrializaram rapidamente, como Coreia do Sul e Cingapura', w: ['Países da Ásia Central com grandes reservas de petróleo', 'Reservas ambientais que protegem felinos selvagens', 'Os países mais populosos do continente asiático'], why: 'Investiram em educação, tecnologia e exportação de manufaturados a partir dos anos 1960-70.' },
      { q: 'Qual é a principal característica da União Europeia?', a: 'A integração econômica e política, com livre circulação de pessoas e, em parte, moeda única', w: ['A união militar de todos os países da Europa', 'A existência de um único governo central para todo o continente', 'A proibição do comércio com outros continentes'], why: 'O euro é usado por parte dos membros; o espaço Schengen permite circular sem controle de fronteira.' },
      { q: 'O que explica a baixa densidade populacional no interior da Austrália?', a: 'O clima árido e semiárido do outback, que dificulta a ocupação', w: ['A presença de montanhas muito altas', 'O excesso de florestas tropicais', 'A proibição legal de morar no interior'], why: 'A população australiana se concentra no litoral leste e sudeste, onde o clima é mais ameno.' },
    ]),
  }),

  tpl({
    id: 'ge9-globalizacao',
    grade: 9, subject: 'geografia', bncc: ['EF09GE01', 'EF09GE02', 'EF09GE10'],
    topic: 'Globalização', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que é a Divisão Internacional do Trabalho (DIT)?', a: 'A especialização dos países em diferentes etapas da produção mundial', w: ['A divisão de tarefas dentro de uma única fábrica', 'A distribuição de empregos públicos em um país', 'O sistema de turnos nas empresas globais'], why: 'Na DIT clássica, países periféricos exportavam matérias-primas e centrais exportavam manufaturados — hoje o quadro é mais complexo.' },
      { q: 'O que são FLUXOS no espaço geográfico globalizado?', a: 'Os deslocamentos de pessoas, mercadorias, capitais e informações entre lugares', w: ['As correntes marítimas que afetam o clima', 'O movimento das placas tectônicas', 'A migração de aves entre continentes'], why: 'A globalização é marcada pela aceleração e pelo aumento de volume desses fluxos.' },
      { q: 'O que é a "exclusão digital"?', a: 'A desigualdade de acesso à internet e às tecnologias entre pessoas, regiões e países', w: ['A proibição de usar redes sociais em alguns países', 'A perda de dados em servidores de internet', 'O fim dos computadores antigos'], why: 'Afeta o acesso a educação, trabalho e serviços — ficou evidente durante o ensino remoto.' },
      { q: 'Qual é uma crítica frequente à globalização?', a: 'Ela amplia desigualdades, concentrando renda e poder em poucos países e empresas', w: ['Ela impede totalmente o comércio internacional', 'Ela reduz a velocidade das comunicações', 'Ela elimina as diferenças culturais por completo'], why: 'Globalização conecta, mas de forma desigual: há quem produza o fluxo e quem apenas o receba.' },
    ]),
  }),

  tpl({
    id: 'ge9-ambiente',
    grade: 9, subject: 'geografia', bncc: ['EF09GE12', 'EF09GE16'],
    topic: 'Questões ambientais globais', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que é o AQUECIMENTO GLOBAL?', a: 'O aumento da temperatura média do planeta, intensificado pela emissão de gases de efeito estufa', w: ['O aumento natural da radiação emitida pelo Sol', 'O calor gerado pelo movimento de rotação da Terra', 'A elevação da temperatura apenas nas cidades grandes'], why: 'A queima de combustíveis fósseis e o desmatamento são as principais causas humanas.' },
      { q: 'O que é a "ilha de calor" urbana?', a: 'A temperatura mais alta nas áreas centrais das cidades em relação ao entorno', w: ['Uma ilha artificial construída no litoral', 'Uma região vulcânica no meio do oceano', 'Uma área de preservação dentro da cidade'], why: 'Asfalto, concreto e falta de vegetação absorvem e irradiam calor; arborização e áreas verdes reduzem o efeito.' },
      { q: 'O que é DESENVOLVIMENTO SUSTENTÁVEL?', a: 'Atender às necessidades do presente sem comprometer as gerações futuras', w: ['Crescer economicamente o mais rápido possível', 'Paralisar toda a atividade industrial', 'Usar apenas recursos não renováveis'], why: 'A definição é do Relatório Brundtland (1987) e articula dimensões ambiental, social e econômica.' },
      { q: 'O que foi o Acordo de Paris (2015)?', a: 'Um compromisso internacional para limitar o aumento da temperatura média global', w: ['Um tratado comercial entre França e Brasil', 'Um acordo de paz entre países europeus', 'Um plano de exploração do petróleo do Ártico'], why: 'Os países se comprometeram a manter o aquecimento bem abaixo de 2 °C, buscando limitar a 1,5 °C.' },
      { q: 'Qual é a principal causa do desmatamento na Amazônia brasileira?', a: 'A expansão da pecuária e da agricultura, somada à grilagem de terras', w: ['A construção de residências urbanas', 'A extração de água dos rios', 'A plantação de árvores nativas'], why: 'A pecuária extensiva é o principal vetor, seguida pela soja e pela exploração madeireira ilegal.' },
    ]),
  }),
]
