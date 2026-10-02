import {validSection} from './presentation-model.mjs?v=f034d95b69f3';
export function resolveStudyRoute(href,studies,defaultSlug){
 const url=new URL(href),known=Array.isArray(studies)?studies:[],requested=url.searchParams.get('terreno'),section=url.hash.slice(1);
 const slug=known.find(s=>s.slug===requested)?.slug||known.find(s=>s.slug===defaultSlug)?.slug||known.find(s=>s.slug==='talma-tatuape-lote-0003')?.slug||known[0]?.slug;
 if(!slug)throw Error('Nenhum terreno disponível para análise.');
 return {slug,section:validSection(section)?section:'overview'};
}
export function studyRouteHref(slug,section){
 if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug??'')||!validSection(section))throw Error('Rota de estudo inválida.');
 return `?terreno=${encodeURIComponent(slug)}#${section}`;
}
