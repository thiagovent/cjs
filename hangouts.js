// hangout
let config = {
  resizeContactList: true,
  hideBackground: true,
  removeStupidButtons: true

}

var myAmazingScript = setInterval(function() {
  let divChat = document.getElementById("hangout-landing-chat");
  if (!divChat) {
    return;
  }
  if (config.resizeContactList) {
    // redimenciona a lista de pessoas
    divChat.style.width = "250px";
    divChat.style.left = "10px";
  }
  if (config.removeStupidButtons) {
    // remove opções idiotas que ficam do lado da lista de pessoas
    let menuItems = document.querySelectorAll('[data-tooltip=Menu]')[0].parentElement.children;
    for(let item of menuItems) {
      item.style.display = "none";
    }
    menuItems[0].style.display = "none";

    // remove opções idiotas que ficam no meio da tela
    divChat.nextElementSibling.style.display = "none"
  }
  if (config.hideBackground) {
    // remove image de fundo e créditos
    let background = document.getElementById("hangout-background-hidden-image");
    background.nextElementSibling.style.display = "none"
    background.nextElementSibling.nextElementSibling.style.display = "none"
    background.previousElementSibling.style.display = "none"
  }

  clearInterval(myAmazingScript);
}, 100);
