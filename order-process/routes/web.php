<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('order_landing');
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'order-process']);
});
