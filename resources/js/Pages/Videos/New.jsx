import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function NewVideo() {
    const { data, setData, post, processing, errors } = useForm({
        url: '',
        topic_emphasis: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/dashboard/videos');
    }

    return (
        <AppLayout>
            <div className="max-w-xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">New Video</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Paste a YouTube URL and get 15 pieces of content in under 20 seconds.
                    </p>
                </div>

                <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1.5">
                            YouTube URL
                        </label>
                        <input
                            id="url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                        />
                        {errors.url && (
                            <p className="text-red-600 text-xs mt-1">{errors.url}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="topic_emphasis" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Key topics to emphasize <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="topic_emphasis"
                            value={data.topic_emphasis}
                            onChange={(e) => setData('topic_emphasis', e.target.value)}
                            placeholder="e.g. focus on the productivity tips, de-emphasize the sponsor section"
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                        <strong className="text-gray-700">What you'll get:</strong>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                            {['5 LinkedIn posts', '3 Twitter threads', '2 Newsletter intros', '3 Video scripts', '2 Quote graphics'].map((item) => (
                                <span key={item} className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.url}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Submitting...' : 'Generate Content →'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
