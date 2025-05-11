import { useEffect, useState } from "react";

export const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "receiver" }));
    };
    setSocket(ws);

    // Create video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.style.width = "600px";
    document.body.appendChild(video);
    setVideoElement(video);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        // Create peer connection only when offer is received
        const peerConnection = new RTCPeerConnection();
        setPc(peerConnection);

        peerConnection.ontrack = (event) => {
          if (event.streams.length > 0) {
            video.srcObject = event.streams[0];
          } else {
            const stream = new MediaStream([event.track]);
            video.srcObject = stream;
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            ws.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        await peerConnection.setRemoteDescription(message.sdp);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: peerConnection.localDescription,
          })
        );
      } else if (message.type === "iceCandidate") {
        if (pc) {
          await pc.addIceCandidate(message.candidate);
        }
      }
    };
  }, []);

  const handlePlayVideo = () => {
    if (videoElement) {
      videoElement
        .play()
        .catch((err) => console.error("Video play failed:", err));
    }
  };

  return (
    <div>
      <div>Receiver Ready</div>
      <button
        onClick={handlePlayVideo}
        className="rounded-lg p-3 bg-black text-white hover:bg-gray-900 mx-2"
      >
        Play Video
      </button>
    </div>
  );
};
