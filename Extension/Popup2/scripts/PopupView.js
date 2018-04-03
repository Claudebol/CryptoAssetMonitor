

var dt;

function addRow(){
  dt.fnAddData(['I', 123, 431.23, 42]);
}

$(document).ready(function(){
  //showLoader();
  //showLogin();
  showAssets();

  function showLoader(){
    $('#content').load('views/loader.html')
  }
  function showLogin(){
    $('#content').load('views/login.html', function(){
      $('.eye').click(togglePassword);
    });
  }

  function showAssets(){
    $('.header-container').addClass('hide');
    $('#content').load('views/assets.html', function(){
      dt = $('.assets').dataTable({
        bPaginate: false,
        scrollY: 350,
        scrollCollapse: true,
        searching: false,
        info: false,
        autoWidth: false
      });
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
