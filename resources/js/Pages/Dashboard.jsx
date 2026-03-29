import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_CONFIG = {
    pending:           { label: 'Queued',       color: 'bg-gray-100 text-gray-600' },
    fetching_captions: { label: 'Fetching...',   color: 'bg-blue-100 text-blue-700' },
    generating:        { label: 'Generating...', color: 'bg-yellow-100 text-yellow-700' },
    ready:             { label: 'Ready',          color: 'bg-green-100 text-green-700' },
    failed:            { label: 'Failed',         color: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
}

function VideoCard({ video }) {
    return (
        <Link href={`/dashboard/videos/${video.id}`} className="block group">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex gap-4 p-4">
                    {video.thumbnail_url ? (
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-24 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                            No thumb
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                {video.title ?? video.youtube_id}
                            </p>
                            <StatusBadge status={video.status} />
                        </div>
                        <p className="text-xs text-gray-500">{video.channel_name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(video.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Dashboard({ videos, videosRemaining, isPro, videosThisMonth, planVideoLimit }) {
    const hasVideos = videos.data?.length > 0;

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Videos</h1>
                    {!isPro && (
                        <p className="text-sm text-gray-500 mt-1">
                            {videosRemaining > 0
                                ? `${videosRemaining} of ${planVideoLimit} free videos remaining this month`
                                : (
                                    <span className="text-orange-600 font-medium">
                                        You've used all free videos this month.{' '}
                                        <Link href="/billing/checkout" className="underline">Upgrade to Pro</Link>
                                    </span>
                                )
                            }
                        </p>
                    )}
                    {isPro && (
                        <p className="text-sm text-gray-500 mt-1">
                            {videosThisMonth} videos processed this month · Unlimited
                        </p>
                    )}
                </div>
                <Link
                    href="/dashboard/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                    + New Video
                </Link>
            </div>

            {!hasVideos ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                    <div className="text-5xl mb-4">🎬</div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Paste a YouTube URL to generate 15 pieces of content in under 20 seconds.
                    </p>
                    <Link
                        href="/dashboard/new"
                        className="inline-flex bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Process your first video
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.data.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}

            {videos.links?.length > 3 && (
                <div className="mt-8 flex justify-center gap-1">
                    {videos.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-3 py-1.5 rounded text-sm ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 py-1.5 rounded text-sm text-gray-400 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
