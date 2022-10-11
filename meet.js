setInterval(() => {
    var found = false; var mainDiv = null;

    for (div of document.getElementsByTagName("div")) {
        if (!found && div.getAttribute("data-auto-ack-recording")) {
            found = true;
        } else if (found && div.getAttribute("jsname")) {
            found = false; mainDiv = div;
        }
        
        var arialabel = div.getAttribute("aria-label");
        if (arialabel && arialabel.indexOf("tivar microfone") > 0) {
            let footer = div.parentElement.parentElement.parentElement.parentElement.parentElement;
            if (arialabel.startsWith("Ativar")) {
                mainDiv.style.backgroundColor = "red"; 
                footer.style.backgroundColor = "red";
            } else {
                mainDiv.style.backgroundColor = "";
                footer.style.backgroundColor = "";
            }
            break;
        }
    }
}, 500);
