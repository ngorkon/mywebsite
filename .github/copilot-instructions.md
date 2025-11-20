# Mayom Kon Portfolio Website

**ALWAYS reference these instructions first** and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

This is a pure static HTML/CSS/JavaScript portfolio website featuring physics-inspired animations, canvas particle systems, and interactive elements. The site is hosted on GitHub Pages and requires no build process or Node.js dependencies.

## Working Effectively

### Serving the Website Locally
- **Primary method (fastest startup):**
  ```bash
  cd /home/runner/work/mywebsite/mywebsite
  python3 -m http.server 8000
  ```
  - **Timing**: Starts in <1 second
  - **Access**: http://localhost:8000/
  - **Performance**: Serves all assets in <10ms each

- **Alternative methods:**
  ```bash
  # Using npx (requires internet for first run)
  npx --yes http-server . -p 8000 -c-1 --cors
  
  # Using Node.js built-in (if available)
  node -e "require('http').createServer(require('fs').readFileSync).listen(8000)"
  ```

### No Build Process Required
- **IMPORTANT**: This is a static website with NO build process
- Do NOT run `npm install`, `npm run build`, or similar commands
- Do NOT expect package.json or Node.js dependencies
- Files are served directly as-is from the filesystem

## Validation and Testing

### Code Validation (Run Before Committing)
1. **HTML structure validation:**
   ```bash
   python3 -c "
   with open('index.html', 'r') as f:
       content = f.read()
   assert '<html' in content and '</html>' in content
   assert '<head' in content and '</head>' in content  
   assert '<body' in content and '</body>' in content
   print('✓ HTML structure valid')
   "
   ```

2. **CSS syntax validation:**
   ```bash
   python3 -c "
   with open('css/style.css', 'r') as f:
       css = f.read()
   open_braces = css.count('{')
   close_braces = css.count('}')
   assert open_braces == close_braces, f'Unbalanced braces: {open_braces} open, {close_braces} close'
   print(f'✓ CSS syntax valid ({open_braces} balanced brace pairs)')
   "
   ```

3. **JavaScript syntax validation:**
   ```bash
   node -c js/script.js && echo "✓ JavaScript syntax valid"
   ```

### Asset Loading Validation
- **Test all assets load correctly:**
  ```bash
  # Start server first: python3 -m http.server 8000
  curl -f http://localhost:8000/ > /dev/null && echo "✓ HTML loads"
  curl -f http://localhost:8000/css/style.css > /dev/null && echo "✓ CSS loads"  
  curl -f http://localhost:8000/js/script.js > /dev/null && echo "✓ JavaScript loads"
  curl -f http://localhost:8000/images/ngorkon.png > /dev/null && echo "✓ Profile image loads"
  ```

### End-to-End Testing Scenarios

**CRITICAL**: After making ANY changes, ALWAYS test these complete user scenarios:

1. **Navigation and Scrolling:**
   - Serve the website locally
   - Open browser to http://localhost:8000/
   - Verify smooth scrolling between sections (Home, About, Projects, Experience, Contact)
   - Confirm active navigation highlighting works
   - Test mobile responsive behavior if possible

2. **Interactive Elements:**
   - Click profile image in hero section (should trigger shooting star animation)  
   - Hover over project cards (should show hover effects)
   - Interact with social media icons in contact section (SVG web should animate)
   - Test slideshow navigation if present (next/prev buttons)

3. **Canvas Animations:**
   - Verify particle network animation in hero section works
   - Check background molecular network renders without errors
   - Confirm animations are smooth and don't cause performance issues

4. **Contact Form:**
   - Form action points to: `https://formspree.io/f/xovdbwpw`
   - Required fields: name (text), email (email), message (textarea)
   - Form should be accessible and properly labeled
   - **Note**: Form submission requires actual internet connection to Formspree

### JavaScript Console Monitoring
- **Expected JavaScript output**: Extensive console logging for slideshow functionality
- **Known non-critical warnings**: Canvas gradient errors (do not affect functionality)
- **Critical errors to watch for**: Missing DOM elements, failed asset loads

## Linting and Code Quality

### JavaScript Linting (Optional)
- **JSHint**: Available via `npx --yes jshint js/script.js`
- **Note**: Code uses ES6+ features, expects warnings about arrow functions, const/let, template literals
- **185 JSHint warnings are NORMAL** (ES6 syntax warnings, not errors)

### Browser Compatibility Notes
- **CSS**: Uses modern CSS3 features (animations, transforms, gradients)
- **CSS prefixes**: Some -webkit- and -moz- prefixes present for compatibility
- **JavaScript**: ES6+ syntax throughout (arrow functions, const/let, template literals)
- **Target browsers**: Modern browsers (Chrome, Firefox, Safari, Edge latest versions)

## Repository Structure and Key Files

### Essential Files
```
/
├── index.html              # Main HTML structure (semantic, accessible)
├── css/style.css          # All styles (53KB, 315 CSS rules, physics-inspired animations)
├── js/script.js           # Interactive functionality (canvas, animations, slideshow)
└── images/                # Profile and project images
    ├── ngorkon.png                    # Profile photo
    ├── placeholder-smart-bin.png      # Project image
    ├── placeholder-smart-pump.png     # Project image  
    └── placeholder-listen-ukraine.png # Project image
```

### Configuration Files
- `.github/workflows/npm-publish-github-packages.yml` - **INCORRECT for static site**, designed for Node.js packages
- **No** package.json, no build configuration, no dependency files

## Common Development Tasks

### Making Style Changes
1. Edit `css/style.css` directly
2. Refresh browser to see changes immediately
3. Run CSS syntax validation
4. Test responsive behavior

### Modifying JavaScript Functionality  
1. Edit `js/script.js` directly
2. Run `node -c js/script.js` to validate syntax
3. Test in browser console for runtime errors
4. Verify animations and interactions work

### Adding New Images
1. Add image files to `images/` directory
2. Reference in HTML with relative path: `images/filename.png`
3. Test loading with curl: `curl -f http://localhost:8000/images/filename.png`

### Content Updates
1. Edit text directly in `index.html`
2. Maintain semantic HTML structure
3. Test accessibility and responsive behavior
4. Validate HTML structure

## Deployment and Hosting

### GitHub Pages
- **Live site**: https://ngorkon.github.io/mywebsite/
- **Deployment**: Automatic from main branch
- **No build step required**: Files served directly

### Testing Production Behavior Locally
- Use Python server as shown above
- Test all functionality works without build process  
- Verify all assets load with relative paths

## Troubleshooting

### Common Issues
1. **"Address already in use" when starting server**:
   ```bash
   pkill -f "http.server 8000"
   # Wait 2 seconds, then restart server
   ```

2. **Images not loading**: Check file paths and case sensitivity
3. **JavaScript console errors**: Check browser developer console, most logging is informational
4. **Canvas not rendering**: Verify browser supports HTML5 Canvas API

### Performance Optimization
- **CSS file size**: 53KB (acceptable for rich animations)
- **JavaScript**: Modern ES6+ code, requires modern browser
- **Images**: PNG format, optimize file sizes as needed

## Important Notes for Code Changes

- **Always test manually**: Start server and exercise your changes in browser  
- **No automatic builds**: Changes are immediately visible when served
- **Console logging**: Extensive debugging output is normal and expected
- **Mobile testing**: Responsive design should work on mobile viewports
- **Form functionality**: Contact form requires internet connection for actual submission

Remember: This is a showcase portfolio site emphasizing visual effects and interactivity. Prioritize smooth animations, responsive design, and cross-browser compatibility when making changes.