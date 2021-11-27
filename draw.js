var Visualizer = function(config) {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.config = config;
    this.frequency = [];
    this.playing = false;
    this.ready = false;
    this.loadFailed = false;
};
Visualizer.prototype = {
    init: function() {
        this._prepare();
        this.getData();
        this._analyser();
    },
    _prepare: function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        try {
            this.audioContext = new AudioContext();

        } catch (e) {
            console.log(e);
        }
    },
    _analyser: function() {
        var that = this;
        that.analyser = that.audioContext.createAnalyser();
        that.analyser.smoothingTimeConstant = 0.85;
        that.analyser.fftSize = 2048; //傅里叶变换参数 简化数组
        that.source.connect(that.analyser);
        that.analyser.connect(that.audioContext.destination);
        that.frequency = new Uint8Array(that.analyser.frequencyBinCount);
    },
    getData: function() {
        var that = this;
        that.source = that.audioContext.createBufferSource();
        var request = new XMLHttpRequest();
        request.open('GET', that.config.url, true);
        request.responseType = 'arraybuffer';
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    that.ready = true;
                } else {
                    that.loadFailed = true;
                }
            }
        };
        request.onload = function() {
            var audioData = request.response;
            that.audioContext.decodeAudioData(audioData, function(buffer) {
                    that.source.buffer = buffer;
                    that.source.loop = that.config.loop || false;

                },
                function(e) {
                    "Error with decoding audio data" + e.err
                });
        };
        request.send();
    },
    play: function() {
        var that = this;
        that.source.start(0);
        that.playing = true;
        var timer = setInterval(function() {
            that.analyser.getByteFrequencyData(that.frequency);
            if (that.source.buffer) {
                if (that.audioContext.currentTime > that.source.buffer.duration) {
                    that.source.stop(0);
                    that.playing = false;
                    clearInterval(timer);
                }
            }
        }, 100);
    },
    stop: function() {
        var that = this;
        that.source.stop(0);
        that.playing = false;
    }
};


var v = new Visualizer({
    url: "tt.mp3",
    loop: false
});
v.init();
$("#btn").click(function() {
    v.play();
})
$("#stop").click(function() {
    v.stop();
})
const t = setInterval(function() {
    if (v.ready) {
        console.log("ready!");
    } else if (v.loadFailed) {
        console.log("加载失败");
    }
    if (v.playing) {
        // console.log(v.frequency);
        let canvas = document.getElementById('canvas');
        canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        v.analyser.getByteFrequencyData(v.frequency);
        canvasCtx.fillStyle = '#000130';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        let barWidth = (canvas.width * 1 / v.analyser.frequencyBinCount) * 2;
        let barHeight;
        let x = 0;
        let prex = 0;
        let prey = 0;
        for (let i = 0; i < v.analyser.frequencyBinCount; i++) {
            barHeight = v.frequency[i] / 2;
            if (i > 0) {
                prey = v.frequency[i - 1] / 2;
            }
            canvasCtx.strokeStyle = 'rgb(100, 200, 255)';
            canvasCtx.beginPath()
            canvasCtx.moveTo(prex, (canvas.height - prey) / 2)
            canvasCtx.lineTo(x, (canvas.height - barHeight) / 2)
            canvasCtx.stroke()
            canvasCtx.closePath()
            x += barWidth + 1;
            if (i > 0) {
                prex += barWidth;
            }
        }

    }
}, 100);