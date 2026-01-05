<?php
namespace App\Tags;
use App\Actions\GetData;
use Statamic\Tags\Tags;

class Apartments extends Tags
{
  public function index()
  {
  }

  public function get()
  {
    // get data from api or storage
    $data = (new GetData)->execute();

    // filter out items with "object_category":"APARTMENT"
    $data = collect($data)->filter(function ($item, $key) {
      return $item['object_category'] == 'APARTMENT';
    });

    // init array of apartments with buildings
    $apartments = ['building_1'];

    // group apartments by building
    $apartments = collect($data)->sortBy('floor')->groupBy(function ($item, $key) {
      $ref_house = substr($item['ref_house'], 0, 2);
      if (in_array($ref_house, ['01']))
      {
        return 'building_1';
      } 
    });

    // addresses
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
