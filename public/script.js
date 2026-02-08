const APP_ID = "a5ae55560cec4210b23be9e7e69385b8";
const CHANNEL = "Channel1";
const TOKEN = "007eJxTYJh9WjZ0m4rTHV/mCeKPrvDHCH14uFhB52DwTjuf4Nf86yYrMCSaJqaampqaGSSnJpsYGRokGRknpVqmmqeaWRpbmCZZHHNhy2gIZGSI52NkYWSAQBCfg8E5IzEvLzXHkIEBAEylHig=";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
const userNames = {};

let username = "";
const userMap = {};
let localUid = null;
let screenTrack;

let isScreenSharing = false;
let audon = true;
let vidon = true;
let chaton = false;

client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    console.log("User published:", user.uid);
    if (!document.getElementById(`user-${user.uid}`)) {
        const remoteVideo = document.createElement("div");
        remoteVideo.class = "videocard";
        remoteVideo.style.width = "fit-content";
        const label = userMap[user.uid] || `${user.uid}`;
        remoteVideo.innerHTML = `
            <video autoplay playsinline id="video-${user.uid}"></video>
            <div style="text-align: center; font-size: 14px;">${label}</div>`;
        remoteVideo.id = `user-${user.uid}`;
        remoteVideo.style.transform = "none"; 
        document.getElementById("video-container").appendChild(remoteVideo);
    }
    if (mediaType === "video") {
        user.videoTrack.play(`video-${user.uid}`);
    }
    if (mediaType === "audio") {
        user.audioTrack.play();
    }
});

client.on("user-unpublished", (user) => {
    console.log("User unpublished:", user.uid);
    const remoteVideo = document.getElementById(`user-${user.uid}`);
    if (remoteVideo) remoteVideo.remove();
});

async function startCall() {
    try {
        localUid = await client.join(APP_ID, CHANNEL, TOKEN, null);
        userMap[localUid] = username;
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        const localVideo = document.createElement("div");
        localVideo.class = "videocard";
        localVideo.style.width = "fit-content";
        localVideo.innerHTML = `
            <video autoplay playsinline muted id="video-${localUid}"></video>
            <div style="font-color: white; text-align: center; font-size: 14px;">${username}</div>`;
        document.getElementById("video-container").appendChild(localVideo);
        localTracks[1].play(`video-${localUid}`);
        await client.publish(localTracks);
        console.log("Published local tracks");
    } catch (error) {
        console.error("Error starting call:", error);
    }
}

async function leaveCall() {
    try {
        localTracks.forEach(track => {
            track.stop();
            track.close();
        });
        await client.leave();
        document.getElementById("video-container").innerHTML = "";
        console.log("Left the channel");
        document.getElementById('main').removeChild(document.getElementById('video-container'));
        document.getElementById('main').removeChild(document.getElementById('footer'));
        let msg = document.createElement('h3');
        msg.innerText = "You left the meeting";
        document.getElementById('main').appendChild(msg);
    } catch (error) {
        console.error("Error leaving channel:", error);
    }
}

async function toggleScreenShare() {
    let temp = document.getElementById(`video-${localUid}`);
    if (!isScreenSharing) {
        try {
        await client.unpublish(localTracks[1]);
        localTracks[1].stop();
        screenTrack = await AgoraRTC.createScreenVideoTrack();
        temp.style.width = "600px";
        temp.style.height = "500px";
        await client.publish(screenTrack);
        screenTrack.play(`video-${localUid}`);

        isScreenSharing = true;
        console.log("Started screen sharing");
        } catch (err) {
        console.error("Failed to start screen sharing:", err);
        }
    } else {
        try {
            await client.unpublish(screenTrack);
            screenTrack.stop();
            screenTrack.close();
            temp.style.width = "400px";
            temp.style.height = "300px";
            temp.style.transform = "scaleX(-1)";
            localTracks[1] = await AgoraRTC.createCameraVideoTrack();
            await client.publish(localTracks[1]);
            localTracks[1].play(`video-${localUid}`);
            isScreenSharing = false;
            console.log("Stopped screen sharing");
            } catch (err) {
            console.error("Failed to stop screen sharing:", err);
        }
    }
}



function audioCall(){
    //if (!localTracks[0]) return;
    if(audon){
        document.getElementById('aud').src = "./assets/aud-unmute.png";
        localTracks[0].setEnabled(true);
        audon = false;
    } else{
        document.getElementById('aud').src = "./assets/aud-mute.png";
        localTracks[0].setEnabled(false);
        audon = true;
    }
}

function videoCall(){
    //if (!localTracks[1]) return;
    if(vidon){
        document.getElementById('vid').src = "./assets/vid-unmute.png";
        localTracks[1].setEnabled(true);
        vidon = false;
    } else{
        document.getElementById('vid').src = "./assets/vid-mute.png";
        localTracks[1].setEnabled(false);
        vidon = true;
    }
}

function chatCall(){
    let cs = document.getElementById('chat-section');
    if(chaton){
        chaton = false;
        cs.style.display = "none";
    }
    else{
        chaton = true;
        cs.style.display = "block";
    }
}

function sendMessage(){
    const input = document.getElementById("message-input");
    const message = input.value;
    if (message && rtmChannel) {
        rtmChannel.sendMessage({ text: message });
        input.value = "";
    }
}

function join(){
    username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Please enter your username.");
        return;
    }
    document.getElementById('options').remove();
    let vc = document.createElement('div');
    vc.id = "video-container";
    let f = document.createElement('div');
    f.id = "footer";
    let fCont = document.createElement('div');
    fCont.id = "f-cont";

    let l = document.createElement('img');
    l.id = "leave-btn";
    l.src = "./assets/cutCall.png";
    fCont.appendChild(l);
    
    let ss = document.createElement('img');
    ss.id = "sshare";
    ss.src = "./assets/sshare.png";
    fCont.appendChild(ss);

    let aud = document.createElement('img');
    aud.id = "aud";
    aud.src = "./assets/aud-unmute.png";
    fCont.appendChild(aud);

    let vid = document.createElement('img');
    vid.id = "vid";
    vid.src = "./assets/vid-unmute.png";
    fCont.appendChild(vid);

    l.addEventListener("click",leaveCall);
    aud.addEventListener("click",audioCall);
    vid.addEventListener("click",videoCall);
    ss.addEventListener("click",toggleScreenShare);
    f.appendChild(fCont);
    document.getElementById('main').appendChild(vc);
    document.getElementById('main').appendChild(f);
    startCall();
}