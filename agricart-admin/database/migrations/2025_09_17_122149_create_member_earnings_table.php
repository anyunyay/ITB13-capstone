<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('member_earnings', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('member_id');
            $table->decimal('total_earnings', 10, 2)->default(0);
            $table->decimal('pending_earnings', 10, 2)->default(0);
            $table->decimal('available_earnings', 10, 2)->default(0);
            $table->timestamps();
            
            $table->foreign('member_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique('member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_earnings');
    }
};
