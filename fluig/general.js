// Here You can type your custom JavaScript...
var field = '<div class="header-grouper-center">'+
'<div id="SlotInstantSearch" slot="true" class="slotint slot-header-actions">'+
'<div id="_instance_91106_" appcode="suggestsearch">'+
'<div id="wcm_widget_91106" class="wcm_widget">'+
'<div class="wcm_corpo_widget_single">'+
'<div id="youtube" class="fluig-style-guide suggest-search clearfix super-widget" data-params="SearchSuggest.instance({\'openNewTab\': \'false\'})">'+
'<div class="input-group">'+
'<span class="input-group-btn">'+
'<button id="youtubeGo" class="btn btn-default" onclick="startFunctions()">'+
'<span class="fluigicon fluigicon-process-adhoc"></span>'+
'</button>'+
'</span>'+
'</div>'+
'</div>'+
'</div>'+
'</div>'+
'</div>'+
'</div>'+
'</div>';

$(".header-grouper-left").after(field);

function random() { return Math.random().toString(36).substring(2, 15); }

let create = {}
create.tenant = {
    url: '/portal/api/rest/wcm/rest/admin/tenant/create',
    data: (code, dir) => {
        let adminLogin = "adm" + (code == "1" ? "" : code);
        let data = {"formData":{"editCode":"","data":"","id": code,"tCode": code,"description": code,"federalId": code,"defaultDir": dir,"email": adminLogin + "@adm.com","login": adminLogin, "password":"adm", "confirmPassword":"adm","name": adminLogin,"lastName":"adm","emailhost":"","emailport":"","emailfrom":"","emailsecurity":"none","emailuser":"","emailpassword":"","idpLogOff":false,"thumbnailEnabled":false,"removeVolume":false,"emailenabled":false,"emailgrouped":false,"emailauthentication":false},"config":{"validateFields":[{"key":"description"}]}};
        return JSON.stringify(data);
    },
    send: () => { send(create.tenant.url, create.tenant.data($("#codeCreateTenant").val(), $("#dirCreateTenant").val()));}
};

create.group = {
    url: '/portal/api/rest/wcm/service/group/create',
    data: (code, users) => {
        let data = {"formData":{"addUsers":users.toString(),"addRoles":"","addChildGroups":"","data":"","groupCode":code,"groupDescription":code},"config":{"validateFields":[{"key":"groupCode"},{"key":"groupDescription"}]}};
        return JSON.stringify(data);
    },
    send: (code, users) => { send(create.group.url, create.group.data(code, users)); }
};

function modalCreateTenant() {
	$("#modal-title").html('Criação de empresa');
	$("#modal-body").html('Código <input type="text" id="codeCreateTenant" value="1"/><br>Diretório <input type="text" id="dirCreateTenant" value="/fluig/empresas/develop-' + random() + '/"/>');
	$("#modal-ok").click(function () { 
        create.tenant.send(); 
        $('#myModal').modal('hide')
    });

	$('#myModal').modal();
}


function createStarWarsUserGroup() {
	create.group.send("all", "adm,darth.vader,luke.skywalker,leia.organa,chewbacca,darth.maul");
}

/*
	Criação de papel
*/
var urlCreateRole = "/portal/api/rest/wcm/service/role/create";
function fDataCreateRole(name) { return '{"formData":{"editCode":"","addUsers":"adm,darth.vader,darth.maul","data":"","code":"' + name + '","description":"' + name + '","selectedItens":[]},"config":{"validateFields":[{"key":"description"}]}}'; }
function createStarWarsEmpireRole() {
	send(urlCreateRole, fDataCreateRole("Empire"));
}


/*
	Cancelamento de solicitacoes em lote
*/
// TODAS
var urlCancelProcessInstance = "/ecm/api/rest/ecm/workflowView/cancelInstance/";
function fDataCancelProcessInstance(id) {
	return '{"processInstanceId":' + id + ',"taskUserId":"' + WCMAPI.userCode + '","cancelText":"teste de cancelamento"}';
}
var cancelAllProcessInstances = function () {
	var url = '/ecm/api/rest/ecm/centralTasks/getTasks/requests/' + WCMAPI.userCode + '?filter=%7B%22id%22:0,%22name%22:%22%22,%22isActive%22:false,%22isModified%22:false,%22fields%22:%7B%7D,%22order%22:%7B%7D,%22firstValue%22:0,%22pageDirection%22:%22forward%22%7D&_search=false&nd=1464031563332&rows=1000&page=1&sidx=processInstanceId&sord=asc';
	send(url, undefined, 'GET', undefined, function (data) {
	    var i;
	    for (i = 0; i < data.invdata.length; i++) {
			send(urlCancelProcessInstance, fDataCancelProcessInstance(data.invdata[i].processInstanceId));
		}
	});
};

// POR INTERVALO
function cancelInstances(start, end) {
	var continuar = true;
	var cancelamento = function (id) {
		var waiting = setInterval( function() { if ( continuar ) {clearInterval(waiting)} }, 100 );
		var next = function() { continuar = true; };			
		continuar = false;
		fSend( urlCancelarSolicitacao, fDataCancelarSolicitacao(id), null, null, next, next  );
	};
	if ( start < end ) {
		for( var i = start; i <= end; i++ ) {
			cancelamento(i);
		}
	} else {
		for( var i = start; i >= end; i-- ) {
			cancelamento(i);
		}
	}
}

function modalCancelProcessInstances() {
	$("#modal-title").html('Cancelamento de solicitações');
	$("#modal-body").html('Início <input type="text" id="cancelInstancesStart" value="1"/><br>Fim <input type="text" id="cancelInstancesEnd" value="10"/><br>');
	$("#modal-ok").click(function() { 
	    cancelInstances($("#cancelInstancesStart").val(),$("#cancelInstancesEnd").val());
	});

	$('#myModal').modal();
};


/*
	Exclusão de solicitações e remoção de processos
*/
urlDeleteProcess = '/ecm/api/rest/ecm/processdefinition/removeProcessDefinition/';
function deleteInstancesAndProcess() {
	var count;
	do {
		count = 0;
		send('/ecm/api/rest/ecm/processdelete/getAllProcessAvailableToDelete', undefined, 'GET', undefined, function(data) {
			for( var i = 0; i < data.length; i++ ) {
				if ( data[i].processId != 'FLUIGADHOC' && data[i].processId != 'FLUIGADHOCPROCESS' ) {
					count++;
					var newData = '{"initialDate":"23/4/2010","finalDate":"23/5/2030","initialInstance":0,"finalInstance":99999999,"finished":true,"canceled":true,"processId":"'+data[i].processId+'"}';
					send('/ecm/api/rest/ecm/processdelete/getInstancesToDelete', newData, 'POST', undefined, function(data2) {
						var instances = new Array();
						for( var j = 0; j < data2.length; j++ ) {
							instances.push(""+data2[j].processInstanceId);
						}
						send('/ecm/api/rest/ecm/processdelete/deleteInstances',JSON.stringify({'selectedRows':instances}), undefined, undefined, function() {
							send(urlDeleteProcess + data[i].processId, undefined, 'GET');
						});
					});
				}
			}
		});
	} while ( count > 0 );
};

/*
	Criação de processos
*/
urlCreateProcess = "/ecm/api/rest/ecm/processdefinition/createProcessDefinition";
urlSaveProcess = "/ecm/api/rest/ecm/workflowModeling/saveProcess";
urlReleaseProcess = "/ecm/api/rest/ecm/workflowModeling/releaseprocess?processId=";

function fDataCreateProcess(diagramId,diagramName) {
	return '{"processId":"'+diagramId+'","processDescription":"'+(diagramName || diagramId)+'","version":0,"active":null,"editionMode":null,"bpmnVersion":0,"mobileReady":false}';
}

function createSimpleProcess() {
	idProcess = 'z';
	send( urlCreateProcess, fDataCreateProcess(idProcess));
	send( urlSaveProcess, '<list><ProcessDefinition><processDefinitionPK><companyId>1</companyId><processId>z</processId></processDefinitionPK><processDescription>z</processDescription><instruction></instruction><active>true</active><publicProcess>false</publicProcess><volumeId></volumeId><categoryId></categoryId><managerEngineAllocationId></managerEngineAllocationId><managerEngineAllocationConfiguration></managerEngineAllocationConfiguration><snapshotFrequency>0</snapshotFrequency><baseDay>0</baseDay><baseMonth>0</baseMonth><periodId>Default</periodId><keyWord></keyWord><uniqueCardVersion>false</uniqueCardVersion></ProcessDefinition><ProcessDefinitionVersion><processDefinitionVersionPK><companyId>1</companyId><processId>z</processId><version>1</version></processDefinitionVersionPK><versionDescription></versionDescription><formId>0</formId><editionMode>true</editionMode><updateAttachmentsVersion>false</updateAttachmentsVersion><controlsAttachmentsSecurity>false</controlsAttachmentsSecurity><active>true</active><counterSign>false</counterSign><mobileReady>false</mobileReady><processDiagram>&lt;svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1228" height="500" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" xmlns:xlink="http://www.w3.org/1999/xlink"&gt;&lt;desc style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;Created with Raphaël&lt;/desc&gt;&lt;defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;linearGradient id="r0" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r1" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r2" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#d4e7f8" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#f9fbfc" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r3" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r4" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r5" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r6" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r7" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;/defs&gt;&lt;circle cx="334.5" cy="166.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;rect x="443.5" y="59.5" width="105" height="55" r="10" rx="10" ry="10" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M349.7895335971638,153.0045329970618L430.5281239082959,113.26014953121037" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M349.99515837882296,153.88783225314907L345.99515837882296,153.88783225314907" opacity="0" transform="rotate(513.790818653544 347.99515837882296 153.88783225314907)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M440.01406195414796,111.05190139099219L430.01406195414796,106.05190139099219L430.01406195414796,116.05190139099219Z" transform="rotate(333.7908186535439 435.01406195414796 111.05190139099219)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;circle cx="637.5" cy="183.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M535.6284964977941,112.75370962570409L610.7804466812927,164.0057463232844" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M535.9761653473427,111.62685481285205L531.9761653473427,111.62685481285205" opacity="0" transform="rotate(214.29315872036034 533.9761653473427 111.62685481285205)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M619.9112745574213,166.8228833554145L609.9112745574213,161.8228833554145L609.9112745574213,171.8228833554145Z" transform="rotate(34.29315872036034 614.9112745574213 166.8228833554145)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="1"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="330.5" cy="162.5" r="17.5" fill="#ffffff" stroke="#000000" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="2"&gt;&lt;rect xmlns="http://www.w3.org/2000/svg" x="439.5" y="55.5" width="105" height="55" r="10" rx="10" ry="10" fill="(#r2)" stroke="#191970" opacity="1" fill-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; fill-opacity: 1; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;text xmlns="http://www.w3.org/2000/svg" x="492.5" y="88.5" text-anchor="middle" font="10px &amp;quot;Arial&amp;quot;" stroke="none" fill="#191970" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-style: normal; font-variant: normal; font-weight: bold; font-stretch: normal; font-size: 10px; line-height: normal; font-family: Arial; cursor: move;" font-weight="bold"&gt;&lt;tspan style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;Activity&lt;/tspan&gt;&lt;/text&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="4"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="633.5" cy="179.5" r="17.5" fill="#ffffff" stroke="#000000" stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-width: 3px; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;/svg&gt;</processDiagram><inheritFormSecurity>false</inheritFormSecurity></ProcessDefinitionVersion><list><ProcessState><processStatePK><companyId>1</companyId><processId>z</processId><version>1</version><sequence>1</sequence></processStatePK><stateName>Início</stateName><stateDescription>Início</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>true</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>196</positionX><positionY>153</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>z</processId><version>1</version><sequence>2</sequence></processStatePK><stateName>Activity</stateName><stateDescription>Activity</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>314</positionX><positionY>55</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>z</processId><version>1</version><sequence>4</sequence></processStatePK><stateName>Fim</stateName><stateDescription>Fim</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>499</positionX><positionY>170</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState></list><list/><list><ProcessLink><processLinkPK><linkSequence>3</linkSequence><processId>z</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>2</finalStateSequence><initialStateSequence>1</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>5</linkSequence><processId>z</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>4</finalStateSequence><initialStateSequence>2</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink></list><list/><list/><list/><list/><list/><list/><list/><list/><list/><list/><list/></list>' );
	send( urlReleaseProcess + idProcess, null, 'GET');
}
function createLoopProcess() {
	idProcess = 'loop';
	send( urlCreateProcess, fDataCreateProcess(idProcess));
	send( urlSaveProcess, '<list><ProcessDefinition><processDefinitionPK><companyId>1</companyId><processId>loop</processId></processDefinitionPK><processDescription>loop</processDescription><instruction></instruction><active>true</active><publicProcess>false</publicProcess><volumeId></volumeId><categoryId></categoryId><managerEngineAllocationId></managerEngineAllocationId><managerEngineAllocationConfiguration></managerEngineAllocationConfiguration><snapshotFrequency>0</snapshotFrequency><baseDay>0</baseDay><baseMonth>0</baseMonth><periodId>Default</periodId><keyWord></keyWord><uniqueCardVersion>false</uniqueCardVersion></ProcessDefinition><ProcessDefinitionVersion><processDefinitionVersionPK><companyId>1</companyId><processId>loop</processId><version>1</version></processDefinitionVersionPK><versionDescription></versionDescription><formId>0</formId><editionMode>true</editionMode><updateAttachmentsVersion>false</updateAttachmentsVersion><controlsAttachmentsSecurity>false</controlsAttachmentsSecurity><active>true</active><counterSign>false</counterSign><mobileReady>false</mobileReady><processDiagram>&lt;svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1243" height="500" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" xmlns:xlink="http://www.w3.org/1999/xlink"&gt;&lt;desc style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;Created with Raphaël&lt;/desc&gt;&lt;defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;linearGradient id="r0" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r1" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r2" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r3" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#d4e7f8" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#f9fbfc" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r4" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r5" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r6" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r7" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#d4e7f8" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#f9fbfc" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r8" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="r9" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="ra" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rb" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#d4e7f8" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#f9fbfc" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rc" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rd" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="re" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rf" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rg" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rh" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="ri" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rj" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rk" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rl" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rm" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rn" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="ro" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rp" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rq" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rr" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rs" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rt" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="ru" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rv" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rw" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="rx" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;linearGradient id="ry" x1="1.8369701987210297e-16" y1="0" x2="0" y2="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;&lt;stop offset="20%" stop-color="#e9ebec" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;stop offset="75%" stop-color="#ffffff" stop-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;/linearGradient&gt;&lt;/defs&gt;&lt;rect x="479.5" y="111.5" width="105" height="55" r="10" rx="10" ry="10" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;rect x="603.5" y="229.5" width="105" height="55" r="10" rx="10" ry="10" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M559.7959680244172,165.2574534425906L615.8575375660756,218.60636639352356" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M560.3471365545814,163.8787267212953L556.3471365545814,163.8787267212953" opacity="0" transform="rotate(223.57973445360096 558.3471365545814 163.8787267212953)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M624.479616240665,222.05318319676178L614.479616240665,217.05318319676178L614.479616240665,227.05318319676178Z" transform="rotate(43.57973445360096 619.479616240665 222.05318319676178)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;rect x="382.5" y="226.5" width="105" height="55" r="10" rx="10" ry="10" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M595.5003684918966,252.23303667636057L493.4990787702587,250.84840378421165" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M599.5001842459483,252.26018349655132L595.5001842459483,252.26018349655132" opacity="0" transform="rotate(360.7777229942636 597.5001842459483 252.26018349655132)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M493.49953938512937,250.7805367337348L483.49953938512937,245.7805367337348L483.49953938512937,255.7805367337348Z" transform="rotate(180.7777229942636 488.49953938512937 250.7805367337348)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;path fill="none" stroke="#000000" d="M456.77465055678033,219.44242459763163L498.35685186891885,170.14393850592094" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M457.48515136534667,220.9712122988158L453.48515136534667,220.9712122988158" opacity="0" transform="rotate(490.1469036130076 455.48515136534667 220.9712122988158)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M506.58059984750287,166.32196925296049L496.58059984750287,161.32196925296049L496.58059984750287,171.32196925296049Z" transform="rotate(310.1469036130076 501.58059984750287 166.32196925296049)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;circle cx="639.5" cy="73.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M576.5494612783929,105.41870033735137L612.0158697415837,83.80893518070938" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M576.8415245323262,106.45935016867568L572.8415245323262,106.45935016867568" opacity="0" transform="rotate(508.64595127922075 574.8415245323262 106.45935016867568)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M621.2857116067504,81.20731060239858L611.2857116067504,76.20731060239858L611.2857116067504,86.20731060239858Z" transform="rotate(328.64595127922075 616.2857116067504 81.20731060239858)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;circle cx="780.5" cy="334.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;circle cx="335.5" cy="343.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M699.5732378827879,282.61386293908487L753.1537476203489,315.96719229379147" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M699.8753286188133,281.55693146954246L695.8753286188133,281.55693146954246" opacity="0" transform="rotate(211.90184920528128 697.8753286188133 281.55693146954246)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M762.3985207802855,318.6095209676476L752.3985207802855,313.6095209676476L752.3985207802855,323.6095209676476Z" transform="rotate(31.90184920528128 757.3985207802855 318.6095209676476)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;path fill="none" stroke="#000000" d="M397.4534547436252,280.175033170307L351.9456969615994,321.1091469541393" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M400.94041452265054,278.8375165851535L396.94041452265054,278.8375165851535" opacity="0" transform="rotate(318.0286985783406 398.94041452265054 278.8375165851535)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M353.2282975140359,324.45293841702306L343.2282975140359,319.45293841702306L343.2282975140359,329.45293841702306Z" transform="rotate(138.02869857834057 348.2282975140359 324.45293841702306)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;circle cx="309.5" cy="137.5" r="17.5" fill="#999999" stroke="none" opacity="0.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0.5;"/&gt;&lt;path fill="none" stroke="#000000" d="M326.9995114419783,133.6449405265751L465.50022723628916,134.57865321732328" fill-opacity="0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1" stroke-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); fill-opacity: 0; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 1; stroke-opacity: 1; cursor: move;"/&gt;&lt;path fill="none" stroke="#000000" d="M326.99955688923615,133.63145768689373L322.99955688923615,133.63145768689373" opacity="0" transform="rotate(180.38625783052902 324.99955688923615 133.63145768689373)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;"/&gt;&lt;path fill="#000000" stroke="#000000" d="M475.50011361814455,134.6123603165268L465.50011361814455,129.6123603165268L465.50011361814455,139.6123603165268Z" transform="rotate(0.3862578305290185 470.50011361814455 134.6123603165268)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"/&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="2"&gt;&lt;rect xmlns="http://www.w3.org/2000/svg" x="475.5" y="107.5" width="105" height="55" r="10" rx="10" ry="10" fill="url(#r3)" stroke="#191970" opacity="1" fill-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; fill-opacity: 1; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;text xmlns="http://www.w3.org/2000/svg" x="528.5" y="140.5" text-anchor="middle" font="10px &amp;quot;Arial&amp;quot;" stroke="none" fill="#191970" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-style: normal; font-variant: normal; font-weight: bold; font-stretch: normal; font-size: 10px; line-height: normal; font-family: Arial; cursor: move;" font-weight="bold"&gt;&lt;tspan style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;a1&lt;/tspan&gt;&lt;/text&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="4"&gt;&lt;rect xmlns="http://www.w3.org/2000/svg" x="599.5" y="225.5" width="105" height="55" r="10" rx="10" ry="10" fill="url(#r7)" stroke="#191970" opacity="1" fill-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; fill-opacity: 1; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;text xmlns="http://www.w3.org/2000/svg" x="652.5" y="258.5" text-anchor="middle" font="10px &amp;quot;Arial&amp;quot;" stroke="none" fill="#191970" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-style: normal; font-variant: normal; font-weight: bold; font-stretch: normal; font-size: 10px; line-height: normal; font-family: Arial; cursor: move;" font-weight="bold"&gt;&lt;tspan style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;a2&lt;/tspan&gt;&lt;/text&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="6"&gt;&lt;rect xmlns="http://www.w3.org/2000/svg" x="378.5" y="222.5" width="105" height="55" r="10" rx="10" ry="10" fill="url(#rb)" stroke="#191970" opacity="1" fill-opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; fill-opacity: 1; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;text xmlns="http://www.w3.org/2000/svg" x="431.5" y="255.5" text-anchor="middle" font="10px &amp;quot;Arial&amp;quot;" stroke="none" fill="#191970" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-style: normal; font-variant: normal; font-weight: bold; font-stretch: normal; font-size: 10px; line-height: normal; font-family: Arial; cursor: move;" font-weight="bold"&gt;&lt;tspan style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"&gt;a3&lt;/tspan&gt;&lt;/text&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="9"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="635.5" cy="69.5" r="17.5" fill="#ffffff" stroke="#000000" stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-width: 3px; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="11"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="776.5" cy="330.5" r="17.5" fill="#ffffff" stroke="#000000" stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-width: 3px; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="13"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="331.5" cy="339.5" r="17.5" fill="#ffffff" stroke="#000000" stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-width: 3px; position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;g xmlns="http://www.w3.org/2000/svg" sequence="1"&gt;&lt;circle xmlns="http://www.w3.org/2000/svg" cx="305.5" cy="133.5" r="17.5" fill="#ffffff" stroke="#000000" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: relative; top: 0px; left: 0px; z-index: 0; cursor: move;"/&gt;&lt;/g&gt;&lt;/svg&gt;</processDiagram><inheritFormSecurity>false</inheritFormSecurity></ProcessDefinitionVersion><list><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>2</sequence></processStatePK><stateName>a1</stateName><stateDescription>a1</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>350</positionX><positionY>107</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>4</sequence></processStatePK><stateName>a2</stateName><stateDescription>a2</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>474</positionX><positionY>225</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>6</sequence></processStatePK><stateName>a3</stateName><stateDescription>a3</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>253</positionX><positionY>222</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>9</sequence></processStatePK><stateName>Fim</stateName><stateDescription>Fim</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>501</positionX><positionY>60</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>11</sequence></processStatePK><stateName>Fim</stateName><stateDescription>Fim</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>642</positionX><positionY>321</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>13</sequence></processStatePK><stateName>Fim</stateName><stateDescription>Fim</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>false</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>197</positionX><positionY>330</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState><ProcessState><processStatePK><companyId>1</companyId><processId>loop</processId><version>1</version><sequence>1</sequence></processStatePK><stateName>Início</stateName><stateDescription>Início</stateDescription><instruction></instruction><deadlineTime>0</deadlineTime><joint>false</joint><agreementPercentage>0</agreementPercentage><engineAllocationId></engineAllocationId><engineAllocationConfiguration></engineAllocationConfiguration><selectColleague>0</selectColleague><initialState>true</initialState><notifyAuthorityDelay>false</notifyAuthorityDelay><notifyRequisitionerDelay>false</notifyRequisitionerDelay><allowanceAuthorityTime>0</allowanceAuthorityTime><frequenceAuthorityTime>0</frequenceAuthorityTime><noticeExpirationAuthorityTime>0</noticeExpirationAuthorityTime><allowanceRequisitionerTime>0</allowanceRequisitionerTime><frequenceRequisitionerTime>0</frequenceRequisitionerTime><noticeExpirationRequisitionerTime>0</noticeExpirationRequisitionerTime><transferAttachments>false</transferAttachments><subProcessId></subProcessId><formFolder>0</formFolder><notifyAuthorityFollowUp>true</notifyAuthorityFollowUp><notifyRequisitionerFollowUp>false</notifyRequisitionerFollowUp><automatic>false</automatic><positionX>171</positionX><positionY>124</positionY><allowanceManagerTime>0</allowanceManagerTime><forecastedEffort>0</forecastedEffort><forecastedEffortType>0</forecastedEffortType><frequenceManagerTime>0</frequenceManagerTime><noticeExpirationManagerTime>0</noticeExpirationManagerTime><notifyManagerDelay>false</notifyManagerDelay><notifyManagerFollowUp>false</notifyManagerFollowUp><inhibitTransfer>false</inhibitTransfer><periodId></periodId><stateType>0</stateType><bpmnType>0</bpmnType><digitalSignature>false</digitalSignature><counterSign>false</counterSign><cancelSubProcess>false</cancelSubProcess></ProcessState></list><list/><list><ProcessLink><processLinkPK><linkSequence>5</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>4</finalStateSequence><initialStateSequence>2</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>10</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>9</finalStateSequence><initialStateSequence>2</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>7</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>6</finalStateSequence><initialStateSequence>4</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>12</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>11</finalStateSequence><initialStateSequence>4</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>8</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>2</finalStateSequence><initialStateSequence>6</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>14</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>13</finalStateSequence><initialStateSequence>6</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink><ProcessLink><processLinkPK><linkSequence>3</linkSequence><processId>loop</processId><companyId>1</companyId><version>1</version></processLinkPK><finalStateSequence>2</finalStateSequence><initialStateSequence>1</initialStateSequence><returnPermited>false</returnPermited><automaticLink>false</automaticLink><returnLabel></returnLabel><actionLabel></actionLabel><name></name></ProcessLink></list><list/><list/><list/><list/><list/><list/><list/><list/><list/><list/><list/></list>' );
	send( urlReleaseProcess + idProcess, null, 'GET');
}

/*
	remoção de substitutos
*/
urlListReplacement = '/ecm/api/rest/ecm/colleaguereplacement/list?_search=false&rows=30&page=1&sidx=&sord=asc';
urlRemoveReplacement = '/ecm/api/rest/ecm/crud/delete/';
fDataRemoveReplacement = function(companyId, colleagueId, replacementId) { return {"config":{"biClass":"foundation.business.ColleagueReplacementBI","pkClass":"foundation.model.ColleagueReplacementPK"},
	"pks":[{"companyId": companyId,"colleagueId":colleagueId,"replacementId":replacementId}]} };

function removeAllReplacement() {
	send(urlListReplacement, null, 'GET', null, function(data) {
		$.each( data.invdata, function( key, value ) {
			fDataRemoveReplacement(value.colleagueReplacementPK.companyId, value.colleagueReplacementPK.colleagueId, 
				value.colleagueReplacementPK.replacementId)
		});
	});
};

/*
	Criação de usuários
*/
urlCreateUser = "/ecm/api/rest/ecm/user/create";
fDataCreateUser = function(nome, sobrenome) { 
	if ( sobrenome ) {
		var login = nome.toLowerCase() + '.' + sobrenome.toLowerCase();
	} else {
		var login = nome.toLowerCase();
		sobrenome = nome;
	}
	if ( WCMAPI.organizationId != '1' ) {
		login = login+WCMAPI.organizationId;
	}
	return '{"formData":{"editLogin":"","data":"","role":"","group":"","email":"'+login+'@fluig.com","login":"'+login+'","userCode":"'+login+'","password":"adm","passwordConfirm":"adm","idpId":"","firstName":"'+nome+'","lastName":"'+sobrenome+'","timezone":"America/Sao_Paulo","user-vol":"","user-quota":"","user-projects":"","user-specialization":"","user-groupworkflow":"","selectedItens":[]},"config":{"validateFields":[{"key":"email"}]}}'; 
};
function createStarWarsUsers() {
	send(urlCreateUser, fDataCreateUser("Darth","Vader"));
	send(urlCreateUser, fDataCreateUser("Luke","Skywalker"));
	send(urlCreateUser, fDataCreateUser("Leia","Organa"));
	send(urlCreateUser, fDataCreateUser("Chewbacca"));
	send(urlCreateUser, fDataCreateUser("Darth","Maul"));
}


/*
	Agenda
*/
urlListJobs = "/ecm/api/rest/ecm/jobscheduler/getJobs?search=timer&searchInColumns=description,jobType,lastExecution,nextExecution&_search=false&nd=1464696764325&rows=30&page=1&sidx=&sord=asc";
urlDeleteJob = "/ecm/api/rest/ecm/jobscheduler/deleteJob/";
fDeleteJobData = function(name, type) {
	return '{"toDelete":[{"jobId":"' + name + '","jobType":' + type + '}]}'
};
deleteJobs = function() {
	send(urlListJobs, undefined, "GET", undefined, function(data) {
		for( var i = 0; i < data.invdata.length; i++ ) {
			send( urlDeleteJob, fDeleteJobData(data.invdata[i].jobId, data.invdata[i].jobTypeInt), 'DELETE');
		}
	});
};




var listProcessUrl = "/ecm/api/rest/ecm/processStart/getInitProcesses";

createProcessInstances = function(processId, state) {
};

urlCriarSolicitacao = "/ecm/api/rest/ecm/workflowView/send";
initInstances = function() {
	var processId = document.getElementById("processList").value;
	var url = "/ecm/api/rest/ecm/workflowView/getDefinitionProcess?processId=" + processId + "&taskUserId=" + WCMAPI.userCode + 
		"&processInstanceId=0&currentMovto=0&managerMode=false";
	send(url, null, 'GET',  null, function(data) {
		state = data.content.availableStates[0].sequence;
		dataCriarSolicitacao = {"processInstanceId":0,"processId": processId ,"taskUserId":WCMAPI.userCode,"completeTask":true,"currentMovto":0,
			"managerMode":false,"selectedDestinyAfterAutomatic":-1,"conditionAfterAutomatic":-1,"selectedColleague":[data.content.availableUsers.users[0].colleagueId],"comments":"","newObservations": [], "currentState": 0,
			"appointments":[],"attachments":[],"digitalSignature":false,"formData":[],"isDigitalSigned":false,"selectedState":state};
		
		var busy = false;
		
		for(var i = 0; i < (document.getElementById("processAmount").value || 1); i++ ) {
			createInstance(dataCriarSolicitacao);
		}
	});
}

instancesBusy = false;

createInstance = function( dataCriarSolicitacao) {
	var a = setInterval(function() {
		if (!instancesBusy) {
			instancesBusy = true; 
			send(urlCriarSolicitacao, JSON.stringify(dataCriarSolicitacao), null, null, function(data) {
				console.log('Solicitação ' + data.content.processInstanceId + ' criada');
				clearInterval(a);
				instancesBusy = false;
			});
		}
	}, 10);
}

/*
	Documents
*/
urlListDocs = "/ecm/api/rest/ecm/navigation/content/";
urlDeleteDocs = "/ecm/api/rest/ecm/navigation/removeDoc/";
fDeleteDocsData = function(ids, parent) {
    docsToDelete = new Array();
    for(id of ids) {
        docsToDelete.push({"docId": id, "isLink": false, "parentId": parent});
    }
	return JSON.stringify({"docsToDelete": docsToDelete, "metadataFormsToDelete" : []});
};
deleteDocuments = function(parent) {
	send(urlListDocs+parent+"?rows=30", undefined, "GET", undefined, function(data) {
        let ids = new Array();
		for( var i = 0; i < data.invdata.length; i++ ) {
            if (data.invdata[i].documentType == "1" || data.invdata[i].documentType == "4") {
                deleteDocuments(data.invdata[i].documentId);
            }
            if (data.invdata[i].documentDescription != "Fluig Forms" 
                    && data.invdata[i].documentDescription != "FLUIGADHOC" 
                    && data.invdata[i].documentDescription != "FLUIGADHOCPROCESS" 
                    && !data.invdata[i].privateDocument) {
    			ids.push(data.invdata[i].documentId);
            }
		}
        if(ids.length > 0) {
            send( urlDeleteDocs, fDeleteDocsData(ids, parent), 'DELETE');
        }
	});
};

/*
	Método de envio
*/
send = function( url, data, type, contentType, success, error ) {
	$.ajax({
			url: window.location.origin + url,
			type: type || 'POST',
			async: false,
			contentType : contentType || 'application/json',
			data: data,
			success: success || function(data) {
				console.log(data);
			},
			error: error || function(data) {
				if (data && data.responseText) {
					console.log("ERRO: " + JSON.parse(data.responseText).message.message);
				} else {
					console.log("ERRO: ");
				}
				console.dir(data);
			}
		});
};

startFunctions = function() {

	if (!WCMAPI || WCMAPI.userCode === "Guest") {
		alert("Entre no fluig e faça login cabeça de bagre..");
	}

	/*
	<button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">
	  <span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>
	</button>
	*/

	$('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">');
	$('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>');
	var fields = '';
	fields += '<div class="row">';
	fields += '	<div class="col-md-4">';
	fields += '		WCMAdmin<p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="modalCreateTenant()">';
	fields += '		  Criar empresa<span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>';
	fields += '		</button>';
	fields += '	</div>';
	fields += '	<div class="col-md-4">';
	fields += '		Admin<p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="createStarWarsUsers()">Criar usuários StarWars</button><p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="createStarWarsUserGroup()">Criar grupo de usuários StarWars</button><p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="deleteJobs()">Excluir Jobs de Timer</button><p>';
	fields += '		<button type="button" class="btn btn-danger" onclick="deleteInstancesAndProcess()">Excluir todas as solicitações e processos</button><p>';
	fields += '		<button type="button" class="btn btn-danger" onclick="removeAllReplacement()">Excluir todos os substitutos</button><p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="createSimpleProcess()">Criar processo comum</button><p>';
	fields += '		<button type="button" class="btn btn-primary" onclick="createLoopProcess()">Criar processo loop</button><p>';
	fields += '		<button type="button" class="btn btn-danger" onclick="deleteDocuments(0)">Excluir todos os documentos</button><p>';

	fields += '	</div>';
	fields += '	<div class="col-md-4">';
	fields += '		User<p>';
	fields += '		<button type="button" class="btn btn-default" onclick="cancelAllProcessInstances()">Cancelar todas as minhas solicitações</button><p>';
	fields += '		<button type="button" class="btn btn-default" onclick="modalCancelProcessInstances()">';
	fields += '		  Cancelar algumas solicitações<span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>';
	fields += '		</button>';
	fields += '		<div class="row">';
	fields += '			<div class="col-md-6">';
	fields += '				<select class="form-control" id="processList"></select>';
	fields += '			</div>';
	fields += '			<div class="col-md-3">';
	fields += '				<input class="form-control" id="processAmount" type="number">';
	fields += '			</div>';
	fields += '			<div class="col-md-3">';
	fields += '				<button type="button" class="btn btn-default" onclick="initInstances()">Criar</button>';
	fields += '			</div>';
	fields += '		</div>';
	fields += '	</div>';
	fields += '</div>';

	// modal
	fields += '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">';
	fields += '<div class="modal-dialog">';
	fields += '    <div class="modal-content">';
	fields += '      <div class="modal-header">';
	fields += '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
	fields += '        <h4 class="modal-title" id="modal-title">Modal title</h4>';
	fields += '      </div>';
	fields += '      <div class="modal-body" id="modal-body">';
	fields += '        <p></p>';
	fields += '      </div>';
	fields += '      <div class="modal-footer">';
	fields += '        <button type="button" class="btn btn-default" data-dismiss="modal">Arregar</button>';
	fields += '        <button type="button" class="btn btn-primary" id="modal-ok">Tocá-lo Pau!</button>';
	fields += '      </div>';
	fields += '    </div>';
	fields += '  </div>';
	fields += '</div>';
	document.body.innerHTML = fields;

	send(listProcessUrl, null, 'GET',  null, function(data) {
		var list = data.content;
		if (list.listUserWorkflowProcessVOs) {
		    list = list.listUserWorkflowProcessVOs;
		}
		var processList = '';
		for (var i = 0; i < list.length; i++) {
		
			processList += '<option value="' + list[i].processId + '">' + list[i].processId + '</option>';
		}
		document.getElementById("processList").innerHTML = processList;
	});
}


startFunctions();
