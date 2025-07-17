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
            $table->string('type')->default('customer'); // admin, customer, logistic, member
            $table->string('name')->nullable(); // for admin/member/logistic
            $table->string('firstname')->nullable(); // for customer
            $table->string('lastname')->nullable(); // for customer
            $table->string('username')->nullable()->unique(); // for customer
            $table->string('email')->unique();
            $table->string('password');
            $table->string('contact_number')->nullable(); // for customer/member/logistic
            $table->text('address')->nullable(); // for member/logistic/customer
            $table->string('province')->nullable(); // for customer
            $table->string('barangay')->nullable(); // for customer
            $table->string('city')->nullable(); // for customer
            $table->date('registration_date')->nullable(); // for member/logistic
            $table->string('document')->nullable(); // for member
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
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