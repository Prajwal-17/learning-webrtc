import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    // connect to socket server for signaling
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(ws);
  }, []);

  const startSendingVideo = async () => {
    if (!socket) {
      alert("NO Socket");
      return;
    }

    // create a RTCPeerConnection object
    const peerConnection = new RTCPeerConnection(); // configure stun server and turn server here if needed
    setPc(peerConnection); // set peerConnection locally

    // handler fires on every iceCandidate is available
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    /**
     * Get media streams and add video & audio tracks before creating a offer ,
     * because sdp contains all iceCandidates and media format data about the tracks etc..
     */
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    // create a video element before sending an offer
    const localVideo = document.createElement("video");
    localVideo.srcObject = stream;
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.style.width = "300px";
    document.body.appendChild(localVideo);

    // create and offer and send sdp(session description protocol) to other client
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(
      JSON.stringify({
        type: "createOffer",
        sdp: peerConnection.localDescription,
      })
    );

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await peerConnection.setRemoteDescription(message.sdp); // set the remote descritption to the client sdp
      } else if (message.type === "iceCandidate") {
        await peerConnection.addIceCandidate(message.candidate); // add iceCandidate to the peerConnection
      }
    };
  };

  return (
    <button
      onClick={startSendingVideo}
      className="rounded-lg p-3 bg-black text-white hover:bg-gray-900 mx-2"
    >
      Start Streaming
    </button>
  );
};

//   pc.onnegotiationneeded = async () => {
//       console.log("inside negotitaion");
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socket.send(
//         JSON.stringify({
//           type: "createOffer",
//           sdp: pc.localDescription,
//         })
//       );
//     };

// -> the on negotiation event is written because to trigger whenever there is a new track(video,audio) is added/removed
// -> the sdp keeps changing due to which we might have to write onnegotiationneeded event
