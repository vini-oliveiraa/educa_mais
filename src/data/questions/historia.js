import { tpl, mc, input, pickWrong, take3 } from './helpers.js'

/** Pergunta simples a partir de um banco de itens {q, a, w, why}. */
function fromBank(bank) {
  return (r) => {
    const item = r.pick(bank)
    return mc({ prompt: item.q, answer: item.a, wrong: item.w, why: item.why, support: item.s })
  }
}

/** História — 6º ao 9º ano. */
export default [
  // ======================================================= 6º ANO
  tpl({
    id: 'hi6-tempo-fontes',
    grade: 6, subject: 'historia', bncc: ['EF06HI01', 'EF06HI02'],
    topic: 'Tempo e fontes históricas', level: 1, variants: 50,
    gen: fromBank([
      { q: 'O que são FONTES HISTÓRICAS?', a: 'Vestígios do passado usados pelos historiadores para reconstruir a história', w: ['Apenas livros escritos por historiadores', 'Somente documentos oficiais de governos', 'Histórias contadas em filmes e novelas'], why: 'Fontes podem ser escritas, materiais (objetos, ruínas), orais, iconográficas e digitais.' },
      { q: 'Qual destes é um exemplo de fonte histórica MATERIAL?', a: 'Uma panela de barro encontrada em um sítio arqueológico', w: ['Uma carta escrita por um soldado', 'Uma entrevista com um sobrevivente', 'Uma lei publicada em diário oficial'], why: 'Fontes materiais são objetos: ferramentas, construções, cerâmicas, roupas.' },
      { q: 'O que estuda a ARQUEOLOGIA?', a: 'As sociedades do passado a partir dos vestígios materiais que deixaram', w: ['Apenas os dinossauros e as eras geológicas', 'A formação das rochas e dos minerais', 'As línguas faladas atualmente no mundo'], why: 'Quem estuda dinossauros é a paleontologia; a arqueologia estuda vestígios humanos.' },
      { q: 'O que significa a sigla "a.C."?', a: 'Antes de Cristo — anos anteriores ao marco do nascimento de Cristo', w: ['Antes do Calendário', 'Ano Contado', 'Antiguidade Clássica'], why: 'A contagem ocidental usa o nascimento de Cristo como marco zero: a.C. conta para trás e d.C. para a frente.' },
      { q: 'O ano de 1500 pertence a qual século?', a: 'Século XV', w: ['Século XVI', 'Século XIV', 'Século XVII'], why: 'Cada século vai do ano terminado em 01 ao terminado em 00. O século XV vai de 1401 a 1500 — então 1500 é o ÚLTIMO ano do século XV, e o XVI começa em 1501.' },
    ]),
  }),

  tpl({
    id: 'hi6-seculos',
    grade: 6, subject: 'historia', bncc: 'EF06HI01',
    topic: 'Contagem do tempo', level: 2, variants: 400,
    gen(r) {
      // Intervalo 101–1899 evita o século I (sem "século anterior") e o XXI
      // (sem "século seguinte") na hora de montar os distratores.
      const ano = r.int(2, 19) * 100 - r.int(1, 99)
      const seculo = Math.ceil(ano / 100)
      const romanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']
      return mc({
        prompt: `A que século pertence o ano de ${ano} d.C.?`,
        answer: `Século ${romanos[seculo - 1]}`,
        wrong: take3(`Século ${romanos[seculo - 1]}`, [
          `Século ${romanos[seculo]}`,
          `Século ${romanos[seculo - 2]}`,
          `Século ${romanos[seculo + 1]}`,
        ]),
        why: `Anos de ${(seculo - 1) * 100 + 1} a ${seculo * 100} formam o século ${romanos[seculo - 1]}. Como ${ano} está nesse intervalo, pertence ao século ${romanos[seculo - 1]}.`,
      })
    },
  }),

  tpl({
    id: 'hi6-antiguidade',
    grade: 6, subject: 'historia', bncc: ['EF06HI07', 'EF06HI09', 'EF06HI10', 'EF06HI11'],
    topic: 'Antiguidade', level: 2, variants: 90,
    gen: fromBank([
      { q: 'Por que o rio Nilo foi fundamental para o Egito Antigo?', a: 'Suas cheias anuais fertilizavam o solo e permitiam a agricultura', w: ['Servia de fronteira militar contra os gregos', 'Era a única fonte de ouro da região', 'Separava os vivos dos mortos na religião egípcia'], why: 'Heródoto chamou o Egito de "dádiva do Nilo": a agricultura dependia do ciclo de cheias.' },
      { q: 'O que era a DEMOCRACIA na Atenas Antiga?', a: 'Um regime em que os cidadãos homens, livres e atenienses decidiam diretamente na Assembleia', w: ['Um sistema em que todos os habitantes votavam, inclusive mulheres e escravizados', 'Uma monarquia hereditária com conselho de nobres', 'Um governo exercido apenas por militares'], why: 'A democracia ateniense era direta, mas excluía mulheres, estrangeiros (metecos) e escravizados — a maioria da população.' },
      { q: 'Qual foi uma importante contribuição da civilização mesopotâmica?', a: 'A escrita cuneiforme e o Código de Hamurabi', w: ['A invenção da imprensa de tipos móveis', 'A construção das pirâmides de Gizé', 'A criação dos Jogos Olímpicos'], why: 'A escrita cuneiforme, feita em tabletes de argila, é uma das mais antigas do mundo.' },
      { q: 'Como Roma passou de República a Império?', a: 'Após guerras civis, Otávio Augusto concentrou os poderes e tornou-se o primeiro imperador', w: ['Por uma votação popular unânime no Senado', 'Após ser conquistada pelos gregos', 'Com a chegada do cristianismo como religião oficial'], why: 'Em 27 a.C. Otávio recebeu o título de Augusto, iniciando o período imperial.' },
      { q: 'Quem eram os astecas, maias e incas?', a: 'Povos originários das Américas com cidades, escrita, astronomia e agricultura complexas', w: ['Povos europeus que colonizaram a América', 'Tribos nômades sem organização política', 'Comerciantes árabes que chegaram à América antes dos europeus'], why: 'Astecas (México), maias (América Central) e incas (Andes) desenvolveram impérios com grandes centros urbanos.' },
      { q: 'O que caracteriza o período chamado de PRÉ-HISTÓRIA?', a: 'O período anterior à invenção da escrita', w: ['O período anterior ao surgimento dos seres humanos', 'O tempo em que não havia nenhuma ferramenta', 'A época dos dinossauros'], why: 'A divisão é baseada na escrita, não na ausência de história: sociedades sem escrita também têm história.' },
    ]),
  }),

  tpl({
    id: 'hi6-povos-indigenas',
    grade: 6, subject: 'historia', bncc: ['EF06HI04', 'EF06HI06'],
    topic: 'Povoamento da América', level: 2, variants: 40,
    gen: fromBank([
      { q: 'Qual teoria explica o povoamento da América pelo estreito de Bering?', a: 'Grupos vindos da Ásia atravessaram uma ponte de terra durante a última glaciação', w: ['Povos africanos chegaram de barco pelo Atlântico Sul', 'Os humanos surgiram independentemente na América', 'Vikings povoaram todo o continente no século X'], why: 'Com o nível do mar mais baixo, a Beríngia ligava Sibéria e Alasca, permitindo a migração.' },
      { q: 'O que o sítio arqueológico da Serra da Capivara (PI) revela?', a: 'Pinturas rupestres e vestígios de ocupação humana muito antiga no Brasil', w: ['Ruínas de uma cidade construída pelos portugueses', 'Fósseis dos primeiros dinossauros do mundo', 'Restos de um porto comercial fenício'], why: 'O parque reúne milhares de painéis rupestres e é Patrimônio Mundial da UNESCO.' },
      { q: 'Como era a relação dos povos indígenas brasileiros com a terra antes da colonização?', a: 'Uso coletivo dos recursos, com manejo e sem propriedade privada da terra', w: ['Cada família possuía um título de propriedade registrado', 'A terra pertencia a um rei que cobrava impostos', 'Não havia nenhuma forma de cultivo agrícola'], why: 'Muitos povos praticavam agricultura (mandioca, milho) com manejo coletivo e rotação de áreas.' },
    ]),
  }),

  // ======================================================= 7º ANO
  tpl({
    id: 'hi7-modernidade',
    grade: 7, subject: 'historia', bncc: ['EF07HI01', 'EF07HI04', 'EF07HI05'],
    topic: 'Mundo Moderno', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que foi o RENASCIMENTO?', a: 'Um movimento cultural que valorizou a razão, o ser humano e a herança greco-romana', w: ['Um movimento religioso que criou novas igrejas protestantes', 'Uma revolta camponesa contra os senhores feudais', 'Uma epidemia que atingiu a Europa no século XIV'], why: 'O Renascimento (séculos XIV-XVI) marcou o humanismo, a ciência e as artes na Europa.' },
      { q: 'Qual foi o principal motivo da Reforma Protestante iniciada por Lutero?', a: 'A crítica às práticas da Igreja Católica, como a venda de indulgências', w: ['A tentativa de conquistar terras na América', 'A defesa do poder absoluto do papa', 'A criação de uma nova língua para a Europa'], why: 'Em 1517 Lutero publicou as 95 teses, questionando indulgências e a autoridade papal.' },
      { q: 'O que foi a Contrarreforma?', a: 'A reação da Igreja Católica à Reforma, com o Concílio de Trento, a Inquisição e a Companhia de Jesus', w: ['Um acordo em que o papa aceitou todas as teses de Lutero', 'A separação definitiva entre Igreja e Estado na Europa', 'Uma guerra entre reinos muçulmanos e cristãos'], why: 'A Igreja reafirmou dogmas, criou o Index de livros proibidos e ampliou a ação missionária.' },
      { q: 'O que caracterizava o ABSOLUTISMO monárquico?', a: 'A concentração de todos os poderes nas mãos do rei, justificada pelo direito divino', w: ['A divisão do poder entre rei e parlamento eleito', 'O governo exercido por uma assembleia de camponeses', 'A ausência de qualquer autoridade central'], why: '"O Estado sou eu", atribuída a Luís XIV, resume a ideia de poder absoluto do monarca.' },
      { q: 'O que motivou as Grandes Navegações europeias?', a: 'A busca por novas rotas comerciais para as especiarias e metais preciosos', w: ['O desejo de encontrar um novo continente desabitado', 'A fuga de uma guerra civil em toda a Europa', 'A necessidade de estudar as correntes marítimas'], why: 'Com o bloqueio das rotas terrestres para o Oriente, buscou-se o caminho marítimo — somado ao avanço técnico (bússola, caravela, astrolábio).' },
    ]),
  }),

  tpl({
    id: 'hi7-colonizacao',
    grade: 7, subject: 'historia', bncc: ['EF07HI09', 'EF07HI11', 'EF07HI13'],
    topic: 'Colonização da América', level: 2, variants: 90,
    gen: fromBank([
      { q: 'O que foi o Tratado de Tordesilhas (1494)?', a: 'Um acordo entre Portugal e Espanha que dividiu as terras "descobertas" por uma linha imaginária', w: ['Um tratado de paz entre indígenas e portugueses', 'A lei que aboliu a escravidão na América', 'O documento que criou o Brasil como país independente'], why: 'A linha ficava 370 léguas a oeste de Cabo Verde; a parte leste cabia a Portugal.' },
      { q: 'O que foi o sistema de CAPITANIAS HEREDITÁRIAS?', a: 'A divisão do território em faixas doadas a donatários, responsáveis por colonizar à própria custa', w: ['Um sistema de eleição de governadores pelos colonos', 'A divisão do Brasil entre as tribos indígenas', 'Um regime em que a Coroa administrava tudo diretamente'], why: 'Criado em 1534, o sistema transferia o custo e o risco da colonização a particulares. Poucas prosperaram (Pernambuco e São Vicente).' },
      { q: 'Qual era a base econômica do Brasil colonial no século XVI?', a: 'A produção de açúcar em engenhos com trabalho escravizado', w: ['A mineração de ouro em Minas Gerais', 'A produção de café no Vale do Paraíba', 'A indústria têxtil nas cidades do litoral'], why: 'O ciclo do açúcar dominou o período; o ouro vem no século XVIII e o café, no XIX.' },
      { q: 'O que foi o "comércio triangular" no Atlântico?', a: 'A rota entre Europa, África e América que envolvia manufaturados, pessoas escravizadas e produtos coloniais', w: ['Um acordo comercial entre três reinos indígenas', 'A troca de mercadorias entre três capitanias brasileiras', 'A rota da seda entre Europa e Ásia'], why: 'Manufaturas iam da Europa à África; pessoas escravizadas, da África à América; açúcar, ouro e tabaco, da América à Europa.' },
      { q: 'Quem foram os bandeirantes?', a: 'Expedicionários paulistas que avançaram pelo interior em busca de riquezas e para capturar indígenas', w: ['Soldados portugueses enviados para defender o litoral', 'Missionários jesuítas que fundaram escolas', 'Comerciantes holandeses instalados em Pernambuco'], why: 'As bandeiras ampliaram o território para além de Tordesilhas, mas também promoveram a escravização de povos indígenas.' },
      { q: 'O que foi o Quilombo dos Palmares?', a: 'A maior comunidade de pessoas escravizadas fugidas, que resistiu por quase um século', w: ['Uma vila fundada por portugueses no sertão', 'Um engenho de açúcar movido a energia hidráulica', 'Uma missão jesuítica no sul do Brasil'], why: 'Palmares, em Alagoas, resistiu de cerca de 1600 a 1694 e teve Zumbi como principal liderança.' },
    ]),
  }),

  tpl({
    id: 'hi7-escravidao',
    grade: 7, subject: 'historia', bncc: ['EF07HI15', 'EF07HI16'],
    topic: 'Escravidão moderna', level: 3, variants: 40,
    gen: fromBank([
      { q: 'O que diferencia a escravidão moderna (séculos XVI-XIX) da escravidão na Antiguidade?', a: 'Foi baseada em critérios raciais e integrada a um sistema comercial atlântico de larga escala', w: ['Não envolvia transporte de pessoas entre continentes', 'Era voluntária e temporária em todos os casos', 'Atingia apenas prisioneiros de guerra europeus'], why: 'A escravidão moderna associou cor da pele e escravidão, criando um racismo estrutural cujos efeitos persistem.' },
      { q: 'O que era o "tumbeiro"?', a: 'O navio negreiro, assim chamado pela enorme mortalidade durante a travessia', w: ['Um tipo de engenho de açúcar movido a boi', 'Um instrumento musical trazido da África', 'Um imposto cobrado sobre a exportação de açúcar'], why: 'A travessia do Atlântico, chamada de Passagem do Meio, matava uma parcela enorme das pessoas transportadas.' },
      { q: 'Qual foi uma forma de RESISTÊNCIA das pessoas escravizadas no Brasil?', a: 'A formação de quilombos, revoltas, fugas e a preservação de práticas culturais e religiosas', w: ['A aceitação pacífica da escravidão em todos os casos', 'A compra de navios para retornar à África em massa', 'A criação de partidos políticos no século XVII'], why: 'A resistência foi cotidiana e variada: quilombos, capoeira, religiões de matriz africana, sabotagens e revoltas.' },
    ]),
  }),

  // ======================================================= 8º ANO
  tpl({
    id: 'hi8-iluminismo-revolucoes',
    grade: 8, subject: 'historia', bncc: ['EF08HI01', 'EF08HI02', 'EF08HI03', 'EF08HI04'],
    topic: 'Iluminismo e revoluções', level: 2, variants: 90,
    gen: fromBank([
      { q: 'Qual era a ideia central do ILUMINISMO?', a: 'O uso da razão e da ciência para questionar privilégios, superstições e o poder absoluto', w: ['A defesa do direito divino dos reis', 'O retorno aos valores religiosos da Idade Média', 'A valorização da nobreza como classe superior'], why: 'Montesquieu, Voltaire e Rousseau criticaram o Antigo Regime e inspiraram as revoluções burguesas.' },
      { q: 'Quais eram os três estados da sociedade francesa antes da Revolução?', a: 'Clero (1º), nobreza (2º) e o restante da população (3º estado)', w: ['Reis, soldados e camponeses', 'Ricos, remediados e pobres', 'Cidadãos, estrangeiros e escravizados'], why: 'O 3º estado representava cerca de 97% da população, mas pagava quase todos os impostos.' },
      { q: 'O que significou o lema "Liberdade, Igualdade, Fraternidade"?', a: 'A síntese dos ideais da Revolução Francesa contra os privilégios do Antigo Regime', w: ['O lema do Império Napoleônico na conquista da Europa', 'O slogan da Revolução Industrial inglesa', 'O princípio religioso da Contrarreforma'], why: 'O lema expressa a ruptura com uma sociedade de ordens e privilégios de nascimento.' },
      { q: 'Por que a Revolução Industrial começou na Inglaterra?', a: 'Pelo acúmulo de capital, reservas de carvão e ferro, mão de obra disponível e estabilidade política', w: ['Porque era o país mais populoso da Europa', 'Porque tinha as maiores reservas de ouro do mundo', 'Porque recebeu ajuda financeira da França'], why: 'Cercamentos, revolução agrícola e colônias também contribuíram.' },
      { q: 'Qual foi um impacto social da Revolução Industrial?', a: 'O crescimento acelerado das cidades e o surgimento do proletariado urbano', w: ['A diminuição da população nas cidades', 'O fim do trabalho infantil na Europa', 'A extinção da propriedade privada'], why: 'Jornadas longas, trabalho infantil e péssimas condições de moradia marcaram o período.' },
      { q: 'O que foi o Ludismo?', a: 'Um movimento de trabalhadores que destruía máquinas como forma de protesto', w: ['Uma corrente filosófica que defendia as máquinas', 'Um partido político inglês do século XIX', 'Uma técnica de produção têxtil'], why: 'Os ludistas associavam as máquinas ao desemprego e à precarização do trabalho.' },
    ]),
  }),

  tpl({
    id: 'hi8-independencias',
    grade: 8, subject: 'historia', bncc: ['EF08HI05', 'EF08HI07', 'EF08HI12'],
    topic: 'Independências nas Américas', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que foi a Inconfidência Mineira (1789)?', a: 'Uma conspiração em Minas Gerais contra a cobrança da derrama e o domínio português', w: ['Uma revolta de escravizados no Rio de Janeiro', 'Um acordo comercial entre Minas e a Inglaterra', 'Uma guerra entre Portugal e Espanha no sul do Brasil'], why: 'Inspirada no Iluminismo e na independência dos EUA, foi descoberta antes de eclodir; Tiradentes foi executado em 1792.' },
      { q: 'Por que a Corte portuguesa se transferiu para o Brasil em 1808?', a: 'Para escapar da invasão das tropas de Napoleão em Portugal', w: ['Para fundar a capital do Império Português na América', 'Porque Lisboa havia sido destruída por um terremoto', 'Para combater os holandeses em Pernambuco'], why: 'Com apoio da marinha inglesa, D. João VI e a Corte vieram ao Rio de Janeiro, que virou sede do império.' },
      { q: 'Qual foi uma consequência imediata da vinda da Corte para o Brasil?', a: 'A abertura dos portos às nações amigas, encerrando o exclusivo comercial com Portugal', w: ['A abolição imediata da escravidão', 'A proclamação da República', 'A criação do voto universal'], why: 'A abertura dos portos (1808) beneficiou principalmente a Inglaterra e abalou o pacto colonial.' },
      { q: 'Quem foi Simón Bolívar?', a: 'Líder das independências de vários países da América espanhola, defensor da união latino-americana', w: ['O primeiro imperador do Brasil', 'Um general português que lutou contra Napoleão', 'O presidente dos Estados Unidos na época da independência'], why: 'Bolívar libertou Venezuela, Colômbia, Equador, Peru e Bolívia, e sonhava com a Grã-Colômbia.' },
      { q: 'O que foi a Revolução Haitiana (1791-1804)?', a: 'A primeira revolução vitoriosa liderada por pessoas escravizadas, que resultou em independência e abolição', w: ['Uma revolta de colonos franceses contra impostos', 'Uma guerra entre Espanha e Inglaterra no Caribe', 'Um movimento pacífico de negociação com a França'], why: 'O Haiti tornou-se a primeira república negra independente, assustando as elites escravistas das Américas.' },
    ]),
  }),

  tpl({
    id: 'hi8-brasil-imperio',
    grade: 8, subject: 'historia', bncc: ['EF08HI15', 'EF08HI16', 'EF08HI19'],
    topic: 'Brasil Império', level: 3, variants: 80,
    gen: fromBank([
      { q: 'O que foi o Poder Moderador na Constituição de 1824?', a: 'Um quarto poder, exclusivo do imperador, que lhe permitia intervir sobre os demais', w: ['O poder atribuído ao Parlamento para destituir o imperador', 'O poder dado aos presidentes de província', 'Um tribunal responsável por julgar os ministros'], why: 'Criado por inspiração de Benjamin Constant, concentrava poder nas mãos de D. Pedro I.' },
      { q: 'O que caracterizou o período Regencial (1831-1840)?', a: 'Instabilidade política e várias revoltas provinciais, com o país governado por regentes', w: ['A maior estabilidade política da história do Império', 'O domínio direto de Portugal sobre o Brasil', 'A vigência de uma Constituição republicana'], why: 'Cabanagem, Sabinada, Balaiada e Farroupilha marcaram o período.' },
      { q: 'O que foi a Lei Áurea (1888)?', a: 'A lei que aboliu a escravidão no Brasil, sem qualquer política de reparação ou inclusão', w: ['A lei que libertou apenas os filhos de escravizadas', 'A lei que proibiu o tráfico atlântico de pessoas', 'A lei que concedeu terras aos libertos'], why: 'A abolição foi resultado de décadas de resistência negra e pressão abolicionista, mas não veio acompanhada de reparação.' },
      { q: 'O que estabelecia a Lei do Ventre Livre (1871)?', a: 'Que os filhos de mulheres escravizadas nascidos a partir dali seriam livres, com condições', w: ['A libertação imediata de todos os escravizados', 'O fim do tráfico internacional de africanos', 'A libertação dos escravizados com mais de 60 anos'], why: 'Era uma lei gradualista: a criança permanecia sob tutela do senhor até os 21 anos ou era indenizada pelo Estado.' },
      { q: 'Qual foi o principal produto de exportação do Brasil no século XIX?', a: 'O café', w: ['O açúcar', 'A borracha', 'O algodão'], why: 'O café sustentou a economia imperial e concentrou poder político nas elites do Vale do Paraíba e do oeste paulista.' },
    ]),
  }),

  // ======================================================= 9º ANO
  tpl({
    id: 'hi9-republica',
    grade: 9, subject: 'historia', bncc: ['EF09HI01', 'EF09HI02', 'EF09HI03', 'EF09HI05'],
    topic: 'Primeira República', level: 2, variants: 80,
    gen: fromBank([
      { q: 'O que foi a "política do café com leite"?', a: 'O revezamento na Presidência entre as oligarquias de São Paulo e de Minas Gerais', w: ['Um programa de merenda escolar da Primeira República', 'Um acordo comercial entre Brasil e Inglaterra', 'A política de subsídio à pecuária leiteira no Sul'], why: 'O arranjo garantia o domínio das oligarquias cafeeira (SP) e leiteira (MG) sobre o governo federal.' },
      { q: 'O que foi o "coronelismo"?', a: 'O poder local de grandes proprietários que controlavam votos em troca de favores', w: ['A presença de militares de alta patente no governo', 'A organização do exército brasileiro em coronéis', 'Um movimento de resistência dos trabalhadores rurais'], why: 'O "voto de cabresto" era aberto e controlado pelo coronel, chefe político local.' },
      { q: 'O que foi a Guerra de Canudos (1896-1897)?', a: 'A destruição pelo Exército de uma comunidade sertaneja liderada por Antônio Conselheiro', w: ['Uma guerra entre Brasil e Paraguai', 'Uma revolta de marinheiros no Rio de Janeiro', 'Um conflito de fronteira com a Argentina'], why: 'Euclides da Cunha narrou o episódio em "Os Sertões", denunciando o massacre.' },
      { q: 'O que foi a Revolta da Vacina (1904)?', a: 'Uma rebelião popular no Rio contra a vacinação obrigatória e as reformas urbanas autoritárias', w: ['Um protesto de médicos contra a falta de vacinas', 'Uma greve de enfermeiros por melhores salários', 'Uma campanha a favor da vacinação em massa'], why: 'A revolta somou medo da vacina, falta de informação e revolta com as desapropriações do "bota-abaixo".' },
      { q: 'Qual foi a situação da população negra após a abolição?', a: 'Sem terra, sem indenização e sem políticas públicas, foi marginalizada no mercado de trabalho', w: ['Recebeu lotes de terra e crédito do governo', 'Foi imediatamente integrada às escolas e universidades', 'Passou a ocupar a maioria dos cargos públicos'], why: 'A política de imigração europeia subsidiada e o racismo estrutural aprofundaram a exclusão.' },
    ]),
  }),

  tpl({
    id: 'hi9-guerras-mundiais',
    grade: 9, subject: 'historia', bncc: ['EF09HI10', 'EF09HI11', 'EF09HI12', 'EF09HI13'],
    topic: 'Guerras e totalitarismos', level: 2, variants: 100,
    gen: fromBank([
      { q: 'O que foi a Crise de 1929?', a: 'A quebra da Bolsa de Nova York, que gerou desemprego em massa e uma depressão mundial', w: ['Uma guerra comercial entre Inglaterra e Alemanha', 'A falência do sistema colonial africano', 'Uma crise causada pela falta de petróleo'], why: 'A superprodução e a especulação levaram ao colapso; a resposta nos EUA foi o New Deal.' },
      { q: 'Qual foi uma causa da ascensão do nazismo na Alemanha?', a: 'A crise econômica e a humilhação do Tratado de Versalhes após a Primeira Guerra', w: ['A vitória alemã na Primeira Guerra Mundial', 'A ausência de desemprego no país', 'O apoio da União Soviética ao partido nazista'], why: 'Hiperinflação, desemprego e ressentimento nacional criaram terreno para o discurso de Hitler.' },
      { q: 'O que foi o Holocausto?', a: 'O extermínio sistemático de cerca de 6 milhões de judeus e de outros grupos pelo regime nazista', w: ['Um bombardeio aliado sobre cidades alemãs', 'Uma epidemia que atingiu a Europa durante a guerra', 'O nome de uma batalha na frente oriental'], why: 'Além de judeus, foram perseguidos ciganos, pessoas com deficiência, homossexuais, comunistas e testemunhas de Jeová.' },
      { q: 'O que caracteriza um regime TOTALITÁRIO?', a: 'Partido único, culto ao líder, censura, propaganda e controle de todos os aspectos da vida', w: ['Eleições livres com vários partidos', 'Separação clara entre os três poderes', 'Liberdade de imprensa garantida por lei'], why: 'Nazismo, fascismo e stalinismo compartilham essas características, embora com bases ideológicas diferentes.' },
      { q: 'Por que a ONU foi criada em 1945?', a: 'Para promover a paz, a cooperação internacional e evitar novas guerras mundiais', w: ['Para administrar as colônias europeias na África', 'Para organizar o comércio entre Europa e Ásia', 'Para substituir a União Soviética nas decisões globais'], why: 'A ONU sucedeu a fracassada Liga das Nações; em 1948 aprovou a Declaração Universal dos Direitos Humanos.' },
      { q: 'O que foi a Guerra Fria?', a: 'A disputa por influência global entre EUA e URSS, sem confronto militar direto entre eles', w: ['Uma guerra travada no Ártico entre 1947 e 1991', 'O conflito entre Alemanha e França pela Alsácia', 'A guerra civil espanhola dos anos 1930'], why: 'Durou de 1947 a 1991 e envolveu corrida armamentista, espacial e conflitos indiretos (Coreia, Vietnã, Afeganistão).' },
    ]),
  }),

  tpl({
    id: 'hi9-ditadura',
    grade: 9, subject: 'historia', bncc: ['EF09HI19', 'EF09HI20', 'EF09HI22'],
    topic: 'Ditadura e redemocratização', level: 3, variants: 80,
    gen: fromBank([
      { q: 'Em que ano teve início a ditadura civil-militar no Brasil?', a: '1964', w: ['1945', '1930', '1985'], why: 'O golpe de 31 de março / 1º de abril de 1964 depôs João Goulart e iniciou 21 anos de regime autoritário.' },
      { q: 'O que foi o AI-5 (1968)?', a: 'O ato que fechou o Congresso, suspendeu direitos e institucionalizou a censura e a repressão', w: ['Uma lei que ampliou o direito de greve', 'Um plano econômico contra a inflação', 'O decreto que criou o voto direto para presidente'], why: 'O AI-5 marcou o período mais duro do regime, com prisões arbitrárias, tortura e desaparecimentos.' },
      { q: 'O que foi o movimento "Diretas Já" (1983-1984)?', a: 'Uma campanha de massas pela volta das eleições diretas para presidente', w: ['Um movimento pela criação de novos estados', 'Uma greve geral por aumento de salários', 'Uma campanha pela anistia aos militares'], why: 'A emenda Dante de Oliveira foi rejeitada, mas o movimento acelerou o fim do regime.' },
      { q: 'Por que a Constituição de 1988 é chamada de "Constituição Cidadã"?', a: 'Por ampliar direitos sociais, civis e políticos após o período autoritário', w: ['Por ter sido escrita apenas por militares', 'Por reduzir o número de direitos trabalhistas', 'Por instituir o voto censitário'], why: 'A expressão é de Ulysses Guimarães. A Carta garantiu direitos sociais, liberdade de expressão e o SUS.' },
      { q: 'O que foi a Lei da Anistia (1979)?', a: 'A lei que perdoou crimes políticos, permitindo o retorno de exilados — e também protegendo agentes da repressão', w: ['A lei que condenou todos os torturadores do regime', 'A lei que proibiu partidos políticos no Brasil', 'A lei que criou o Estado Novo'], why: 'Sua interpretação "ampla, geral e irrestrita" é até hoje objeto de debate jurídico e político.' },
    ]),
  }),

  tpl({
    id: 'hi9-globalizacao',
    grade: 9, subject: 'historia', bncc: ['EF09HI32', 'EF09HI33'],
    topic: 'Mundo contemporâneo', level: 2, variants: 60,
    gen: fromBank([
      { q: 'O que caracteriza a GLOBALIZAÇÃO?', a: 'A intensificação da integração econômica, cultural e tecnológica entre os países', w: ['O fechamento das fronteiras entre os países', 'O fim do comércio internacional', 'A padronização de todas as línguas do mundo'], why: 'O processo acelerou a partir dos anos 1990, com queda de barreiras comerciais e avanço das telecomunicações.' },
      { q: 'O que simbolizou a queda do Muro de Berlim (1989)?', a: 'O fim da divisão da Alemanha e o enfraquecimento do bloco socialista', w: ['O início da Segunda Guerra Mundial', 'A criação da União Europeia', 'A independência da Alemanha em relação à França'], why: 'A queda do Muro antecedeu a reunificação alemã (1990) e a dissolução da URSS (1991).' },
      { q: 'Qual é um efeito das tecnologias digitais sobre a política contemporânea?', a: 'A circulação rápida de informações — e também de desinformação em larga escala', w: ['O fim completo das eleições em todo o mundo', 'A eliminação de qualquer forma de censura', 'A redução do número de pessoas com acesso a notícias'], why: 'Redes sociais ampliaram a participação, mas também criaram bolhas, polarização e fake news.' },
    ]),
  }),
]
