<?php
namespace App\Tags;
use Statamic\Tags\Tags;
use Statamic\Facades\Entry;

class Apartments extends Tags
{
  protected $floorOrder = [
    'EG' => 0,
    '1. OG' => 1,
    '2. OG' => 2,
    '3. OG' => 3,
    '4. OG' => 4,
    'Attika' => 5,
  ];

  public function index()
  {
  }

  public function get()
  {
    // Get apartments from collection (respects manual order)
    $entries = Entry::query()
      ->where('collection', 'apartments')
      ->orderBy('order')
      ->get();

    // Transform to expected format
    $data = $entries->map(function ($entry) {
      $number = $entry->get('number');
      $floor = $entry->get('floor');
      $state = $entry->get('state') ?? 'available';

      // Map state to status/reserved for frontend compatibility
      $statusMap = [
        'available' => ['status' => 'act', 'reserved' => false],
        'reserved' => ['status' => 'act', 'reserved' => true],
        'taken' => ['status' => 'arc', 'reserved' => false],
      ];
      $stateData = $statusMap[$state] ?? $statusMap['available'];

      return [
        'ref_house' => '01',
        'ref_object' => $number,
        'floor' => $this->floorOrder[$floor] ?? 0,
        'floor_label' => $floor,
        'number_of_rooms' => $entry->get('rooms'),
        'surface_living' => $entry->get('area'),
        'rent_net' => $entry->get('rent_net'),
        'additional_costs' => $entry->get('additional_costs'),
        'rent_gross' => $entry->get('rent_gross'),
        'status' => $stateData['status'],
        'reserved' => $stateData['reserved'],
        'short_url' => '',
        'object_category' => 'APARTMENT',
      ];
    });

    // Group apartments by building
    $apartments = $data->groupBy(function ($item, $key) {
      return 'building_1';
    });

    // Addresses
    $addresses = [
      'building_1' => 'Radial Rupperswil 1/3',
    ];

    $reference_date = [
      'building_1' => '1. Dezember 2024',
    ];

    return [
      'apartments' => $apartments,
      'addresses' => $addresses,
      'reference_date' => $reference_date,
    ];
  }
}
