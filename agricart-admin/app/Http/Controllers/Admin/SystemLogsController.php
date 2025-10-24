<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
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
            'level' => $request->get('level', 'all'),
            'event_type' => $request->get('event_type', 'all'),
            'user_type' => $request->get('user_type', 'all'),
            'date_from' => $request->get('date_from', ''),
            'date_to' => $request->get('date_to', ''),
            'per_page' => $request->get('per_page', 25)
        ];

        // Get logs from system.log file
        $logs = $this->getLogsFromFile($filters);
        
        // Calculate summary statistics
        $summary = $this->calculateSummary();

        // Log admin access to system logs
        SystemLogger::logAdminActivity(
            'system_logs_access',
            $request->user()->id,
            [
                'ip_address' => $request->ip(),
                'filters_applied' => array_filter($filters, fn($value) => $value !== 'all' && $value !== ''),
                'total_logs_viewed' => count($logs['data'])
            ]
        );

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
            'level' => $request->get('level', 'all'),
            'event_type' => $request->get('event_type', 'all'),
            'user_type' => $request->get('user_type', 'all'),
            'date_from' => $request->get('date_from', ''),
            'date_to' => $request->get('date_to', '')
        ];

        // Get all logs (no pagination for export)
        $filters['per_page'] = 10000; // Large number to get all logs
        $logs = $this->getLogsFromFile($filters);

        // Log export activity
        SystemLogger::logDataExport(
            'system_logs_export',
            $request->user()->id,
            $request->user()->type,
            [
                'ip_address' => $request->ip(),
                'filters_applied' => array_filter($filters, fn($value) => $value !== 'all' && $value !== ''),
                'total_logs_exported' => count($logs['data']),
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
                'Timestamp',
                'Level',
                'Message',
                'Event Type',
                'User ID',
                'User Type',
                'User Email',
                'IP Address',
                'Action',
                'Product ID',
                'Product Name',
                'Order ID',
                'Total Amount',
                'Status',
                'Additional Context'
            ]);

            // Write log data
            foreach ($logs['data'] as $log) {
                fputcsv($file, [
                    $log['context']['timestamp'] ?? '',
                    $log['level'] ?? '',
                    $log['message'] ?? '',
                    $log['context']['event_type'] ?? '',
                    $log['context']['user_id'] ?? '',
                    $log['context']['user_type'] ?? '',
                    $log['context']['user_email'] ?? '',
                    $log['context']['ip_address'] ?? '',
                    $log['context']['action'] ?? '',
                    $log['context']['product_id'] ?? '',
                    $log['context']['product_name'] ?? '',
                    $log['context']['order_id'] ?? '',
                    $log['context']['total_amount'] ?? '',
                    $log['context']['status'] ?? '',
                    json_encode($log['context'])
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get logs from system.log file with filtering and pagination
     */
    private function getLogsFromFile(array $filters)
    {
        $logPath = storage_path('logs/system.log');
        
        if (!File::exists($logPath)) {
            return [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $filters['per_page'],
                'total' => 0
            ];
        }

        $logContent = File::get($logPath);
        $logLines = array_filter(explode("\n", $logContent));
        
        $parsedLogs = [];
        foreach ($logLines as $line) {
            if (empty(trim($line))) continue;
            
            try {
                // Parse Laravel log format: [timestamp] environment.LEVEL: message {"context":"data"}
                if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.+?)\s+(\{.*\})$/', $line, $matches)) {
                    $timestamp = $matches[1];
                    $environment = $matches[2];
                    $level = strtolower($matches[3]);
                    $message = $matches[4];
                    $contextJson = $matches[5];
                    
                    $context = json_decode($contextJson, true);
                    if ($context) {
                        $parsedLogs[] = $this->formatLogEntry([
                            'timestamp' => $timestamp,
                            'level' => $level,
                            'message' => $message,
                            'context' => $context
                        ]);
                    }
                } else {
                    // Try alternative parsing for logs without JSON context
                    if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.+)$/', $line, $matches)) {
                        $timestamp = $matches[1];
                        $environment = $matches[2];
                        $level = strtolower($matches[3]);
                        $message = $matches[4];
                        
                        // Try to extract JSON from the message
                        $context = [];
                        if (preg_match('/\{.*\}$/', $message, $jsonMatches)) {
                            $contextJson = $jsonMatches[0];
                            $context = json_decode($contextJson, true) ?? [];
                            $message = trim(str_replace($contextJson, '', $message));
                        }
                        
                        $parsedLogs[] = $this->formatLogEntry([
                            'timestamp' => $timestamp,
                            'level' => $level,
                            'message' => $message,
                            'context' => $context
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // Skip malformed log entries
                continue;
            }
        }

        // Apply filters
        $filteredLogs = $this->applyFilters($parsedLogs, $filters);

        // Sort by timestamp (newest first)
        usort($filteredLogs, function($a, $b) {
            return strtotime($b['context']['timestamp']) - strtotime($a['context']['timestamp']);
        });

        // Pagination
        $perPage = (int) $filters['per_page'];
        $total = count($filteredLogs);
        $currentPage = 1; // For now, we'll implement simple pagination
        $lastPage = ceil($total / $perPage);
        
        $paginatedLogs = array_slice($filteredLogs, 0, $perPage);

        return [
            'data' => $paginatedLogs,
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $total
        ];
    }

    /**
     * Format log entry for display
     */
    private function formatLogEntry(array $logEntry)
    {
        // Convert Laravel timestamp to ISO format
        $timestamp = $logEntry['timestamp'] ?? now()->toISOString();
        if (isset($logEntry['timestamp']) && !str_contains($logEntry['timestamp'], 'T')) {
            try {
                $timestamp = Carbon::createFromFormat('Y-m-d H:i:s', $logEntry['timestamp'])->toISOString();
            } catch (\Exception $e) {
                $timestamp = now()->toISOString();
            }
        }

        return [
            'id' => uniqid(),
            'level' => $logEntry['level'] ?? 'info',
            'message' => $logEntry['message'] ?? '',
            'context' => array_merge($logEntry['context'] ?? [], [
                'timestamp' => $timestamp
            ]),
            'created_at' => $timestamp
        ];
    }

    /**
     * Apply filters to logs
     */
    private function applyFilters(array $logs, array $filters)
    {
        return array_filter($logs, function($log) use ($filters) {
            
            // Search filter
            if (!empty($filters['search'] ?? '')) {
                $searchTerm = strtolower($filters['search']);
                $searchableText = strtolower($log['message'] . ' ' . json_encode($log['context']));
                if (strpos($searchableText, $searchTerm) === false) {
                    return false;
                }
            }

            // Level filter
            if (($filters['level'] ?? 'all') !== 'all') {
                $logLevel = isset($log['level']) ? $log['level'] : '';
                if ($logLevel !== $filters['level']) {
                    return false;
                }
            }

            // Event type filter
            if (($filters['event_type'] ?? 'all') !== 'all' && 
                ($log['context']['event_type'] ?? '') !== $filters['event_type']) {
                return false;
            }

            // User type filter
            if (($filters['user_type'] ?? 'all') !== 'all' && 
                ($log['context']['user_type'] ?? '') !== $filters['user_type']) {
                return false;
            }

            // Date filters
            if (!empty($filters['date_from'])) {
                $logDate = Carbon::parse($log['context']['timestamp'] ?? now());
                $fromDate = Carbon::parse($filters['date_from']);
                if ($logDate->lt($fromDate)) {
                    return false;
                }
            }

            if (!empty($filters['date_to'])) {
                $logDate = Carbon::parse($log['context']['timestamp'] ?? now());
                $toDate = Carbon::parse($filters['date_to'])->endOfDay();
                if ($logDate->gt($toDate)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Calculate summary statistics
     */
    private function calculateSummary()
    {
        $logPath = storage_path('logs/system.log');
        
        if (!File::exists($logPath)) {
            return [
                'total_logs' => 0,
                'error_count' => 0,
                'warning_count' => 0,
                'info_count' => 0,
                'today_logs' => 0,
                'unique_users' => 0
            ];
        }

        $logContent = File::get($logPath);
        $logLines = array_filter(explode("\n", $logContent));
        
        $totalLogs = count($logLines);
        $errorCount = 0;
        $warningCount = 0;
        $infoCount = 0;
        $todayLogs = 0;
        $uniqueUsers = [];

        foreach ($logLines as $line) {
            if (empty(trim($line))) continue;
            
            try {
                // Parse Laravel log format: [timestamp] environment.LEVEL: message {"context":"data"}
                if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.+?)\s+(\{.*\})$/', $line, $matches)) {
                    $timestamp = $matches[1];
                    $environment = $matches[2];
                    $level = strtolower($matches[3]);
                    $message = $matches[4];
                    $contextJson = $matches[5];
                    
                    $context = json_decode($contextJson, true);
                    if (!$context) $context = [];

                    // Count by level
                    switch ($level) {
                        case 'error':
                            $errorCount++;
                            break;
                        case 'warning':
                            $warningCount++;
                            break;
                        case 'info':
                            $infoCount++;
                            break;
                    }

                    // Count today's logs
                    try {
                        $logDate = Carbon::createFromFormat('Y-m-d H:i:s', $timestamp);
                        if ($logDate->isToday()) {
                            $todayLogs++;
                        }
                    } catch (\Exception $e) {
                        // Skip if timestamp parsing fails
                    }

                    // Count unique users
                    $userId = $context['user_id'] ?? null;
                    if ($userId) {
                        $uniqueUsers[$userId] = true;
                    }
                } else {
                    // Try alternative parsing for logs without JSON context
                    if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.+)$/', $line, $matches)) {
                        $timestamp = $matches[1];
                        $environment = $matches[2];
                        $level = strtolower($matches[3]);
                        $message = $matches[4];
                        
                        // Try to extract JSON from the message
                        $context = [];
                        if (preg_match('/\{.*\}$/', $message, $jsonMatches)) {
                            $contextJson = $jsonMatches[0];
                            $context = json_decode($contextJson, true) ?? [];
                        }
                        
                        // Count by level
                        switch ($level) {
                            case 'error':
                                $errorCount++;
                                break;
                            case 'warning':
                                $warningCount++;
                                break;
                            case 'info':
                                $infoCount++;
                                break;
                        }

                        // Count today's logs
                        try {
                            $logDate = Carbon::createFromFormat('Y-m-d H:i:s', $timestamp);
                            if ($logDate->isToday()) {
                                $todayLogs++;
                            }
                        } catch (\Exception $e) {
                            // Skip if timestamp parsing fails
                        }
                        
                        // Count unique users
                        $userId = $context['user_id'] ?? null;
                        if ($userId) {
                            $uniqueUsers[$userId] = true;
                        }
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        return [
            'total_logs' => $totalLogs,
            'error_count' => $errorCount,
            'warning_count' => $warningCount,
            'info_count' => $infoCount,
            'today_logs' => $todayLogs,
            'unique_users' => count($uniqueUsers)
        ];
    }
}
