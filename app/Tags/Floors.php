<?php
namespace App\Tags;
use Statamic\Tags\Tags;

class Floors extends Tags
{
  public function index()
  {
  }

  public function get()
  {
    $floors = [
      0 => 'EG',
      1 => '1. OG',
      2 => '2. OG',
      3 => '3. OG',
      4 => '4. OG',
      5 => 'Attika'];
    return $floors[$this->params->get('floor')] ?? '';
  }
}
