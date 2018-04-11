class PopupController {
  constructor() {
    this.model = new PopupModel();
    this.view = new PopupView();
    this.bh = 'http://localhost:8000/popup/';
    //this.bh = 'http://stsherman.us-east-2.elasticbeanstalk.com/popup/';
  }

  connect() {
    let controller = this;
    controller.view.showLoader(); //Fade the loader in.
    setTimeout(function(){ //Wait for 1500ms to just show the loader.
      controller.request( //Request to the server.
        'GET',
        'subscription',
        undefined,
        controller.showWelcome(controller.showAssets()), //If we get a 200, show the assets.
        controller.showLogin(), //If we get a 403, show the login
        controller.showError()); //If we get something else, show 'No server' screen.
    }, 1500);
  };

  showWelcome(f) {
    let controller = this;
    return function(r){
      controller.view.showWelcome();
      setTimeout(function(){
          f(r);
        },2000
      );
    }
  }

  showSuccess(f) {
    let controller = this;
    return function(r){
      controller.view.showSuccess();
      setTimeout(function(){
          f(r);
        },2000
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
        controller.view.showLogin(controller.setLoginClickListeners());
    }
  };

  showError() {
    let controller = this;
    return function(r){
      console.log(r);
      controller.view.showError(r);
    }
  };


  setLoginClickListeners() {
    let controller = this;
    return function() {
      $('.eye').click(controller.view.togglePassword);
      $('#login-button').click(function () {
        controller.sendForm('login');
      });
      $('#signup-button').click(function () {
        controller.sendForm('subscriber');
      });
    }
  };

  sendForm(url) {
    let controller = this;
    let email = $('#email');
    let pass = $('#password');
    let data = $('.login-container form').serialize();
    let valid_e = /[\w]+@[\w]+\.[\w]/.test(email.val());
    let valid_p = pass.val().length > 0;


    if(!valid_e || !valid_p){
      let out = '';
      if(!valid_e)
        out += 'Must enter a valid email<br>';
      if(!valid_p)
        out += 'Must enter a password';
      controller.view.showLoginError(out);
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

