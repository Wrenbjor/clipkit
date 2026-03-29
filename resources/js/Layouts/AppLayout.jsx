import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top nav */}
            <nav className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                            Clip<span className="text-indigo-600">Kit</span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Videos
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Settings
                            </Link>
                            {user?.is_admin && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.plan === 'free' && (
                            <Link
                                href="/billing/checkout"
                                className="hidden sm:inline-flex bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Upgrade to Pro
                            </Link>
                        )}
                        {user?.plan === 'pro' && (
                            <span className="hidden sm:inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                ✦ Pro
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {title && (
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                )}
                {children}
            </main>
        </div>
    );
}
