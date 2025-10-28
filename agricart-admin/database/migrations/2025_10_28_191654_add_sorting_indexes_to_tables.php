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
        // Add indexes for users table (staff and members)
        Schema::table('users', function (Blueprint $table) {
            $table->index(['type', 'created_at'], 'users_type_created_at_index');
            $table->index(['type', 'name'], 'users_type_name_index');
            $table->index(['type', 'email'], 'users_type_email_index');
            $table->index(['type', 'active'], 'users_type_active_index');
        });

        // Add indexes for products table
        Schema::table('products', function (Blueprint $table) {
            $table->index(['name'], 'products_name_index');
            $table->index(['produce_type'], 'products_produce_type_index');
            $table->index(['price_kilo'], 'products_price_kilo_index');
            $table->index(['price_pc'], 'products_price_pc_index');
            $table->index(['price_tali'], 'products_price_tali_index');
            $table->index(['created_at'], 'products_created_at_index');
            $table->index(['archived_at'], 'products_archived_at_index');
        });

        // Add indexes for stocks table
        Schema::table('stocks', function (Blueprint $table) {
            $table->index(['product_id', 'created_at'], 'stocks_product_created_index');
            $table->index(['member_id', 'created_at'], 'stocks_member_created_index');
            $table->index(['category'], 'stocks_category_index');
            $table->index(['quantity'], 'stocks_quantity_index');
            $table->index(['sold_quantity'], 'stocks_sold_quantity_index');
            $table->index(['removed_at'], 'stocks_removed_at_index');
            $table->index(['created_at'], 'stocks_created_at_index');
            $table->index(['updated_at'], 'stocks_updated_at_index');
        });

        // Add indexes for orders table (if exists)
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['member_id', 'created_at'], 'orders_member_created_index');
                $table->index(['status'], 'orders_status_index');
                $table->index(['delivery_status'], 'orders_delivery_status_index');
                $table->index(['is_urgent'], 'orders_is_urgent_index');
                $table->index(['total_amount'], 'orders_total_amount_index');
                $table->index(['created_at'], 'orders_created_at_index');
                $table->index(['delivery_date'], 'orders_delivery_date_index');
            });
        }

        // Add indexes for logistics table (if exists)
        if (Schema::hasTable('logistics')) {
            Schema::table('logistics', function (Blueprint $table) {
                $table->index(['name'], 'logistics_name_index');
                $table->index(['email'], 'logistics_email_index');
                $table->index(['vehicle_type'], 'logistics_vehicle_type_index');
                $table->index(['active'], 'logistics_active_index');
                $table->index(['created_at'], 'logistics_created_at_index');
            });
        }

        // Add indexes for user_addresses table (for address sorting)
        if (Schema::hasTable('user_addresses')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->index(['user_id', 'is_active'], 'user_addresses_user_active_index');
                $table->index(['city'], 'user_addresses_city_index');
                $table->index(['province'], 'user_addresses_province_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes for users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_type_created_at_index');
            $table->dropIndex('users_type_name_index');
            $table->dropIndex('users_type_email_index');
            $table->dropIndex('users_type_active_index');
        });

        // Drop indexes for products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_name_index');
            $table->dropIndex('products_produce_type_index');
            $table->dropIndex('products_price_kilo_index');
            $table->dropIndex('products_price_pc_index');
            $table->dropIndex('products_price_tali_index');
            $table->dropIndex('products_created_at_index');
            $table->dropIndex('products_archived_at_index');
        });

        // Drop indexes for stocks table
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropIndex('stocks_product_created_index');
            $table->dropIndex('stocks_member_created_index');
            $table->dropIndex('stocks_category_index');
            $table->dropIndex('stocks_quantity_index');
            $table->dropIndex('stocks_sold_quantity_index');
            $table->dropIndex('stocks_removed_at_index');
            $table->dropIndex('stocks_created_at_index');
            $table->dropIndex('stocks_updated_at_index');
        });

        // Drop indexes for orders table (if exists)
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_member_created_index');
                $table->dropIndex('orders_status_index');
                $table->dropIndex('orders_delivery_status_index');
                $table->dropIndex('orders_is_urgent_index');
                $table->dropIndex('orders_total_amount_index');
                $table->dropIndex('orders_created_at_index');
                $table->dropIndex('orders_delivery_date_index');
            });
        }

        // Drop indexes for logistics table (if exists)
        if (Schema::hasTable('logistics')) {
            Schema::table('logistics', function (Blueprint $table) {
                $table->dropIndex('logistics_name_index');
                $table->dropIndex('logistics_email_index');
                $table->dropIndex('logistics_vehicle_type_index');
                $table->dropIndex('logistics_active_index');
                $table->dropIndex('logistics_created_at_index');
            });
        }

        // Drop indexes for user_addresses table
        if (Schema::hasTable('user_addresses')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->dropIndex('user_addresses_user_active_index');
                $table->dropIndex('user_addresses_city_index');
                $table->dropIndex('user_addresses_province_index');
            });
        }
    }
};