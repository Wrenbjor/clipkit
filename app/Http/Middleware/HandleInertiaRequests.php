<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'         => $request->user()->id,
                    'name'       => $request->user()->name,
                    'email'      => $request->user()->email,
                    'plan'       => $request->user()->plan,
                    'avatar_url' => $request->user()->avatar_url,
                    'is_admin'   => $request->user()->is_admin,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'info'    => $request->session()->get('info'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
