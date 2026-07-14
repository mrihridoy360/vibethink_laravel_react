<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->integer('money_back_days')->nullable()->default(0)->after('is_published');
            $table->boolean('lifetime_access')->default(false)->after('money_back_days');
        });
    }

    public function down()
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['money_back_days', 'lifetime_access']);
        });
    }
};
