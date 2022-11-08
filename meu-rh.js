var debugScript = true;

function router() {
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

function readHours() {
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
            includeAddAppointmentButton(tr, incoming, outcoming);
          } else if (incoming.length == 1 && isMissingLunchBreak(incoming, outcoming)) {
            addLunchBreak(tr, incoming, outcoming);
          } else {
            calculateHours(tr, incoming, outcoming);
          }


      }
  }
}

isMissingLunchBreak = (incoming, outcoming) => (getMinutesFromString(outcoming[0]) - getMinutesFromString(incoming[0])) > 6*60;

function includeAddAppointmentButton(tr, incoming, outcoming) {
  // first incoming is after 11:00, probabily is the lunch break
  if (getMinutesFromString(incoming[0]) > (11*60)) {
    addMorningAppointmentButton(tr);
  } else if (outcoming.length > 0) {
    var first = getMinutesFromString(outcoming[0]) - getMinutesFromString(incoming[0]);
    var second = getMinutesFromString(incoming[1]) - getMinutesFromString(outcoming[0]);

    if (first < 60+30) {
      // the first entry is the lunch break
      addMorningAppointmentButton(tr);
    } else if (second < 60+30) {
      // the second entry is the lunch break
      addEveningAppointmentButton(tr);
    } else {
      // is missing lunch break in or out
      if (first > second) {
        addLunchBreakIn(tr, outcoming[0]);
      } else {
        addLunchBreakReturn(tr, outcoming[0]);
      }
    }
  }
}

randomId = () => (Math.random() + 1).toString(36).substring(5);

addMorningAppointmentButton = (tr) => addButton(tr, 'Adiciona entrada às 8h', () => addAppointment(tr, 'entry', '08:00'));
addEveningAppointmentButton = (tr) =>  addButton(tr, 'Adiciona saída às 18h', () => addAppointment(tr, 'exit', '18:00'));
addLunchBreakIn = (tr, lunchBreakStart) => addButton(tr, 'Adiciona saída para o almoço', () => addAppointment(tr, 'exit', subtractHour(lunchBreakStart)));
addLunchBreakReturn = (tr, lunchBreakStart) => addButton(tr, 'Adiciona volta do almoço', () => addAppointment(tr, 'entry', addHour(lunchBreakStart)));

addLunchBreak = (tr, incoming, outcoming) => {
  let firstIn = getMinutesFromString(incoming[0]);
  let diff = getMinutesFromString(outcoming[0]) - firstIn;
  firstIn += (diff/2 - 30);

  let time = getStringFromMinutes(firstIn);

  addButton(tr, 'Adiciona almoço', () => {
    addAppointment(tr, 'exit', time);
    addAppointment(tr, 'entry', addHour(time));

  });
}

addHour = (stringHour) => {
  let time = stringHour.split(':');
  return formatIntAsString(parseInt(time[0], 10) + 1) + ":" + time[1];
}

subtractHour = (stringHour) => {
  let time = stringHour.split(':');
  return formatIntAsString(parseInt(time[0], 10) - 1) + ":" + time[1];
}

addButton = (tr, label, onclick) => {
  let id = randomId();
  $(tr).append('<button type="button" id="' + id + '" class="po-button po-text-ellipsis">'
                + '<po-icon class="po-button-icon">'
                  + '<i aria-hidden="true" class="po-icon po-icon-plus"></i>'
                + '</po-icon>'
                + '<span class="po-button-label">' + label + '</span>'
              + '</button>');

  $('#' + id).on( "click", () => $('#' + id).remove());
  $('#' + id).on( "click", onclick);
}

formatIntAsString = (int) => int < 9 ? '0' + int : int;

function getMinutesFromString(string) {
  let time = string.split(':');
  return parseInt(time[0], 10)*60 + parseInt(time[1],10);
}

function getStringFromMinutes(time) {
  let hours = parseInt(time/60, 10)
  let minutes = time - (hours*60);
  return formatIntAsString(hours) + ':' + formatIntAsString(minutes);
}

getDateFromLine = (tr) => {
  let date = $(tr).find("a")[0].innerHTML.split('/');
  let year = new Date().getFullYear();
  if (new Date().getMonth() == 0 && parseInt(date[1], 10) == 12) {
    year--;
  }
  return year + "-" + date[1] + '-' + date[0] + 'T03:00:00.000Z';
}

function calculateHours(tr, incoming, outcoming) {
  let worked = 0;

  for (var i = 0; i < incoming.length; i++) {
      worked += getMinutesFromString(outcoming[i]) - getMinutesFromString(incoming[i]);
  }

  if (worked > 0) {
      let columnSumItem = $(tr).find("td")[0].cloneNode(true);
      columnSumItem.children[0].children[0].innerHTML = (worked-510);

      let hours = parseInt(worked/60);

      columnSumItem.children[2].innerHTML = pad(hours, 2) + ':' + pad(worked - hours*60, 2);
      columnSumItem.children[3].remove();

      $(tr).append(columnSumItem);
  }
}

function addAppointment(tr, direction, stringHour, justify) {
  let url = "/rm/api/rest/timesheet/clocking/%7Bcurrent%7D";
  var date = getDateFromLine(tr);
  let data = {
    "date": date,
    "direction": direction,
    "hour":getMinutesFromString(stringHour)*60*1000,
    "referenceDate": date,
    "justify": justify || "expediente",
    "origin":"manual"
  };

  console.dir(data);

  $.ajax({
    url: url,
    async: false,
    type: 'POST',
    contentType : 'application/json',
    data: JSON.stringify(data),
    success: (data) => console.log(data),
    error: (data) => console.dir(data)
  });

}

function waitFor(f, c) {
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
