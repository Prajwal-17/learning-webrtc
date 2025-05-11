# Media handling in WebRTC

JSFiddle Example => https://jsfiddle.net/rainzhao/3L9sfsvf/

RTCPeerConnection API => https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection

RTCRtpSender:setParameters methods=> https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/setParameters

`addTrack`: Used by the sender to add an audio/video track to a peer connection (e.g., from your webcam or mic).You send your webcam video using addTrack.

`ontrack`: Used by the receiver to get the incoming audio/video track when the other peer sends it.The other person receives it using ontrack.

### 1. MediaStream and MediaStreamTrack

- **MediaStream**: Represents a stream of media content (video/audio)
- **MediaStreamTrack**: Individual track within a stream (e.g., video track, audio track)

```javascript
// Getting a media stream
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

// Accessing tracks
const videoTrack = stream.getVideoTracks()[0];
const audioTrack = stream.getAudioTracks()[0];
```

### 2. Media Devices API (`navigator.mediaDevices`)

- `getUserMedia()`: access to camera/microphone
- `navigator`: access user agent objects

  ```javascript
  {
    video: {
      width: 1280,
      height: 720
    },
    audio: {
      echoCancellation: true
    }
  }
  ```

### 3. RTCPeerConnection Media Handling

**Adding Tracks to Connection:**

```javascript
// Add all tracks from stream
stream.getTracks().forEach((track) => pc.addTrack(track, stream));

pc.addTrack(videoTrack, stream);
```

**Receiving Tracks:**

```javascript
pc.ontrack = (event) => {
  // event.streams contains streams
  // event.track contains actual media track
  videoElement.srcObject = event.streams[0];
};
```

### 4. Track Lifecycle Management

**Stopping Tracks:**

```javascript
// Stop all tracks in a stream
stream.getTracks().forEach((track) => track.stop());

// Stop individual track
videoTrack.stop();
```

**Track Events:**

```javascript
track.onmute = () => console.log("Track muted");
track.onunmute = () => console.log("Track unmuted");
track.onended = () => console.log("Track ended");
```

### 5. Screen Sharing

**Screen Sharing:**

```javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true,
});
```

### 6. Cleanup

```javascript
// component unmount
stream.getTracks().forEach((track) => track.stop());
pc.close();
socket.close();
document.body.removeChild(videoElement);
```
