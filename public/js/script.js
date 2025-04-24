
  const video = document.getElementById('video');

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
  ]).then(startVideo);

  function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(error => console.error("Error: ", error));
  }

  video.addEventListener('play', () => {
    const canvas = document.getElementById('overlay');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        video, new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions().withAgeAndGender(); ;
      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // faceapi.draw.drawDetections(canvas, resized);
      
      resized.forEach(result => {
        resized.forEach(result => {
          const { age, gender } = result;
          const { x, y, width, height } = result.detection.box;

          const estimatedDistance = (24 * 450) / height;
        
            
          const mirroredX = canvas.width - (x + width); 
        
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'white';
          ctx.rect(mirroredX + (width * .75) / 5, y, width * .75, height * .85);
          ctx.stroke();
          
          const label = `${gender}, ${Math.round(age)}`;
          const expressions = result.expressions;
          const maxValue = Math.max(...Object.values(expressions));
          const emotion = Object.keys(expressions).find(
            key => expressions[key] === maxValue
          );
          const distance = `${Math.round(estimatedDistance  )/100}m`;
          const emotionWidth = ctx.measureText(emotion).width;

          ctx.font = '24px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(label, mirroredX + (width * .75) / 5, y - 10);
          ctx.fillText(distance, mirroredX + (width * .75) / 5 + width * .75 + 5, y + 24);
          ctx.fillText(emotion, mirroredX + (width * .75) / 5 + width * .75 - emotionWidth, (y + (height * .85)) + 24);
        });
      });
    }, 100);
  });
