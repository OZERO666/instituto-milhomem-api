-- ============================================================
-- 007_service_faq_seed.sql
-- Dados de FAQ para os servicos cadastrados
-- Requer: 006_service_faq.sql ja executada (coluna faq existe)
-- ============================================================

-- 1) Transplante Capilar FUE
UPDATE servicos
SET faq = '[
  {"pergunta":"O transplante capilar FUE \u00e9 permanente?","resposta":"Sim. Os foliculos transplantados s\u00e3o extra\u00eddos da zona doadora (nuca e laterais), geneticamente resistente \u00e0 queda. Ap\u00f3s o crescimento, eles permanecem definitivamente no local receptor."},
  {"pergunta":"O procedimento \u00e9 doloroso?","resposta":"N\u00e3o. O transplante \u00e9 realizado sob anestesia local. O paciente permanece acordado e confort\u00e1vel durante todo o processo, sem sentir dor."},
  {"pergunta":"Quanto tempo dura o procedimento?","resposta":"Varia conforme a quantidade de grafts necess\u00e1rios. Em m\u00e9dia de 4 a 8 horas. Procedimentos menores podem ser conclu\u00eddos em menos tempo."},
  {"pergunta":"Quando os resultados aparecem?","resposta":"Os primeiros fios crescem entre 3 e 4 meses ap\u00f3s o procedimento. O resultado final \u2014 com densidade e aspecto natural \u2014 \u00e9 vis\u00edvel a partir do 12.\u00ba m\u00eas."},
  {"pergunta":"\u00c9 normal os cabelos ca\u00edrem ap\u00f3s o transplante?","resposta":"Sim, \u00e9 completamente normal. Em torno de 2 a 4 semanas ap\u00f3s o procedimento ocorre o chamado shock loss: os fios transplantados caem temporariamente antes de crescerem definitivamente."},
  {"pergunta":"Qual \u00e9 o tempo de recupera\u00e7\u00e3o?","resposta":"Nos primeiros 10 dias o paciente deve evitar esfor\u00e7os f\u00edsicos intensos e exposi\u00e7\u00e3o solar direta. A maioria retorna ao trabalho em 2 a 3 dias, desde que a atividade n\u00e3o envolva esfor\u00e7o f\u00edsico."},
  {"pergunta":"Quantos grafts eu preciso?","resposta":"O n\u00famero de grafts varia conforme o grau de calv\u00edcie e a \u00e1rea a ser tratada. Uma avalia\u00e7\u00e3o presencial com nossos especialistas \u00e9 necess\u00e1ria para definir o planejamento personalizado."},
  {"pergunta":"O transplante funciona para mulheres?","resposta":"Sim. Mulheres com alopecia androgen\u00e9tica ou cicatricial podem ser candidatas ao transplante capilar. A avalia\u00e7\u00e3o pr\u00e9via \u00e9 fundamental para verificar a viabilidade e a zona doadora."},
  {"pergunta":"O procedimento deixa cicatrizes vis\u00edveis?","resposta":"Na t\u00e9cnica FUE as cicatrizes s\u00e3o pontos m\u00ednimos dispersos na nuca, praticamente invis\u00edveis mesmo com o cabelo curto. N\u00e3o h\u00e1 corte linear nem pontos."},
  {"pergunta":"Qual a diferen\u00e7a entre FUE e FUT?","resposta":"Na t\u00e9cnica FUE (Follicular Unit Extraction) os fol\u00edculos s\u00e3o extra\u00eddos individualmente, sem corte linear. No FUT remove-se uma faixa de couro cabeludo. O Instituto Milhomem utiliza a t\u00e9cnica FUE, mais moderna e com recupera\u00e7\u00e3o mais r\u00e1pida."}
]'
WHERE id = '10000000-0000-4000-8000-000000000001';

-- 2) Transplante de Barba
UPDATE servicos
SET faq = '[
  {"pergunta":"O transplante de barba \u00e9 definitivo?","resposta":"Sim. Os fol\u00edculos implantados s\u00e3o resistentes à queda e crescem permanentemente, exatamente como os fios da zona doadora."},
  {"pergunta":"O procedimento dói?","resposta":"N\u00e3o. \u00c9 realizado sob anestesia local. O paciente fica confort\u00e1vel durante todo o processo, sem sentir dor."},
  {"pergunta":"Posso escolher o formato da barba?","resposta":"Sim. Antes do procedimento o especialista faz um planejamento detalhado com voc\u00ea, definindo o contorno, a densidade e o estilo desejado para a barba."},
  {"pergunta":"Quanto tempo leva para a barba crescer?","resposta":"Os primeiros fios crescem entre 3 e 4 meses. O resultado final, com densidade e aspecto natural, \u00e9 vis\u00edvel a partir do 9.\u00ba ao 12.\u00ba m\u00eas."},
  {"pergunta":"Os fios transplantados v\u00e3o cair ap\u00f3s o procedimento?","resposta":"Sim, \u00e9 normal. Cerca de 2 a 4 semanas ap\u00f3s o transplante os fios caem (shock loss) e recrescem definitivamente nos meses seguintes."},
  {"pergunta":"Deixa cicatriz no rosto?","resposta":"N\u00e3o. A t\u00e9cnica FUE extrai os fol\u00edculos individualmente da nuca, deixando micropontos impercept\u00edveis. O rosto n\u00e3o recebe nenhum corte."},
  {"pergunta":"Qual \u00e9 o tempo de recupera\u00e7\u00e3o?","resposta":"A recupera\u00e7\u00e3o \u00e9 r\u00e1pida. Na maioria dos casos o paciente retorna \u00e0s atividades normais em 2 a 3 dias, evitando apenas esfor\u00e7os f\u00edsicos intensos na primeira semana."},
  {"pergunta":"Homens com falhas pequenas tamb\u00e9m podem fazer?","resposta":"Sim. Mesmo falhas pequenas ou assimétricas podem ser corrigidas com planejamento preciso, sem necessidade de um procedimento de grande porte."}
]'
WHERE id = '10000000-0000-4000-8000-000000000002';

-- 3) Tratamentos Complementares
UPDATE servicos
SET faq = '[
  {"pergunta":"O que s\u00e3o os tratamentos complementares?","resposta":"S\u00e3o protocolos cl\u00ednicos aplicados antes ou ap\u00f3s o transplante para estimular o crescimento capilar, fortalecer os fios e acelerar a recupera\u00e7\u00e3o. Incluem mesoterapia, laser de baixa pot\u00eancia, PRP e nutri\u00e7\u00e3o capilar intravenosa."},
  {"pergunta":"Preciso fazer tratamentos complementares se j\u00e1 fiz o transplante?","resposta":"N\u00e3o \u00e9 obrigat\u00f3rio, mas \u00e9 altamente recomendado. Os tratamentos potencializam os resultados, aceleram o crescimento dos fios transplantados e preservam os fios nativos."},
  {"pergunta":"Esses tratamentos s\u00e3o dolorosos?","resposta":"N\u00e3o. Os protocolos s\u00e3o minimamente invasivos. A mesoterapia pode causar leve desconforto local, que \u00e9 amenizado com anestesia t\u00f3pica quando necess\u00e1rio."},
  {"pergunta":"Com que frequ\u00eancia devo realizar as sess\u00f5es?","resposta":"Depende do protocolo indicado pelo especialista. Em geral as sess\u00f5es s\u00e3o mensais ou bimestrais, com plano personalizado conforme a resposta individual de cada paciente."},
  {"pergunta":"Os tratamentos funcionam para queda de cabelo sem transplante?","resposta":"Sim. Pacientes com alopecia incipiente ou que n\u00e3o s\u00e3o candidatos ao transplante podem se beneficiar dos tratamentos complementares para desacelerar ou estabilizar a queda."},
  {"pergunta":"O PRP (Plasma Rico em Plaquetas) \u00e9 seguro?","resposta":"Sim. O PRP \u00e9 preparado com o pr\u00f3prio sangue do paciente, eliminando o risco de rea\u00e7\u00f5es al\u00e9rgicas. \u00c9 uma das t\u00e9cnicas mais estudadas e seguras para estimula\u00e7\u00e3o capilar."},
  {"pergunta":"Quantas sess\u00f5es s\u00e3o necess\u00e1rias para ver resultados?","resposta":"Os primeiros resultados s\u00e3o percebidos a partir da 3.\u00aa ou 4.\u00aa sess\u00e3o. O cronograma completo e o n\u00famero ideal de sess\u00f5es s\u00e3o definidos na avalia\u00e7\u00e3o inicial."}
]'
WHERE id = '10000000-0000-4000-8000-000000000003';
