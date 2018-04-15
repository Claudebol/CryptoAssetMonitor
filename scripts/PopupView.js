class PopupView{
  constructor(){
    this.datatable = undefined;
    this.fadeDuration = 300;
    this.growDuration = 450; //Total. 0.5 width, 0.5 height.
  }

  fadeIn(selector, after) {
    let view = this;
    selector.removeClass('invisible');
    if(after)
      setTimeout(
        after,
        view.fadeDuration
      );
  };

  fadeOut(selector, after) {
    let view = this;
    selector.addClass('invisible');
    if(after)
      setTimeout(
        after,
        view.fadeDuration
      );
  };

  adjustSizeFor(type='loader', after) {
    let body = $('body');
    let duration = this.growDuration;
    if(body.hasClass(type)){
      duration = 0;
    }else {
      body.removeClass(['login', 'assets', 'loader', 'error small', 'error large', 'success', 'signup']);
      body.addClass(type);
    }
    if (after) setTimeout(after, duration);
  };

  showLoader(after) {
    let view = this;
    view.contentShift(
      function(nxt){
        view.adjustSizeFor('loader', nxt);
        }, //Before
      function(){ //After
        view.fadeIn($('.header-container'));
        view.fadeIn($('#content'));
        if(after) after();
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
        $('.access-form').load('views/login.html',
          function(){
            view.fadeIn(content);
            if(fn) fn();
          });
      },
      'access' //View
    );
  };

  showLoginForm(fn) {
    let view = this;
    let content = $('.access-form');
    view.contentShift(
      function(nxt){ //Before
        view.fadeOut(
          content,
          function(){
            content.children().addClass('hide');
          });
        view.adjustSizeFor('login', nxt);
      },
      function(){ //After
        view.fadeIn(content);
        if(fn) fn();
      },
      'login', //View,
      content
    );
  };

  showSignupForm(fn) {
    let view = this;
    let content = $('.access-form');
    view.contentShift(
      function(nxt){ //Before
        view.fadeOut(content);
        view.adjustSizeFor('signup', nxt);
      },
      function(){ //After
        view.fadeIn(content);
        if(fn) fn();
      },
      'signup', //View
      content
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
    let sz = /\<br\>\w/.test(msg) ? 'large' : 'small';
    view.fadeOut(
      err, //Fade out error container
      function(){ //Once faded out...
        let type = $('.body').hasClass('signup') ? 'signup' : 'login';
        view.adjustSizeFor(type + ' error ' + sz, function () { //Adjust to proper size for error
          err.html(msg); //Set error message
          view.fadeIn(err); //Fade error container in
          setTimeout( //Show error for 2 seconds
            function(){ //After the 2 seconds is done...
              view.fadeOut(
                err, //Fade out the error container
                function () { //After faded out...
                  err.html(''); //Clear error message
                  $('.body').removeClass('error ' + sz); //Revert to normal size.
                }
              );
            },
            2000
          );
        });
      }
    );

  }

  contentShift(before, after, view, content) {
    let duration = this.fadeDuration;
    if(!content) content = $('#content');
    before(
      function(){
        setTimeout(
          function(){
            content.load(
              'views/' + view + '.html',
              after
            );
          },
          duration);
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
