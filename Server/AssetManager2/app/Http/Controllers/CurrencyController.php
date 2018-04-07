<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Currency;
use Validator;
use DB;

class CurrencyController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    return response(Currency::all());
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
            'symbol' => 'required',
            'name' => 'required',
            'internal_id' => 'required',
            'display_name' => 'required',
    ]);
    if($validator->fails())
      return response($validator->failed());

    $currency = Currency::create([
            'symbol' => $request->input('symbol'),
            'name' => $request->input('name'),
            'internal_id' => $request->input('internal_id'),
            'display_name' => $request->input('display_name'),
    ]);

    return response($currency->id);
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    return response(Currency::find($id));
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
    $currency = Currency::find($id);
    if($request->has('display_name'))
      $currency->name = $request->input('display_name');
    if($request->has('name'))
      $currency->name = $request->input('name');
    if($request->has('symbol'))
      $currency->value_type = $request->input('symbol');
    if($request->has('internal_id'))
      $currency->name = $request->input('internal_id');

    return response($currency->save());
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function destroy($id)
  {
    $destroy = Currency::destroy($id);
    return response($destroy === 1); //True if successfully destroyed
  }

  public function match($word)
  {
    $word = '+'.$word.'*';
    $match = Currency::whereRaw("MATCH (Symbol,Name) AGAINST (? IN BOOLEAN MODE)", [$word])
            ->orderByRaw(DB::raw('LENGTH(Name)'))
            ->limit(10)
            ->get();
    return response($match);
  }
}
