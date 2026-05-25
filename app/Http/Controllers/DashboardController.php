<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = request()->user();

        if (! $user->isAdmin()) {
            return Inertia::render('Dashboard', [
                'mode' => 'user',
                'userModules' => [
                    [
                        'title' => 'Trip Expense Recording',
                        'status' => 'Mock',
                        'value' => 'P18,450',
                        'meta' => 'Latest trip expenses',
                        'description' => 'Record fuel, food, ice, and other operational costs for each fishing trip.',
                    ],
                    [
                        'title' => 'Fish Sales Tracking',
                        'status' => 'Mock',
                        'value' => 'P31,800',
                        'meta' => 'Latest trip sales',
                        'description' => 'Track quantity, price per kilo, and total sales per fishing trip.',
                    ],
                    [
                        'title' => 'Profit and Loss Summary',
                        'status' => 'Mock',
                        'value' => 'P13,350',
                        'meta' => 'Estimated net profit',
                        'description' => 'View computed trip income, expenses, and net profit or loss.',
                    ],
                    [
                        'title' => 'Financial Reports',
                        'status' => 'Mock',
                        'value' => '4',
                        'meta' => 'Reports ready',
                        'description' => 'Review simple summaries for planning, reporting, and decision support.',
                    ],
                ],
                'mockTrips' => [
                    ['trip' => 'Trip 001', 'boat' => 'FV Cantil 1', 'sales' => 'P31,800', 'expenses' => 'P18,450', 'profit' => 'P13,350', 'status' => 'Profitable'],
                    ['trip' => 'Trip 002', 'boat' => 'FV Cantil 1', 'sales' => 'P24,600', 'expenses' => 'P17,900', 'profit' => 'P6,700', 'status' => 'Profitable'],
                    ['trip' => 'Trip 003', 'boat' => 'FV Cantil 2', 'sales' => 'P19,250', 'expenses' => 'P20,100', 'profit' => '-P850', 'status' => 'Review'],
                ],
                'recentLogs' => ActivityLog::with('user:id,fullname,username')
                    ->where('user_id', $user->id)
                    ->latest('created_at')
                    ->limit(5)
                    ->get(),
            ]);
        }

        return Inertia::render('Dashboard', [
            'mode' => 'admin',
            'stats' => [
                'users' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'logs' => ActivityLog::count(),
            ],
            'recentLogs' => ActivityLog::with('user:id,fullname,username')
                ->latest('created_at')
                ->limit(8)
                ->get(),
        ]);
    }
}
