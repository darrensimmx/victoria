const apiKey = 'Of2S8Rh4xNWPTXhQLgWDl9wMn-T_Mv3z';  // Replace with your actual API key
const apiSecret = 'PVePZUKiXosGx_Di1muGZ4gFs0maCU-l';  // Replace with your actual API secret (if needed)

console.log(faceapi)
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');  // Load face detection model
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models');  // Load landmark model
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');  // Load emotion detection model
}

// Setup camera
async function setupCamera() {
    console.log('loading models')
    await loadModels();
    setInterval(async () => {
        const videoElement = document.getElementById('videoElement');
        const snapshotCanvas = document.getElementById('mycanvas');
        snapshotCanvas.width = videoElement.videoWidth;
        snapshotCanvas.height = videoElement.videoHeight;
    
        const ctx = snapshotCanvas.getContext('2d');
        console.log(snapshotCanvas.width, snapshotCanvas.height)
        snapshotCanvas.width = 100
        snapshotCanvas.height = 100
        ctx.drawImage(videoElement, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
        var dataURI = snapshotCanvas.toDataURL('image/jpeg'); // can also use 'image/png'
        // console.log(dataURI)
        // var face = document.createElement('img');
        var face = document.getElementById('exampleImage')
        face.src = dataURI
        setTimeout(() => {detectFaceAndEmotion(face);}, 100);
    }, 1000);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('videoElement');
        videoElement.srcObject = stream;

        // Start face and emotion detection once the camera is set up
        // detectFaceAndEmotion(document.getElementById('mycanvas'));
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
}

async function detectFaceAndEmotion(videoElement) {
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);  // Add canvas to the DOM to draw the results
    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Detect faces and emotions
        // document.getElementById('exampleImage').srcObject = "REPLACE"
        const detections = await faceapi.detectAllFaces(videoElement)
            .withFaceLandmarks()
            .withFaceExpressions();
            

        // Resize detections to match the video element's size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Clear previous drawings and draw new detections
        // canvas.clear();
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        console.log(detections);
        // Output the detected emotion
        if (detections.length > 0) {
            const emotions = detections[0].expressions;
            const dominantEmotion = getDominantEmotion(emotions);
            console.log(dominantEmotion)
            const emotionOutput = document.getElementById('emotionOutput');
            emotionOutput.textContent = `Detected Emotion: ${dominantEmotion}`;
        }
}

// Capture the video frame and send it to the API
async function captureImage(videoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');  // Capture image as Base64

    // Send image data to external API for emotion detection
    // sendToApi(imageData);
}

// Send image data to external API
async function sendToApi(imageData) {
    const apiUrl = 'https://api-us.faceplusplus.com/facepp/v3/detect';  // Replace with actual API URL

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    console.log('API Response:', data);

    // Display emotion result
    const emotionOutput = document.getElementById('emotionOutput');
    if (data && data.emotion > 0) {
        const emotions = data.faces[0].attributes.emotion;
        const dominantEmotion = getDominantEmotion(emotions);
        emotionOutput.textContent = `Detected Emotion: ${dominantEmotion}`; //return dominant emotion (double check again)
    } else {
        emotionOutput.textContent = 'No face detected.';
    }
}

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

// Event listener for starting recognition via webcam
document.getElementById('startRecognition').addEventListener('click', () => {
    setupCamera();  // Start the webcam
});



// Event listener for uploading an image
document.getElementById('uploadInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageData = reader.result;  // Image in base64 format
            sendToApi(imageData);  // Send to API for emotion detection
        };
        reader.readAsDataURL(file);  // Read the file as Data URL
    }
});
