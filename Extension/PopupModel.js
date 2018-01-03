class PopupModel{
  constructor(){
    this.assets = {}; //Indexed by coin (i.e. BTC, ETH, LTC, etc...) stores the balance of that asset, from DB or user input
    this.values = {}; //Indexed by coin (i.e. BTC, ETH, LTC, etc...) stores the value of that asset, from the server.
    this.nostream = [];
    this.valuetype = 'owned';
    this.total = 0.0;
  }
}

//Handle adding an asset to the asset collection and makes a call to the db.
//Probably could handle updating a value too... but the database query would
//be different on the server...
PopupModel.prototype.addAsset = function (asset_name, balance) {
  this.assets[asset_name + 'USD'] = balance * 1.0;
};

PopupModel.prototype.getValue = function (asset_name) {
  if(this.assets[asset_name] === undefined){
    console.log('No balance for ' + asset_name);
    return 0.0;
  }
  if(this.values[asset_name] === undefined) {
    console.log('No values for ' + asset_name);
    return 0.0;
  }
  if(this.values[asset_name]['PRICE'] === undefined) {
    console.log('No price for ' + asset_name);
    return 0.0;
  }

  if(this.valuetype === 'owned'){
    return  this.values[asset_name]['VALUE'];
  } //Return the calculated worth
  return this.values[asset_name]['PRICE']; //Return the value
};

PopupModel.prototype.getBalance = function (asset_symbol) {
  return this.assets[asset_symbol + 'USD'];
};

PopupModel.prototype.owns = function (asset_symbol) {
  return this.assets[asset_symbol + 'USD'] !== undefined;
};

PopupModel.prototype.updateBalance = function (asset_symbol, balance) {
  let val = balance * this.values[asset_symbol]['PRICE'];
  let diff = val - this.values[asset_symbol]['VALUE'];
  this.assets[asset_symbol] = balance;
  this.values[asset_symbol]['VALUE'] = val;
  this.total += diff;
};

PopupModel.prototype.getTotalValue = function () {
  return Math.max(0.0, this.total);
};

PopupModel.prototype.updateValue = function (asset_symbol, value) {//Actually updates the PRICE... ik it doesnt make sense

  if(this.values[asset_symbol] === undefined) this.values[asset_symbol] = {PRICE: 0.0, VALUE: 0.0};
  if(value === undefined) return;
  this.values[asset_symbol]['PRICE'] = value;
  let val = this.values[asset_symbol]['PRICE'] * this.assets[asset_symbol];
  let diff = val - this.values[asset_symbol]['VALUE'];
  this.values[asset_symbol]['VALUE'] = val;
  this.total += diff;
};

PopupModel.prototype.addToNoStream = function (asset_symbol) {
  this.nostream.push(asset_symbol);
};

PopupModel.prototype.getNoStream = function () {
  return this.nostream;
};

PopupModel.prototype.switchValueType = function () {
  if(this.valuetype === 'owned') this.valuetype = 'market';
  else this.valuetype = 'owned';
};

PopupModel.prototype.resetToDefault = function () {
  this.assets = {};
  this.values = {};
  this.nostream = [];
  this.valuetype = 'owned';
  this.total = 0.0;
};

PopupModel.prototype.remove = function (asset_symbol) {
  this.total -= this.values[asset_symbol + 'USD']['VALUE'];
  this.assets[asset_symbol + 'USD'] = undefined;
  this.values[asset_symbol + 'USD'] = undefined;
  this.nostream[this.nostream.indexOf(asset_symbol)] = this.nostream[this.nostream.length - 1];
  this.nostream.pop();
  document.getElementById(asset_symbol + 'USD_row').hidden = true;
};
