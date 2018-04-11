class PopupView{
  constructor(){
    this.datatable = undefined;
    this.duration = {
      short:{type: 'short', value: 700},
      med: {type: 'med', value: 1100},
      long: {type: 'long', value: 1600}
    }['short'];
  }

  showLoader() {
    let view = this;
    this.adjustSizeFor();
    $('#content').load('views/loader.html', function(){
      $('.header-container').removeClass('hide');
      view.fadeIn($('.body'));
    })
  };

  showLogin(fn) {
    let view = this;
    let content = $('#content');
    view.fadeOut(content);
    view.adjustSizeFor('login');
    setTimeout(function(){
      content.load('views/login.html', function(){
        view.fadeIn(content);
        if(fn) fn();
      });
    }, view.duration.value);
  };

  fadeIn(selector, duration) {
    if(!duration) duration = this.duration.type;
    selector.removeClass('out').addClass(['fade','in',duration]);
  };

  fadeOut(selector, duration) {
    if(!duration) duration = this.duration.type;
    selector.removeClass('in').addClass(['fade','out',duration]);
  };

  adjustSizeFor(type='loader') {
    let body = $('body');
    body.removeClass(['base','login', 'assets', 'loader']);
    body.addClass(type);
  };

  showAssets(assets) {
    let view = this;
    let content = $('#content');
    let header = $('.header-container');

    view.fadeOut(header);
    view.fadeOut(content);
    view.adjustSizeFor('assets');

    setTimeout(function(){
      content.load('views/assets.html', function(){
        header.addClass('hide');
        view.fadeIn(content);
        view.datatable = $('.assets-table').dataTable({
          bPaginate: false,
          scrollY: 400,
          scrollCollapse: true,
          searching: false,
          info: false,
          autoWidth: false
        });
        for(let i in assets){
          view.addAsset(assets[i]);
        }
      });
    }, view.duration.value);
  };

  showError(status) {
    console.log(status);
  };

  togglePassword() {
    var pword = $('#password');
    var swap = pword.data('type');
    pword.data('type', pword.prop('type'));
    pword.prop('type', swap);

    var eye = $('.eye');
    swap = eye.data('title');
    eye.data('title', eye.prop('title'));
    eye.prop('title', swap);
    $('.eye div').toggleClass('hide');
  };

  addAsset(data) {
    if(!data.img) data.img = "";
    if(!data.balance) data.balance = 0;
    if(!data.value) data.value = 0;
    if(!data.percent) data.percent = 0;

    let _icon = "<div class='icon_"+ data.sub_id +"'><img width='30' height='30' src='"+ data.img +"'></div>";
    let _balance = "<div class='balance_"+ data.sub_id +"'><input type='number' value='"+ data.balance +"'></div>";
    let _value = "<div class='value_"+ data.sub_id +"'><input type='number' value='"+ data.value +"'></div>";
    let _percent = "<div class='percent_"+ data.sub_id +"'><input type='number' value='"+ data.percent +"'></div>";

    this.datatable.fnAddData([_icon, _balance, _value, _percent]);
  };
}
