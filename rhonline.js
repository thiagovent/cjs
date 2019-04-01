
function seek() {
	document.getElementById("GB_txtJustificativa").value = "Expediente normal";
	let lines = document.getElementById("GB_pnGridBatidas").getElementsByTagName("table");
	for( let i = 0; i< lines.length; i++ ) {
		let line = lines[i];
		let cells = line.getElementsByTagName("td");
		let values = line.getElementsByTagName("input");
		if (values[0].value || values[1].value) {
			// first in or out
			if (hasAllValuesStartIn(values, 0)) {
				continue;
			} else if (values[0].value) {
				if (checkLeftBehinds(values, 0)) {
					continue;
				}
			} else if (hasAllValuesStartIn(values, 1) || checkLeftBehinds(values,1)) {
				continue;
			}

			console.log("erro");
		}
	}
};

function hasAllValuesStartIn(values, start) {
	for(let i = start; i < start+4; i++) {
		if (!values[i] || !(values[i].value || values[i].innerHTML) ) {
			return false;
		}
	}
	return true;
};

function checkLeftBehinds(values, start) {
	return oneLeftBehind(values, start) || twoLeftBehind(values, start);
};

function oneLeftBehind(values, start) {
	if (values[start].value && values[start+1].value && values[start+2].value) {
		let split = values[1].value.split(":");
		if (parseInt(split[0]) <= 12) { // out = ok
			values[start+4].value = (parseInt(split[0])+1) + ":" + split[1];
		} else { // in = ok
			values[start+3].value = (parseInt(split[0])-1) + ":" + split[1];
		}
		return true;
	}

	return false;
};

function twoLeftBehind(values, start) {
	if (values[start].value && values[start+1].value) {
		values[start+2].value = "13:00";
		values[start+3].value = "12:00";
		return true;
	}

	return false;
};

function calculateHours() {
	let table = document.getElementById("ctl25_gridEspelhoCartao_gridEspelhoCartao");
	let cell = table.getElementsByTagName("tr")[0].insertCell(3)
	cell.innerHTML = "Horas";

	let total = 0;

	let rows = table.getElementsByClassName("RowGrid");
	for( let i = 0; i < rows.length; i++ ) {
		cell = rows[i].insertCell(3);
		let cells = rows[i].getElementsByTagName("td");
		let minutes = correctHoursSum(cells);
		if (minutes > 0) {
			let diff = minutes-510;
			if (diff < -10 || diff > 10) {
				total += diff;
			}
			cell.innerHTML = pad(parseInt(minutes/60)) + ":" + pad((minutes % 60)) + " (" + diff + ")";
		}
	}

	document.getElementById("ctl25_totaisEnvelope_cellUndefinedLabel").innerHTML = "<b>Calculado</b>";
	document.getElementById("ctl25_totaisEnvelope_cellUndefinedLabel").align = "right";

	let hours = parseInt(total/60);
	let minutes = (total % 60);
	if (minutes < 0) {
		minutes *= -1;
	}
	document.getElementById("ctl25_totaisEnvelope_cellUndefined").innerHTML = pad(hours) + ":" + pad(minutes);
	document.getElementById("ctl25_totaisEnvelope_cellUndefined").className = "lblAbonos";
};

function pad(num, size) {
	if(!size) size = 2;
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};

function correctHoursSum(values) {
	let start = 4;
	if (hasAllValuesStartIn(values, start)) {
		return getMinutes(values[start+1])-getMinutes(values[start]) + getMinutes(values[start+3])-getMinutes(values[start+2]) + getMinutes(values[start+5])-getMinutes(values[start+4]);
	}

	return 0;
};

function getMinutes(html) {
	let value = html.innerHTML;
	if (value.indexOf(":") < 0) {
		return 0;
	}
	let splitted = value.split(":");
	return parseInt(splitted[0])*60+parseInt(splitted[1]);
};

function isGeneralView() { return document.getElementById("ctl25_EspelhoCartaoDiv"); }

function isAppointmentEntry() { return window.location.search.indexOf("MasterCaptionForAnnex") > 0 }
function addAppointmentButton() {
	let seekCell = document.getElementById("GB_ButtonsCell").children[0].rows[0].insertCell();
	seekCell.innerHTML = '<td style="padding-left: 10px"><span name="" id=""><table cellpadding="0" cellspacing="0"><tbody><tr><td align="center"><img id="GB_btn_tbimage" class="ToolButtonImage" onclick="seek()" src="/Corpore.Net/SharedServices/Images/gv_Refresh.gif" style="border-width: 0px; cursor: pointer;"><span><br></span><span id="GB_btn_tblabel" class="ToolButtonLabel" onclick="seek()">Automático</span></td></tr></tbody></table></span></td>';
}

if (isAppointmentEntry()) addAppointmentButton();
else if (isGeneralView()) calculateHours();
