package assetmanager;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.PriorityQueue;
import java.util.Random;

import org.json.JSONArray;
import org.json.JSONObject;
/*
 * SERVER SIDE
 * Handle interaction with database
 * 
 */

public class MyModel{

		
	//The URL for the database and the credentials for the database
	private final String dbUrl    = buildDBUrl();
	private final String user     = System.getProperty("RDS_USERNAME");
	private final String password = System.getProperty("RDS_PASSWORD");
	
	private static final HashMap<String, String> matches = new HashMap<String, String>();
	
	private String buildDBUrl() {
	  String hostname = System.getProperty("RDS_HOSTNAME");
	  String port = System.getProperty("RDS_PORT");
	  String db = System.getProperty("RDS_DB_NAME");
	  return  "jdbc:mysql://" + hostname + ":" + port + "/" + db + "?useSSL=false";
	}
	
	//The connection to the database
	private Connection con1;

	/**
	 * Create a new DatabaseHandler.
	 * A server side handler that connects to the database and provides
	 * and smooth communication between the server, client and database.
	 */

	public void connect() {
		if(con1 == null) {
		// Load and register a JDBC driver
			try {
				// Load the driver (registers itself)
				Class.forName("com.mysql.jdbc.Driver");
			} 
			catch (Exception E) {
				System.err.println("Unable to load driver.");
				E.printStackTrace();
			}
			
			try {
				//Attempt to make the connection to the database using the provided URL and credentials
				con1 = DriverManager.getConnection(dbUrl, user, password);
				//Display in console indicating a successful connection to the database
				//System.out.println("*** Connected to the database ***");
				
			} catch (SQLException e) {
				e.printStackTrace();
			}	
		}
	}

		public void disconnect() {
			if(con1 != null) {
				try {
					con1.close();
					//System.out.println("*** Disconnected from the database ***");
				} catch (SQLException e) { 
					e.printStackTrace();
				}
				con1 = null;
			}
		}
		
		public String getMatch(String entry) {
		  return matches.get(entry);
		}
		
		public synchronized JSONArray findMatches(String entry, boolean connect) {
		  if(connect) connect();
		  String sql = "SELECT Name, Symbol FROM Currencies c WHERE MATCH (Symbol,Name) AGAINST ('+" + entry + "*' IN BOOLEAN MODE) ORDER BY LENGTH(Name) ASC LIMIT 10";
		  JSONArray jar = new JSONArray();
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
         while(rs.next()) {
           JSONObject job = new JSONObject();
           job.put("Name", rs.getString("Name"));
           job.put("Symbol", rs.getString("Symbol"));
           jar.put(job);
           
         }
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  
		  matches.put(entry, jar.toString()); 
		  if(connect) disconnect();
		  return jar;
		}
		
		public boolean addNewUser(String email, String password, boolean connect) {
		  if(connect) connect();
		  String sql = "SELECT Email FROM Subscribers WHERE Email = '" + email + "'";
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);  
        if(rs.next()) return false;
        sql = "INSERT INTO Subscribers (Email,Password) VALUES (AES_ENCRYPT('" + email + "',UNHEX(SHA2('" + email + password + email + "',512))),AES_ENCRYPT('" + password + "',UNHEX(SHA2('" + password + email + password + "',512))))";
        con1.createStatement().execute(sql);
        sql = "INSERT INTO Settings (Subscriber) VALUES ((SELECT ID FROM Subscribers WHERE Email = AES_ENCRYPT('" + email + "',UNHEX(SHA2('" + email + password + email + "',512)))))";
        con1.createStatement().execute(sql);
      } catch (SQLException e) {
        e.printStackTrace();
      }  
		  if(connect) disconnect();
		  return true;
		}
		
		public boolean validCredentials(String email, String password, boolean connect) {
		  if(connect) connect();
		  
		  String query = "SELECT ID FROM Subscribers WHERE Password=AES_ENCRYPT('" + password + "',UNHEX(SHA2('" + password + email + password + "',512)))";
		  try {
        ResultSet rs = con1.createStatement().executeQuery(query);
        if(rs.next()) return true;
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  return false;
		}
		
		public JSONObject getUser(String email, String password, boolean connect) {
		  JSONObject job = new JSONObject();
		  if(connect) connect();
		  
		  if(!validCredentials(email, password, false)) return job;
		  
		  String sql = "SELECT ID,Email FROM Subscribers WHERE Password=AES_ENCRYPT('" + password + "',UNHEX(SHA2('" + password + email + password + "',512)))";
		  
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        
        if(!rs.next()) return job;
        job.put("ID", rs.getInt("ID"));
        //job.put("Email", rs.getString("Email").trim());
        
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  
		  if(connect) disconnect();
		  return job;
		}
		
		public boolean isSubscribed(int subscriberID, int currencyID, boolean connect) {
		  if(connect) connect();
		  boolean res = false;
		  String sql = "SELECT * FROM Subscriptions WHERE Subscriber = " + subscriberID + " AND Currency = " + currencyID;
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        res = rs.next();
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  return res;
		}
	
		
		public boolean addSubscription(int subscriberID, String assetSymbol, double balance, boolean connect) {
		  if(connect) connect();
		  boolean success = false;
		  String sql = "SELECT ID FROM Currencies WHERE Symbol ='" + assetSymbol + "'";
		  
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        
        if(rs.next()) {
          int currencyID = rs.getInt("ID");
          if(!isSubscribed(subscriberID, currencyID, false)) {
            sql = "INSERT INTO Subscriptions (Subscriber,Currency,Balance) VALUES (" + subscriberID + "," + currencyID + "," + balance + ");";
            con1.createStatement().execute(sql);
            
            success = true;
          }
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  
		  return success;
		}
		
		public boolean removeSubscription(int subscriberID, String assetSymbol, boolean connect) {
		  if(connect) connect();
		  boolean success = true;
		  String sql = "DELETE FROM Subscriptions WHERE Subscriber = " + subscriberID + " AND Currency = (SELECT ID FROM Currencies WHERE Symbol = '" + assetSymbol + "')";
		  try {
        con1.createStatement().execute(sql);
      } catch (SQLException e) {
        success = false;
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  return success;
		}
		
		public boolean updateSubscription(int subscriberID, String assetSymbol, double balance, boolean connect) {
		  if(connect) connect();
		  boolean success = false;
		  
		  String sql = "UPDATE Subscriptions SET Balance = " + balance + " WHERE Subscriber = " + subscriberID + " AND Currency = (SELECT ID FROM Currencies WHERE Symbol = '" + assetSymbol + "')";
		  try {
        con1.createStatement().execute(sql);
        success = true;
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  return success;
		}
		
		public JSONArray getSubscriptions(int subscriberID, boolean connect) {
		  JSONArray jar = new JSONArray();
		  if(connect) connect();
		  
		  String sql = "SELECT c.Name, c.Symbol, s.Balance FROM ebdb.Subscriptions s, ebdb.Currencies c WHERE c.ID = s.Currency AND s.Subscriber =" + subscriberID;
		  try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        PriorityQueue<JSONObject> objectorder = new PriorityQueue<JSONObject>(new Comparator<JSONObject>() {
          @Override
          public int compare(JSONObject arg0, JSONObject arg1) {
            double value0 = arg0.getDouble("Balance") * arg0.getDouble("Price"); 
            double value1 = arg1.getDouble("Balance") * arg1.getDouble("Price"); 
            return value0 > value1 ? -1 : (value0 < value1 ? 1 : 0); //Sort by the largest value...
          }
        });
        while(rs.next()) {
          JSONObject job = new JSONObject();
          String symbol = rs.getString("Symbol");
          job.put("Name", rs.getString("Name"));
          job.put("Symbol", symbol);
          job.put("Balance", rs.getDouble("Balance"));
          job.put("Price", DataRetriever.getInstance().getPriceUsd(symbol));
          objectorder.add(job);
        }
        while(!objectorder.isEmpty()) { //Add JSONObjects to JSONArray in descending order based on balance * price...
          jar.put(objectorder.poll());
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
		  if(connect) disconnect();
		  return jar;
		}
		
	  public boolean inEmailForm(String email) {
	    boolean atfound = false;
	    boolean dotfound = false;
	    boolean isAlphaNum = true;
	    
	    for(int i=0; i < email.length(); i++) {
	      char ati = email.charAt(i);
	      if((ati != 46 && ati < 48) || (ati > 57 && ati < 64) || (ati > 90 && ati < 97) || ati > 122) return false;
	     
	      if(!atfound) {
	        if(ati == '@') atfound = true;
	      }
	      else {
	        if(!dotfound) {
	          if(ati == '.') dotfound = true;
	        }
	      }
	    }
	    return atfound && dotfound && isAlphaNum;
	  }
	  
	  public boolean updateSetting(int subscriberID, String setting, String value, boolean connect) {
	    if(!setting.equalsIgnoreCase("Theme") && !setting.equalsIgnoreCase("ValueType")) return false;
	    
	    if(connect) connect();
	    String sql = "UPDATE Settings SET " + setting + " = '" + value + "' WHERE Subscriber = " + subscriberID;
	    try {
        con1.createStatement().execute(sql);
      } catch (SQLException e) {
        e.printStackTrace();
        return false;
      }
	    
	    if(connect) disconnect();
	    return true;
	  }
	  
	  public JSONObject getSettings(int subscriberID, boolean connect) {
	    JSONObject job = new JSONObject();
	    if(connect) connect();
	    
	    String sql = "SELECT * FROM Settings WHERE Subscriber = " + subscriberID;
	    try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        if(rs.next()) {
          job.put("Theme", rs.getString("Theme"));
          job.put("ValueType", rs.getString("ValueType"));
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	    return job;
	  }
	  
	  public String getMemo(boolean connect) {
	    if(connect) connect();
	    String res = null;
	    
	    String sql = "SELECT Content FROM Memos WHERE Title = 'Landing_memo'";
	    
	    try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        if(rs.next()) {
          res = rs.getString("Content");
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	    return res;
	  }
	  
	  public String generateUserCode() {
	    String r = "";
	    
	    String characters ="ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "01234567890123456789" + "abcdefghijklmnopqrstuvwxyz" ;
	    
	    int length = 255;
	    Random random = new Random();

  	  while(r.length() < length) {
  	    r += characters.charAt(random.nextInt(characters.length()));
  	  }
	    return r;
	  }
	  
	  public boolean addUserID(String code, int id, boolean connect) {
	    if(connect) connect();
	    String sql = "INSERT INTO Cookies (Code,Subscriber) VALUES ('" + code + "'," + id + ")";
	    boolean success = true;
	    try {
        con1.createStatement().execute(sql);
      } catch (SQLException e) {
        success = false;
        e.printStackTrace();
      }
	    if(connect) disconnect();
	    return success;
	  }
	  
	  public int getUserID(String code, boolean connect) {
	    if(connect) connect();
	    int result = -1;
	    String sql = "SELECT Subscriber FROM Cookies WHERE Code = '" + code + "'";
	    try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        if(rs.next()) {
          result = rs.getInt("Subscriber");
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	    return result;
	  }
	  
	  public void removeID(String code, boolean connect) {
	    if(connect) connect();
	    String sql = "DELETE FROM Cookies WHERE Code = '" + code + "'";
	    try {
        con1.createStatement().execute(sql);
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	  }
	  
	  public HashSet<String> getCurrentSymbols(boolean connect){
	    if(connect) connect();
	    HashSet<String> symbs = new HashSet<String>();
	    String sql = "SELECT Symbol FROM Currencies";
	    
	    try {
        ResultSet rs = con1.createStatement().executeQuery(sql);
        while(rs.next()) {
          symbs.add(rs.getString("Symbol"));
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	    return symbs;
	  }
	  
	  public void addCurrency(String symbol, String name, String displayName, int internalID, boolean connect) {
	    if(connect) connect();
	    
	    String sql = "INSERT INTO Currencies (Symbol,Name,DisplayName,InternalID) Values ('" + symbol + "','" + name + "','" + displayName + "'," + internalID + ")";
	    try {
        con1.createStatement().execute(sql);
        System.out.println("Added Currency: " + symbol);
      } catch (SQLException e) {
        e.printStackTrace();
      }
	    if(connect) disconnect();
	  }
	  
	  public String getSymbolByName(String name, boolean connect) {
	    String res = null;
	    JSONArray matches = findMatches(name, connect);
	    if(matches.length() > 0) res = matches.getJSONObject(0).getString("Symbol");
	    return res;
	  }

}
