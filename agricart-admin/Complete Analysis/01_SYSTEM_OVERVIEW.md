# System Overview and Purpose

## Project Information
- **Name**: AgriCart Admin Panel
- **Version**: 1.0.0
- **Type**: Agricultural Marketplace Management System
- **License**: MIT
- **Last Updated**: January 15, 2025

## Purpose
AgriCart is a comprehensive agricultural marketplace management system designed to connect farmers (members) with customers through a cooperative model. The system facilitates:

1. **Product Management**: Inventory tracking for agricultural products
2. **Order Processing**: Complete order lifecycle from placement to delivery
3. **Member Management**: Farmer/producer membership and earnings tracking
4. **Logistics Coordination**: Delivery assignment and tracking
5. **Financial Management**: Revenue sharing between cooperative and members
6. **Customer Experience**: Shopping cart, order history, and product browsing

## System Architecture
- **Backend**: Laravel 12.0 (PHP 8.2+)
- **Frontend**: React 19.0 with Inertia.js 2.0
- **Database**: SQLite (development) / MySQL/PostgreSQL (production capable)
- **Authentication**: Laravel's built-in authentication with Spatie Permissions
- **UI Framework**: Tailwind CSS 4.0 with Radix UI components

## Key Features
1. **Multi-Role System**: Admin, Staff, Customer, Logistic, Member
2. **Real-time Notifications**: Role-based notification system
3. **Inventory Management**: Product, stock, and archive management
4. **Order Management**: Complete order workflow with status tracking
5. **Sales Analytics**: Comprehensive reporting and trend analysis
6. **Member Earnings**: Automatic calculation and tracking
7. **Delivery Tracking**: Proof of delivery with image uploads
8. **Multi-language Support**: English and Tagalog (Filipino)
9. **Theme Support**: Light, dark, and system themes
10. **Security Features**: Brute force protection, single session enforcement, OTP verification

## Business Model
- **Revenue Sharing**: 
  - Members receive 100% of product sale price
  - Cooperative adds 10% service fee on top (paid by customer)
  - Example: ₱100 product → Customer pays ₱110 (₱100 to member, ₱10 to coop)

## Target Users
1. **Administrators**: System management and oversight
2. **Staff Members**: Day-to-day operations support
3. **Customers**: End-users purchasing agricultural products
4. **Logistics Personnel**: Delivery and distribution
5. **Members (Farmers)**: Product suppliers and cooperative members

## System Timezone
- **Default**: Asia/Manila (Philippine Time)
- **Locale**: English (en) with Tagalog (tl) support
