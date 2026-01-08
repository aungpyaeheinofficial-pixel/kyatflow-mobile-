# How to Create Favicon Files

The SVG favicon has been created at `public/favicon.svg`. To create other formats needed for better browser compatibility, follow these steps:

## Option 1: Online Favicon Generator (Easiest)

1. **Use an online tool:**
   - https://realfavicongenerator.net/
   - https://favicon.io/

2. **Upload the SVG file:**
   - Upload `public/favicon.svg` or `public/logo-green-cash.svg`

3. **Download generated files:**
   - Download the generated favicon package
   - Replace files in `public/` folder:
     - `favicon.ico`
     - `favicon.png` (32x32 and 16x16)
     - `apple-touch-icon.png` (180x180)

## Option 2: Convert SVG to ICO/PNG (Command Line)

### Install ImageMagick (if not installed)

```bash
# Ubuntu/Debian
sudo apt install imagemagick

# Or use Node.js tool
npm install -g sharp-cli
```

### Convert SVG to PNG/ICO

```bash
cd public

# Convert to PNG (16x16)
convert -background none -resize 16x16 logo-green-cash.svg favicon-16x16.png

# Convert to PNG (32x32)
convert -background none -resize 32x32 logo-green-cash.svg favicon-32x32.png

# Convert to ICO (multiple sizes)
convert -background none -resize 256x256 logo-green-cash.svg favicon.ico

# Create Apple touch icon (180x180)
convert -background none -resize 180x180 logo-green-cash.svg apple-touch-icon.png

# Create OG image (1200x630 for social media)
convert -background "#10b981" -resize 1200x630 logo-green-cash.svg og-image.png
```

### Or use Sharp (Node.js)

```bash
# Install sharp
npm install -g sharp-cli

# Convert files
sharp -i logo-green-cash.svg -o favicon-16x16.png --resize 16 16
sharp -i logo-green-cash.svg -o favicon-32x32.png --resize 32 32
sharp -i logo-green-cash.svg -o apple-touch-icon.png --resize 180 180
sharp -i logo-green-cash.svg -o og-image.png --resize 1200 630 --background "#10b981"
```

## Option 3: Use Favicon Generator Script

Create a simple script to generate all sizes:

```bash
# Save as generate-favicons.sh
#!/bin/bash
SVG_FILE="public/logo-green-cash.svg"

# Convert to various sizes
convert -background none -resize 16x16 "$SVG_FILE" public/favicon-16x16.png
convert -background none -resize 32x32 "$SVG_FILE" public/favicon-32x32.png
convert -background none -resize 180x180 "$SVG_FILE" public/apple-touch-icon.png
convert -background none -resize 1200x630 -extent 1200x630 -background "#10b981" "$SVG_FILE" public/og-image.png

# Create ICO file (combines multiple sizes)
convert -background none "$SVG_FILE" -define icon:auto-resize=16,32,48,64,128,256 public/favicon.ico

echo "✅ Favicon files generated!"
```

Run: `bash generate-favicons.sh`

## Option 4: Manual Design Tools

If you want to create a custom design:

1. **Use Figma/Sketch/Adobe Illustrator:**
   - Create 512x512 or 1024x1024 design
   - Export as SVG
   - Use conversion tools above

2. **Use Canva:**
   - Create custom logo design
   - Export as PNG
   - Convert to SVG/ICO

## Quick Setup (Minimum Required)

For now, the SVG favicon will work in modern browsers. To complete the setup:

```bash
# Just copy the SVG as PNG for basic support
cp public/favicon.svg public/favicon.png
cp public/favicon.svg public/apple-touch-icon.png
cp public/favicon.svg public/og-image.png
```

Then rebuild:
```bash
npm run build
```

## Verify Favicon

After creating files and rebuilding:

1. Clear browser cache
2. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Check browser tab - should show green cash icon
4. Or inspect element and check Network tab for favicon requests

## Colors Used

- Primary Green: `#10b981` (Emerald 500)
- Dark Green: `#059669` (Emerald 600)
- White: `#ffffff`
- Theme matches the app's primary color scheme

