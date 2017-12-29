class Popup{
  constructor(){
    this.model = new PopupModel();
    this.view = new PopupView();
    this.cookieman = new CookieManager();
    this.socket = undefined;
    this.flash = false;
    this.isValid = false;
    this.url = 'http://assetmonitor.us-east-2.elasticbeanstalk.com';
    //this.url = 'http://localhost:8080/AssetManager';
    this.loadPage();
  }
}

Popup.prototype.loadPage = function () {
  let popup = this;
  this.httpGetAsync(popup.url,'/Home?Code=' + popup.cookieman.getCookie('usercode'),function(res){
    popup.view.fillPopupBody(res);

    if(popup.view.hasElementWithId('login_button')) popup.loadLoginScreen();
    else popup.loadMainScreen();
  });
};

Popup.prototype.loadLoginScreen = function () {
  let popup = this;
  document.getElementById('popup_body').style.backgroundColor = "#efefef";
  document.getElementById('login_button').onclick = login;
  document.getElementById('sign_up_button').onclick = function () {
    verify('Signup', login);
  };

  function login(){
    verify('Login', function (usercode) {
      if(usercode !== undefined && !popup.cookieman.compareCookie('usercode', usercode)) popup.cookieman.setCookie('usercode', usercode, 365);
      popup.loadPage();
    });
  }

  function verify(querytype, onsuccess) {
    let email = document.getElementById('email_input').value;
    let password = document.getElementById('password_input').value;
    let error_output = document.getElementById('error_output');

    if(email === '' || password === '') {
      error_output.innerHTML = 'Must enter credentials.';
      error_output.hidden = false;
    }
   else {
      let querystring = 'email=' + email + '&password=' + password;
      popup.httpPostAsync(popup.url + '/' + querytype, querystring, function (res) {
        let response = res.split(':');
        if (response[0] === 'Success') {
          //Display the main screen wit da scruptsoooo
          onsuccess(response[1]);
        } else {
          error_output.innerHTML = res;
          error_output.hidden = false;
        }
      });
    }
  }
};


Popup.prototype.loadMainScreen = function () {
  let popup = this;
  popup.isValid = true;
  popup.setClickListeners();
  popup.receiveData();
  let asset_data = document.getElementById('assets-from-server').innerText;
  popup.loadAssets(JSON.parse(asset_data));
  let settings_data = document.getElementById('settings-from-server').innerText;
  popup.loadSettings(JSON.parse(settings_data));
  popup.createAutocomplete();
  popup.startPollingNoStream();
  popup.flash = true;
};

Popup.prototype.setClickListeners = function () {
  let popup = this;
  document.getElementById('submit_add_asset_button').onclick = function () {
    popup.addAsset();
    popup.view.clearInput();
  };
  document.getElementById('cancel_add_asset_button').onclick = function () {
    popup.view.hideInputTable();
  };
  document.getElementById('show_asset_input_table').onclick = function () {
    popup.view.showInputTable();
  };
  document.getElementById('switch_value_type').onclick = function () {
    popup.switchValueType();
    popup.saveSetting('ValueType', popup.model.valuetype);
  };
  document.getElementById('switch_color_mode').onclick = function () {
    popup.view.switchColorMode();
    popup.saveSetting('Theme', popup.view.colormode);
  };
  document.getElementById('sign_out_button').onclick = function () {
    popup.httpGetAsync(popup.url, '/Logout', function (res) {
      if(res === 'Success'){
        popup.cookieman.invalidateCookie('usercode');
        popup.socket.disconnect();
        popup.model.resetToDefault();
        popup.view.resetToDefault();
        popup.isValid = false;
        popup.loadPage();
      }
      else{
        //Handle error
        console.log(res);
      }
    });
  };
};

Popup.prototype.switchValueType = function () {
  this.model.switchValueType();
  this.view.switchValueType();
  this.refreshData();
};

Popup.prototype.refreshData = function () {
  for(let asset in this.model.assets){
    this.view.updateAssetValue(asset, this.model.getValue(asset), false);
  }
  this.updateTotal();
};

Popup.prototype.loadAssets = function (from_server) {
  let popup = this;
  for(let i=0; i < from_server.length; i++){
    let name = from_server[i]['Name'];
    let symbol = from_server[i]['Symbol'];
    let balance = from_server[i]['Balance'];
    let price = from_server[i]['Price'];

    popup.model.addAsset(symbol, balance);
    popup.model.updateValue(symbol + 'USD', price);
    popup.view.addAsset(name, symbol, balance, popup.url);

    popup.view.updateAssetValue(symbol + 'USD', popup.model.getValue(symbol + 'USD'), popup.flash);
    popup.addSubscription(symbol);
  }
  let clix = document.getElementsByClassName('asset_row');
  for(let i=0; i < clix.length; i++){
    popup.setOnHoverListeners(clix[i]);
  }
  popup.refreshData();
};

Popup.prototype.removeSubscription = function (asset_symbol) {
  let popup = this;
  let element = document.getElementById(asset_symbol + '_delete');
  asset_symbol = asset_symbol.replace(/USD/, '');
  if(element) {
    element.hidden = false;
    element.onclick = function () {
      popup.httpDeleteAsync(popup.url + '/Subscriptions/' + asset_symbol, '', function () {
        popup.model.remove(asset_symbol);
      })
    };
  }
};

Popup.prototype.setOnHoverListeners = function () {
  let popup = this;
  let clix = document.getElementsByClassName('asset_row');
  for(let i=0; i < clix.length; i++){
    clix[i].onmouseover = function () {
      let id = this.id.split('_')[0];
      popup.removeSubscription(id);
      popup.updateTotal();
      let bal = document.getElementById(id + '_balance_col');

      if(bal){
        bal.disabled = false;
      }
    };
    clix[i].onmouseout = function () {
      let id = this.id.split('_')[0];
      let del = document.getElementById(id + '_delete');
      let bal = document.getElementById(id + '_balance_col');
      if(del) {
        del.hidden = true;
        del.onclick = undefined;
      }
      if(bal){
        bal.disabled = true;
      }
    }
  }

  let changers = document.getElementsByName('balance_input');
  for(let i=0; i < changers.length; i++){
   changers[i].onchange = function () {
      let newval = document.getElementById(this.id).value;
      popup.updateBalance(this.id.split('_')[0], newval);
   };
  }
};

Popup.prototype.loadSettings = function (from_server) {
  let theme = from_server['Theme'];
  let valuetype = from_server['ValueType'];

  if(this.view.colormode !== theme){
    document.getElementById('switch_color_mode').checked = true;
    this.view.switchColorMode();
  }
  if(this.view.valuetype !== valuetype){
    document.getElementById('switch_value_type').checked = true;
    this.switchValueType();
  }
};

Popup.prototype.saveSetting = function (setting, value) {
  if(setting === undefined || value === undefined) return;
  this.httpPutAsync(this.url + '/Settings/' + setting + "/" + value, '', function (res) {
    console.log(res);
    if(res === 'Success'){
      //yay
    }
    else{
      //nooo
    }
  });
};

Popup.prototype.saveSettings = function () {
  //Not needed atm
};

Popup.prototype.httpAsync = function (method, url, querystring, callback) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
      callback(xmlHttp.responseText);
  };
  xmlHttp.open(method, url, true); // true for asynchronous
  if(querystring) xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlHttp.send(querystring);
};

Popup.prototype.httpGetAsync = function (url, querystring, callback) {
  this.httpAsync('GET', url + querystring, null, callback);
};

Popup.prototype.httpPostAsync = function (url, querystring, callback) {
  this.httpAsync('POST', url, querystring, callback);
};

Popup.prototype.httpPutAsync = function (url, querystring, callback) {
  this.httpAsync('PUT', url, querystring, callback);
};

Popup.prototype.httpDeleteAsync = function (url, querystring, callback) {
  this.httpAsync('DELETE', url, querystring, callback);
};

Popup.prototype.createAutocomplete = function () {
  let popup = this;
  new autoComplete({
    selector: '#asset_input',
    minChars: 1,
    source: function (term, suggest) {
      popup.httpGetAsync(popup.url, '/Match/' + term, function (result) {
        let results = JSON.parse(result);
        let choices = [];

        for(let i=0; i < results.length; i++){
          choices.push(results[i]["Name"] + " (" + results[i]["Symbol"] + ")");
        }
        suggest(choices);
      });
    }
  });
};


Popup.prototype.addAsset = function () {
  let asset = document.getElementById('asset_input').value;
  let asset_balance = document.getElementById('asset_balance_input').value;
  if(asset === undefined || asset_balance === undefined || asset === '' || asset_balance === ''){
    return;
  }
  asset = asset.split(' (');
  let asset_name = asset[0].trim();
  let asset_symbol = asset[1].substring(0, asset[1].indexOf(')'));

  if(this.model.owns(asset_symbol)){
    this.updateBalance(asset_symbol, asset_balance);
    return;
  }
  this.model.addAsset(asset_symbol, asset_balance);
  this.view.addAsset(asset_name, asset_symbol, asset_balance, this.url);
  this.addSubscription(asset_symbol);
  this.saveSubscription(asset_symbol);


  this.setOnHoverListeners();
  this.refreshData();

};


Popup.prototype.updateBalance = function (asset_name, balance) {
  this.model.updateBalance(asset_name, balance);
  let id = asset_name + (asset_name.includes('USD') ? '' : 'USD');
  this.view.updateAsset(id, balance, this.model.getValue(id), this.flash);
  this.httpPutAsync(this.url + '/Subscriptions/Update/' + asset_name.replace(/USD/g, '') + '/' + balance.replace('.', '-'), '', function (res) {
    console.log(res);
  });
};

Popup.prototype.receiveData = function () {
  let popup = this;
  popup.socket = io.connect('https://streamer.cryptocompare.com/');
  //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
  //Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
  //For aggregate quote updates use CCCAGG as market

  popup.socket.on("m", function(message) {
    if(!popup.isValid) return;
    let messageType = message.substring(0, message.indexOf("~"));
    let res = {};
    if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
      res = CCC.CURRENT.unpack(message);
      dataUnpack(res);
    }
  });



  let dataUnpack = function(data) {
    let from = data['FROMSYMBOL'];
    let to = data['TOSYMBOL'];
    // let fsym = CCC.STATIC.CURRENCY.getSymbol(from);
    // let tsym = CCC.STATIC.CURRENCY.getSymbol(to);
    let pair = from + to;

    if(data['FLAGS'] === undefined) popup.addToNoStream(from);
    popup.model.updateValue(pair, data['PRICE']);
    // for (let key in data) { popup.model.values[pair][key] = data[key]; }
    // if (popup.model.values[pair]['LASTTRADEID'])   popup.model.values[pair]['LASTTRADEID'] = parseInt(popup.model.values[pair]['LASTTRADEID']).toFixed(0);
    // popup.model.values[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (popup.model.values[pair]['PRICE'] - popup.model.values[pair]['OPEN24HOUR']));
    // popup.model.values[pair]['CHANGE24HOURPCT'] = ((popup.model.values[pair]['PRICE'] - popup.model.values[pair]['OPEN24HOUR']) / popup.model.values[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";;
    popup.view.updateAssetValue(pair, popup.model.getValue(pair), popup.flash);
    popup.updateTotal();
  };
};

Popup.prototype.updateTotal = function () {
  let total = this.model.getTotalValue();
  this.view.updateTotal(total);
};

Popup.prototype.addToNoStream = function (asset_symbol) {
  let popup = this;
  popup.model.addToNoStream(asset_symbol);
  if(popup.model.values[asset_symbol + 'USD'] !== undefined) return;
  let querystring = '/Subscriptions/Prices/' + asset_symbol;
  this.httpGetAsync(popup.url, querystring, function (res) {
    if(res !== '0.0'){
      popup.model.updateValue(asset_symbol + 'USD', res);
      popup.view.updateAssetValue(asset_symbol + 'USD', popup.model.getValue(asset_symbol + 'USD', false));
      popup.updateTotal();
    }
  });
};


Popup.prototype.startPollingNoStream = function () {
  let popup = this;
  setInterval(function(){
    let querystring = '/Subscriptions/Prices?symbols=' + JSON.stringify(popup.model.getNoStream());
    popup.httpGetAsync(popup.url, querystring, function (res) {
      if(!popup.isValid || popup.model.getNoStream().length === 0) return;
      if(res !== 'Must be logged in.' || res !== "Must provide 'symbols' parameter."){
        let arr = JSON.parse(res);
        for(let i=0; i < arr.length; i++){
          popup.model.updateValue(arr[i]['Symbol'] + 'USD', arr[i]['Price']);
          popup.view.updateAssetValue(arr[i]['Symbol'] + 'USD', popup.model.getValue(arr[i]['Symbol'] + 'USD'), popup.flash);
        }
        popup.updateTotal();
      }
    });
  }, 2000);

};

Popup.prototype.addSubscription = function (asset_symbol) {
  let subscription = ['5~CCCAGG~' + asset_symbol + '~USD'];
  this.socket.emit('SubAdd', { subs: subscription });
};

Popup.prototype.saveSubscription = function (asset_symbol) {
  let querystring = 'balance=' + this.model.getBalance(asset_symbol);
  this.httpPostAsync(this.url + '/Subscriptions/Add/' + asset_symbol, querystring, function (res) {
    console.log(res);
  });
};
//let ppap = undefined;
document.addEventListener('DOMContentLoaded', function () {
  new Popup();
  //ppap = new Popup()
});
