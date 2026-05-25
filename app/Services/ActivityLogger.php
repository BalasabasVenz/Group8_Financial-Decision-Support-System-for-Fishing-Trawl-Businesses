<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public function log(Request $request, string $activity, ?User $user = null): void
    {
        ActivityLog::create([
            'user_id' => $user?->id,
            'activity' => $activity,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'created_at' => now(),
        ]);
    }
}
