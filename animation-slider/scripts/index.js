class ImageSequenceViewer {
  constructor(container, options) {
      this.container = container;
      const defaultOptions = {
          folderPath: '',
          numFrames: 0,
          startFrame: 1,
          endFrame: null,
          speed: 1,
          autoplay: false
      };
      
      this.options = { ...defaultOptions, ...options };
      this.frames = [];
      this.currentIndex = 0;
      this.isPlaying = this.options.autoplay;
      this.playDirection = 1;
      this.animationFrame = null;
      this.lastFrameTime = 0;
      this.frameInterval = 1000 / (30 * this.options.speed);

      this.createUI();
      this.initializeElements();
      
      // Set initial play/pause icon based on autoplay
      this.playPauseIconEl.src = this.options.autoplay ? 
          './animation-slider/mediaicons/pause.png' : 
          './animation-slider/mediaicons/play.png';
      
      this.loadImages();
      this.setupEventListeners();

      if (this.options.autoplay) {
          this.playForward();
      }
  }

  createUI() {
      const viewerId = this.container.id;
      this.container.innerHTML = `          
          <div class="sequence-viewer">
              <div class="start-frame">
                  <img id="first-frame-${viewerId}" src="" alt="First Frame">
              </div>
              <div class="center-column">
                  <div class="current-frame">
                      <div class="frame-counter">
                          Frame: <span id="current-frame-number-${viewerId}">0</span> / <span id="total-frames-${viewerId}">0</span>
                      </div>
                      <img id="current-frame-${viewerId}" src="" alt="Current Frame">
                  </div>
                  <div class="slider-container">
                      <input type="range" id="frame-slider-${viewerId}" min="0" value="0">
                  </div>
              </div>
              <div class="end-frame">
                  <img id="last-frame-${viewerId}" src="" alt="Last Frame">
              </div>
          </div>
          <div class="controls">
              <button class="control-btn" id="play-backward-${viewerId}">
                  <img src="./animation-slider/mediaicons/back.png" alt="Rewind" class="control-icon">
              </button>
              <button class="control-btn" id="prev-frame-${viewerId}">
                  <img src="./animation-slider/mediaicons/backward.png" alt="Previous Frame" class="control-icon">
              </button>
              <button class="control-btn" id="play-pause-${viewerId}">
                  <img src="./animation-slider/mediaicons/play.png" alt="Play/Pause" class="control-icon" id="play-pause-icon-${viewerId}">
              </button>
              <button class="control-btn" id="next-frame-${viewerId}">
                  <img src="./animation-slider/mediaicons/forward.png" alt="Next Frame" class="control-icon">
              </button>
              <button class="control-btn" id="play-forward-${viewerId}">
                  <img src="./animation-slider/mediaicons/next.png" alt="Forward" class="control-icon">
              </button>
              <div class="speed-controls">
                  <span class="speed-label">Speed:</span>
                  <button class="speed-btn" id="speed-btn-${viewerId}" data-speed="0.25">0.25x</button>
                  <button class="speed-btn" id="speed-btn-${viewerId}" data-speed="0.5">0.5x</button>
                  <button class="speed-btn  id="speed-btn-${viewerId}" active" data-speed="1">1x</button>
                  <button class="speed-btn" id="speed-btn-${viewerId}" data-speed="2">2x</button>
                  <button class="speed-btn" id="speed-btn-${viewerId}" data-speed="3">3x</button>
                  <button class="speed-btn" id="speed-btn-${viewerId}" data-speed="5">5x</button>
              </div>
          </div>
      `;
  }

  initializeElements() {
      const viewerId = this.container.id;
      this.firstFrameEl = document.getElementById('first-frame-' + viewerId);
      this.currentFrameEl = document.getElementById('current-frame-' + viewerId);
      this.lastFrameEl = document.getElementById('last-frame-' + viewerId);
      this.sliderEl = document.getElementById('frame-slider-' + viewerId);
      this.playBackwardBtn = document.getElementById('play-backward-' + viewerId);
      this.prevFrameBtn = document.getElementById('prev-frame-' + viewerId);
      this.playPauseBtn = document.getElementById('play-pause-' + viewerId);
      this.nextFrameBtn = document.getElementById('next-frame-' + viewerId);
      this.playForwardBtn = document.getElementById('play-forward-' + viewerId);
      this.playPauseIconEl = document.getElementById('play-pause-icon-' + viewerId);
  }

  async loadImages() {
      try {
          // Generate array of image paths only for the specified frame range
          const frameCount = this.options.endFrame - this.options.startFrame + 1;
          this.frames = Array.from({length: frameCount}, (_, i) => {
              // Pad number with leading zeros (startFrame -> 0001)
              const frameNumber = this.options.startFrame + i;
              const paddedNumber = String(frameNumber).padStart(4, '0');
            //   '${this.options.folderPath}/${paddedNumber}.png'
              return this.options.folderPath + '/' + paddedNumber + '.png';
          });
          
          this.sliderEl.max = this.frames.length - 1;
          
          this.firstFrameEl.src = this.frames[0];
          this.currentFrameEl.src = this.frames[0];
          this.lastFrameEl.src = this.frames[this.frames.length - 1];
          
          // Update total frames display
          this.totalFramesEl = document.getElementById('total-frames-' + this.container.id);
          this.totalFramesEl.textContent = this.frames.length;
          this.frameCounterEl = document.getElementById('current-frame-number-' + this.container.id);
          this.frameCounterEl.textContent = '1';
      } catch (error) {
          console.error('Error loading images:', error);
      }
  }

  setupEventListeners() {
      this.sliderEl.addEventListener('input', () => {
          this.currentIndex = parseInt(this.sliderEl.value);
          this.updateCurrentFrame();
      });

      this.playBackwardBtn.addEventListener('click', () => this.playBackward());
      this.prevFrameBtn.addEventListener('click', () => this.previousFrame());
      this.playPauseBtn.addEventListener('click', () => this.togglePlay());
      this.nextFrameBtn.addEventListener('click', () => this.nextFrame());
      this.playForwardBtn.addEventListener('click', () => this.playForward());

      // Add speed control listeners
      const speedButtons = document.querySelectorAll('.speed-btn');
      speedButtons.forEach(button => {
          button.addEventListener('click', (e) => {
              // Update active button styling
              speedButtons.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');

              // Update speed
              this.frameInterval = 1000 / (30 * parseFloat(button.dataset.speed));
          });
      });
  }

  updateCurrentFrame() {
      this.currentFrameEl.src = this.frames[this.currentIndex];
      this.sliderEl.value = this.currentIndex;
      // Update frame counter
      this.frameCounterEl.textContent = (this.currentIndex + 1).toString();
  }

  nextFrame() {
      if (this.currentIndex < this.frames.length - 1) {
          this.currentIndex++;
          this.updateCurrentFrame();
      }
  }

  previousFrame() {
      if (this.currentIndex > 0) {
          this.currentIndex--;
          this.updateCurrentFrame();
      }
  }

  playForward() {
      this.playDirection = 1;
      this.isPlaying = true;
      this.animate();
  }

  playBackward() {
      this.playDirection = -1;
      this.isPlaying = true;
      this.animate();
  }

  togglePlay() {
      this.isPlaying = !this.isPlaying;
      // Update play/pause icon
      this.playPauseIconEl.src = this.isPlaying ? 
          './animation-slider/mediaicons/pause.png' : 
          './animation-slider/mediaicons/play.png';
      
      if (this.isPlaying) {
          this.animate();
      } else {
          cancelAnimationFrame(this.animationFrame);
      }
  }

  animate(timestamp) {
      if (!this.isPlaying) return;

      // Check if enough time has passed to show next frame
      if (!this.lastFrameTime) this.lastFrameTime = timestamp;
      const elapsed = timestamp - this.lastFrameTime;

      if (elapsed > this.frameInterval) {
          this.currentIndex += this.playDirection;

          if (this.currentIndex >= this.frames.length) {
              this.currentIndex = 0;
          } else if (this.currentIndex < 0) {
              this.currentIndex = this.frames.length - 1;
          }

          this.updateCurrentFrame();
          this.lastFrameTime = timestamp;
      }

      this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }
}

// Make the class globally available
window.ImageSequenceViewer = ImageSequenceViewer;