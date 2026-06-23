"use client";

import { motion } from "framer-motion";
import {
  Map as MapIcon,
  Satellite,
  Layers,
  Ruler,
  MapPin,
  Search,
  FileText,
  Download,
  Navigation,
  MapPinned,
  Crosshair,
  Database,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Globe2,
  Building2,
  Compass,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onLaunch: () => void;
}

const stats = [
  { value: "64", label: "Bairros", icon: Building2 },
  { value: "662", label: "Localidades", icon: MapPinned },
  { value: "6", label: "Zonas", icon: Compass },
  { value: "11", label: "Tipos", icon: Layers },
];

const basemaps = [
  {
    key: "vector",
    label: "Vetor (OSM)",
    desc: "Ruas e logradouros limpos",
    icon: MapIcon,
    gradient: "from-emerald-500/30 to-teal-500/10",
  },
  {
    key: "satellite",
    label: "Satélite (Esri)",
    desc: "Imagem de alta resolução",
    icon: Satellite,
    gradient: "from-amber-500/30 to-orange-500/10",
  },
  {
    key: "hybrid",
    label: "Híbrido (Google)",
    desc: "Satélite + logradouros",
    icon: Globe2,
    gradient: "from-teal-500/30 to-cyan-500/10",
  },
  {
    key: "dark",
    label: "Tema Escuro",
    desc: "CartoDB Dark Matter",
    icon: Palette,
    gradient: "from-fuchsia-500/30 to-purple-500/10",
  },
];

const features = [
  {
    icon: Navigation,
    title: "Navegação Cartográfica Avançada",
    color: "text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/20",
    points: [
      "Quatro mapas base: Vetor, Satélite, Híbrido e Tema Escuro",
      "Rótulos permanentes dos bairros com halo cartográfico de alto contraste",
      "Destaques visuais e tooltips flutuantes ao passar o mouse",
      "Transições suaves e controle total de camadas por zona e tipo",
    ],
  },
  {
    icon: FileText,
    title: "Relatório Técnico (Preview A4)",
    color: "text-amber-400",
    ring: "ring-amber-500/20",
    glow: "group-hover:shadow-amber-500/20",
    points: [
      "Painel de visualização prévia da folha A4 em tempo real",
      "Sincronização inteligente: o relatório herda posição e basemap do mapa",
      "Tabela dinâmica com informações da feição selecionada",
      "Legendas automáticas das camadas ativas + notas editáveis + export PDF",
    ],
  },
  {
    icon: Ruler,
    title: "Interações Espaciais",
    color: "text-teal-400",
    ring: "ring-teal-500/20",
    glow: "group-hover:shadow-teal-500/20",
    points: [
      "Medição de linhas e polígonos (perímetro em m, área em ha)",
      "Proximidade: 3 pontos de referência mais próximos em até 1 km (Haversine)",
      "Link direto das coordenadas centroides para o Google Maps",
      "Busca rápida com autocomplete e zoom suave (flyTo)",
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* ============================= NAV ============================= */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-lg shadow-emerald-500/30">
              <MapIcon className="h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Território Digital - Web GIS Manaus</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Plataforma Cartográfica
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#mapas" className="hover:text-foreground transition-colors">
              Mapas Base
            </a>
            <a href="#dados" className="hover:text-foreground transition-colors">
              Dados
            </a>
          </nav>
          <Button
            onClick={onLaunch}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-background font-semibold shadow-lg shadow-emerald-500/25"
          >
            Abrir Mapa
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ============================= HERO ============================= */}
        <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
          {/* backdrop */}
          <div className="absolute inset-0 cartographic-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px] animate-float-slow" />
          <div
            className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/15 blur-[140px] animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />
          <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px] animate-float-slow" style={{ animationDelay: "-6s" }} />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-3xl"
            >
              <motion.div variants={item}>
                <Badge
                  variant="outline"
                  className="mb-6 gap-2 rounded-full border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-emerald-300"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  SIG interativo · Manaus / Amazonas
                </Badge>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
              >
                Visualize os{" "}
                <span className="text-gradient-emerald">Bairros, Zonas</span> e{" "}
                <span className="text-gradient-emerald">Localidades</span> de Manaus
              </motion.h1>

              <motion.p
                variants={item}
                className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                Plataforma Web GIS construída com{" "}
                <span className="text-foreground font-medium">Leaflet.js</span>,{" "}
                <span className="text-foreground font-medium">Tailwind CSS</span> e{" "}
                <span className="text-foreground font-medium">Lucide Icons</span>. Interface
                moderna, rápida e no tema escuro premium — para navegação, análise e
                geração de relatórios cartográficos.
              </motion.p>

              <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={onLaunch}
                  className="h-13 px-8 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-background font-semibold shadow-xl shadow-emerald-500/30"
                >
                  <MapIcon className="mr-2 h-5 w-5" />
                  Iniciar Aplicação
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-13 px-8 text-base border-border/70 hover:bg-secondary/60"
                >
                  <a href="#funcionalidades">
                    Ver Funcionalidades
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>

              <motion.div variants={item} className="mt-14 pt-8 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-4">
                  Apoio e Software
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  {[
                    {
                      src: "https://yt3.googleusercontent.com/F9b_TQzrPQ30Tihlh1GB7uyLVMNxq5TUcjQk2NKmdbd1EPgPpeCoa-bGAVT3-Z6n4er1NcT-=s900-c-k-c0x00ffffff-no-rj",
                      alt: "Igeotecnologia",
                    },
                    {
                      src: "https://www.esri-portugal.pt/content/dam/distributor-share/esri-pt/artigos/arcgis-pro.png",
                      alt: "ArcGIS Pro",
                    },
                    {
                      src: "https://hackernoon.imgix.net/images/9SBj6OzMvXOEhDxTjjuu75pLYnp1-vn83emp.jpeg",
                      alt: "Leaflet",
                    },
                    {
                      src: "https://blog.kubesimplify.com/img/blog/git-and-github-a-beginners-guide/q3I5kJ5U9.jpeg",
                      alt: "Git & GitHub",
                    },
                  ].map((logo, idx) => (
                    <div
                      key={idx}
                      className="h-20 px-6 rounded-2xl bg-secondary/20 border border-border/60 flex items-center justify-center hover:border-emerald-500/40 hover:bg-secondary/35 hover:scale-[1.03] transition-all duration-300 shadow-md"
                    >
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="h-13 max-w-[160px] object-contain rounded-lg filter opacity-95 hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* stats */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={item}
                  className="glass-panel rounded-2xl p-5 sm:p-6 group hover:border-emerald-500/30 transition-colors"
                >
                  <s.icon className="h-5 w-5 text-emerald-400 mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================= FEATURES ============================= */}
        <section id="funcionalidades" className="py-24 sm:py-28 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <Badge variant="outline" className="mb-4 gap-2 border-amber-500/30 bg-amber-500/10 text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Funcionalidades
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Tudo o que você precisa para{" "}
                <span className="text-gradient-emerald">analisar o território</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Três pilares de funcionalidades profissionais, integrados em uma única
                interface cartográfica fluida.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "group relative rounded-3xl glass-panel p-7 ring-1 transition-all duration-300 hover:-translate-y-1",
                    f.ring,
                    f.glow,
                    "hover:shadow-2xl",
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl grid place-items-center bg-secondary/60 ring-1 mb-5",
                      f.ring,
                    )}
                  >
                    <f.icon className={cn("h-6 w-6", f.color)} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 leading-snug">{f.title}</h3>
                  <ul className="space-y-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", f.color.replace("text-", "bg-"))} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* sub-features strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {[
                { icon: Search, t: "Busca com autocomplete", d: "flyTo suave" },
                { icon: Crosshair, t: "Cálculo de proximidade", d: "Haversine · 1 km" },
                { icon: MapPin, t: "Link para Google Maps", d: "coordenadas centroides" },
                { icon: Download, t: "Exportação PDF", d: "folha A4 sem cortes" },
              ].map((x) => (
                <div
                  key={x.t}
                  className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/50 p-4 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/15 grid place-items-center shrink-0">
                    <x.icon className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{x.t}</p>
                    <p className="text-xs text-muted-foreground truncate">{x.d}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================= BASEMAPS ============================= */}
        <section id="mapas" className="py-24 sm:py-28 relative">
          <div className="absolute inset-0 cartographic-grid opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 gap-2 border-teal-500/30 bg-teal-500/10 text-teal-300">
                <Globe2 className="h-3.5 w-3.5" />
                Mapas Base
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Quatro bases cartográficas, <span className="text-gradient-emerald">um só clique</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Alterne instantaneamente entre estilos para a melhor leitura do território.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {basemaps.map((b, i) => (
                <motion.button
                  key={b.key}
                  onClick={onLaunch}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="group text-left relative overflow-hidden rounded-2xl glass-panel p-5 hover:-translate-y-1 transition-transform"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", b.gradient)} />
                  <div className="relative">
                    <div className="h-24 w-full rounded-xl bg-background/40 ring-1 ring-border/60 grid place-items-center mb-4 overflow-hidden">
                      <b.icon className="h-10 w-10 text-foreground/80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                    </div>
                    <p className="font-bold text-base">{b.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ============================= DATA ============================= */}
        <section id="dados" className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="mb-4 gap-2 border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
                  <Database className="h-3.5 w-3.5" />
                  Base de Dados
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                  Divisões administrativas e subdivisões oficiais
                </h2>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  Dados vetoriais do município de Manaus: os 64 bairros organizados em 6
                  zonas, e 662 localidades classificadas em 11 tipos — comunidades,
                  condomínios, conjuntos, residenciais, loteamentos e mais.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl glass-panel p-5">
                    <p className="text-3xl font-bold text-emerald-400">6</p>
                    <p className="text-sm text-muted-foreground mt-1">Zonas administrativas</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">Norte · Sul · Leste · Oeste · Centro-Oeste · Centro-Sul</p>
                  </div>
                  <div className="rounded-2xl glass-panel p-5">
                    <p className="text-3xl font-bold text-amber-400">11</p>
                    <p className="text-sm text-muted-foreground mt-1">Tipos de localidade</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">Comunidade, conjunto, condomínio, residencial, vila...</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="rounded-3xl glass-panel p-6 overflow-hidden">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-3 w-3 rounded-full bg-rose-400/70" />
                    <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
                    <span className="ml-2 text-xs text-muted-foreground">webgis.manaus — legenda</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { c: "#34d399", n: "ZONA NORTE", k: "10 bairros" },
                      { c: "#fb7185", n: "ZONA SUL", k: "18 bairros" },
                      { c: "#fbbf24", n: "ZONA LESTE", k: "11 bairros" },
                      { c: "#2dd4bf", n: "ZONA OESTE", k: "8 bairros" },
                      { c: "#e879f9", n: "ZONA CENTRO-OESTE", k: "11 bairros" },
                      { c: "#fb923c", n: "ZONA CENTRO-SUL", k: "6 bairros" },
                    ].map((z) => (
                      <div
                        key={z.n}
                        className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5 border border-border/40 hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-3.5 w-3.5 rounded-full ring-2 ring-white/10" style={{ background: z.c }} />
                          <span className="text-sm font-semibold tracking-wide">{z.n}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{z.k}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================= CTA ============================= */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl glass-panel p-10 sm:p-14 text-center"
            >
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-emerald-500/20 blur-[100px]" />
              <div className="relative">
                <Compass className="h-12 w-12 text-emerald-400 mx-auto mb-5" />
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Pronto para explorar Manaus?
                </h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
                  Abra o mapa agora e comece a navegar, medir, analisar e gerar relatórios.
                </p>
                <Button
                  size="lg"
                  onClick={onLaunch}
                  className="mt-8 h-13 px-10 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-background font-semibold shadow-xl shadow-emerald-500/30"
                >
                  <MapIcon className="mr-2 h-5 w-5" />
                  Abrir o Mapa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ============================= FOOTER ============================= */}
      <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center">
                <MapIcon className="h-4 w-4 text-background" strokeWidth={2.5} />
              </div>
              <div className="text-sm">
                <p className="font-semibold">Território Digital - Web GIS Manaus</p>
                <p className="text-xs text-muted-foreground">
                  Leaflet · Tailwind CSS · Lucide Icons
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Dados vetoriais: Bairros e Localidades do município de Manaus / AM.
              <br className="hidden sm:block" /> Plataforma demonstrativa de Web GIS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
