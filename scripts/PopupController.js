class PopupController {
  constructor() {
    this.model = new PopupModel();
    this.view = new PopupView();
    this.bh = 'http://localhost:8000/popup/';
    //this.bh = 'http://stsherman.us-east-2.elasticbeanstalk.com/popup/';
  }

  connect() {
    let controller = this;
    controller.view.showLoader(
      function() {
        controller.request( //Request to the server.
          'GET',
          'subscription',
          undefined,
          controller.showWelcome(controller.showAssets()), //If we get a 200, show the assets.
          controller.showLogin(), //If we get a 403, show the login
          controller.showError()); //If we get something else, show 'No server' screen.
      }
    ); //Fade the loader in.

  };

  showWelcome(f) {
    let controller = this;
    return function(r){
      controller.view.showWelcome();
      setTimeout(function(){
          f(r);
        },
        controller.view.growDuration * 2
      );
    }
  }

  showSuccess(f) {
    let controller = this;
    return function(r){
      controller.view.showSuccess();
      setTimeout(function(){
          f(r);
        },
        controller.view.growDuration
      );
    }
  };

  showAssets() {
    let controller = this;
    return function(r) {
      console.log(r);
      controller.model.loadAssets(r);
      controller.view.showAssets(controller.model.assets);
    }
  };

  showLogin() {
    let controller = this;
    return function(r){
      if(r.status === 401){
        controller.view.showError(r)
      }else
        controller.view.showLogin(controller.clickListeners());
    }
  };

  showError() {
    let controller = this;
    return function(r){
      console.log(r);
      controller.view.showError(r);
    }
  };

  clickListeners(type) {
    let controller = this;
    if(!type)
      return function() {
        controller.clickListeners('login')();

        $('#l_tab').click(function(){
          $('.selected').removeClass('selected');
          $('#l_tab').addClass('selected');
          controller.view.showLoginForm(
            controller.clickListeners('login')
          );
        });
        $('#r_tab').click(function(){
          $('.selected').removeClass('selected');
          $('#r_tab').addClass('selected');
          controller.view.showSignupForm(
            controller.clickListeners('signup')
          );
        });
      };
    if(type === 'login')
      return function(){
        $('.eye').click(controller.view.togglePassword);
        $('#submit').click(function () {
          controller.sendForm('login');
        });
      };
    if(type === 'signup')
      return function(){
        $('.eye').click(controller.view.togglePassword);
        $('#submit').click(function () {
          controller.sendForm('signup');
        });
      };
  };

  checkLogin(){
    let email = $('#email');
    let pass = $('#password');
    let valid_e = /[\w]+@[\w]+\.[\w]/.test(email.val());
    let valid_p = pass.val().length > 0;
    let out = undefined;
    if(!valid_e || !valid_p){
      out = '';
      if(!valid_e)
        out += 'Must enter a valid email<br>';
      if(!valid_p)
        out += 'Must enter a password';
    }
    return out;
  };

  checkSignup(){

  }


  sendForm(url) {
    let controller = this;
    let data = $('.login-container form').serialize();
    let login_errors = controller.checkLogin();

    if(login_errors){
      controller.view.showLoginError(login_errors);
    }
    else{
      controller.request(
        'POST',
        url,
        data,
        controller.showSuccess(controller.showAssets()), //If we get a 200, show the assets.
        controller.showLogin(), //If we get a 403, show the login
        controller.showError());//If we get something else, show 'No server' screen.
    }
  };

  request(type, url, data, success, restricted, error) {
    if(! /http/.test(url))
      url = this.bh + url;
    $.ajax({
      url: url,
      type: type,
      data: data,
      success: success,
      error: function(r, s, x) {
        if(r.status === 401 || r.status === 403) {
          if (restricted) restricted(r);
        }
        else{
          if(error) error(r);
        }
      }
    });
  };

}

