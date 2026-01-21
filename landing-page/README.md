# InterviewPro Landing Page

A beautiful, modern landing page with glassmorphic design elements, soft gradients in white, light blue, pink, purple, and silver.

## Design Features

- **Glassmorphic Components**: Modern frosted glass effect cards and elements
- **Gradient Color Scheme**: Soft blue, pink, purple, and silver gradients
- **Smooth Animations**: Fade-in, floating elements, and interactive micro-animations
- **Mouse Tracking**: Interactive floating elements that respond to cursor movement
- **Responsive Design**: Fully responsive across all device sizes
- **Performance Optimized**: Throttled events and efficient animations

## Tech Stack

- **Node.js + Express**: Simple, fast server
- **Vanilla HTML/CSS/JS**: No frameworks, pure performance
- **Modern CSS**: Backdrop filters, gradients, custom animations
- **Elegant Typography**: DM Serif Display + Outfit font pairing

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The landing page will be available at **http://localhost:3001**

## Project Structure

```
landing-page/
├── server.js           # Express server
├── package.json        # Dependencies
├── public/
│   ├── index.html     # Main landing page
│   ├── styles.css     # All styling (glassmorphic effects, animations)
│   └── script.js      # Interactive features
└── README.md          # This file
```

## Key Sections

1. **Hero Section**: Main headline with animated floating elements
2. **Stats Cards**: Glassmorphic stat displays with hover effects
3. **Features Grid**: Four dimension cards (Technical Skills, EQ, Communication, Executive Presence)
4. **CTA Section**: Large call-to-action with gradient background
5. **Footer**: Clean, minimal footer

## Customization

### Colors
All colors are defined as CSS variables in `styles.css`:
- `--blue-*`: Blue gradient shades
- `--purple-*`: Purple gradient shades
- `--pink-*`: Pink gradient shades

### Animations
Adjust animation timing in `styles.css`:
- `pulse-slow`: Background orb animations
- `float-slow`: Floating element animations
- `fade-in-up`: Content reveal animations

### Typography
Fonts are loaded from Google Fonts:
- Display: DM Serif Display
- Body: Outfit
- Alternative: Plus Jakarta Sans

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Throttled mouse events (50ms)
- GPU-accelerated animations
- Optimized backdrop filters
- Lazy-loaded content

---

Built with attention to detail and aesthetic refinement.
