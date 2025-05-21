# Mayom Kon Portfolio

## Overview
A high-performance, physics-inspired portfolio website with advanced CSS, JavaScript, and SVG animation systems. Designed for a physicist/engineer, it features interactive canvas backgrounds, animated hero and project sections, and a dynamic, interactive contact web. The site is fully responsive and optimized for modern browsers.

## Project Structure
```
my-website/
├── css/
│   └── style.css        # Advanced CSS with physics-inspired, animated UI
├── images/
│   └── ngorkon.png      # Profile image (Corrected)
│   └── placeholder-smart-bin.png
│   └── placeholder-smart-pump.png
│   └── placeholder-listen-ukraine.png
├── js/
│   └── script.js        # Modular JS for animation, SVG, and interactivity
├── index.html           # Semantic, accessible HTML structure
├── src/
│   └── components/      # (For future React migration)
└── README.md
```

## Technologies Used
-   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
-   **Animations:** CSS Keyframes, JavaScript (Canvas API, SVG manipulation)
-   **Interactivity:** DOM manipulation, Event Listeners
-   **Deployment:** GitHub Pages
-   **Form Handling:** Formspree (for contact form)

## Key Features

### Physics-Inspired Animations
- **Hero Section:**
  - Animated particle network (canvas) with proximity-based connectors
  - Typing effect for subtitle
  - Profile image with glowing, pulsing, and shooting star animation on click
- **Full-Page Background:**
  - Canvas-based molecular network with simulated chemical reactions
  - Particles trigger color transitions and state changes based on proximity
- **Scroll Animations:**
  - IntersectionObserver triggers fade-in and glitch effects for sections and awards

### Projects & Experience
- **Project Cards:**
  - Responsive grid, animated hover, and tag system
  - Placeholder images for demonstration (replace with real project images as needed)
- **Experience & Honors:**
  - Timeline and awards list with staggered, animated appearance

### Interactive Contact Section
- **Contact Form:**
  - Formspree integration for serverless email delivery
  - Accessible, validated, and styled for a high-tech look
- **Social Web:**
  - SVG-based, animated web connecting social icons
  - Interactive: lines stretch/elongate toward cursor when hovering icons
  - Animated pulse and glow effects

### Advanced CSS & SVG Techniques
- Keyframe animations for glow, pulse, scanline, and more
- Pseudo-elements for energy fields and neon effects
- SVG manipulation for dynamic, interactive visuals

### JavaScript Architecture
- Modular, event-driven initialization
- Canvas and SVG rendering optimized with requestAnimationFrame
- Debounced resize and scroll handlers for performance
- Smooth scrolling and active nav highlighting

### Responsive & Accessible
- Mobile-first, flexible grid and flex layouts
- Touch-friendly interactions
- Accessible navigation and form controls

## Development & Usage

### Local Development
1. Clone the repository:
   ```powershell
   git clone <repository-url>
   cd my-website
   ```
2. Start a local server (ensure you are in the `my-website` directory):
   ```powershell
   # Option 1: Python HTTP server
   python -m http.server
   # Option 2: Use VS Code Live Server extension (it should now serve from the root)
   ```
3. Open [http://localhost:8000](http://localhost:8000) (or the port Live Server uses) in your browser.

### Browser Support
- Chrome, Edge, Brave (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (touch support)

## Live Site

This portfolio is hosted on GitHub Pages and can be viewed at:
[https://ngorkon.github.io/mywebsite/](https://ngorkon.github.io/mywebsite/)

## Roadmap
- WebGL-based 3D physics simulations
- Dark/light mode toggle with persistence
- PWA support (offline, installable)
- React/TypeScript migration

## License
MIT License