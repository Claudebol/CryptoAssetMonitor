package test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashSet;

import org.json.JSONArray;
import org.json.JSONObject;

import assetmanager.DataRetriever;
import assetmanager.MyModel;

public class Test {

  public static void main(String[] args) {
  // DataRetriever dr = DataRetriever.getInstance();
   
    System.out.println( new MyModel().getSymbolByName("Aelf", true));
//   
//   
//   JSONArray symbols = new JSONArray();
//   
//   symbols.put("BTC");
//   symbols.put("ADA");
//   symbols.put("ICE");
//   
//   for(int i=0; i < 100; i++) {
//     try {
//      System.out.println(dr.getPricesUsd(symbols));
//      Thread.sleep(2000);
//    } catch (InterruptedException e) {
//      e.printStackTrace();
//    }
//   }
    
    //MyModel m = new MyModel();
   
//   for(int i=0; i < 10; i++) {
//   
//     try {
//       dr.retrieveData();
//      Thread.sleep(11000);
//    } catch (InterruptedException e) {
//      e.printStackTrace();
//    }
//   }
//   System.out.println(dr.getPriceUsd("BTC"));
//   System.out.println(dr.getPriceUsd("LTC"));
//   System.out.println(dr.getPriceUsd("MIOTA"));
//   System.out.println(dr.getPriceUsd("TFL"));
//   System.out.println(dr.getPriceUsd("ICE"));
//   System.out.println(dr.getPriceUsd("XMR"));
//   System.out.println(dr.getPriceUsd("ADA"));
//   System.out.println(dr.getPriceUsd("SALT"));
    


    
    
    
  }
  

}
