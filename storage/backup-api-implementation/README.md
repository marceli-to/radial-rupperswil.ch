# Switching Between Collection and API Implementation

This directory contains backup files for the original Flatfox API implementation.
The current setup uses a Statamic collection for apartment data.

## Current Implementation: Statamic Collection

Apartments are stored in `content/collections/apartments/` and can be managed via the Statamic control panel.

## Switch to API Implementation

To restore the Flatfox API integration:

```bash
# 1. Copy the original files back
cp storage/backup-api-implementation/Apartments.php app/Tags/Apartments.php
cp storage/backup-api-implementation/Floors.php app/Tags/Floors.php
cp storage/backup-api-implementation/GetData.php app/Actions/GetData.php
cp storage/backup-api-implementation/FetchData.php app/Actions/FetchData.php

# 2. Clear caches
php artisan cache:clear
php artisan statamic:stache:refresh
```

Make sure `FLATFOX_API_URI` is set in your `.env` file.

## Switch Back to Collection Implementation

To use the Statamic collection again:

```bash
# 1. Copy the collection-based files (create backups first if needed)
# The collection implementation is in app/Tags/Apartments.php (current)

# 2. Clear caches
php artisan cache:clear
php artisan statamic:stache:refresh
```

## Files Overview

| File | Purpose |
|------|---------|
| `Apartments.php` | Original tag that fetches from Flatfox API |
| `Floors.php` | Original floors tag (without EG support) |
| `GetData.php` | Processes API data, handles caching and status |
| `FetchData.php` | Fetches data from Flatfox API |

## Collection Fields

The Statamic collection uses these fields:
- `number` - Apartment number (e.g., "0001")
- `floor` - Floor label (e.g., "EG", "1. OG")
- `rooms` - Number of rooms (e.g., "3.5")
- `area` - Living area in m²
- `price` - Monthly rent in CHF
