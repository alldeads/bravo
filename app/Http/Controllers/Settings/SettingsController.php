<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Show the settings hub.
     */
    public function index(): Response
    {
        return Inertia::render('settings/index');
    }
}
