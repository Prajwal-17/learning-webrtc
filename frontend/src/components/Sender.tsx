import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
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

    const peerConnection = new RTCPeerConnection();
    setPc(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    const localVideo = document.createElement("video");
    localVideo.srcObject = stream;
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.style.width = "300px";
    document.body.appendChild(localVideo);

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
        await peerConnection.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        await peerConnection.addIceCandidate(message.candidate);
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
