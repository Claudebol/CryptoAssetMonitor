<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/form', function(){
  return view('test');
});

Route::resources([
  'cookie' => 'CookieController',
  'currency' => 'CurrencyController',
  'settings' => 'SettingsController',
  'subscriber' => 'SubscriberController',
  'subscription' => 'SubscriptionController',
]);

Route::post('/login', function(Request $request){

  //echo \App\Models\Subscriber::find(37)->
  if (Auth::attempt(array('email' => $request->input('email'), 'password' => $request->input('password')), true)){
    Session::save();
    return response(Auth::User());
  }else{
    return response(App\Models\Subscriber::where('email', $request->input('email'))->get() );
  }
  return response('error');


});