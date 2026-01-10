import Link from 'next/link'
import { NATIONS, GAME_CONSTANTS } from '@/lib/types'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-amber-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          <div className="inline-block animate-bounce-slow mb-6">
            <span className="text-7xl filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">🎖️</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-sm">
              WORLD CONFLICT
            </span>
            <br />
            <span className="text-5xl md:text-7xl text-zinc-700 font-serif tracking-widest opacity-80 mt-2 block">
              1945
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Domina la estrategia global en tiempo real.
            <span className="block text-amber-500/80 font-medium">Diplomacia. Guerra. Supremacía.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/game"
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] border border-amber-400/20"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                🎮 JUGAR AHORA
              </span>
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 bg-zinc-900/50 text-zinc-300 font-bold text-lg rounded-full hover:bg-zinc-800 hover:text-white transition-all border border-zinc-700 backdrop-blur-sm hover:border-zinc-500"
            >
              CREAR CUENTA
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-5xl mx-auto mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '100+', label: 'PROVINCIAS', icon: '🏰' },
              { value: '50', label: 'JUGADORES', icon: '👥' },
              { value: '8', label: 'NACIONES', icon: '🌍' },
              { value: 'REAL', label: 'TIEMPO', icon: '⏱️' },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-md p-6 rounded-2xl text-center group hover:border-amber-500/20 transition-colors">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500 font-bold tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">La Guerra Total</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚔️', title: 'Combate Táctico', desc: 'Controla tus ejércitos en tiempo real. Intercepta, defiende y conquista.', color: 'from-orange-500/20' },
              { icon: '🤝', title: 'Alianzas Reales', desc: 'Pactos de no agresión, embargos comerciales y traiciones inesperadas.', color: 'from-blue-500/20' },
              { icon: '🏗️', title: 'Economía de Guerra', desc: 'Construye infraestructuras clave. Gestiona petróleo, acero y alimentos.', color: 'from-green-500/20' },
              { icon: '🗺️', title: 'Mapa Geopolítico', desc: 'Más de 100 provincias con recursos únicos y gran valor estratégico.', color: 'from-purple-500/20' },
              { icon: '🕵️', title: 'Espionaje', desc: 'Infiltra agentes, revela ejércitos enemigos y sabotea su producción.', color: 'from-red-500/20' },
              { icon: '🏆', title: 'Ranking Global', desc: 'Sube de rango, gana medallas y demuestra que eres el líder supremo.', color: 'from-yellow-500/20' },
            ].map((f, i) => (
              <div key={i} className={`relative p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300 origin-left">{f.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nations Showcase */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-16">
            Potencias Mundiales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NATIONS.map((nation) => (
              <div key={nation.id} className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all p-6">
                {/* Glow effect based on nation color */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: nation.color }}></div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <span className="text-6xl mb-4 drop-shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300 grayscale group-hover:grayscale-0">{nation.flag}</span>
                  <h3 className="text-lg font-bold text-white mb-1">{nation.nameEs}</h3>
                  <div className="w-full h-px bg-zinc-800 my-3 group-hover:bg-zinc-700 transition-colors"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {nation.bonus.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-sm">© 2026 WORLD CONFLICT 1945. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
