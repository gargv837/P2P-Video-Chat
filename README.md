# P2P-Video-Chat

Welcome to my Video Chat Project. The Real-Time Video Chat Application is a web-based platform designed for seamless and real-time video communication. Leveraging WebRTC (Web Real-Time Communication) technology, this application facilitates direct peer-to-peer connections, providing users with a high-quality audio and video experience.

Key Features
User Authentication:

Participants can join video chat rooms using unique room codes.
Each participant is assigned a unique user ID for identification.
Real-Time Video Communication:

Utilizes WebRTC for establishing direct connections between users.
Supports high-definition video and clear audio for an immersive communication experience.
Dynamic Room Management:

Users can create new rooms or join existing ones using unique room codes.
Dynamically updates the user interface to reflect the presence of participants.
Audio and Video Controls:

Participants can toggle their audio and video feeds on and off.
Option to mute/unmute the microphone and enable/disable the camera during the call.
Screen Sharing:

Users can share their screens with other participants in real-time.
Seamless transition between video feed and screen sharing.
User-Friendly Interface:

Responsive design ensures a consistent experience across different devices.
Intuitive controls for managing audio, video, and screen-sharing features.
Copy Room Code:

Each room has a unique code that can be copied for easy sharing.
Provides a convenient button to copy the room code to the clipboard.
Hang-Up and Leave:

Users can gracefully exit the video chat room with a hang-up button.
Automatically handles room cleanup when a user leaves.
Technologies Used
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
WebSockets: Socket.IO
WebRTC Library: RTCPeerConnection
External Libraries: Font Awesome (for control icons)
Usage Scenario
Ideal for business meetings, virtual conferences, or casual catch-ups with friends and family.
Steps to run the Project on local device:

Step-1: Open a Folder in vs Code and clone this repo
```
git clone https://github.com/gargv837/P2P-Video-Chat
```

Step-2: Run npm init command to create package.json file
```
npm init
```

Step-3: Install the packages needed

```
npm install node express socket.io nodemon ejs
```

Step-4: Go to package.json file and change its script
```
"scripts": {
    "start": "nodemon",
}
```

Step-4: In the server.js file you can enter the port number as per your device
```
const PORT = process.env.PORT || 5501;
```

