<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Portfolio Website Development Guide

This is a modern, responsive portfolio website built with HTML, CSS, and JavaScript. The site features:

## Key Features
- **Responsive Design**: Mobile-first approach with clean, modern UI
- **Dark/Light Theme**: Toggle between themes with persistent storage and theme-aware animations
- **Smooth Animations**: Scroll-triggered animations, hover effects, and entrance animations
- **Hero Image Underglow**: Animated circular underglow effect with theme-specific colors
- **Interactive Elements**: Shine effects on skill items, smooth project overlays, and micro-interactions
- **GitHub Pages Ready**: Automated deployment with GitHub Actions
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Performance Focused**: Optimized CSS and JavaScript for fast loading

## Technology Stack
- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
- **Icons**: Font Awesome 6.0
- **Fonts**: Google Fonts (Inter)
- **Deployment**: GitHub Pages with GitHub Actions
- **Version Control**: Git

## Development Guidelines
- Use CSS custom properties (variables) for consistent theming across light/dark modes
- Maintain accessibility standards (WCAG guidelines)
- Keep JavaScript modular and well-commented
- Use semantic HTML elements for better SEO
- Optimize images and assets for web delivery
- Test responsiveness across different screen sizes
- Ensure all animations and effects work in both theme modes
- Use theme-aware color schemes for underglow effects and animations
- Maintain consistent animation timing with cubic-bezier easing functions

## Customization Tips
- Update personal information in `index.html`
- Modify color schemes in CSS custom properties for both light and dark themes
- Add your own project images and links
- Update social media links and contact information
- Customize the skills and technologies sections
- Adjust animation timings and effects in the CSS
- Modify underglow colors for different theme aesthetics
- Update hero image and ensure it works with the circular clip-path effect

## Deployment Process
1. Push code to GitHub repository
2. GitHub Actions automatically builds and deploys
3. Configure custom domain in repository settings
4. Site is available at your custom domain or GitHub Pages URL
