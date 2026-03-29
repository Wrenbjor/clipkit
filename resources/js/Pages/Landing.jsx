import { Link } from '@inertiajs/react';

const FEATURES = [
    {
        icon: '⚡',
        title: '20 seconds, not 5 minutes',
        description: 'We use YouTube\'s own captions — no audio download, no transcription API. Just instant results.',
    },
    {
        icon: '📝',
        title: '15 pieces of content',
        description: 'LinkedIn posts, Twitter threads, newsletter intros, video scripts, and quote graphics — all from one video.',
    },
    {
        icon: '💰',
        title: '$0.07 per video',
        description: 'No transcription costs. Just Claude API. The math works at any scale.',
    },
    {
        icon: '✏️',
        title: 'Edit, copy, regenerate',
        description: 'Every piece is editable inline. One-click copy. Not happy? Regenerate any single piece.',
    },
];

const PLATFORMS = [
    { name: 'LinkedIn', count: '5 posts', color: 'bg-blue-100 text-blue-800' },
    { name: 'Twitter/X', count: '3 threads', color: 'bg-sky-100 text-sky-800' },
    { name: 'Newsletter', count: '2 intros', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Video Scripts', count: '3 scripts', color: 'bg-purple-100 text-purple-800' },
    { name: 'Quote Graphics', count: '2 quotes', color: 'bg-green-100 text-green-800' },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                        Clip<span className="text-indigo-600">Kit</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Start free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    Results in under 20 seconds
                </div>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                    Turn one YouTube video into<br />
                    <span className="text-indigo-600">a week of content</span>
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Paste a YouTube URL. Get 15 ready-to-post pieces for LinkedIn, Twitter, newsletters, video scripts, and quote graphics — in seconds.
                </p>

                {/* Platform chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {PLATFORMS.map((p) => (
                        <span key={p.name} className={`px-3 py-1 rounded-full text-sm font-medium ${p.color}`}>
                            {p.name} · {p.count}
                        </span>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/register"
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Start free — no credit card
                    </Link>
                    <Link
                        href="/login"
                        className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-base font-medium hover:border-gray-400 transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
                <p className="text-sm text-gray-500 mt-4">Free plan includes 3 videos/month</p>
            </section>

            {/* Demo URL input mockup */}
            <section className="max-w-2xl mx-auto px-6 pb-20">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-400 text-sm">
                            https://youtube.com/watch?v=...
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold cursor-default">
                            Generate →
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {['Fetching captions...', 'Generating content...', 'Ready! 15 pieces'].map((step, i) => (
                            <div key={i} className={`text-center text-xs py-2 px-3 rounded-lg ${i === 2 ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-500'}`}>
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Built different
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="text-3xl mb-3">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Simple pricing</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Free */}
                        <div className="border border-gray-200 rounded-2xl p-8">
                            <div className="text-lg font-semibold text-gray-900 mb-1">Free</div>
                            <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
                            <div className="text-gray-500 text-sm mb-6">forever</div>
                            <ul className="space-y-3 text-sm text-gray-700 mb-8">
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 3 videos per month</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All 5 content formats</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Edit &amp; copy</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No credit card required</li>
                            </ul>
                            <Link
                                href="/register"
                                className="block text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:border-gray-400 transition-colors"
                            >
                                Get started
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="border-2 border-indigo-600 rounded-2xl p-8 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                MOST POPULAR
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">Pro</div>
                            <div className="text-4xl font-bold text-gray-900 mb-1">$19</div>
                            <div className="text-gray-500 text-sm mb-6">per month</div>
                            <ul className="space-y-3 text-sm text-gray-700 mb-8">
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited videos</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All 5 content formats</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Edit, copy &amp; regenerate</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Brand voice settings</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority processing</li>
                            </ul>
                            <Link
                                href="/register"
                                className="block text-center bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Start free, upgrade anytime
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} ClipKit. Built for creators.</p>
            </footer>
        </div>
    );
}
