<?php
namespace App\Actions;
use Illuminate\Support\Facades\Storage;

class FetchData
{
  public function execute(): string
  {
    $api_uri = env('FLATFOX_API_URI');
    $data = $this->get($api_uri);
    $json_data = collect(json_decode($data, true));
    $apartment_pages[] = isset($json_data['results']) ? $json_data['results'] : [];

    // if $json_data['next'] is not null, there are more pages to fetch
    while ($json_data['next'] !== null)
    {
      $data = $this->get($json_data['next']);
      $json_data = collect(json_decode($data, true));
      $apartment_pages[] = isset($json_data['results']) ? $json_data['results'] : [];
    }

    // merge all pages into one array
    $apartments = collect($apartment_pages)->flatten(1);

    // save the data to a file
    Storage::disk('public')->put('apartements.json', $apartments);

    return $apartments;
  }

  protected function get($uri): string
  {
    return file_get_contents($uri);
  }
}