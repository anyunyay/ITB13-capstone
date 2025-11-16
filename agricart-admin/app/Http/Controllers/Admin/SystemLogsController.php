<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class SystemLogsController extends Controller
{
    /**
     * Display the system logs page
     */
    public function index(Request $request)
    {
        // Check if user has permission to view system logs
        if (!in_array($request->user()->type, ['admin', 'staff'])) {
            abort(403, 'Access denied. Only admin and staff users can view system logs.');
        }

        $filters = [
            'search' => $request->get('search', ''),
            'event_type' => $request->get('event_type', 'all'),
            'user_type' => $request->get('user_type', 'all'),
            'date_from' => $request->get('date_from', ''),
            'date_to' => $request->get('date_to', ''),
            'per_page' => $request->get('per_page', 5)
        ];

        // Get logs from database
        $logs = $this->getLogsFromDatabase($filters);
        
        // Calculate summary statistics
        $summary = $this->calculateSummary();

        return Inertia::render('Profile/system-logs', [
            'logs' => $logs,
            'filters' => $filters,
            'summary' => $summary
        ]);
    }

    /**
     * Export system logs to CSV
     */
    public function export(Request $request)
    {
        // Check if user has permission to export system logs
        if (!in_array($request->user()->type, ['admin', 'staff'])) {
            abort(403, 'Access denied. Only admin and staff users can export system logs.');
        }

        $filters = [
            'search' => $request->get('search', ''),
            'event_type' => $request->get('event_type', 'all'),
            'user_type' => $request->get('user_type', 'all'),
            'date_from' => $request->get('date_from', ''),
            'date_to' => $request->get('date_to', '')
        ];

        // Get all logs from database (no pagination for export)
        $query = SystemLog::with('user');
        
        // Apply filters
        if ($filters['search']) {
            $query->search($filters['search']);
        }
        if ($filters['event_type'] !== 'all') {
            $query->eventType($filters['event_type']);
        }
        if ($filters['user_type'] !== 'all') {
            $query->userType($filters['user_type']);
        }
        if ($filters['date_from'] || $filters['date_to']) {
            $query->dateRange($filters['date_from'], $filters['date_to']);
        }
        
        $logs = $query->orderBy('performed_at', 'desc')->get();

        // Log export activity (important data access)
        SystemLogger::logDataExport(
            'system_logs_export',
            $request->user()->id,
            $request->user()->type,
            [
                'ip_address' => $request->ip(),
                'record_count' => $logs->count(),
                'export_format' => 'csv'
            ]
        );

        $filename = 'system_logs_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Write CSV headers
            fputcsv($file, [
                'ID',
                'User',
                'Action',
                'Date & Time',
                'Location (IP Address)',
                'Details',
                'Event Type'
            ]);

            // Write log data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user_email ?? "User #{$log->user_id}",
                    $log->action,
                    $log->performed_at->format('Y-m-d H:i:s'),
                    $log->ip_address,
                    $log->details,
                    $log->event_type
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get logs from database with filtering and pagination
     */
    private function getLogsFromDatabase(array $filters)
    {
        $query = SystemLog::with('user');
        
        // Apply filters
        if ($filters['search']) {
            $query->search($filters['search']);
        }
        if ($filters['event_type'] !== 'all') {
            $query->eventType($filters['event_type']);
        }
        if ($filters['user_type'] !== 'all') {
            $query->userType($filters['user_type']);
        }
        if ($filters['date_from'] || $filters['date_to']) {
            $query->dateRange($filters['date_from'], $filters['date_to']);
        }
        
        // Paginate results
        $perPage = (int) $filters['per_page'];
        $logs = $query->orderBy('performed_at', 'desc')->paginate($perPage);
        
        // Format logs for frontend compatibility
        $formattedLogs = $logs->map(function ($log) {
            // Determine level based on event type
            $level = 'info';
            if ($log->event_type === 'security_event') {
                $level = 'warning';
            } elseif ($log->event_type === 'critical_error') {
                $level = 'error';
            }
            
            // Merge context with additional fields for frontend
            $context = $log->context ?? [];
            $context['timestamp'] = $log->performed_at->toISOString();
            $context['user_id'] = $log->user_id;
            $context['user_email'] = $log->user_email;
            $context['user_type'] = $log->user_type;
            $context['action'] = $log->action;
            $context['event_type'] = $log->event_type;
            $context['ip_address'] = $log->ip_address;
            
            return [
                'id' => $log->id,
                'level' => $level,
                'message' => $log->details,
                'context' => $context,
                'created_at' => $log->performed_at->toISOString(),
            ];
        });
        
        // Format for frontend
        return [
            'data' => $formattedLogs->toArray(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'per_page' => $logs->perPage(),
            'total' => $logs->total()
        ];
    }

    /**
     * Calculate summary statistics from database
     */
    private function calculateSummary()
    {
        $totalLogs = SystemLog::count();
        $todayLogs = SystemLog::whereDate('performed_at', today())->count();
        $uniqueUsers = SystemLog::distinct('user_id')->whereNotNull('user_id')->count('user_id');
        
        // Count by event type (security events + critical errors = error_count for frontend)
        $securityEventCount = SystemLog::where('event_type', 'security_event')->count();
        $criticalErrorCount = SystemLog::where('event_type', 'critical_error')->count();
        $errorCount = $securityEventCount + $criticalErrorCount;
        
        return [
            'total_logs' => $totalLogs,
            'error_count' => $errorCount, // Combined security events and critical errors
            'warning_count' => $securityEventCount, // Security events as warnings
            'info_count' => $totalLogs - $errorCount, // Everything else
            'today_logs' => $todayLogs,
            'unique_users' => $uniqueUsers
        ];
    }
}
