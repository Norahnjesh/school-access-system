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
        // Students table
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('admission_number', 50)->unique();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('grade_class', 50);
            $table->string('qr_code', 255)->unique();
            $table->boolean('is_active')->default(true);

            // Guardian information
            $table->string('guardian_name', 200)->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->string('guardian_email', 100)->nullable();

            // Service subscriptions
            $table->boolean('transport_enabled')->default(false);
            $table->boolean('lunch_enabled')->default(false);

            $table->timestamps();

            $table->index('admission_number');
            $table->index('qr_code');
            $table->index('is_active');
            $table->index(['grade_class', 'is_active']);
        });

        // Buses table
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number', 50)->unique();
            $table->string('bus_name', 100)->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->string('driver_name', 100)->nullable();
            $table->string('driver_phone', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('bus_number');
        });

        // Transport details table
        Schema::create('transport_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('bus_id')->constrained();
            $table->string('pickup_point', 255);
            $table->string('dropoff_point', 255);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('student_id');
        });

        // Lunch details table
        Schema::create('lunch_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('diet_type', ['normal', 'special'])->default('normal');
            $table->text('diet_notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('student_id');
        });

        // Transport attendance table
        Schema::create('transport_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained();
            $table->foreignId('bus_id')->constrained();
            $table->enum('scan_type', ['morning_pickup', 'evening_dropoff']);
            $table->timestamp('scanned_at')->useCurrent();
            $table->foreignId('scanned_by')->nullable()->constrained('users');
            $table->boolean('is_valid')->default(true);
            $table->string('alert_message', 255)->nullable();

            $table->index(['student_id', 'scanned_at']);
            $table->index(['bus_id', 'scanned_at']);
            $table->index('scanned_at');
        });

        // Lunch attendance table
        Schema::create('lunch_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained();
            $table->date('meal_date');
            $table->timestamp('scanned_at')->useCurrent();
            $table->foreignId('scanned_by')->nullable()->constrained('users');
            $table->enum('diet_type_served', ['normal', 'special'])->nullable();

            $table->index(['student_id', 'meal_date']);
            $table->index('meal_date');
            $table->unique(['student_id', 'meal_date']);
        });

        // Audit logs table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('action', 100);
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
        });

        // Import jobs table
        Schema::create('import_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('filename', 255);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('processed_rows')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('error_count')->default(0);
            $table->json('error_log')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });

        // Offline cache table
        Schema::create('offline_cache', function (Blueprint $table) {
            $table->id();
            $table->string('cache_key', 100)->unique();
            $table->json('cache_data');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('cache_key');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offline_cache');
        Schema::dropIfExists('import_jobs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('lunch_attendance');
        Schema::dropIfExists('transport_attendance');
        Schema::dropIfExists('lunch_details');
        Schema::dropIfExists('transport_details');
        Schema::dropIfExists('buses');
        Schema::dropIfExists('students');
    }
};