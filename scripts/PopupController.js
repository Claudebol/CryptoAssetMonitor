class PopupController {
  constructor() {
    this.model = new PopupModel();
    this.view = new PopupView();
    //this.bh = 'http://localhost:8000/popup/';
     this.bh = 'http://stsherman.us-east-2.elasticbeanstalk.com/popup/';
  }

  connect() {
    let controller = this;
    controller.view.adjustSizeFor('base');
    setTimeout(function() {
      controller.view.showLoader();
      controller.request(
          'GET',
          'subscription',
          undefined,
          controller.showAssets(),
          controller.showLogin(),
          controller.showError());
      },
      750);
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
    return function(){
      controller.view.showLogin(controller.setLoginClickListeners());
    }
  };

  showError() {
    let controller = this;
    return function(r){
      controller.view.showError(r);
    }
  };


  setLoginClickListeners() {
    let controller = this;
    return function() {
      $('.eye').click(controller.view.togglePassword);
      $('#login-button').click(function () {
        let data = $('.login-container form').serialize();
        controller.request(
          'POST',
          'login',
          data,
          controller.showAssets(),
          controller.showLogin(),
          controller.showError());
      });
      $('#signup-button').click(function () {
        let data = $('.login-container form').serialize();
        controller.request(
          'POST',
          'subscriber',
          data,
          controller.showAssets(),
          controller.showLogin(),
          controller.showError());
      });
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
        if(r.status === 403)
          if(restricted) restricted();
        else
          if(error) error(r);
      }
    });
  };

}

