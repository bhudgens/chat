chatHistory = [];

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

$("#peopleInRoomList").jsGrid({
  height: "100vh",
  width: "100%",

  filtering: false,
  editing: false,
  sorting: false,
  paging: false,
  autoload: true,

  pageSize: 1,
  pageButtonCount: 5,

  deleteConfirm: "Do you really want to delete the client?",

  data: [
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Hello" },
    { "Users": "Doug" }
  ],

  // controller: db,

  fields: [
    { name: "Users", type: "text" }
    // { name: "Age", type: "number", width: 50 },
    // { name: "Address", type: "text", width: 200 },
    // { name: "Country", type: "select", items: db.countries, valueField: "Id", textField: "Name" },
    // { name: "Married", type: "checkbox", title: "Is Married", sorting: false },
    // { type: "control" }
  ]
});

$("#roomList").jsGrid({
  height: "95vh",
  width: "100%",

  filtering: false,
  editing: false,
  sorting: false,
  paging: false,
  autoload: true,

  pageSize: 1,
  pageButtonCount: 5,

  deleteConfirm: "Do you really want to delete the client?",

  data: [
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Hello" },
    { "Room": "Doug" }
  ],

  // controller: db,

  fields: [{
      name: "Room",
      type: "text"
      // headerTemplate: function() {
      //   return $("<button>")
      //     .attr("type", "button")
      //     .addClass("pull-right")
      //     .text("Add")
      //     .on("click", function() {
      //       showDetailsDialog("Add", {});
      //     });
      // }
    }
    // { name: "Age", type: "number", width: 50 },
    // { name: "Address", type: "text", width: 200 },
    // { name: "Country", type: "select", items: db.countries, valueField: "Id", textField: "Name" },
    // { name: "Married", type: "checkbox", title: "Is Married", sorting: false },
    // { type: "control" }
  ]
});

// [].forEach.call(x, el => console.log(el.parentNode.className))

// const _data = [
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing',
//   'thing'
// ];

const _data = [{
  firstName: "Benjamin",
  lastName: "Hudgens",
  time: "Jan 6 2:34PM",
  text: "This is a message"
}];

const updateMessages = messages => {
  $("#chatMessages").jsGrid({
    height: "95vh",
    width: "100%",

    autoload: true,
    paging: false,
    heading: false,

    controller: {
      loadData: function() {
        return _data;
        // return [
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing',
        //   'thing'
        // ]
        // var deferred = $.Deferred();
        //
        // $.ajax({
        //   url: 'http://api.randomuser.me/?results=40',
        //   dataType: 'jsonp',
        //   success: function(data) {
        //     deferred.resolve(data.results);
        //   }
        // });
        //
        // return deferred.promise();
      }
    },

    rowRenderer: message => {
      const imageUrl = message.imageUrl || "./emptyImage.png";
      const _row = `
      <div class="container-fluid">
        <div class="row">
          <hr />
        </div>
        <div class="row">
          <div class="col-xs-2 col-sm-2 col-md-1 col-lg-1">
            <div class="text-center"><img src="${imageUrl}"></div>
          </div>
          <div class="col-xs-10 col-sm-10 col-md-11 col-lg-10">
            <div class="row">
              <div class="col-lg-12">
                <span class="name"> ${message.firstName} ${message.lastName} </span>
                <span class="time"> - ${message.time} </span>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12">
                ${message.text}
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
      return $("<tr>").append($("<td>").append(_row));
    },

    fields: [
      { title: "Messages" }
    ]
  });
};

const doScrollChatWindowAllTheWayDown = () => {
  // const _elements = document.getElementsByClassName("jsgrid-grid-body");
  // var ch = document.getElementById('chatHistory');
  // ch.scrollTop = ch.scrollHeight;
};

// var username;
// var populateUsernameFromCookie = function() {
//   var un = document.getElementById('username');
//   try {
//     var user;
//     var allcookies = document.cookie;
//     var base64value = (allcookies.split("glguserinfo=")[1]).split(';')[0];
//     var json = atob(base64value);
//     user = JSON.parse(json);
//     username = user.username;
//   } catch (e) {
//     // User info is whack, tell @bhudgens
//   }
//   username = username || "";
//   un.value = username;
// };

var addNewChatMessage = function() {
  currentMessage = document.getElementById('currentMessage');
  // var _date = [new Date().toISOString().slice(0, 10), new Date().toISOString().slice(11, 19)].join(' ');
  // var un = document.getElementById('username');
  // if (!username && un.value === "") {
  //   alert('You need a username');
  //   return;
  // }
  console.log("CM:", currentMessage);
  var message = {
    // message: [_date, ": [", un.value, "]:  ", currentMessage.value].join('')
    message: currentMessage.value
  };
  // http("./addMessage", JSON.stringify(message), function(response) {
  //   var r = JSON.parse(response);
  //   chatHistory = r.messages;
  //   updateChatWindow(function() {
  //     doScrollChatWindowAllTheWayDown();
  //   });
  // });
  currentMessage.value = "";
};

var updateChatWindow = function(callback) {
  if (typeof callback !== "function") {
    callback = function() {};
  }
  updateChatHistory();
  var ch = document.getElementById('chatHistory');
  ch.value = chatHistory.join('\n');
  var ph = document.getElementById('peopleHistory');
  ph.value = peopleHistory.join('\n');
  callback();
};


var updateChatHistory = function() {
  // http("./getMessages", null, function(response) {
  //   var r = JSON.parse(response);
  //   chatHistory = r.messages || [];
  //   peopleHistory = r.users || [];
  // });
};

var currentMessageTextArea = document.getElementById('currentMessage');
currentMessageTextArea.addEventListener('keypress', function(e) {
  if (e.keyCode === 13) {
    addNewChatMessage();
  }
}, false);

// updateChatHistory();
// setInterval(updateChatWindow, 2000);
