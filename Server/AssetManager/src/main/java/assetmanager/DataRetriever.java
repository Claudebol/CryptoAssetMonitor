package assetmanager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import org.json.JSONArray;
import org.json.JSONObject;

public class DataRetriever {
  
  private static final DataRetriever instance = new DataRetriever();
  private JSONObject cryptoCompare;
  private HashMap<String, JSONObject> values;
  private ArrayList<String> symbols;
  private int symbolsIndex;
  private boolean dataReady;
  
  public static DataRetriever getInstance() {
    if(instance.values == null) {
      instance.values = new HashMap<String, JSONObject>();
      instance.init();
    }
    return instance;
  }
  
  private void init() {
    System.out.println("Initializing...");
    instance.dataReady = false;
    instance.symbols = new ArrayList<String>();
    instance.cryptoCompare = new JSONObject();
    instance.symbolsIndex = 0;
    instance.loadCoinsFromCrytoCompare();
    instance.startPolling();
  }
  
  private void startPolling() {
    new Thread(new Runnable() {
      @Override
      public void run() {
        boolean valid = true;
        long elapsed = 0; //Keep track of the elapsed time. Coins refresh after 24 hours.
        long sleep = 10000 / instance.symbols.size(); //New prices 'Cached each 10 seconds' according to CryptoCompare API. So we don't need to request as frequently.
        
        while(valid) {
          try {
            instance.retrieveCryptoCompareData();
            Thread.sleep(sleep);
            elapsed += sleep;
            if(elapsed >= 24*60*60*1000) valid = false; //Refresh the coins every 24 hours to add any coins that have been added to CryptoCompare

          } catch (InterruptedException | IOException e) {
            valid = false;
            e.printStackTrace();
          }
        }
        instance.init();
      }
    }).start();
  }
  
  private String visitUrl(String urlstr) throws IOException{
    String res = "";

    URL url = new URL(urlstr);
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestProperty("User-Agent","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; de; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13");
    con.connect();
    BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
    String line;
    while((line = in.readLine()) != null) {
      res += line.trim();
    }
    return res;
  }
  
  public void loadCoinsFromWorldCoinIndex() {
    ArrayList<String> altSearch = new ArrayList<String>();
    HashMap<String, String> labelToSymbol = new HashMap<String,String>();
    
    String str = "https://www.worldcoinindex.com/apiservice/getmarkets?key=EIEvtUtrHbBQlHVi6PIkpngxOZzW6e&fiat=usd";
    try {
        String results = visitUrl(str);
        if(!results.startsWith("{") && !results.endsWith("}")) return;
        JSONObject job = new JSONObject(results);
        
        if(!job.has("Markets")) return;
        
        JSONArray jar = job.getJSONArray("Markets");
        JSONArray marketUSD = jar.getJSONArray(0);
        MyModel m = new MyModel();
        m.connect();
        for(int i=0; i < marketUSD.length(); i++) {
          JSONObject coin = marketUSD.getJSONObject(i);
          String symbol = m.getSymbolByName(coin.getString("Name"), false);
          
          if(symbol != null && instance.values.containsKey(symbol)) {
            if(instance.values.get(symbol).getDouble("Price_USD") == 0.0) {
              labelToSymbol.put(coin.getString("Label"), symbol);
              altSearch.add(coin.getString("Label").replace("/", "").toLowerCase());
              instance.values.get(symbol).put("Price_USD", coin.getDouble("Price"));
            }
          }
        }
        m.disconnect();
        instance.fulfillAltSearch(labelToSymbol, altSearch);
    }
    catch(IOException e) {
      e.printStackTrace();
    }
  }
  
  public void fulfillAltSearch(final HashMap<String, String> labelToSymbol, ArrayList<String> altSearch) {
    System.out.println(altSearch.size());
    String symbs = "";
    for(String symb : altSearch) {
      if(!symbs.isEmpty()) symbs += "-";
      symbs += symb;
    }
    final String str = "https://www.worldcoinindex.com/apiservice/ticker?key=EIEvtUtrHbBQlHVi6PIkpngxOZzW6e&label=" + symbs + "&fiat=usd";
    new Thread(new Runnable() {
      @Override
      public void run() {
        boolean valid = true;
        while(valid) {
          try {
            pollFromWorldCoinIndex(str, labelToSymbol);
            Thread.sleep(1000 * 60 * 5); //According to WorldCoinIndex API, 'The data will be updated every 5 minutes'. So no need to poll any more often than that.
          } catch (InterruptedException e) {
            e.printStackTrace();
            valid = false;
          } 
        }
      }
      
    }).start();
  }
  
  private void pollFromWorldCoinIndex(String urlstr, HashMap<String, String> labelToSymbol) { 
    try {
       String results = visitUrl(urlstr);
        if(!results.startsWith("{") && !results.endsWith("}")) return;
        JSONObject job = new JSONObject(results);

        if(!job.has("Markets")) return;

        JSONArray marketUSD = job.getJSONArray("Markets");
        for(int i=0; i < marketUSD.length(); i++) {
          JSONObject coin = marketUSD.getJSONObject(i);
          String symbol = labelToSymbol.get(coin.getString("Label"));
          instance.values.get(symbol).put("Price_USD", coin.getDouble("Price"));
        }
    }
    catch(IOException e) {
      e.printStackTrace();
    }
  }
  
  
  public void loadCoinsFromCrytoCompare() {
    String str = "https://min-api.cryptocompare.com/data/all/coinlist";

    try {
      String results = visitUrl(str);
      if(!results.startsWith("{") && !results.endsWith("}")) return;
      JSONObject job = new JSONObject(results);
      
      if(!job.getString("Response").equalsIgnoreCase("Success")) return;
     
      instance.cryptoCompare.put("BaseImageUrl", job.getString("BaseImageUrl"));
      instance.cryptoCompare.put("BaseLinkUrl", job.getString("BaseLinkUrl"));
      
      MyModel m = new MyModel();
      m.connect();
      
      HashSet<String> currentSymbols = m.getCurrentSymbols(false);
      
      int maxlen = 299;
      int i = 0;
      instance.symbols.add("");
      JSONObject data = job.getJSONObject("Data");
      for(String key : data.keySet()) {
        JSONObject out = loadCoinFromCryptoCompare(data.getJSONObject(key)); //Extract the data from each JSONObject. Each represents a coin
        String symbol = out.getString("Symbol");
        //If the symbol for this coin was NOT in database, add it.
        if(!currentSymbols.contains(symbol)) m.addCurrency(symbol, out.getString("Name"), out.getString("DisplayName"), out.getInt("InternalID"), false);
        instance.values.put(symbol, out);
        
        if(instance.symbols.get(i).length() >= maxlen - symbol.length()) {
          instance.symbols.add("");
          i++;
        }
        
        String cur = instance.symbols.get(i); 
        if(!cur.isEmpty()) cur += ",";
        instance.symbols.set(i, cur + symbol);
      }
      System.out.println("Data retrieved: " + instance.symbols.size());
      m.disconnect();
    }
    catch(IOException e) {
      e.printStackTrace();
    }
  }
  
  private JSONObject loadCoinFromCryptoCompare(JSONObject fromCryptoCompare) {
    JSONObject out = new JSONObject();
    out.put("InternalID", fromCryptoCompare.getInt("Id"));
    out.put("Url", fromCryptoCompare.getString("Url"));
    if(!fromCryptoCompare.has("ImageUrl")) out.put("ImageUrl", "/media/20545/default-logo.png"); //Default image... not very pretty but oh well...
    else  out.put("ImageUrl", fromCryptoCompare.getString("ImageUrl"));
    
    out.put("Symbol", fromCryptoCompare.getString("Name"));
    out.put("Name", fromCryptoCompare.getString("CoinName"));
    out.put("DisplayName", fromCryptoCompare.getString("FullName"));  
    return out;
  }

  public synchronized void retrieveCryptoCompareData() throws IOException {
    String symbols = instance.symbols.get(instance.symbolsIndex);
    String str = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + symbols + "&tsyms=USD";
    
    String results = visitUrl(str);
    
    if(!results.startsWith("{") || !results.endsWith("}"))  return;
    JSONObject job = new JSONObject(results);
    
    if(job.has("Response")) {
      System.out.println(job.getString("Message"));
      return;
    }
    HashSet<Integer> toRemove = new HashSet<Integer>();
    String[] symbs = symbols.split(",");
    for(int i=0; i < symbs.length; i++) {
      if(!job.has(symbs[i])) {
        toRemove.add(i);
        instance.values.get(symbs[i]).put("Price_USD", 0.0);
      }
      else { 
        JSONObject elem = job.getJSONObject(symbs[i]);

        instance.values.get(symbs[i]).put("Price_USD", elem.getDouble("USD"));
      }
    }
    if(!toRemove.isEmpty()) {
      String replace = "";
      for(int i=0; i < symbs.length; i++) {
        if(!toRemove.contains(i)) {
          if(!replace.isEmpty()) replace += ",";
          replace += symbs[i];
        }
      }
      instance.symbols.set(instance.symbolsIndex, replace);
    }
    instance.symbolsIndex++;
    if(!instance.dataReady && instance.symbolsIndex == instance.symbols.size()) {
      instance.dataReady = true;
      instance.loadCoinsFromWorldCoinIndex();
    }
    instance.symbolsIndex %= instance.symbols.size();
    
  }
  
  public JSONArray getPricesUsd(JSONArray symbols) {
    JSONArray jar = new JSONArray();
    if(!instance.dataReady) return jar;
    for(int i=0; i < symbols.length(); i++) {
     JSONObject job = new JSONObject();
     Double value = instance.getPriceUsd(symbols.getString(i));
     job.put("Symbol", symbols.getString(i));
     job.put("Price", value);
     jar.put(job);
    }
    return jar;
  }
  
  
  public Double getPriceUsd(String symbol) {
    return instance.values.containsKey(symbol) ? (instance.values.get(symbol).has("Price_USD") ? instance.values.get(symbol).getDouble("Price_USD") : 0.0) : 0.0;
  }
  
  public boolean isReady() {
    return instance.dataReady;
  }
  
  public String getImageUrl(String symbol) {
    return cryptoCompare.getString("BaseImageUrl") + instance.values.get(symbol).getString("ImageUrl");
  }
}
