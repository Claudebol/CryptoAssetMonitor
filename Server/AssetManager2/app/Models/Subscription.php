<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
  /**
   * The connection name for the model.
   *
   * @var string
   */
  protected $connection = 'popup';
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
  /**
   * The attributes that should be hidden for arrays.
   *
   * @var array
   */
  protected $hidden = [
      'created_at',
      'updated_at',
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
