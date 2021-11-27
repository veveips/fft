let audioContext = new(window.AudioContext || window.webkitAudioContext)();

function getaudio(url, canvas) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        const audioData = request.response;
        audioContext.decodeAudioData(audioData, function(buffer) {
            const peaks = getPeaks(buffer, 1);
            drawaudio(peaks, canvas);
            audioContext = null;
        }, function(e) {
            "Error with decoding audio data" + e.err
        });
    };
    request.send();
}

function drawaudio(a, c) {
    cwidth = c.width,
        cheight = c.height - 2,
        meterWidth = 4,
        gap = 5,
        meterNum = cwidth / (meterWidth + gap),
        anum = Math.floor(a.length / meterNum);
    var ctx = c.getContext('2d');
    var soild = ctx.fillStyle = 'rgb(100, 200, 255)';
    ctx.clearRect(0, 0, cwidth, cheight);
    for (var i = 0; i < meterNum; i++) {
        ctx.fillStyle = soild;
        ctx.shadowColor = '#0ff';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        let cxheight = a[i * anum] * cheight;
        let y = Math.abs(cxheight) - cheight / 2 - cheight * 0.1;
        y /= cheight * 0.03;
        let x = i * (meterWidth + gap)
        ctx.fillRect(x, cheight / 2, meterWidth, y);
        ctx.fillRect(x, cheight / 2, meterWidth, -y);
        ctx.shadowBlur = 0;
        ctx.fillRect(0, cheight / 2, cwidth, 1)
    }
}

function getPeaks(buffer, perSecPx) {
    const {
        sampleRate,
        length
    } = buffer;
    const sampleSize = ~~(sampleRate / perSecPx);
    const first = 0;
    const last = ~~(length / sampleSize);
    const peaks = [];
    const chan = buffer.getChannelData(0);
    for (let i = first; i <= last; i++) {
        const start = i * sampleSize;
        const end = start + sampleSize;
        let min = 0;
        let max = 0;
        for (let j = start; j < end; j++) {
            const value = chan[j];
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
        peaks[2 * i] = max;
        peaks[2 * i + 1] = min;
    }

    return peaks;
};


getaudio("gz.mp3", document.getElementById('canvas'));