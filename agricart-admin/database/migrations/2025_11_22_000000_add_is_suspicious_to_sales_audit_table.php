<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->boolean('is_suspicious')->default(false)->after('is_urgent');
            $table->text('suspicious_reason')->nullable()->after('is_suspicious');
        });
    }

    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropColumn(['is_suspicious', 'suspicious_reason']);
        });
    }
};
