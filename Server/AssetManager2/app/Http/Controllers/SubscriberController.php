<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscriber;
use Illuminate\Support\Facades\Hash;
use Validator;
use Auth;

class SubscriberController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response(Subscriber::all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
      $validator = Validator::make($request->all(), [
        'email' => 'required|string|email|max:255',
        'password' => 'required|string',
      ]);
      if($validator->fails())
        return response($validator->failed());

      $subscriber = Subscriber::create([
        'email' => $request->input('email'),
        'password' => Hash::make($request->input('password')),
      ]);

      return response($subscriber->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
      return response(Subscriber::find($id));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $subscriber = Subscriber::find($id);

        if($request->has('email'))
          $subscriber->email = $request->input('email');
        if($request->has('password'))
          $subscriber->password = Hash::make($request->input('password'));

        return response($subscriber->save());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
      $destroy = Subscriber::destroy($id);
      return response($destroy === 1); //True if successfully deleted.
    }
}
