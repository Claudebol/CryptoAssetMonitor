class PopupView{
  constructor(){
    this.fadeDuration = 300;
    this.growDuration = 450;
  }

  addAsset(data) {
    if(!data.img) data.img = "";
    if(!data.balance) data.balance = 0;
    if(!data.price_usd_cc) data.price_usd_cc = 0;
    if(!data.price_usd_wci) data.price_usd_wci = 0;

    var title = data.name + ' (' + data.symbol + ')';

    let _icon = "<div class='asset_icon'><img id='icon_"+ data.symbol +"' width='20' height='20' src='"+ data.img +"'></div>";
    let _balance = "<div class='asset_balance'><input id='balance_"+ data.symbol +"' type='number' value='"+ data.balance +"'></div>";
    let _price_usd_cc = "<div class='asset_price_usd_cc'><input id='price_usd_cc_"+ data.symbol +"' type='number' value='"+ this.cleanValueUSD(data.price_usd_cc) +"' step=\"any\" readonly></div>";
    let _price_usd_wci = "<div class='asset_price_usd_wci'><input id='price_usd_wci_"+ data.symbol +"' type='number' value='"+ this.cleanValueUSD(data.price_usd_wci) +"' step=\"any\" readonly></div>";

    let _row = [_icon, _balance, _price_usd_cc, _price_usd_wci]

    let out = "<tr title='" + title + "'>";
    for(let i in _row)
      out += "<td>" + _row[i] + "</td>"
    $('.assets-table tbody').append(out + "</tr>")
  }

  addAuthSpinner(){
    let view = this;
    let content = $('#content');
    let spn = $('<div></div>');
    spn.load('views/spinners/auth.html', function(){
      content.prepend(spn.html());
      setTimeout(
        function(){
          view.fadeIn($('.auth-spinner'));
        },
        10
      )
    });
  }

  addSuggestion(suggestion){
    suggestion = this.makeSuggestion(suggestion);
    var suggestions = $('.search-results');
    suggestions.append(suggestion);
  }

  adjustSizeFor(type='loader', after, duration) {
    let body = $('body');
    if(body.hasClass(type)){
      duration = 0;
    }else {
      if(!duration) duration = this.growDuration;
      body.removeClass(['login', 'assets', 'loader', 'error small', 'error large', 'success', 'signup']);
      body.addClass(type);
    }
    if (after) setTimeout(after, duration);
  }

  cleanValueUSD(value) {
    var match = /\.([\d]+)/.exec(value);
    if(!match) return value;
    return Number(value).toFixed(Math.min(8, match[1].length));
  }

  clearSuggestions() {
    $('.search-results').html('');
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
  }

  fadeIn(selector, after) {
    let view = this;
    selector.removeClass('invisible');
    if(after)
      setTimeout(
        after,
        view.fadeDuration
      );
  }

  fadeOut(selector, after) {
    let view = this;
    selector.addClass('invisible');
    if(after)
      setTimeout(
        after,
        view.fadeDuration
      );
  }

  hideSuggestions() {
    $('.search-results').hide();
  }

  makeSuggestion(suggestion){
    var out = "<div class='suggestion'>";
    out += "<div class='suggestion-title'>"+ suggestion.name +" ("+ suggestion.symbol +")</div>";
    out += "<div class='suggestion-add'>&#43;</div>";
    out += "<div class='suggestion-form'>";
    out += "<div class='suggestion-balance'><input type='number' placeholder='Balance for '"+ suggestion.symbol +"'></div>";
    out += "<div class='suggestion-submit'><input type='button' value='Add'></div>"
    return out + "</div></div>";
  }

  showAssets(assets, onload) {
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

        for(let i in assets)
          view.addAsset(assets[i]);
        view.fadeIn(content);

        if(onload) onload();
      },
      'assets' //View
    );
  }

  showConnectSpinner(after) {
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
      'spinners/connect' //View
    );
  }

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
      let spinner = $('.auth-spinner');
      view.showLoginError(response.responseText);
      view.fadeOut(
        spinner,
        function(){
          spinner.remove();
        });
    }
  }

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
  }

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
          setTimeout( //Show error for 5 seconds
            function(){ //After the 5 seconds is done...
              view.fadeOut(
                err, //Fade out the error container
                function () { //After faded out...
                  err.html(''); //Clear error message
                  $('.body').removeClass('error ' + sz); //Revert to normal size.
                }
              );
            },
            5000
          );
        });
      }
    );
  }

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
  }

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
  }

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
  }

  showSuggestions() {
    $('.search-results').show();
  }

  setTotals(data) {
    $('#total_value_usd_cc').val(this.cleanValueUSD(data.cc));
    $('#total_value_usd_wci').val(this.cleanValueUSD(data.wci));
  }

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
  }

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
  //Improve this, this was just to see that it works!!
  updateTotals(data) {
    var cc = $('#total_value_usd_cc');
    var wci = $('#total_value_usd_wci');
    var cc_total = Number(cc.val());
    var wci_total = Number(wci.val());

    data.cc = this.cleanValueUSD(data.cc);
    data.wci = this.cleanValueUSD(data.wci);

    cc.val(data.cc);
    wci.val(data.wci);

    if(data.cc > cc_total){
      cc.css('color', '#0f0');
    }else{
      cc.css('color', '#f00');
    }
    if(data.wci > wci_total){
      wci.css('color', '#0f0');
    }else{
      wci.css('color', '#f00');
    }
    setTimeout(function(){
      cc.css('color', '#ddd')
      wci.css('color', '#ddd')
    }, 500);
  }

  //Improve this, this was just to see that it works!!
  updateValue(data) {
    var cc = $('#price_usd_cc_' + data.symbol);
    var wci = $('#price_usd_wci_' + data.symbol);
    var cc_cur = cc.val();
    var wci_cur = wci.val();

    data.price_usd_cc = this.cleanValueUSD(data.price_usd_cc);
    data.price_usd_wci = this.cleanValueUSD(data.price_usd_wci);

    cc.val(data.price_usd_cc);
    wci.val(data.price_usd_wci);
    if(data.price_usd_cc > cc_cur){
      cc.css('color', '#0f0');
    }else{
      cc.css('color', '#f00');
    }
    if(data.price_usd_wci > wci_cur){
      wci.css('color', '#0f0');
    }else{
      wci.css('color', '#f00');
    }
    setTimeout(function(){
      cc.css('color', '#ddd')
      wci.css('color', '#ddd')
    }, 500);
  }
}
