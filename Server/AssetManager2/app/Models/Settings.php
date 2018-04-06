<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
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
    'theme',
    'value_type',
  ];

  public function owner()
  {
    return $this->belongsTo('App\Models\Subscriber', 'subscriber_id', 'id');
  }
}
