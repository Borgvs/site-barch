# site-barch · Site institucional Barch

Site público da Barch em `barch.com.br`. Linguagem visual inspirada em LanderOS (Framer) adequada à identidade Barch (tokens R01, paleta creme + ink + terracotta, glass design).

## Stack
- **Next.js 16.2.12** (App Router, TypeScript strict)
- **Tailwind CSS 3** com tokens R01 (mesmos do `painel-barch`)
- **Framer Motion** para animações sutis (scroll reveal, hero entrada, hover)
- **Inter + Fraunces** (sans + serif display)
- Deploy: Vercel separado · domínio `barch.com.br`

## Rodar local
```bash
npm install
npm run dev   # http://localhost:3001
```

## Estrutura

```
app/
├── layout.tsx          # Root layout com fontes + meta
├── page.tsx            # Home: Hero · Process · Projects · Stack · Manifesto · Contact
├── sobre/page.tsx      # Manifesto detalhado · pilares · VBA · escuta · LOCVS
└── globals.css         # Tokens R01 + componentes

components/
├── Nav.tsx             # Pill flutuante glass, scroll-aware
├── Footer.tsx          # 4 colunas + tagline + copyright
├── Logo.tsx            # Logos Barch (wordmark/symbol/line × dark/light)
└── sections/
    ├── Hero.tsx        # H1 dramaticamente serif + ilustração 3D iso
    ├── Process.tsx     # 4 núcleos numerados + 3 stats
    ├── Projects.tsx    # Lista esquerda + featured card direita
    ├── Stack.tsx       # Bento grid: BIM · IA · Painel · 360°
    ├── Manifesto.tsx   # 4 pilares + cláusula de autocrítica
    └── Contact.tsx     # CTA final com trust chips
```

## Identidade aplicada
- **Tagline R00:** *"A liberdade de criar. A ousadia de transformar."* — Hero e Footer
- **Pilares:** Autêntica · Visionária · Sofisticada · Inovadora
- **Arquétipo:** O Criador
- **Cor primária:** terracotta `#A23A1F` (substitui o roxo do LanderOS)
- **Tipografia display:** Fraunces (serif moderna com SOFT/WONK)
- **Glass design** + ambient gradients + Apple-grade motion

## Deploy (próximos passos · TODO)
1. `git init` + push para novo repo `Borgvs/site-barch`
2. Importar no Vercel
3. Apontar DNS apex `barch.com.br` no Wix para Vercel
4. Configurar `www.barch.com.br` como redirect 301 para apex
