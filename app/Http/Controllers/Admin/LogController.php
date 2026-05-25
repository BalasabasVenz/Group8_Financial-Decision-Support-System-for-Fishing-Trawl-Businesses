<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Logs', [
            'logs' => ActivityLog::with('user:id,fullname,username,role')
                ->latest('created_at')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function destroy(Request $request, ActivityLogger $logger): RedirectResponse
    {
        ActivityLog::query()->delete();
        $logger->log($request, 'Activity logs cleared', $request->user());

        return back()->with('success', 'Activity logs cleared. A new audit record was kept for this action.');
    }
}
