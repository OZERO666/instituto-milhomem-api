-- ============================================================
-- 009_faq_seed.sql
-- Conteúdo demonstrativo para a tabela faq
-- Requer: 008_faq_table.sql já executada
-- ============================================================

SET @now = NOW();

INSERT INTO faq (id, pergunta, resposta, ordem, ativo, created, updated) VALUES

('faq00000-0000-4000-8000-000000000001',
 'O transplante capilar é permanente?',
 'Sim. Os folículos transplantados são retirados da zona doadora (nuca e laterais), que é geneticamente resistente à queda. Após o crescimento, eles permanecem definitivamente no local receptor, sem necessidade de manutenção especial.',
 1, 1, @now, @now),

('faq00000-0000-4000-8000-000000000002',
 'O procedimento é doloroso?',
 'Não. O transplante é realizado sob anestesia local, portanto o paciente permanece acordado e confortável durante todo o processo, sem sentir dor. Após o procedimento pode haver leve sensibilidade na região operada, que passa em poucos dias.',
 2, 1, @now, @now),

('faq00000-0000-4000-8000-000000000003',
 'Quanto tempo dura o procedimento?',
 'Varia conforme a quantidade de grafts necessários. Em média de 4 a 8 horas. Procedimentos menores podem ser concluídos em menos tempo. O paciente permanece reclinado confortavelmente durante toda a sessão.',
 3, 1, @now, @now),

('faq00000-0000-4000-8000-000000000004',
 'Quando os resultados aparecem?',
 'Os primeiros fios crescem entre 3 e 4 meses após o procedimento. O resultado final — com densidade e aspecto completamente natural — é visível a partir do 12.º mês. A partir daí, o cabelo cresce normalmente para sempre.',
 4, 1, @now, @now),

('faq00000-0000-4000-8000-000000000005',
 'É normal os cabelos caírem após o transplante?',
 'Sim, é completamente normal. Em torno de 2 a 4 semanas após o procedimento ocorre o chamado "shock loss": os fios transplantados caem temporariamente antes de crescerem definitivamente. Isso faz parte do ciclo natural do folículo e não indica falha no procedimento.',
 5, 1, @now, @now),

('faq00000-0000-4000-8000-000000000006',
 'Qual é o tempo de recuperação?',
 'Nos primeiros 10 dias o paciente deve evitar esforços físicos intensos e exposição solar direta. A maioria retorna ao trabalho em 2 a 3 dias. As crostas na área receptora desaparecem entre 7 e 14 dias, e o couro cabeludo retorna ao aspecto normal em cerca de 3 semanas.',
 6, 1, @now, @now),

('faq00000-0000-4000-8000-000000000007',
 'O procedimento deixa cicatrizes visíveis?',
 'Na técnica FUE utilizada pelo Instituto Milhomem, as cicatrizes são micropontos dispersos na nuca, praticamente invisíveis mesmo com o cabelo curto. Não há corte linear nem pontos de sutura, diferente da técnica FUT.',
 7, 1, @now, @now),

('faq00000-0000-4000-8000-000000000008',
 'Qual a diferença entre FUE e FUT?',
 'Na técnica FUE (Follicular Unit Extraction) os folículos são extraídos individualmente com micromotor, sem corte linear, deixando cicatrizes mínimas e invisíveis. No FUT remove-se uma faixa de couro cabeludo, resultando em uma cicatriz linear. O Instituto Milhomem utiliza exclusivamente a técnica FUE, mais moderna, com recuperação mais rápida e resultado mais natural.',
 8, 1, @now, @now),

('faq00000-0000-4000-8000-000000000009',
 'Quantos grafts eu preciso?',
 'O número de grafts varia conforme o grau de calvície (escala de Norwood) e a área a ser tratada. Casos leves podem requerer 1.000 a 2.000 grafts; casos avançados, de 3.000 a 5.000 ou mais. Uma avaliação presencial com nossos especialistas é necessária para definir o planejamento personalizado.',
 9, 1, @now, @now),

('faq00000-0000-4000-8000-000000000010',
 'O transplante funciona para mulheres?',
 'Sim. Mulheres com alopecia androgenética (queda feminina em padrão difuso) ou alopecia cicatricial podem ser candidatas ao transplante capilar. A avaliação prévia é fundamental para verificar a viabilidade, a extensão da zona doadora e o protocolo ideal.',
 10, 1, @now, @now),

('faq00000-0000-4000-8000-000000000011',
 'O transplante de barba também é definitivo?',
 'Sim. Os folículos implantados na barba são provenientes da mesma zona doadora resistente à queda, portanto crescem permanentemente. O resultado é uma barba mais densa, com contorno definido e aspecto completamente natural.',
 11, 1, @now, @now),

('faq00000-0000-4000-8000-000000000012',
 'Como é feita a avaliação inicial?',
 'A avaliação é presencial e gratuita. O especialista analisa o grau de calvície, a qualidade da zona doadora, o histórico familiar e as expectativas do paciente. Com base nisso, é elaborado um plano personalizado com estimativa de grafts, técnica recomendada e cronograma de resultados.',
 12, 1, @now, @now);
