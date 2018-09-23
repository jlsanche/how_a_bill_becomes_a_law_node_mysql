function searchMemberByName() {

  var name_search_string = document.getElementById("name_search_string").value
  console.log(name_search_string);
  
  window.location = "/congress/search/" + encodeURI(name_search_string)

}