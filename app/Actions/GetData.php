<?php
namespace App\Actions;
use App\Actions\FetchData;
use Illuminate\Support\Facades\Storage;

class GetData
{
  // All possible listing status
  protected $listing_status_all = ["pre", "act", "dis", "arc", "rem"];
  protected $listing_status_active = ["pre", "act", "dis"];
  protected $listing_status_removed = ["arc", "rem"];

  // Excluded references (Sammelinserate - collective listings, not individual apartments)
  protected $excluded_references = [
    '10100.99.9001',
    '10100.99.9002',
    '10100.99.9003',
  ];

  // Your final listing status
  protected $status_free = "free";
  protected $status_reserved = "reserved";
  protected $status_taken = "taken";

  public function execute(): \Illuminate\Support\Collection
  { 
    // if there is no file or the existing file is older than 60 minutes, fetch new data
    if (
      !Storage::disk('public')->exists('apartements.json') || 
      Storage::disk('public')->lastModified('apartements.json') < now()->subMinutes(60)->timestamp
    )
    {
      (new FetchData)->execute();
    }
    $data = Storage::disk('public')->get('apartements.json');
    $data = collect(json_decode($data, true));

    $states = $this->getState($data);
    $data = $data->map(function ($apartment) use ($states) {
      $apartment['state'] = $states[$apartment['reference']] ?? $this->status_free;
      return $apartment;
    });

    // it is possible that the same listing is in the list twice, so we need to remove duplicates
    // find duplicates and keep the one with the higher pk
    $data = $data->sortByDesc('pk')->unique('reference');
    $data = $data->sortBy('reference');

    // filter out excluded references (Sammelinserate)
    $data = $data->filter(function ($apartment) {
      return !in_array($apartment['reference'], $this->excluded_references);
    });

    return $data; 
  }

  private function getState($all_listings)
  {
    // Group status by listing reference (or id, if reference is missing)
    $listing_status = [];

    // first we handle all removed listings and set the status to rented
    $listing_status = $this->handleRemovedListings($all_listings, $listing_status);

    // then handle the active listings, set the status and if necessary overwrite it
    $listing_status = $this->handleActiveListings($all_listings, $listing_status);

    // Group listings by status
    $reserved_listings = [];
    $taken_listings = [];
    $free_listings = [];

    foreach ($listing_status as $listing_ref => $status)
    {
      if ($status == $this->status_reserved)
      {
        if (!in_array($listing_ref, $free_listings)) {
          $reserved_listings[] = $listing_ref;
        }
      }
      if ($status == $this->status_taken)
      {
        if (!in_array($listing_ref, $free_listings)) {
          $taken_listings[] = $listing_ref;
        }
      }
      if ($status == $this->status_free)
      {
        $free_listings[] = $listing_ref;
      }
    }

    $states = [];
    foreach ($all_listings as $listing)
    {
      $listing_ref = empty($listing["reference"]) ? $listing["pk"] : $listing["reference"];
      if (in_array($listing_ref, $reserved_listings))
      {
        if (!in_array($listing_ref, $free_listings)) {
          $states[$listing_ref] = $this->status_reserved;
        }
      } 
      elseif (in_array($listing_ref, $taken_listings))
      {
        if (!in_array($listing_ref, $free_listings)) {
          $states[$listing_ref] = $this->status_taken;
        }
      }
      else
      {
        $states[$listing_ref] = $this->status_free;
      }
    }

    return $states;
  }

  private function handleRemovedListings($all_listings, &$listing_status)
  {
    /*
    Go through all listings but ignores listings which are still active.
    All inactive listings will have a final status of "taken"
    */
    foreach ($all_listings as $listing) {
      if (in_array($listing["status"], $this->listing_status_active))
      {
        // skip listing if listing is active
        continue;
      }
      $listing_ref = empty($listing["reference"]) ? $listing["pk"] : $listing["reference"];
      $listing_status[$listing_ref] = $this->status_free;
    }
    return $listing_status;
  }

  private function handleActiveListings($all_listings, &$listing_status)
  {
    /*
    Go through all listings but ignores listings which are not active anymore.
    The final status will then be decided based on the "reserved" field of the listing.
    */

    foreach ($all_listings as $listing)
    {
      if (in_array($listing["status"], $this->listing_status_removed))
      {
        continue;
      }

      $listing_ref = empty($listing["reference"]) ? $listing["pk"] : $listing["reference"];

      // now identify the status of the listing based on the reserved label
      if ($listing["reserved"])
      {
        $listing_status[$listing_ref] = $this->status_reserved;
      }
      else
      {
        $listing_status[$listing_ref] = $this->status_free;
      }
    }

    return $listing_status;
  }
}