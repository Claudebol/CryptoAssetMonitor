<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
  /**
   * The attributes that are NOT mass assignable.
   *
   * @var array
   */
  protected $guarded = [
    'id',
  ];

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'symbol',
    'name',
    'internal_id',
    'display_name',
  ];

  public function subscriptions()
  {
    return $this->belongsTo('App\Models\Subscription', 'id', 'currency_id');
  }
}
