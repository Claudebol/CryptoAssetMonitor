class PopupView{
  constructor(){
    this.datatable = undefined;

  }
  showLoader() {
    $('#content').load('views/loader.html')
  };
  showLogin(fn) {
    $('#content').fadeOut(function() {
      $('#content').load('views/login.html', function(){
        $('#content').fadeIn(700);
        if(fn) fn();
      });
    });
  };
  showAssets() {
    let view = this;
    $('.header-container').addClass('hide');

    $('#content').fadeOut( function() {
      $('#content').load('views/assets.html', function(){
        $('#content').fadeIn(700);
        view.datatable = $('.assets').dataTable({
          bPaginate: false,
          scrollY: 350,
          scrollCollapse: true,
          searching: false,
          info: false,
          autoWidth: false
        });
      });
    });

  };
  showError(status) {
    console.log(status);
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

  addRow(data) {
    if(!data.img) data.img = "";
    if(!data.balance) data.balance = 0;
    if(!data.value) data.value = 0;
    if(!data.percent) data.percent = 0;

    let _icon = "<div class='icon_"+ data.id +"'><img width='30' height='30' src='"+ data.img +"'></div>";
    let _balance = "<div class='balance_"+ data.id +"'><input type='number' value='"+ data.balance +"'></div>";
    let _value = "<div class='value_"+ data.id +"'><input type='number' value='"+ data.value +"'></div>";
    let _percent = "<div class='percent_"+ data.id +"'><input type='number' value='"+ data.percent +"'></div>";

    this.datatable.fnAddData([_icon, _balance, _value, _percent]);
  };
}



var dt;

function addRow(){
  dt.fnAddData(['I', 123, 431.23, 42]);
}


