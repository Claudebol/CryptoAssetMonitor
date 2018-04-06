<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use Validator;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response(Subscription::where('subscriber_id',Auth::id())->get());
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
        'subscriber_id' => 'required',
        'currency_id' => 'required',
        'balance' => 'required',
      ]);
      if($validator->fails())
        return response($validator->failed());

      $sub = Subscription::create([
        'subscriber_id' => $request->input('subscriber_id'),
        'currency_id' => $request->input('currency_id'),
        'balance' => $request->input('balance'),
      ]);
      return response($sub->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
      return response(Subscription::find($id));
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
        $sub = Subscription::find($id);
        if($request->has('subscriber_id'))
          $sub->subscriber_id = $request->input('subscriber_id');
        if($request->has('currency_id'))
          $sub->currency_id = $request->input('currency_id');
        if($request->has('balance'))
          $sub->balance = $request->input('balance');

        return response($sub->save());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $destroy = Subscription::destroy($id);
        return response($destroy === 1); //True if successfully deleted.
    }
}
