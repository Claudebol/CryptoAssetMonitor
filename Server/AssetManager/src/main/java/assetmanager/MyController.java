package assetmanager;

import java.util.HashMap;
import java.util.HashSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;


@Controller
public class MyController {
  final static HashSet<String> localimages = indicatelocalimages(); 
  final static DataRetriever dr = DataRetriever.getInstance(); //Get the data retriever instance going. 
  
  private static HashSet<String> indicatelocalimages(){
    HashSet<String> set = new HashSet<String>();
    //Indicate here which images are stored locally.
    //These are here in place of the images that lack a transparent background or are button images.
    set.add("1ST");
    set.add("ADST");
    set.add("BCH");
    set.add("BET*");
    set.add("BRD");
    set.add("BTC");
    set.add("COB");
    set.add("CPAY");
    set.add("DASH");
    set.add("ELF");
    set.add("ETH");
    set.add("ICE");
    set.add("KIN");
    set.add("LIFE");
    set.add("LTC");
    set.add("MBI");
    set.add("MNX");
    set.add("PIVX");
    set.add("SMLY");
    set.add("VIU");
    set.add("XEM");
    set.add("XNN");
    set.add("XRL");
    
    set.add("add-button");
    set.add("logout-button");
    set.add("delete-button");
    return set;    
  }
  
  @GetMapping("/Home")
  public ModelAndView home(HttpServletRequest req) { 
  
    HttpSession session = req.getSession(true);
    MyModel m = new MyModel();
    m.connect();
    String memo = m.getMemo(false);
    if(memo == null) memo = "";
    if(session.getAttribute("ID") == null)  {
      String code = req.getParameter("Code");
      int id = m.getUserID(code, false);
      if(code == null || code.equals("") || id == -1) return new ModelAndView("landing-page","error","Please login or sign up." + memo);

      session.setAttribute("ID", id);
      session.setAttribute("Code", code);
    }
    
    int subscriberID = (int) session.getAttribute("ID");

    HashMap<String, String> model = new HashMap<String, String>();
    model.put("settings", m.getSettings(subscriberID, false).toString());
    model.put("data", m.getSubscriptions(subscriberID, false).toString());
    m.disconnect();
    return new ModelAndView("asset-display",model);
  }
  
  @GetMapping("/Icon/{symbol}")
  public RedirectView getIcon(@PathVariable String symbol) {
    RedirectView rview = null;
    
    //Ideally save the image if not already in local storage. But that proves to be more difficult than it seems...
    if(localimages.contains(symbol)) {
      if(symbol.contains("*")) symbol = symbol.replace("*", "!");
      rview = new RedirectView("../images/icons/" + symbol + ".png");
    }
    else {
      rview = new RedirectView(DataRetriever.getInstance().getImageUrl(symbol));
    }
    return rview;
  }
  
  @PostMapping("/Login")
  @ResponseBody
  public String login(HttpServletRequest req) {
    String email = req.getParameter("email");
    String password = req.getParameter("password"); 
    if(email == null || email.isEmpty()) return "Must provide an 'email'.";
    if(password == null || password.isEmpty()) return "Must provide a 'password'.";
    MyModel m = new MyModel();
    m.connect();
    if(!m.inEmailForm(email)) return "Invalid email form. Must be xxx@xxx.xxx where x is alphanumeric.";
    
    JSONObject user = m.getUser(email, password, false);
    
    if(user.keySet().isEmpty()) return "Error, invalid credentials.";
    
    String code = m.generateUserCode();
    while(!m.addUserID(code, user.getInt("ID"), false)) {
      code = m.generateUserCode();
    }
    HttpSession session = req.getSession(true);
    //session.setAttribute("Email", user.getString("Email"));
    session.setAttribute("ID", user.getInt("ID"));
    session.setAttribute("Code", code);
    m.disconnect();
    
    return "Success:" + code;
  }
  
  @PostMapping("/Signup")
  @ResponseBody
  public String signup(HttpServletRequest req) {
    String email = req.getParameter("email");
    String password = req.getParameter("password");
    
    if(email == null || email.isEmpty()) return "Must provide a 'username'.";
    if(password == null || password.isEmpty()) return "Must provide a 'password'.";
    MyModel m = new MyModel();
    if(!m.inEmailForm(email)) return "Invalid email form. Must be xxx@xxx.xxx where x is alphanumeric.";
    if(!m.addNewUser(email, password, true)) return "Error, unable to add. Email may already be in use.";

    return "Success";
  }
  
  @GetMapping("/Logout")
  @ResponseBody
  public String signout(HttpServletRequest req) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Not logged in.";
    String code = (String) session.getAttribute("Code");
    new MyModel().removeID(code, true);
    session.invalidate();
    return "Success";
  }
  
  
  @GetMapping("/Match/{entry}")
  @ResponseBody
  public String matchEntry(@PathVariable String entry) {
    MyModel m = new MyModel();
    JSONArray jar = m.findMatches(entry, true);
    return jar.toString();
  }
  
  @PostMapping("/Subscriptions/Add/{symbol}")
  @ResponseBody
  public String addAsset(HttpServletRequest req, @PathVariable String symbol) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    String balance_param = req.getParameter("balance");
    if(balance_param == null) return "Must provide a balance.";
    double balance = Double.valueOf(balance_param);
    
    MyModel m = new MyModel();
    int subscriberID = (int) session.getAttribute("ID");
    
    if(!m.addSubscription(subscriberID, symbol, balance, true)) return "Could not add subscription.";
    
    return "Success";
  }
  
  @PutMapping("/Subscriptions/Update/{symbol}/{balance}")
  @ResponseBody
  public String modifyAsset(HttpServletRequest req, @PathVariable String symbol, @PathVariable String balance) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    MyModel m = new MyModel();
    int subscriberID = (int) session.getAttribute("ID");
    String b = balance.replace("-", ".");
    
    if(!m.updateSubscription(subscriberID, symbol, Double.valueOf(b), true)) return "Could not update subscription.";
    
    return "Success";
  }
  
  @GetMapping("/Subscriptions/")
  @ResponseBody
  public String getSubscriptions(HttpServletRequest req) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    int subscriberID = (int) session.getAttribute("ID");
    JSONArray jar = new MyModel().getSubscriptions(subscriberID, true);
    return jar.toString();
  }
  
  @GetMapping("/Subscriptions/Prices")
  @ResponseBody
  public String getSubscriptionPrices(HttpServletRequest req) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    
    String symbols = req.getParameter("symbols");
    if(symbols == null || symbols.isEmpty()) return "Must provide 'symbols' parameter.";
    
    JSONArray symbols_arr = new JSONArray(symbols);
    JSONArray jar = DataRetriever.getInstance().getPricesUsd(symbols_arr);
    return jar.toString();
  }
  
  @GetMapping("/Subscriptions/Prices/{symbol}")
  @ResponseBody
  public String getSubscriptionPrice(HttpServletRequest req, @PathVariable String symbol) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    
    Double price = DataRetriever.getInstance().getPriceUsd(symbol);
    if(price == null) price = 0.0;
    
    return "" + price;
  }
  
  @PutMapping("/Settings/{type}/{value}")
  @ResponseBody
  public String updateSetting(HttpServletRequest req, @PathVariable String type, @PathVariable String value) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    int subscriberID = (int) session.getAttribute("ID");
    if(!new MyModel().updateSetting(subscriberID, type, value, true)) return "Error, could not update " + type + " with value " + value;
    
    return "Success";
  }
  
  @DeleteMapping("/Subscriptions/{symbol}")
  @ResponseBody
  public String removeSubscription(HttpServletRequest req, @PathVariable String symbol) {
    HttpSession session = req.getSession(false);
    if(session == null) return "Must be logged in.";
    int subscriberID = (int) session.getAttribute("ID");
    if(!new MyModel().removeSubscription(subscriberID, symbol, true)) return "Error, could not remove subscription for '" + symbol + "'";
    
    return "Success";
  }
  
}
