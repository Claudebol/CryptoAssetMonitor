<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
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
    'theme',
    'value_type',
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

  public function owner()
  {
    return $this->belongsTo('App\Models\Subscriber', 'subscriber_id', 'id');
  }
}
