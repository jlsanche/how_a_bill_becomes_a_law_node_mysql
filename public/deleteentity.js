function deleteBill(id){
  $.ajax({
      url: '/bill/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};


function deleteMember(id){
    $.ajax({
        url: '/congress/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
  };

  function deleteLobby(id){
    $.ajax({
        url: '/lobby/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
  };

  function deleteCongressLobby(cid, cid){
    $.ajax({
        url: '/money_taken/cid/' + cid + '/congress/' + lid,
        type: 'DELETE',
        success: function(result){
            if(result.responseText != undefined){
              alert(result.responseText)
            }
            else {
              window.location.reload(true)
            } 
        }
    })
  };

  function deletePresident(id){
    $.ajax({
        url: '/president/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
  };

