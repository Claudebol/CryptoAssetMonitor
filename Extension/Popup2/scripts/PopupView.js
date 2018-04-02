
$(document).ready(function(){
  showLoader();

  function showLoader(){
    $('#content').load('views/loader.html')
  }
  function showLogin(){
    $('#content').load('views/login.html')
  }
});
