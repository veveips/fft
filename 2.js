const audioContext = new(window.AudioContext || window.webkitAudioContext)();

function getaudio(url, canvas) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        const audioData = request.response;

        audioContext.decodeAudioData(audioData, function(buffer) {
                const audioBufferSourceNode = audioContext.createBufferSource();
                audioBufferSourceNode.connect(audioContext.destination)
                audioBufferSourceNode.buffer = buffer
                audioBufferSourceNode.start()
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                audioBufferSourceNode.connect(analyser);
                analyser.connect(audioContext.destination);
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                canvasCtx = canvas.getContext('2d');
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                analyser.getByteFrequencyData(dataArray);
                canvasCtx.fillStyle = '#000130';
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                let barWidth = (canvas.width * 1 / bufferLength) * 2;
                let barHeight;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];
                    //barHeight = buffer.getChannelData(0)[i];
                    console.log(barHeight);
                    canvasCtx.fillStyle = 'rgb(0, 255, 30)';
                    canvasCtx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
                    x += barWidth + 1;
                }
            },
            function(e) {
                "Error with decoding audio data" + e.err
            });
    };
    request.send();
}

$("#btn").click(function() {
    getaudio("gz.mp3", document.getElementById('canvas'));
})