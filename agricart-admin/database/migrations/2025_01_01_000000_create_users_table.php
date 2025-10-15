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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->nullable()->unique(); // Added for members
            $table->string('type')->default('customer'); // admin, customer, logistic, member
            $table->boolean('is_default')->default(false); // Added for default accounts
            $table->boolean('active')->default(true); // Added for account status
            $table->string('name')->nullable(); // for admin/member/logistic
            $table->string('email')->nullable()->unique(); // Made nullable for members
            $table->string('avatar')->nullable(); // Added for user avatars
            $table->string('password');
            $table->string('contact_number')->nullable(); // for customer/member/logistic
            $table->date('registration_date')->nullable(); // for member/logistic
            $table->string('document')->nullable(); // for member
            $table->boolean('document_marked_for_deletion')->default(false); // Added for document management
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->string('current_session_id')->nullable(); // Added for session management
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
