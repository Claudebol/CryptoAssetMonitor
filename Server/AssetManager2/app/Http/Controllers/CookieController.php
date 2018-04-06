<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cookie;
use Validator;

class CookieController extends Controller
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
        'code' => 'required',
      ]);
      if($validator->fails())
        return response($validator->failed());
      $cookie = Cookie::create([
        'code' => $request->input('code'),
        'subscriber_id' => Auth::id(),
      ]);
      return response($cookie->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return response(Cookie::find($id));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $destroy = Cookie::destroy($id);
        return response($destroy === 1); //True if successful.
    }
}
