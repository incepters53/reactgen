// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to the main image for potential zoom functionality
    const mainImage = document.getElementById('mainImage');
    
    if (mainImage) {
        mainImage.addEventListener('click', function() {
            this.classList.toggle('enlarged');
        });
    }

    // You can add more interactive features here as needed
}); 






function zoom(e){
    var zoomer = e.currentTarget;
    e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
    e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
    x = offsetX/zoomer.offsetWidth*100
    y = offsetY/zoomer.offsetHeight*100
    zoomer.style.backgroundPosition = x + '% ' + y + '%';
  }
  
  
  
  
  // Initialize all video comparisons
  function initVideoComparisons() {
    document.querySelectorAll('.compare-video').forEach(container => {
        const slider = container.querySelector('.slider');
        const videoBefore = container.querySelector('.video-before');
        let isDown = false;
  
        slider.addEventListener('mousedown', () => {
            isDown = true;
        });
  
        window.addEventListener('mouseup', () => {
            isDown = false;
        });
  
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            
            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            slider.style.left = `${percentage}%`;
            videoBefore.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        });
  
        // Touch events support
        slider.addEventListener('touchstart', (e) => {
            isDown = true;
            e.preventDefault();
        });
  
        window.addEventListener('touchend', () => {
            isDown = false;
        });
  
        window.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            slider.style.left = `${percentage}%`;
            videoBefore.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        });
    });
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initVideoComparisons);