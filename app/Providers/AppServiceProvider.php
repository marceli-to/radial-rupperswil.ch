<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Statamic\Statamic;
use Statamic\Events\EntrySaved;
use Statamic\Events\EntryDeleted;
use Statamic\Facades\StaticCache;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // // Clear cache when apartments collection is modified
        // $clearCacheForApartments = function ($event) {
        //     if ($event->entry->collectionHandle() === 'apartments') {
        //         StaticCache::flush();
        //         Cache::flush();
        //     }
        // };

        // Event::listen(EntrySaved::class, $clearCacheForApartments);
        // Event::listen(EntryDeleted::class, $clearCacheForApartments);
    }
}
