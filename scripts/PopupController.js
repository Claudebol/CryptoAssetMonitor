class PopupController {
  constructor() {
    this.model = new PopupModel();
    this.view = new PopupView();
    this.bh = 'http://localhost:8000/popup/';
    //this.bh = 'http://stsherman.us-east-2.elasticbeanstalk.com/popup/';
  }

  connect() {
    let controller = this;
    controller.view.showConnectSpinner(
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
    if(!type) type = 'access';
    let listeners = {
      //Click listeners for login/register tabs and login since that the initial view
      access: function(){
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
      },
      //Click listener for the login view
      login: function(){
        $('.eye').click(controller.view.togglePassword);
        $('.form-field input').focus(function(){
          this.classList.remove('invalid');
        });
        $('#submit').click(function () {
          controller.sendForm('login');
        });
      },
      //Click listener for the signup view
      signup: function(){
        $('.eye').click(controller.view.togglePassword);
        $('.form-field input').focus(function(){
          this.classList.remove('invalid');
        });
        $('#submit').click(function () {
          controller.sendForm('signup');
        });
      }
    };
    //Return the proper function.
    return listeners[type];
  };

  checkLogin(){
    let email = $('#email');
    let pass = $('#password');
    let valid_e = /[\w]+@[\w]+\.[\w]/.test(email.val());
    let valid_p = pass.val().length > 0;
    let out = '';

    if(!valid_e){
      out += 'Email must contain a "@" and a "."';
      email.addClass('invalid');
    }else{
      email.removeClass('invalid');
    }
    if(!valid_p){
      if(out) out += '<br>';
      out += 'Must enter a password';
      pass.addClass('invalid');
    }else{
      pass.removeClass('invalid');
    }

    return out;
  };

  checkSignup(){

  }


  sendForm(url) {
    let controller = this;
    let data = $('.access-container form').serialize();
    let login_errors = controller.checkLogin();

    if(login_errors){
      controller.view.showLoginError(login_errors);
    }
    else{
      controller.view.addAuthSpinner();
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

