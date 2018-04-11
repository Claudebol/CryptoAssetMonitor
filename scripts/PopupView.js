class PopupView{
  constructor(){
    this.datatable = undefined;
    this.duration = {
      short:{type: 'short', value: 700},
      med: {type: 'med', value: 1100},
      long: {type: 'long', value: 1600}
    }['short'];
  }

  fadeIn(selector, after, duration) {
    let view = this;
    if(!duration) duration = view.duration.type;
    selector.removeClass('out').addClass(['fade','in',duration]);
    if(after) setTimeout(after, view.duration.value);
  };

  fadeOut(selector, after, duration) {
    let view = this;
    if(!duration) duration = view.duration.type;
    selector.removeClass('in').addClass(['fade','out',duration]);
    if(after) setTimeout(after, view.duration.value);
  };

  adjustSizeFor(type='loader', after) {
    let body = $('body');

    body.removeClass(['login', 'assets', 'loader', 'error small', 'error large', 'success']);
    body.addClass(type);
    if (after) after();
  };

  showLoader() {
    let view = this;

    view.contentShift(
      function(nxt){ view.adjustSizeFor('loader', nxt);}, //Before
      function(){ //After
        $('.header-container').removeClass('hide');
        view.fadeIn($('.body'));
      },
      'loader' //View
    );

  };

  showLogin(fn) {
    let view = this;
    let content = $('#content');
    view.contentShift(
      function(nxt){ //Before
        view.fadeOut(content);
        view.adjustSizeFor('login', nxt);
      },
      function(){ //After
        view.fadeIn(content);
        if(fn) fn();
      },
      'login' //View
    );

  };

  showAssets(assets) {
    let view = this;
    let content = $('#content');
    let header = $('.header-container');

    view.contentShift(
      function(nxt){  //Before
        view.fadeOut(header);
        view.fadeOut(content);
        view.adjustSizeFor('assets', nxt);
      },
      function(){  //After
        header.addClass('hide');
        view.datatable = $('.assets-table').dataTable({
          bPaginate: false,
          scrollY: 400,
          scrollCollapse: true,
          searching: false,
          info: false,
          autoWidth: false
        });
        for(let i in assets)
          view.addAsset(assets[i]);
        view.fadeIn(content);
      },
      'assets' //View
    );
  };

  showWelcome() {
    let view = this;
    let content = $('#content');
    view.contentShift(
      function(nxt){
        view.fadeOut(content);
        nxt(); }, //Before
      function(){ view.fadeIn(content); }, //After
      'welcome' //View
    );
  };

  showSuccess() {
    let view = this;
    let content = $('#content');
    view.contentShift(
      function(nxt){
        view.fadeOut(content);
        view.adjustSizeFor('login success', nxt);
      }, //Before
      function(){ view.fadeIn(content); }, //After
      'success' //View
    );

  };

  showError(response) {
    let view = this;
    let content = $('#content');
    if(response.status === 0){
      view.contentShift(
        function (nxt) {  //Before
          view.fadeOut(content);
          view.adjustSizeFor('loader', nxt);
        },
        function () { view.fadeIn(content); }, //After
        'no-server' //View
      );
    } else if(response.status === 401) {
      view.showLoginError(response.responseText);
    }
  };

  showLoginError(msg) {
    let view = this;
    let err = $('.error-container');
    let sz = /\<br\>/.test(msg) ? 'large' : 'small';
    view.fadeOut(
      err,
      function(){
        err.addClass('hide');
        err.html(msg);
        view.adjustSizeFor('login error ' + sz, function () {
          err.removeClass('hide');
          view.fadeIn(err);
        });
      }
    );

  }

  contentShift(before, after, view, duration) {
    if(!duration) duration = this.duration.value;
    before(function(){
      setTimeout(function(){
        $('#content').load('views/' + view + '.html', after);
      }, duration);
    });

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
