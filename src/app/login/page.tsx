'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NATIONS } from '@/lib/types'

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        nation: NATIONS[0].id,
        color: NATIONS[0].color,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'

            // Log what we're sending (for debugging)
            console.log('Submitting to:', endpoint, formData)

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()
            console.log('Response:', data)

            if (!response.ok || !data.success) {
                setError(data.error || `Error: ${response.status}`)
                return
            }

            // Store user data
            if (data.user) {
                localStorage.setItem('userId', data.user.id)
                localStorage.setItem('username', data.user.username)
            }

            // Store token if provided
            if (data.token) {
                localStorage.setItem('token', data.token)
            }

            // Redirect to game
            router.push('/game')
        } catch (err) {
            console.error('Auth error:', err)
            setError('Error de conexión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const handleNationChange = (nationId: string) => {
        const nation = NATIONS.find((n) => n.id === nationId)
        setFormData((prev) => ({
            ...prev,
            nation: nationId,
            color: nation?.color || prev.color,
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-5xl">🎖️</span>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mt-2">
                            WORLD CONFLICT 1945
                        </h1>
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    {/* Toggle */}
                    <div className="flex mb-6 bg-zinc-900 rounded-lg p-1">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isLogin
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'text-zinc-400 hover:text-zinc-100'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isLogin
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'text-zinc-400 hover:text-zinc-100'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Usuario</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="Tu nombre de usuario"
                                required
                                minLength={3}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Email (opcional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nación</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {NATIONS.map((nation) => (
                                        <button
                                            key={nation.id}
                                            type="button"
                                            onClick={() => handleNationChange(nation.id)}
                                            className={`p-2 rounded-lg border text-center transition-all ${formData.nation === nation.id
                                                ? 'border-amber-500 bg-amber-500/20'
                                                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                                                }`}
                                            title={nation.nameEs}
                                        >
                                            <span className="text-2xl">{nation.flag}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 font-bold rounded-lg hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear Cuenta'}
                        </button>
                    </form>

                    {/* Demo Login */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-zinc-500">
                            Demo: usuario <code className="text-amber-400">demo</code> / contraseña <code className="text-amber-400">demo123</code>
                        </p>
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
