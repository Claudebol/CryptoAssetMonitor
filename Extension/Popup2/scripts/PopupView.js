
$(document).ready(function(){
  //showLoader();
  showLogin();


  function showLoader(){
    $('#content').load('views/loader.html')
  }
  function showLogin(){
    $('#content').load('views/login.html', function(){
      $('.eye').click(togglePassword);
    });
  }


  function togglePassword(){
    var pword = $('#password');
    var swap = pword.data('type');
    pword.data('type', pword.prop('type'));
    pword.prop('type', swap);

    var eye = $('.eye');
    swap = eye.data('title');
    eye.data('title', eye.prop('title'));
    eye.prop('title', swap);
    $('.eye div').toggleClass('hide');
  }
});
