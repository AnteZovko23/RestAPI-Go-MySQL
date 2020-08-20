

$(document).ready(function(){
    $.getJSON("/all" + window.location.search, function(data){
        var itemArr = data.All
        var employee_data = '';   

        var test = ['nfl', 'nhl', 'pga', 'mlb','col1', 'col2', 'col3', 'col4'];

        var num = Math.floor(Math.random() * 7);
     
            
        
          $.each(itemArr, function(key, value){
            employee_data += '<section class="row-fadeIn-wrapper">'
            employee_data += '<article class="row ' + test[num] + '">'
            employee_data += '<ul>'
            employee_data += '<li>' + value.Name + '</li>'
            employee_data += '<li>' + value.Description + '</li>'
            employee_data += '<li></li>'
            employee_data += '<li>' + value.Category + '</li>'
            employee_data += '<li>' + value.Barcode+ '</li>'
            employee_data += '</ul>'
            employee_data += '<ul class="more-content">'
            employee_data += '<li></li>'
            employee_data += '</ul>'
            employee_data += '</article>'
            employee_data += '</section>'
        });
            
        $('#employee_table').append(employee_data)
    });
});