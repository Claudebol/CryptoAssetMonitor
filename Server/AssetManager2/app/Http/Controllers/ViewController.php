<?php

namespace App\Http\Controllers;

class ViewController extends Controller
{
    public function home()
    {
      return view('welcome');
    }

    public function popup()
    {
      return view('welcome');
    }

    public function form()
    {
      return view('test');
    }
}
