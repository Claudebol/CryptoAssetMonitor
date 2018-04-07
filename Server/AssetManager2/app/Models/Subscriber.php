<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Subscriber extends Authenticatable
{
  use Notifiable;

  /**
   * The connection name for the model.
   *
   * @var string
   */
  protected $connection = 'popup';

  protected $primaryKey = "id";

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
    'email',
    'password'
  ];
  /**
   * The attributes that should be hidden for arrays.
   *
   * @var array
   */
  protected $hidden = [
    'password',
    'remember_token',
    'created_at',
    'updated_at',
  ];

  public function settings()
  {
    return $this->hasOne('App\Models\Settings');
  }

  public function subscriptions()
  {
    return $this->hasMany('App\Models\Subscription');
  }


}
