$(".toggleMenu").on('click', function(){

    $("#mainMenu").toggleClass('open');
  });
  
  
function nextPage(){
  
    var url = window.location.href
  
    var urlParam = new URL(url)
  
    var page = urlParam.searchParams.get("page")  
    
    if (page == null) {
        window.location.search += "&page=2"
  
    }
    else {

        var pageInt = parseInt(page, 10)
        var pageNew = pageInt + 1;
        location.href = location.href.replace("page="+page, "page=" + pageNew)
    }
   
  
  
  }
  
  
function prevPage(){
  
    var url = window.location.href
  
    var urlParam = new URL(url)
  
    var page = urlParam.searchParams.get("page")  
  
    if (page === null || page === "1") {

         window.location.href = "/inventory/homepage"
  
    }
    else{
        var pageInt = parseInt(page, 10)
  
        var pageNew = pageInt - 1;
  
        location.href = location.href.replace("page="+page, "page=" + pageNew)
    }
    }