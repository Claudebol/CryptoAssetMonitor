<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Settings;
use Validator;

class SettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
      return response(Settings::where('subscriber_id','=',Auth::id())->first());
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
          'theme' => 'required',
          'value_type' => 'required',
        ]);
        if($validator->fails())
          return response($validator->failed());

        $settings = Settings::create([
          'theme' => $request->input('theme'),
          'value_type' => $request->input('value_type'),
          'subscriber_id' => Auth::id(),
        ]);

        return response($settings->id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
      $settings = Settings::where('subscriber_id','=',Auth::id())->first();
      if($request->has('name'))
        $settings->name = $request->input('name');
      if($request->has('value_type'))
        $settings->value_type = $request->input('value_type');

      return response($settings->save());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy()
    {
        $destroy = Settings::where('subscriber_id','=',Auth::id())->delete();
        return response($destroy === 1); //True if successfully deleted
    }
}
