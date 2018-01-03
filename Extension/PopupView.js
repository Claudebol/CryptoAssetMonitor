class PopupView{
  constructor(){
    this.valuetype = 'owned';
    this.colormode = 'light';
  }
}

//Takes the name of the asset (BTC, ETH, etc...), the users balance, and the value of the asset times the balance.
PopupView.prototype.addAsset = function (asset_name, asset_symbol, balance, url) {
  let html = '<tr class="asset_row" id="' + asset_symbol + 'USD_row">';
  html += '<td style="width: 25px">';
  html += '<div id="' + asset_symbol + 'USD_col_1" style="text-align: center; width: 25px;">';
  html += '<img id="'+asset_symbol+'USD_icon" src="' + url + '/Icon/' + asset_symbol + '" title="' + asset_name + '" height="20" width="20">';
  html += '</div>';
  html += '</td>';
  html += '<td id="'+ asset_symbol +'USD_balance" style=" max-width: 130px" class="text-value">';
  html += '<table>';
  html += '<tr>';
  html += '<td>';
  html += '<div style="width: 25px; text-align: center;" id="' + asset_symbol + 'USD_col_2_1">';
  html += '<img src="' + url + '/Icon/delete-button" title="Remove ' + asset_name + '" height="12" width="15" id="' + asset_symbol  +'USD_delete" hidden>';
  html += '</div>';
  html += '</td>';
  html += '<td>';
  html += '<div id="' + asset_symbol + 'USD_balance_col_div" >';
  html += '<input type="number" name="balance_input" id="' + asset_symbol + 'USD_balance_col" ' +
    'min="0.0" style="border:none; width: 135px; max-width: 135px; font-size: 12px; padding: 0 0 0 5px;" ' +
    'step="any" value="' + balance + '" class="text-value" title="Click to adjust the balance for ' + asset_name + '." disabled>';
  html += '</div>';
  html += '</td>';
  html += '</tr>';
  html += '</table>';
  html += '</td>';
  html += '<td style="width: 75px; max-width: 75px;" >';
  html += '<div id="' + asset_symbol + 'USD_value_col_div"  class="text-value" style="width: 70px; max-width: 70px;" >';
  html += '$<input type="number" id="' + asset_symbol +'USD_value_col" min="0.0" style="border: none; width: 60px; max-width: 60px; font-size: 12px; " class="text-value" step="any" readonly>';
  html += '</div>';
  html += '</td>';
  html +=  '</tr>';
  document.getElementById('asset_list_body').innerHTML += html;

 this.refreshColors();
};

PopupView.prototype.hasElementWithId = function (id) {
  return document.getElementById(id) != null;
};

PopupView.prototype.fillPopupBody = function (html) {
  document.getElementById('popup_body').innerHTML = html;
};

PopupView.prototype.updateAssetValue = function (asset_symbol, value, flash) {
  value *= 1.0;
  let element = document.getElementById(asset_symbol + '_value_col');
  if(element){
    if(flash) this.flashColor(asset_symbol + '_value_col', value, true);
    let v = this.getval(value);
    if( v === 'NaN'){
      console.log(v);
      return;
    }
    element.value = v;
  }
};

PopupView.prototype.getval = function (value) {
  //if(value > 1.0) return value.toFixed(2);
  let val = value.toString().substring(0, 8) * 1.0;
  if(val >= 1.0) return val.toFixed(2);
  return val;
};

PopupView.prototype.flashColor = function (id, value) {
  let elem = document.getElementById(id);
  let elemdiv = document.getElementById(id + '_div');
  if(!elem || !elemdiv) return;
  let prev = elem.value;
  let view = this;
   let val = view.getval(value);

  let attribute = view.colormode === 'light' ? 'backgroundColor' : 'color';
  let color = val > prev ? '#7fff7f' : (val < prev ? '#ff7f7f' : '#efefef');

  elem.style[attribute] = color;
  elemdiv.style[attribute] = color;

  setTimeout(function () {
    if(elem && elemdiv){
      let attr = view.colormode === 'light' ? 'backgroundColor' : 'color';
      elem.style[attr] = "#efefef";
      elemdiv.style[attr] = "#efefef";
    }
  }, 250);

};


PopupView.prototype.updateAsset = function (asset_symbol, balance, value) {
  document.getElementById(asset_symbol + '_balance_col').value = balance;
  document.getElementById(asset_symbol + '_value_col').value = value.toFixed(2);
};

PopupView.prototype.clearInput = function () {
  document.getElementById('asset_input').value = '';
  document.getElementById('asset_balance_input').value = '';
};

PopupView.prototype.showInputTable = function () {
  document.getElementById('asset_input_table').hidden = false;
  document.getElementById('asset_input_table_show').hidden = true;
};

PopupView.prototype.hideInputTable = function () {
  document.getElementById('asset_input_table').hidden = true;
  document.getElementById('asset_input_table_show').hidden = false;
  this.clearInput();
};

PopupView.prototype.updateTotal = function (new_total) {
  let t = this.getval(new_total);

  this.flashColor('total_value', t, false);
  document.getElementById('total_value').value = t;
};

PopupView.prototype.switchValueType = function () {
  let title = 'Switch to ' + this.valuetype + ' value.';
  if(this.valuetype === 'owned') this.valuetype = 'market';
  else  this.valuetype = 'owned';

  document.getElementById('switch_value_type_title').title = title;
};

PopupView.prototype.switchColorMode = function () {
  document.getElementById('switch_color_mode_title').title = 'Switch to ' + this.colormode + ' mode.';
  if(this.colormode === 'light') this.colormode = 'dark';
  else this.colormode = 'light';

  this.refreshColors();

};

PopupView.prototype.refreshColors = function () {
  let color = "#efefef";
  let background = "#333333";
  if(this.colormode === 'light') {
    color = "#333333";
    background = "#efefef";
  }
  let texts =  document.getElementsByClassName('text-value');

  for(let i=0; i < texts.length; i++){
    texts[i].style.color = color;
    texts[i].style.backgroundColor = background;
  }

  document.getElementById('popup_body').style.backgroundColor = background;
};

PopupView.prototype.resetToDefault = function () {
  this.colormode = 'light';
  this.valuetype = 'owned';
  this.refreshColors();
};