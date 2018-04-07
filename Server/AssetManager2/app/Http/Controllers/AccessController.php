<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Validator;
use App\Models\Subscription;

class AccessController extends Controller
{
    public function login(Request $request)
    {
      $validator = Validator::make($request->all(), [
        'email' => 'required|string|email|max:255',
        'password' => 'required|string',
      ]);
      if($validator->fails())
        return response($validator->failed());

      if (Auth::attempt(array('email' => $request->input('email'), 'password' => $request->input('password')), true)){
        return response(Subscription::where('subscriber_id',Auth::id())->with('currency')->get());
      }
      return response('Invalid Credentials');
    }

    public function logout()
    {
      Auth::logout();
      return redirect('/popup');
    }
}
