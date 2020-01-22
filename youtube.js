// requires jquery

let cjs_youtube = setInterval(function() {
  if (window.location.href.indexOf("watch") == 0) {
      clearInterval(cjs_youtube);
  } else if ($("#masthead-container")[0]) {
      $("#related").remove();
      $("#sections").remove();
      $("#masthead-container").remove();
      $("#page-manager")[0].style.marginTop = "-20px";
      clearInterval(cjs_youtube);
  }
}, 500);
