# P2P-Video-Chat

Welcome to my Video Chat Project. The Real-Time Video Chat App enables seamless, secure communication with WebRTC. Join rooms, manage audio/video, and share screens effortlessly. Responsive design for a user-friendly experience. Built with HTML, CSS, JavaScript, Node.js, and WebSockets. Ideal for various scenarios, from business meetings to social interactions.

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

