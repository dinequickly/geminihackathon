// Mouse tracking for floating elements
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;

  updateFloatingElements();
});

function updateFloatingElements() {
  const floatingElements = document.querySelectorAll('.floating-element');

  floatingElements.forEach((element, index) => {
    const speed = (index + 1) * 15;
    const x = mouseX * speed * (index % 2 === 0 ? 1 : -1);
    const y = mouseY * speed * (index % 2 === 0 ? 1 : -1);

    element.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach(card => {
  observer.observe(card);
});

// Smooth scroll polyfill
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

// Add parallax effect to orbs on scroll
let scrollY = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  updateOrbPositions();
});

function updateOrbPositions() {
  const orbs = document.querySelectorAll('.orb');

  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 0.05;
    const yPos = scrollY * speed;
    orb.style.transform = `translateY(${yPos}px)`;
  });
}

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

// Add loading animation
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// Performance optimization: throttle mouse move events
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// Apply throttling to mouse move
const throttledMouseMove = throttle((e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
  updateFloatingElements();
}, 50);

document.removeEventListener('mousemove', throttledMouseMove);
document.addEventListener('mousemove', throttledMouseMove);

console.log('✨ InterviewPro landing page loaded!');
