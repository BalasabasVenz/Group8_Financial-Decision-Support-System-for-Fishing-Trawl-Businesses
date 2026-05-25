<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('password');
            $table->string('contact_number')->nullable()->after('avatar_path');
            $table->string('boat_name')->nullable()->after('contact_number');
            $table->string('position')->nullable()->after('boat_name');
            $table->string('address')->nullable()->after('position');
            $table->text('bio')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_path',
                'contact_number',
                'boat_name',
                'position',
                'address',
                'bio',
            ]);
        });
    }
};
