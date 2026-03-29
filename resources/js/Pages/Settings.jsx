import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const PLATFORMS = [
    { key: 'linkedin',     label: 'LinkedIn' },
    { key: 'twitter',      label: 'Twitter/X' },
    { key: 'newsletter',   label: 'Newsletter' },
    { key: 'video_script', label: 'Video Scripts' },
    { key: 'quote',        label: 'Quote Graphics' },
];

export default function Settings({ user }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        brand_voice:       user.brand_voice ?? '',
        default_platforms: user.default_platforms ?? PLATFORMS.map((p) => p.key),
    });

    const togglePlatform = (key) => {
        const current = data.default_platforms;
        if (current.includes(key)) {
            setData('default_platforms', current.filter((p) => p !== key));
        } else {
            setData('default_platforms', [...current, key]);
        }
    };

    function submit(e) {
        e.preventDefault();
        patch('/dashboard/settings');
    }

    return (
        <AppLayout>
            <div className="max-w-xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                </div>

                {/* Profile */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
                    <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-semibold">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {user.plan === 'pro' ? '✦ Pro' : 'Free'}
                        </span>
                    </div>
                </div>

                {/* Preferences */}
                <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-gray-900">Content Preferences</h2>

                    <div>
                        <label htmlFor="brand_voice" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Brand voice
                        </label>
                        <textarea
                            id="brand_voice"
                            value={data.brand_voice}
                            onChange={(e) => setData('brand_voice', e.target.value)}
                            placeholder="Describe your tone and style (e.g. 'Conversational and direct. Avoid corporate jargon. Use short sentences. Occasionally witty.')"
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Applied to all generated content.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default platforms
                        </label>
                        <div className="space-y-2">
                            {PLATFORMS.map((platform) => (
                                <label key={platform.key} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={data.default_platforms.includes(platform.key)}
                                        onChange={() => togglePlatform(platform.key)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                        {platform.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {recentlySuccessful && (
                            <span className="text-sm text-green-600 font-medium">Saved!</span>
                        )}
                        <div className="ml-auto">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save settings'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Billing */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-4">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Billing</h2>
                    {user.plan === 'pro' ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pro plan · $19/month</p>
                                <p className="text-xs text-gray-500 mt-0.5">Unlimited video processing</p>
                            </div>
                            <a
                                href="/billing/portal"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Manage billing →
                            </a>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Free plan</p>
                                <p className="text-xs text-gray-500 mt-0.5">3 videos per month</p>
                            </div>
                            <a
                                href="/billing/checkout"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Upgrade to Pro
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
