// gmail
let sidebarClass = "no";
let hideSidebarClass = "bhZ";

var hideSidePanel = setInterval(function() {
  let elements = document.getElementsByClassName(sidebarClass)[1];
  if (elements) {
    let panel = elements.children[0];
    if (panel.classList.contains(hideSidebarClass)) {
      panel.style.display = "none";
      elements.children[1].style['margin-left'] = "0px";
    }
    else {
      panel.style.display = "";
      elements.children[1].style['margin-left'] = "0";
    }
  }

}, 100);
