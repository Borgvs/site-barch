# PL-020 · SITE-CPT · laboratório Rhino Penha

Ambiente:Local: SITE-CPT `/viabilidade/laboratorio-rhino`, caso Penha/SC.
Efeito: página de teste em tela própria, sem iframe; ponte com Rhino/GH do computador do usuário.
Natureza: experimento paramétrico autorizado pelo dono, anterior à incorporação integral ao sistema.
Limites: nenhuma escrita em Barch/painel/DB, nenhum túnel ou serviço Rhino público; nenhuma publicação de runtime, matrículas, credenciais ou acervo privado. Sem ligação na navegação institucional.
Donos: `public/viabilidade/laboratorio-rhino/**`, rewrite isolado em `next.config.mjs`; conector desktop no pacote privado `Barch - Ventures/Entregaveis/penha-mvp-parametrico-2026-10-09/`.

O usuário autorizou a publicação de testes dentro de barch.com.br/viabilidade nesta conversa e pediu a integração online. O site opera produção em `main` e não possui branch remota `regencia`; o PR deste recorte usa a branch vigente do site, preservando a regência do painel. A entrega deve passar por revisão independente e build antes de promoção.

A interface aponta exclusivamente para `http://127.0.0.1:5188`. O servidor local, iniciado com `--online`, permite CORS somente para `https://barch.com.br`; outros domínios e hosts são recusados. O navegador pode solicitar autorização de rede local. Abrir a página em outro computador não conecta ao Mac do dono.

Provas nativas do pacote privado: retângulo 544m²/5 andares, Penha 13.163,98m²/12 andares com vazio de rua, alteração automática 12→16, reabertura de 3DM/GH. Tempo observado ~2,3–2,8s; não é SLA nem benchmark de paridade.

A setorização é GEOS; a massa é RhinoCommon + Extrude nativo GH. Extrusão do setor inteiro não é uma torre arquitetonicamente qualificada. IFC, plantas, núcleos, física e conformidade normativa não foram resolvidos por este recorte. A definição GH exportada guarda laje/altura do resultado, não um configurador cloud universal.

Manifesto público contém apenas hashes dos arquivos explícitos de interface/base geográfica e bibliotecas web. As referências Penha foram autorizadas pelo usuário para esta superfície de teste; não contêm dados pessoais ou documentos originais. Perímetro interpretado e área documental permanecem distintos, sem escalonamento artificial.

Testes: lint, tipos e build do site; 22 testes privados de geometria/ponte/HTTP, mais revisão independente de concorrência. Publicação só comprovada após SHA de produção e rota; execução online só comprovada após ensaio HTTPS→loopback no navegador.

Rollback: reverter o commit/PR; a página principal, painel e DB permanecem com seus donos e bases existentes.
