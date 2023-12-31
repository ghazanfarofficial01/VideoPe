const socket = io("/");

const videoGrid = document.getElementById("video-grid");
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

const peer = new Peer(undefined, {
  //path: "/peerjs",
  host: "/",
  port: "3000",
  //secure: true
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      //store user

      //on leave
      call.on("close", () => {
        video.remove();
      });
    });
    socket.on("user-connected", (userId) => {
      
      connectToNewUser(userId, stream);
    });
  });
//socket.emit("join-room", ROOM_ID);

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
   
  peers[userId] = call;
}

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

let text = $("input");

document.querySelector("html").addEventListener("keypress", function (event) {
  if (event.key === "Enter" && text.val().length !== 0) {
    //console.log('from script',text.val());
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message, userId,name) => {
  $("ul").append(
    `<li class="message"><b>${name}:</b><br/>${message}</li>`
  );
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

//----

function toggle() {
  const el = document.querySelector(".main__right");
  const main = document.querySelector(".main__left");
  const display = el.style.display;
  if (display === "none") {
    el.style.display = "flex";
    main.style.flex = 0.8;
  } else {
    el.style.display = "none";
    main.style.flex = 1;
  }
  //el.style.display = display === 'none' ? 'block' : 'none';
}

//leave meeting button functionality
const leaveMeet = () => {
  document.querySelector(".leave__room").addEventListener("click", () => {
    //console.log("button-clicked");
    socket.emit("leave-room");
  });
};
