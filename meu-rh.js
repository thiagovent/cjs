var debugScript = true;

router = function() {
  console.log("checking cjs : meu-rh.js");
  if (window.location.href.includes("/clockings")) {
    console.log("includes /clockings");
    waitFor(() => $("#table-timesheet")[0], () => readHours());
  } else {
    console.log("unknow page, ignoring script");
  }
}

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

readHours = function() {
  var columnSum = $("#table-timesheet").find("tr:first").find("th")[0].cloneNode(true);
  columnSum.children[0].innerHTML = "Saldo"
  $("#table-timesheet").find("tr:first").append(columnSum);

  for(var tr of $("#table-timesheet").find("tr")) {
      if (tr.children[1].children[0] && tr.children[1].children[0].children[0]) {

          var incoming = new Array();
          var items = $(tr.children[1]).find('a');
          for (item of items) {
              if (item.innerHTML.trim().length > 0) {
                  incoming.push(item.innerHTML.trim());
              }
          }

          var outcoming = new Array();
          items = $(tr.children[2]).find('a');
          for (item of items) {
              if (item.innerHTML.trim().length > 0) {
                  outcoming.push(item.innerHTML.trim());
              }
          }



          if (incoming.length != outcoming.length) {

          } else {
            calculateHours(incoming, outcoming);
          }


      }
  }
}

calculateHours = function(incoming, outcoming) {
  var worked = 0;

  for (var i = 0; i < incoming.length; i++) {
      var time = incoming[i].split(':');
      var minutes = parseInt(time[0], 10)*60 + parseInt(time[1],10);

      time = outcoming[i].split(':');
      worked += parseInt(time[0], 10)*60 + parseInt(time[1],10) - minutes;
  }

  if (worked > 0) {
      var columnSumItem = $(tr).find("td")[0].cloneNode(true);
      columnSumItem.children[0].children[0].innerHTML = (worked-510);

      var hours = parseInt(worked/60);

      columnSumItem.children[2].innerHTML = pad(hours, 2) + ':' + pad(worked - hours*60, 2);
      columnSumItem.children[3].remove();

      $(tr).append(columnSumItem);
  }
}

waitFor = function(f, c) {
    if (debugScript) { console.log("waiting"); }
    var waitForZ = setInterval(
        () => {
            if (f()) {
                if (debugScript) { console.log("done, loading"); }
                clearInterval(waitForZ);
                c();
                return;
            }
            if (debugScript) { console.log("waiting"); }
        }
    , 300);

}

router()
