(function ($) {
  window.onload = function () {
    $(function () {
      $.ajax({
        url: "http://localhost:3000/getSession",
        type: "GET",
        datatype: JSON,
        success: function (data) {
          if (data.result == true) {
            $("#helloUser").removeClass("hidden");
            $("#helloUser").html("Hello, " + data.name);
            $("#LoginBtn").removeClass("m-item item");
            $("#LoginBtn").addClass("hide");
            $("#SignUpBtn").removeClass("m-item item");
            $("#SignUpBtn").addClass("hide");
            $("#SignOutBtn").addClass("m-item item");
            $("#SignOutBtn").removeClass("hide");
          } else {
            $("#helloUser").addClass("hidden");
            $("#LoginBtn").addClass("m-item item");
            $("#LoginBtn").removeClass("hide");
            $("#SignUpBtn").addClass("m-item item");
            $("#SignUpBtn").removeClass("hide");
            $("#SignOutBtn").removeClass("m-item item");
            $("#SignOutBtn").addClass("hide");
          }
        },
        error: function () {
          alert("error");
        },
      });
    });
  };
})(window.jQuery);
