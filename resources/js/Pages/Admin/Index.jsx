import AppLayout from '@/Layouts/AppLayout';

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

const STATUS_COLORS = {
    ready:             'bg-green-100 text-green-700',
    failed:            'bg-red-100 text-red-700',
    generating:        'bg-yellow-100 text-yellow-700',
    fetching_captions: 'bg-blue-100 text-blue-700',
    pending:           'bg-gray-100 text-gray-600',
};

export default function AdminIndex({ stats, recentUsers, recentVideos }) {
    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
                <p className="text-sm text-gray-500 mt-1">System overview</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total users"       value={stats.total_users}       sub={`${stats.pro_users} Pro`} />
                <StatCard label="Total videos"      value={stats.total_videos}      sub={`${stats.videos_today} today`} />
                <StatCard label="This month"        value={stats.videos_this_month} />
                <StatCard label="Processing now"    value={stats.processing_videos} sub={`${stats.failed_videos} failed`} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent users */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 text-sm">Recent Users</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentUsers.map((u) => (
                            <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.plan}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-0.5">{u.videos_this_month} videos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent videos */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 text-sm">Recent Videos</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentVideos.map((v) => (
                            <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{v.title ?? v.youtube_id}</p>
                                    <p className="text-xs text-gray-500">{v.user?.email}</p>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {v.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
