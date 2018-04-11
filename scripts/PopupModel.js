class PopupModel{
  constructor(){
    this.assets = {};
  }

  addAsset(asset) {
    let symb = asset.currency.symbol;
    this.assets[symb] = {
      balance: asset.balance,
      sub_id: asset.id, //Subscription id
      symbol: symb,
      name: asset.currency.name,
      display: asset.currency.display_name,
      cur_id: asset.currency.currency_id
    };
  }

  loadAssets(assets) {
    for(let i in assets){
      this.addAsset(assets[i]);
    }
  }
}