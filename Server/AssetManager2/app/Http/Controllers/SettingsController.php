<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Settings;
use Validator;

class SettingsController extends Controller
{
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
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
      return response(Settings::find($id));
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
      $settings = Settings::find($id);
      if($request->has('name'))
        $settings->name = $request->input('name');
      if($request->has('value_type'))
        $settings->value_type = $request->input('value_type');

      return response($settings->save());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $destroy = Settings::destroy($id);
        return response($destroy === 1); //True if successfully deleted
    }
}
