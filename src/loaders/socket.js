module.exports = (server) => {
  let io = require("socket.io").listen(server);
  // io.set('transports', ['websocket']);
  const randomInt = require("random-int");
  const nsGame = io.of("game");
  let hostInfo = [];
  const randCode = () => {
    return randomInt(10000);
  };
  const findInfobyHostId = (hostId) => {
    let ind = -1;
    hostInfo.forEach((item, index) => {
      if (item.hostId === hostId) {
        ind = index;
      }
    });
    return ind;
  };
  const findInfobyCodePin = (codePin) => {
    let ind = -1;
    hostInfo.forEach((item, index) => {
      if (item.codePin === codePin) {
        ind = index;
      }
    });
    return ind;
  };
  const getSocketsbyRoomName = (roomName) => {
    if (typeof nsGame.adapter.rooms[roomName] !== "undefined") {
      let socketsId = nsGame.adapter.rooms[roomName].sockets;
      let sockets = [];
      for (const k in socketsId) {
        sockets.push(nsGame.connected[k]);
      }
      return sockets;
    } else {
      return null;
    }
  };
  const getUserNamebyRoomeName = (roomName) => {
    return getSocketsbyRoomName(roomName)
      ? getSocketsbyRoomName(roomName).map((socket) =>
          socket.username ? socket.username : "host"
        )
      : null;
  };
  const getIDbyRoomeName = (roomName) => {
    return getSocketsbyRoomName(roomName)
      ? getSocketsbyRoomName(roomName).map((socket) => socket.id)
      : null;
  };
  nsGame.on("connection", function (socket) {
    socket.on("host-join", () => {
      let codePin = randCode().toString();
      socket.join(codePin);
      hostInfo.push({
        hostId: socket.id,
        codePin: codePin,
        playersId: [],
        playersName: [],
      });
      socket.emit("showGamePin", {
        pin: codePin,
      });
    });
    socket.on("join-room", (data) => {
      if (getUserNamebyRoomeName(data.pin) !== null) {
        socket.join(data.pin);
        socket.username = data.username;
        let playersName = getUserNamebyRoomeName(data.pin);
        let playersId = getIDbyRoomeName(data.pin);
        hostInfo.forEach((item) => {
          if (item.codePin === data.pin) {
            item.playersName = playersName;
            item.playersId = playersId;
          }
        });
        nsGame.to(data.pin).emit("player-lobby", { players: playersName });
        socket.emit("check-join-room", {
          result: true,
        });
      } else {
        socket.emit("check-join-room", {
          result: false,
        });
      }
    });
    socket.on("startGame", (data) => {
      let index = findInfobyHostId(socket.id);
      if (index !== -1) {
        hostInfo[index].hostId = "redirectedId";
      }
      nsGame.to(data.pin).emit("redirect", { redirect: "/playing-game/" });
      socket.emit("redirect", { redirect: "/game/" + data.gameId });
    });
    socket.on("change-hostId", (data) => {
      let index = findInfobyHostId("redirectedId");
      if (index !== -1) {
        hostInfo[index].hostId = data.hostId;
        socket.join(hostInfo[index].codePin);
        let playersName = getUserNamebyRoomeName(hostInfo[index].codePin);
        let playersId = getIDbyRoomeName(hostInfo[index].codePin);
        hostInfo[index].playersName = playersName;
        hostInfo[index].playersId = playersId;
      }
      console.log(hostInfo);
    });
    socket.on("join-room-again", (data) => {
      socket.join(data.reCode);
      socket.username = data.username;
    });
    socket.on("choose-answer", (data) => {
      nsGame
        .to(hostInfo[findInfobyCodePin(data.codePin)].hostId)
        .emit("anwser-to-host", {
          answer: data.answer,
          username: data.username,
        });
    });
    socket.on("payload-data", () => {
      let code = hostInfo[findInfobyHostId(socket.id)]
        ? hostInfo[findInfobyHostId(socket.id)].codePin
        : null;

      socket.emit("number-player", {
        arrNamePlayer: code ? getUserNamebyRoomeName(code) : [],
      });
    });
    // nsGame.to(hostId).emit("number-player", {
    //   // arrNamePlayer: index !== -1 ? hostInfo[ind].players : [],
    //   arrNamePlayer: ["abc,cd,emf,cmnr"],
    // });
    // socket.on("change-hostId", (data) => {
    //   let oldHostId = hostId;
    //   hostId = data.hostId;

    //   let ind = findInfobyHostId(hostId);
    //   console.log;
    //   nsGame.to(hostId).emit("number-player", {
    //     // arrNamePlayer: index !== -1 ? hostInfo[ind].players : [],
    //     arrNamePlayer: ["abc,cd,emf,cmnr"],
    //   });
    // });
  });
  return io;
};
