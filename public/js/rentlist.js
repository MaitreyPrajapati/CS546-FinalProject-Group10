(function ($) {
    window.onload = function () {
      $(function () {
        $.ajax({
          url: "http://localhost:3000/games",
          type: "GET",
          dataType: "json",
          success: function (data) {
            let div_item = $("<div class='item'>");
          //   <div class="item">
          //   <div class="right floated content">
          //     <div class="ui button">Borrow</div>
          //   </div>
          //   <img class="ui avatar image" src="../../public/img/home_page2.png">
          //   <div class="content"><a href="#">{{this.name}}</a></div>
          //   <ul>
          //     <li>$ {{this.rentPrice}}</li>
          //     <li>{{this.duration}} days</li>
          //   </ul>
          // </div>
          },
          error: function () {
            alert("error");
          }
        });
      });
    }
  })(window.jQuery);