<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
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
    'symbol',
    'name',
    'internal_id',
    'display_name',
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

  public function subscriptions()
  {
    return $this->belongsTo('App\Models\Subscription', 'id', 'currency_id');
  }
}
