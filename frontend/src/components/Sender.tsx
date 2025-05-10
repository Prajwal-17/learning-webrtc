import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "sender" }));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("Sender got message:", message);

      if (!pc) return;

      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      } else if (message.type === "iceCandidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (err) {
          console.error("Error adding received ice candidate", err);
        }
      }
    };

    return () => {
      ws.close();
      if (pc) {
        pc.close();
      }
    };
  }, [pc]);

  const createConnection = async () => {
    if (!socket) {
      alert("No socket connection");
      return;
    }

    const peerConnection = new RTCPeerConnection();
    setPc(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "createOffer",
            sdp: peerConnection.localDescription,
          })
        );
      } catch (err) {
        console.error("Error during negotiation:", err);
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  return (
    <>
      <div>Sender</div>
      <button onClick={createConnection}>Connect</button>
    </>
  );
};

export default Sender;
