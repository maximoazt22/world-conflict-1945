import Link from 'next/link'
import { NATIONS, GAME_CONSTANTS } from '@/lib/types'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Logo & Title */}
          <div className="text-center mb-16">
            <div className="text-6xl mb-6 animate-pulse">🎖️</div>
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 mb-4">
              WORLD CONFLICT
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-zinc-400 mb-6">
              1945
            </p>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
              El juego de estrategia multijugador en tiempo real de la Segunda Guerra Mundial.
              Conquista territorios, forma alianzas y domina el mundo.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/game"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              🎮 Jugar Ahora
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-zinc-800 text-zinc-100 font-semibold text-lg rounded-xl hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              📝 Crear Cuenta
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '100+', label: 'Provincias', icon: '🏰' },
              { value: '50', label: 'Jugadores/Partida', icon: '👥' },
              { value: '8', label: 'Naciones', icon: '🌍' },
              { value: '7', label: 'Días/Campaña', icon: '📅' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center backdrop-blur-sm"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-zinc-100 mb-12">
            Características del Juego
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚔️',
                title: 'Batallas en Tiempo Real',
                description: 'Combate táctico con visualización de tropas, refuerzos durante la batalla y sistema de moral.',
              },
              {
                icon: '🤝',
                title: 'Diplomacia y Alianzas',
                description: 'Forma alianzas de hasta 4 jugadores, negocia pactos y traiciona a tus enemigos.',
              },
              {
                icon: '🏗️',
                title: 'Construcción y Economía',
                description: 'Gestiona 4 recursos, construye edificios y desarrolla tu imperio militar.',
              },
              {
                icon: '😴',
                title: 'Modo Sleep',
                description: 'Protección offline de hasta 8 horas diarias. Juega sin estrés.',
              },
              {
                icon: '🗺️',
                title: 'Mapa 3D Isométrico',
                description: 'Explora un mapa con más de 100 provincias en 3D con controles intuitivos.',
              },
              {
                icon: '💬',
                title: 'Chat en Vivo',
                description: 'Comunicación global, de alianza y privada en tiempo real.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nations Section */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-zinc-100 mb-4">
            Elige tu Nación
          </h2>
          <p className="text-center text-zinc-500 mb-12 max-w-2xl mx-auto">
            Cada nación tiene bonificaciones únicas que afectan tu estrategia de juego.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NATIONS.map((nation) => (
              <div
                key={nation.id}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-all group"
                style={{ borderColor: nation.color + '30' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{nation.flag}</span>
                  <div>
                    <div className="font-semibold text-zinc-100">{nation.nameEs}</div>
                    <div className="text-xs text-zinc-500">{nation.name}</div>
                  </div>
                </div>
                <div
                  className="text-xs px-2 py-1 rounded-full inline-block"
                  style={{ backgroundColor: nation.color + '20', color: nation.color }}
                >
                  {nation.bonus.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-zinc-100 mb-6">
            ¿Listo para conquistar el mundo?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Únete a miles de jugadores en la batalla por la supremacía global.
          </p>
          <Link
            href="/game"
            className="inline-block px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 font-bold text-xl rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            🎮 Comenzar a Jugar
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl mb-2">🎖️</div>
          <div className="text-zinc-500">
            WORLD CONFLICT 1945 © 2024 - MVP Version
          </div>
          <div className="text-zinc-600 text-sm mt-2">
            Made with ❤️ for strategy game lovers
          </div>
        </div>
      </footer>
    </div>
  )
}
