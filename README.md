# Yash Rathore Portfolio

A modern cyberpunk-themed portfolio website with 3D effects, VR mode, and contact form functionality.

## Features

- Fully responsive design
- Interactive 3D effects with Three.js
- VR mode for immersive viewing
- Contact form with email functionality
- Modern cyberpunk design with glass morphism effects

## Contact Form Email Setup

The contact form is already set up with EmailJS to send messages directly to your email. The following credentials are configured:

- Public Key: HAVMhHXyZrplCnKuF
- Service ID: service_g94h78q
- Template ID: template_6oopjgl

If you need to modify these settings:

1. **Access Your EmailJS Account**:
   - Go to [EmailJS](https://www.emailjs.com/) and log in to your account
   - The free plan allows 200 emails per month

2. **Modify Email Template**:
   - Go to "Email Templates" 
   - Edit the template with ID "template_6oopjgl"
   - You can customize the look and feel of the email notifications

3. **Update Email Service**:
   - If needed, you can modify the email service with ID "service_g94h78q"
   - You can connect a different email account by following the instructions

## Customization

- Update the colors in the `:root` section of `cyberpunk.css` to change the theme
- Modify the Three.js background in the `initThreeJS()` function in `script.js`
- Update your portfolio information in `index.html`

## VR Mode

The website includes a VR mode that works best on devices with a gyroscope. When users click the "VR Mode" button, a popup explains how it works before enabling the feature.

## Mobile Responsiveness

The website is fully responsive and adapts to all screen sizes, with special consideration for:
- Navigation on mobile devices
- Contact form layout
- Project cards and other content sections

## Browser Compatibility

Tested and works on:
- Chrome (recommended for best 3D effects)
- Firefox
- Safari
- Edge

## Dependencies

- Three.js for 3D effects
- Font Awesome for icons
- EmailJS for contact form functionality
- Google Fonts (Poppins) 