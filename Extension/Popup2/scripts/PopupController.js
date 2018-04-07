class PopupController {
  constructor() {
    this.model = new PopupModel();
    this.view = new PopupView();
    this.bh = 'http://localhost:8000/popup/';
  }

  connect() {
    let controller = this;
    controller.view.showLoader();

    this.request(
      'GET',
      'subscriber',
      undefined,
      controller.showAssets(),
      controller.showLogin(),
      controller.showError());
  };

  showAssets() {
    let controller = this;
    return function(r) {
      console.log(r);
      controller.view.showAssets(r);
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
  }


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
  }

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
  }

}

