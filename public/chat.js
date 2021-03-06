/*global fetch, document*/

let _rooms = [];
let _currentRoom;
let _ldapInfo;

const updatePeopleInRoom = () => {
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

    data: _currentRoom.users,

    // controller: db,

    fields: [{
      title: "Users",
      name: "name",
      type: "text"
    }]
  });
};


// const _rooms = [{
//   "name": "General",
//   "id": "general",
//   "type": "room"
// }, {
//   "name": "Alexis Jackson",
//   "id": "asdfasdfsadfasfd",
//   "type": "person"
// }];

const _readStatus = {};

const updateRoomList = () => {

  /** Sort room list by rooms first, then users */
  const _roomList = [].concat(_rooms.filter(r => r.type === "room"), _rooms.filter(r => r.type === "person"));
  _roomList.forEach(room => {
    console.log(room);
    _readStatus[room.id] = _readStatus[room.id] || 0;
    if (_currentRoom.id === room.id) {
      _readStatus[room.id] = _currentRoom.messages.length;
    }
    const _unreadNumber = _readStatus[room.id] && _messageCache[room.id].messages.length > _readStatus[room.id]
      ? ` (${_messageCache[room.id].messages.length - _readStatus[room.id]})`
      : '';
    room.displayName = `${room.name}${_unreadNumber}`;
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

    data: [].concat(_rooms.filter(r => r.type === "room"), _rooms.filter(r => r.type === "person")),

    fields: [{
      title: "Conversations",
      name: "displayName",
      type: "text"
    }]

    // rowRenderer: message => {
    //   const imageUrl = message.imageUrl || "./emptyImage.png";
    //   const _row = `
    //   <div class="container-fluid">
    //     <div class="row">
    //       <hr />
    //     </div>
    //     <div class="row">
    //       <div class="col-xs-2 col-sm-2 col-md-1 col-lg-1">
    //         <div class="text-center"><img src="${imageUrl}"></div>
    //       </div>
    //       <div class="col-xs-10 col-sm-10 col-md-11 col-lg-10">
    //         <div class="row">
    //           <div class="col-lg-12">
    //             <span class="name"> ${message.firstName} ${message.lastName} </span>
    //             <span class="time"> - ${message.time} </span>
    //           </div>
    //         </div>
    //         <div class="row">
    //           <div class="col-lg-12">
    //             ${message.text}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   `;
    //   return $('<tr class="jsgrid-row">').append($('<td class="jsgrid-cell">').append(_row));
    // },
  });

};

// const _messages = [{
//   firstName: "Benjamin",
//   lastName: "Hudgens",
//   time: "Jan 6 2:34PM",
//   text: "This is a message"
// }];

//
// let _currentRoom = {
//   name: "General",
//   id: "general"
// };

const updateClickEvents = () => {
  const _elements = document.getElementsByClassName("jsgrid-cell");
  [].forEach.call(_elements, el => {

    if (~el.parentNode.parentNode.parentNode.parentNode.parentNode.className.indexOf("roomList")) {
      el.addEventListener("click", e => {
        // console.log("room click");
        /** FIXME: This is a hack until we properly id the convo's */
        const _roomId = _rooms.filter(r => r && r.name && ~e.target.innerHTML.indexOf(r.name))[0].id;
        _currentRoom = _messageCache[_roomId];
        _currentRoom.currentRoom = _roomId;
        _currentRoom.id = _roomId;
        updateUI(true);

        /** Make sure the server remembers */
        const _newRoom = { currentRoom: _roomId };
        fetch('./settings', {
            method: "POST",
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(_newRoom)
          })
          .then(updateUI);
        // console.log(_currentRoom);
        // updateUI();
      });
    }

    if (~el.parentNode.parentNode.parentNode.parentNode.parentNode.className.indexOf("peopleInRoomList")) {
      el.addEventListener("click", e => {
        const _user = _currentRoom.users.filter(u => u.name === e.target.innerHTML)[0];
        fetch('./createPM', {
            method: "POST",
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(_user)
          })
          .then(updateUI);
        // console.log("people click");
        // console.log(_user);
        // updateUI();
      });
    }
  });
};

const updateMessages = () => {
  $("#chatMessages").jsGrid({
    height: "95vh",
    width: "100%",

    autoload: true,
    paging: false,
    heading: true,

    data: _currentRoom.messages,

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
                <span class="name"> ${message.name || _ldapInfo.displayName} </span>
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
      { title: _currentRoom.name }
    ]
  });
};

const doScrollChatWindowAllTheWayDown = () => {
  const _elements = document.getElementsByClassName("jsgrid-grid-body");
  [].forEach.call(_elements, el => {
    if (~el.parentNode.className.indexOf("chatMessages")) {
      el.scrollTop = el.scrollHeight;
    }
  });
  // for(let _element in _elements) {
  //   console.log(_element);
  // }
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

const _messageCache = {};

let _lastUpdate = new Date();
const updateUI = withoutFetch => withoutFetch
  ? Promise.all([
    Promise.resolve(_lastUpdate = new Date()),
    updateMessages(),
    updatePeopleInRoom(),
    updateRoomList(),
    updateClickEvents()
  ])
  : Promise.all([
    Promise.resolve(new Date()),
    fetch('./settings', { credentials: 'include' })
    .then(response => response.json())
    .then(settings => {
      _rooms = settings.rooms || [];
      return Promise.all(_rooms.map(room => fetch(`./room/${room.id}`, { credentials: 'include' })
          .then(response => response.json())
          .then(roomData => {
            _messageCache[room.id] = Object.assign({}, roomData);
          })
        ))
        .then(() => {
          _currentRoom = Object.assign({}, _messageCache[settings.currentRoom]);
          _currentRoom.id = settings.currentRoom;
        });
    })
  ])
  .then(r => {
    if (r[0] > _lastUpdate) {
      updateMessages();
      updatePeopleInRoom();
      updateRoomList();
      updateClickEvents();
    }
  });

const sendMessage = () => {
  const currentMessage = document.getElementById('currentMessage');
  // var _date = [new Date().toISOString().slice(0, 10), new Date().toISOString().slice(11, 19)].join(' ');
  // var un = document.getElementById('username');
  // if (!username && un.value === "") {
  //   alert('You need a username');
  //   return;
  // }
  if (currentMessage.value === "") {
    return;
  }

  // debugger;
  // console.log(_currentRoom);
  const _message = {
    message: {
      time: "Jan 6 2:34PM",
      text: currentMessage.value,
    },
    room: {
      id: _currentRoom.id
    }
  };
  // console.log('m', _message);
  currentMessage.value = "";
  _currentRoom.messages.push(_message.message);
  updateUI(true).then(doScrollChatWindowAllTheWayDown);
  fetch('./message', {
      method: "POST",
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(_message)
    })
    .then(() => updateUI())
    .then(() => {
      doScrollChatWindowAllTheWayDown();
    });
};

document.getElementById('currentMessage').addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    sendMessage();
  }
}, false);

// document.getElementById('addNewRoom').addEventListener('keypress', e => {
//   if (e.keyCode === 13) {
//     const roomName = document.getElementById('addNewRoom');
//     // var _date = [new Date().toISOString().slice(0, 10), new Date().toISOString().slice(11, 19)].join(' ');
//     // var un = document.getElementById('username');
//     // if (!username && un.value === "") {
//     //   alert('You need a username');
//     //   return;
//     // }
//     if (roomName.value === "") {
//       return;
//     }
//
//     const name = roomName.value;
//     const id = roomName.value.toLowerCase().replace(/\s*/g, "");
//
//     fetch('./room', {
//         method: "POST",
//         headers: {
//           'Accept': 'application/json, text/plain, */*',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ name, id })
//       })
//       .then(updateUI)
//       .then(() => {
//         roomName.value = "";
//       });
//   }
// }, false);

// setInterval(() => {
//   fetch(`./messages/${_currentRoom.id}`)
//     .then(res => res.json())
//     .then(messages => Object.assign(_messages, messages));
// }, 5000);

setInterval(() => {
  updateUI().then(doScrollChatWindowAllTheWayDown);
}, 5000);

fetch('./whoami', { credentials: 'include' })
  .then(response => response.json())
  .then(ldapInfo => {
    _ldapInfo = ldapInfo;
  });

updateUI().then(doScrollChatWindowAllTheWayDown);
