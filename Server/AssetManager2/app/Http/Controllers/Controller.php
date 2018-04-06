<?php
/**
 * Created by PhpStorm.
 * User: Sammy
 * Date: 4/5/2018
 * Time: 11:45 PM
 */
namespace App\Http\Controllers;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
class Controller extends BaseController
{
  use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}