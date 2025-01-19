window.currEmotion = null;

// Load models
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');  // Load face detection model
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models');  // Load landmark model
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');  // Load emotion detection model
}

// Setup camera
async function setupCamera() {
    console.log('loading models');
    await loadModels();
    const videoElement = document.getElementById('videoElement');

    videoElement.onplaying = () => {
        setInterval(async () => {
            if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                console.log('Video dimensions are not ready yet...');
                return;  // Exit early if dimensions are not loaded
            }

            const snapshotCanvas = document.getElementById('mycanvas');
            snapshotCanvas.width = videoElement.videoWidth;
            snapshotCanvas.height = videoElement.videoHeight;

            const ctx = snapshotCanvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

            const dataURI = snapshotCanvas.toDataURL('image/jpeg'); // Capture image

            const face = new Image();
            face.onload = async () => {
                const detectedEmotion = await detectFaceAndEmotion(face);  // Process only after the image is loaded
                if (detectedEmotion) {
                    logCurrentEmotion(detectedEmotion);  // Log detected emotion
                }
                snapshotCanvas.style.display = 'none';
            };
            face.src = dataURI;
        }, 1000);  // Capture every 1 second
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
}

// Detect face and emotion
async function detectFaceAndEmotion(videoElement) {
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.log("Waiting for video dimensions to be ready...");
        return;  // Skip detection if video dimensions are not ready
    }
    
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);
    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi.detectAllFaces(videoElement)
        .withFaceLandmarks()
        .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (detections.length > 0) {
        const emotions = detections[0].expressions;
        const dominantEmotion = getDominantEmotion(emotions);
        return dominantEmotion;  // Return the dominant emotion
    }
    return null;
}

// Function to get dominant emotion
function getDominantEmotion(emotions) {
    let maxEmotion = '';
    let maxScore = -1;

    for (const [emotion, score] of Object.entries(emotions)) {
        if (score > maxScore) {
            maxScore = score;
            maxEmotion = emotion;
        }
    }
    return maxEmotion;
}

// Log current emotion
function logCurrentEmotion(updatedEmotion) {
    window.currEmotion = updatedEmotion;
    console.log('Detected Emotion:', window.currEmotion);
}


// Event listener for starting recognition via webcam
document.getElementById('startRecognition').addEventListener('click', () => {
    setupCamera();  // Start the webcam
});

function notifyMoodChange() {
    if (window.currMood) {
        chrome.runtime.sendMessage(
            { moodNotification: `Current mood is ${window.currMood}.` },
            (response) => console.log("Notification sent:", response)
        );
    }
}

// Trigger notifications every 5 seconds (or any desired interval)
setInterval(() => {
    notifyMoodChange();
}, 5000);

if (chrome.runtime && chrome.runtime.sendMessage) {
    console.log("Chrome API available in this context.");
} else {
    console.error("Chrome API not accessible in this context. Are you running this as a Chrome extension?");
}

