import { useEffect, useRef, useState } from "react";

const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      setSocket(socket);
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    const pc = new RTCPeerConnection();
    socket.onmessage = async (event: any) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        await pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );
      } else if (message.type === "iceCandidate") {
        pc.addIceCandidate(message.iceCandidate);
      }
    };

    pc.ontrack = (event) => {
      console.log(event);
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
    };
  }, []);

  const createConnection = () => {
    if (!socket) {
      alert("no socket");
      return;
    }

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.iceCandidate);
      }
    };

    const pc = new RTCPeerConnection();
    setPc(pc);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };
  };
  return (
    <>
      <div onClick={createConnection}>Receiver</div>;
      <video ref={videoRef}></video>
    </>
  );
};

export default Receiver;
