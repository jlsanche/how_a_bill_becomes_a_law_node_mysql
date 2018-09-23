
function updateBill(id){
  $.ajax({
      url: '/bill/' + id,
      type: 'PUT',
      data: $('#update-bill').serialize(),
      success: function(result){
          window.location.replace("./");
      }
  })
};

function updateCongress(id){
    $.ajax({
        url: '/congress/' + id,
        type: 'PUT',
        data: $('#update-congress').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
  };

  function updateLobby(id){
    $.ajax({
        url: '/lobby/' + id,
        type: 'PUT',
        data: $('#update-lobby').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
  };

  function updatePresident(id){
    $.ajax({
        url: '/president/' + id,
        type: 'PUT',
        data: $('#update-president').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
  };