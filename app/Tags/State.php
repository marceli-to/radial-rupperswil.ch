<?php
namespace App\Tags;
use Statamic\Tags\Tags;

class State extends Tags
{
  public function index()
  {
    
  }

  public function available()
  {
    if (($this->params->get('state') == 'pre' || $this->params->get('state') == 'act' || $this->params->get('state') == 'dis') && $this->params->get('reserved') == false)
    {
      return true;
    }
    return false;
  }

  public function get()
  {
    if ($this->params->get('state') == 'pre' || $this->params->get('state') == 'act' || $this->params->get('state') == 'dis')
    {
      if ($this->params->get('reserved') == false)
      {
        return $this->params->get('key') ? 'free' : 'frei';
      }
      else
      {
        return $this->params->get('key') ? 'reserved' : 'reserviert';
      }
    }

    if ($this->params->get('state') == 'arc' || $this->params->get('state') == 'rem')
    {
      return $this->params->get('key') ? 'taken' : 'vermietet';
    }
  }
}
