class PopupModel{
  constructor(){
    this.assets = {};
    this.totals = {
      cc: 0,
      wci: 0
    }
  }

  addAsset(asset) {
    let symb = asset.symbol;
    asset.value_usd_cc = asset.balance * asset.price_usd_cc;
    asset.value_usd_wci = asset.balance * asset.price_usd_wci;
    this.assets[symb] = asset;
    this.totals.cc += Number(asset.value_usd_cc);
    this.totals.wci += Number(asset.value_usd_wci);
  }

  loadAssets(assets) {
    for(let i in assets){
      this.addAsset(assets[i]);
    }
  }

  updateValue(asset) {
    asset.balance = this.assets[asset.symbol].balance;
    asset.value_usd_cc = asset.balance * asset.price_usd_cc;
    asset.value_usd_wci = asset.balance * asset.price_usd_wci;

    var cur_value_usd_cc = this.assets[asset.symbol].value_usd_cc;
    var cur_value_usd_wci = this.assets[asset.symbol].value_usd_wci;

    this.totals.cc = Number(this.totals.cc) + Number(asset.value_usd_cc) - Number(cur_value_usd_cc);
    this.totals.wci = Number(this.totals.wci) + Number(asset.value_usd_wci) - Number(cur_value_usd_wci);

    this.assets[asset.symbol] = asset;
    return asset;
  }
}