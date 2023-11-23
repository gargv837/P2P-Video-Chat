const socket = io();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const room = urlParams.get("room");

if (!room) {
  window.location = "lobby.html";
} else {
  const constraints = {
    video: {
      width: { min: 640, ideal: 1920, max: 1920 },
      height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true,
  };

  const peerConnectionConfig = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  };

  let localStream;
  let remoteStream;
  let peerConnection;
  let sharingScreen = false;

  const init = async () => {
    try {
      await socket.emit("addRoom", room);
      socket.on("userJoined", handleUserJoined);
      socket.on("userleft", handleUserLeft);
      socket.on("userLeftRoom", handleUserLeftRoom);
      socket.on("messageFromPeer", handleOnMessageFromPeer);

      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById("user-1").srcObject = localStream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const createPeerConnection = async (socketId) => {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    remoteStream = new MediaStream();
    document.getElementById("user-2").srcObject = remoteStream;
    document.getElementById("user-2").style.display = "block";
    document.getElementById("user-1").classList.add("smallframe");

    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById("user-1").srcObject = localStream;
    }

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = async (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event);
        socket.emit(
          "sendMessage",
          JSON.stringify({
            room,
            type: "candidate",
            candidate: event.candidate,
          })
        );
      }
    };
  };

  const createOffer = async (socketId) => {
    await createPeerConnection(socketId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("Offer:", offer, socket.id, socketId);
    socket.emit(
      "sendMessage",
      JSON.stringify({
        room,
        type: "offer",
        offer,
      })
    );
  };

  const createAnswer = async (socketId, offer) => {
    await createPeerConnection(socketId);
    try{
    await peerConnection.setRemoteDescription(offer);
    } catch(error){
      console.log(error);
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log("Answer:", answer);
    socket.emit(
      "sendMessage",
      JSON.stringify({
        room,
        type: "answer",
        answer,
      })
    );
  };

  const addAnswer = async (answer) => {
    if (peerConnection.currentRemoteDescription == null) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleUserJoined = async (socketId) => {
    console.log(`User with socket Id ${socketId} has joined the room`);
    await createOffer(socketId);
  };

  const handleOnMessageFromPeer = async (message, socketId) => {
    message = JSON.parse(message);
    console.log(message);

    if (message.type === 'offer') {
      await createAnswer(socketId, message.offer);
    }

    if (message.type === 'answer') {
      await addAnswer(message.answer);
    }

    if (message.type === 'candidate') {
      if (peerConnection) {
        await peerConnection.addIceCandidate(message.candidate);
      }
    }
  };

  const handleUserLeft = async () => {
    socket.emit("leaveRoom", room);
  };

  const handleUserLeftRoom = async () => {
    document.getElementById("user-2").style.display = "none";
    document.getElementById("user-1").classList.remove("smallframe");
  };

  const toggleMic = () => {
    const audioTrack = localStream.getTracks().find((track) => track.kind === "audio");

    if (audioTrack.enabled) {
      audioTrack.enabled = false;
      document.getElementById("audio-btn").classList.toggle('off');
    } else {
      audioTrack.enabled = true;
      document.getElementById("audio-btn").classList.toggle('off');
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.getTracks().find((track) => track.kind === "video");

    if (videoTrack.enabled) {
      videoTrack.enabled = false;
      document.getElementById("camera-btn").classList.toggle('off');
    } else {
      videoTrack.enabled = true;
      document.getElementById("camera-btn").classList.toggle('off');
    }
  };

  const hangUpCall = () => {
    handleUserLeft();
    window.location = "/";
  };

  const toggleScreen = async () => {
    const videoTrack = localStream.getTracks().find((track) => track.kind === "video");

    if (!sharingScreen) {
      sharingScreen = true;
      videoTrack.enabled = false;
      document.getElementById("camera-btn").classList.add('off');
      document.getElementById("screen-btn").classList.toggle('share');

      try {
        localScreenStream = new MediaStream();
        localScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        document.getElementById("user-1").srcObject = localScreenStream;
        const senders = peerConnection.getSenders();
        const videoSender = senders.find((sender) => sender.track.kind === 'video');
        videoSender.replaceTrack(localScreenStream.getTracks()[0]);
      } catch (error) {
        console.error('Error starting screen sharing:', error);
        return;
      }
    } else {
      
      videoTrack.enabled = true;
      document.getElementById("user-1").srcObject = localStream;
      localScreenStream.getTracks().forEach(track => track.stop());
      const senders = peerConnection.getSenders();
      const videoSender = senders.find((sender) => sender.track.kind === 'video');
      videoSender.replaceTrack(videoTrack);
      document.getElementById("camera-btn").classList.remove('off');
      document.getElementById("screen-btn").classList.toggle('share');
      sharingScreen = false;
    }
  };

  window.addEventListener("beforeunload", handleUserLeft);
  document.getElementById("camera-btn").addEventListener("click", toggleCamera);
  document.getElementById("audio-btn").addEventListener("click", toggleMic);
  document.getElementById("hang-up-btn").addEventListener("click", hangUpCall);
  document.getElementById("screen-btn").addEventListener("click", toggleScreen);

  init();
}

document.querySelector('.roomcode').innerHTML = `${room}`;

function CopyClassText() {
  let textToCopy = document.querySelector('.roomcode');
  let currentRange;

  if (document.getSelection().rangeCount > 0) {
    currentRange = document.getSelection().getRangeAt(0);
    window.getSelection().removeRange(currentRange);
  } else {
    currentRange = false;
  }

  let CopyRange = document.createRange();
  CopyRange.selectNode(textToCopy);
  window.getSelection().addRange(CopyRange);
  document.execCommand("copy");

  window.getSelection().removeRange(CopyRange);

  if (currentRange) {
    window.getSelection().addRange(currentRange);
  }

  document.querySelector(".copycode-button").textContent = "Copied!";
  setTimeout(() => {
    document.querySelector(".copycode-button").textContent = "Copy Code";
  }, 5000);
}