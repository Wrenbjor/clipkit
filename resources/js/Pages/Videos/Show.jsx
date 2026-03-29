import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

const PLATFORM_CONFIG = {
    linkedin:     { label: 'LinkedIn',      icon: '💼', limit: 3000 },
    twitter:      { label: 'Twitter/X',     icon: '𝕏',  limit: 280 },
    newsletter:   { label: 'Newsletter',    icon: '📧',  limit: null },
    video_script: { label: 'Video Scripts', icon: '🎬',  limit: null },
    quote:        { label: 'Quotes',        icon: '💬',  limit: 150 },
};

const PLATFORM_ORDER = ['linkedin', 'twitter', 'newsletter', 'video_script', 'quote'];

function CharCount({ content, limit }) {
    if (!limit) return null;
    const len   = content.length;
    const color = len > limit ? 'text-red-600' : len > limit * 0.85 ? 'text-yellow-600' : 'text-gray-400';
    return (
        <span className={`text-xs tabular-nums ${color}`}>
            {len}/{limit}
        </span>
    );
}

function ContentCard({ piece }) {
    const [content, setContent]         = useState(piece.content);
    const [editing, setEditing]         = useState(false);
    const [copied, setCopied]           = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [saving, setSaving]           = useState(false);
    const editRef                       = useRef(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        axios.post(`/api/content/${piece.id}/copy`).catch(() => {});
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`/api/content/${piece.id}`, { content });
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const res = await axios.post(`/api/content/${piece.id}/regenerate`);
            setContent(res.data.content);
        } catch (e) {
            alert('Regeneration failed. Please try again.');
        } finally {
            setRegenerating(false);
        }
    };

    const config = PLATFORM_CONFIG[piece.platform];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
            {editing ? (
                <textarea
                    ref={editRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-sm text-gray-800 leading-relaxed border border-indigo-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={Math.max(6, content.split('\n').length + 2)}
                    autoFocus
                />
            ) : (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <CharCount content={content} limit={config?.limit} />
                <div className="flex items-center gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={() => { setEditing(false); setContent(piece.content); }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                title="Regenerate"
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            >
                                {regenerating ? '⟳ ...' : '⟳'}
                            </button>
                            <button
                                onClick={() => setEditing(true)}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                                    copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProcessingView({ video }) {
    const steps = [
        { status: 'fetching_captions', label: 'Fetching captions', progress: 35 },
        { status: 'generating',        label: 'Generating content', progress: 70 },
        { status: 'ready',             label: 'Done!',              progress: 100 },
    ];

    const currentStep = steps.find((s) => s.status === video.status) ?? steps[0];

    return (
        <div className="max-w-lg mx-auto mt-16 text-center">
            {video.thumbnail_url && (
                <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full max-w-sm mx-auto rounded-xl mb-6 shadow-sm"
                />
            )}
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{video.title}</h2>
            <p className="text-sm text-gray-500 mb-8">{video.channel_name}</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <p className="text-base font-medium text-gray-900 mb-4">{currentStep.label}...</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${currentStep.progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                    {steps.map((step) => (
                        <span
                            key={step.status}
                            className={currentStep.progress >= step.progress ? 'text-indigo-600 font-medium' : ''}
                        >
                            {step.label}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-6">Usually under 20 seconds</p>
            </div>
        </div>
    );
}

function FailedView({ video }) {
    return (
        <div className="max-w-lg mx-auto mt-16 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Processing failed</h2>
            <p className="text-sm text-gray-600 mb-6">{video.error_message ?? 'An unexpected error occurred.'}</p>
            <a
                href="/dashboard/new"
                className="inline-flex bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
                Try another video
            </a>
        </div>
    );
}

export default function VideoShow({ video, contentByPlatform }) {
    const [activeTab, setActiveTab]         = useState('linkedin');
    const [currentVideo, setCurrentVideo]   = useState(video);
    const [currentContent, setCurrentContent] = useState(contentByPlatform);
    const pollingRef                        = useRef(null);

    const pollStatus = useCallback(async () => {
        try {
            const res = await axios.get(`/api/videos/${currentVideo.id}/status`);
            const data = res.data;

            if (data.status !== currentVideo.status) {
                if (data.status === 'ready' || data.status === 'failed') {
                    // Reload full page to get content
                    router.reload({ only: ['video', 'contentByPlatform'] });
                    return;
                }
                setCurrentVideo((v) => ({ ...v, status: data.status }));
            }
        } catch (e) {
            // Silently fail — will retry
        }
    }, [currentVideo.id, currentVideo.status]);

    useEffect(() => {
        if (currentVideo.status === 'ready' || currentVideo.status === 'failed') {
            clearInterval(pollingRef.current);
            return;
        }
        pollingRef.current = setInterval(pollStatus, 2000);
        return () => clearInterval(pollingRef.current);
    }, [currentVideo.status, pollStatus]);

    // Keep in sync with Inertia reloads
    useEffect(() => {
        setCurrentVideo(video);
        setCurrentContent(contentByPlatform);
    }, [video, contentByPlatform]);

    const availablePlatforms = PLATFORM_ORDER.filter((p) => currentContent[p]?.length > 0);

    return (
        <AppLayout>
            {currentVideo.status === 'failed' && <FailedView video={currentVideo} />}

            {currentVideo.status !== 'ready' && currentVideo.status !== 'failed' && (
                <ProcessingView video={currentVideo} />
            )}

            {currentVideo.status === 'ready' && (
                <div>
                    {/* Video header */}
                    <div className="flex items-start gap-4 mb-8">
                        {currentVideo.thumbnail_url && (
                            <img
                                src={currentVideo.thumbnail_url}
                                alt={currentVideo.title}
                                className="w-32 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                            />
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-snug">{currentVideo.title}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {currentVideo.channel_name}
                                {currentVideo.formatted_duration && ` · ${currentVideo.formatted_duration}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {Object.values(currentContent).flat().length} pieces generated
                            </p>
                        </div>
                    </div>

                    {/* Platform tabs */}
                    <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
                        {availablePlatforms.map((platform) => {
                            const config = PLATFORM_CONFIG[platform];
                            return (
                                <button
                                    key={platform}
                                    onClick={() => setActiveTab(platform)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === platform
                                            ? 'border-indigo-600 text-indigo-700'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                                >
                                    <span>{config.icon}</span>
                                    {config.label}
                                    <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                                        {currentContent[platform]?.length ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content pieces */}
                    <div className="space-y-4">
                        {(currentContent[activeTab] ?? []).map((piece) => (
                            <ContentCard key={piece.id} piece={piece} />
                        ))}
                        {(!currentContent[activeTab] || currentContent[activeTab].length === 0) && (
                            <div className="text-center py-12 text-gray-400 text-sm">
                                No content generated for this platform.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
