<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
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
    'subscriber_id',
    'currency_id',
    'balance',
  ];

  public function subscriber()
  {
    return $this->belongsTo('App\Models\Subscriber');
  }

  public function currency()
  {
    return $this->hasOne('App\Models\Currency', 'id', 'currency_id');
  }
}
