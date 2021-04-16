module.exports = (server) => {
  let io = require("socket.io").listen(server);
  const nsGame = io.of("project");

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
  const getIDbyRoomeName = (roomName) => {
    return getSocketsbyRoomName(roomName)
      ? getSocketsbyRoomName(roomName).map((socket) => socket.id)
      : null;
  };
  nsGame.on("connection", function (socket) {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
      console.log(getIDbyRoomeName("60788e3ffb44b7321c3d2798"));
    });
    socket.on("createdPost", (data) => {
      io.of("project")
        .to("60788e3ffb44b7321c3d2798")
        .emit("loadPost", { data: data });
    });
  });

  return io;
};
