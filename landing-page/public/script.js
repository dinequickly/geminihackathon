// Mouse tracking for floating elements
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Smooth mouse following using lerp
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function updateFloatingElements() {
  // Smooth interpolation for mouse movement
  mouseX = lerp(mouseX, targetMouseX, 0.1);
  mouseY = lerp(mouseY, targetMouseY, 0.1);

  const floatingElements = document.querySelectorAll('.floating-element');

  floatingElements.forEach((element, index) => {
    const speed = (index + 1) * 15;
    const x = mouseX * speed * (index % 2 === 0 ? 1 : -1);
    const y = mouseY * speed * (index % 2 === 0 ? 1 : -1);

    element.style.transform = `translate(${x}px, ${y}px)`;
  });

  requestAnimationFrame(updateFloatingElements);
}

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Start the animation loop
requestAnimationFrame(updateFloatingElements);

// Intersection Observer for scroll animations - more reliable and performant
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Unobserve after animation to save resources
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all feature cards once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.feature-card').forEach(card => {
      observer.observe(card);
    });
  });
} else {
  document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Parallax effect for orbs on scroll - using requestAnimationFrame for smoothness
let scrollY = 0;
let targetScrollY = 0;
let ticking = false;

function updateOrbPositions() {
  const orbs = document.querySelectorAll('.orb');
  
  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 0.08;
    const yPos = scrollY * speed;
    orb.style.transform = `translateY(${yPos}px)`;
  });
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
  
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollY = targetScrollY;
      updateOrbPositions();
    });
    ticking = true;
  }
}, { passive: true });

// Add hover effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.zIndex = '20';
  });

  card.addEventListener('mouseleave', function() {
    this.style.zIndex = '10';
  });
});

// Add ripple effect to buttons
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
buttons.forEach(button => {
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Fade in page on load
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

console.log('✨ InterviewPro landing page loaded!');
