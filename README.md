# CV Website

A professional CV website that displays LaTeX content from Overleaf using GitHub Pages.

## 🚀 Quick Start

### 1. Set up GitHub Repository

1. Create a new repository on GitHub (e.g., `cv-website`)
2. Upload all the files from this project to your repository
3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` or `master`
   - Folder: `/ (root)`

### 2. Configure Your Overleaf Integration

**Option A: Direct LaTeX File (Recommended)**

1. In your Overleaf project, go to Menu → Download → Source
2. Upload the downloaded `.tex` file to your GitHub repository
3. Update the `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
    latexFileUrl: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/your-cv.tex',
    // ... other config
};
```

**Option B: Overleaf Project URL (Already Configured!)**

✅ Your Overleaf project is already configured in `script.js`:

```javascript
const CONFIG = {
    overleafProjectUrl: 'https://www.overleaf.com/project/64e59dded3b340f0eb5e921b',
    // ... other config
};
```

### 3. Customize Your Website

1. **Repository URLs**: Already updated with your GitHub username
2. **Custom Domain** (Optional): Add your custom domain in `.github/workflows/pages.yml`
3. **Styling**: Modify `styles.css` to match your preferences
4. **Content**: The website will automatically fetch and display your LaTeX CV

## 📁 Project Structure

```
cv-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── package.json        # Node.js dependencies
├── .gitignore          # Git ignore rules
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment
└── README.md           # This file
```

## 🔧 Configuration

The main configuration is in `script.js`. Update these values:

```javascript
const CONFIG = {
    // Your Overleaf project URL (Already configured!)
    overleafProjectUrl: 'https://www.overleaf.com/project/64e59dded3b340f0eb5e921b',
    
    // OR direct LaTeX file URL (recommended for better performance)
    latexFileUrl: '', // Set this after exporting from Overleaf
    
    // Your GitHub Pages URL (Already configured!)
    githubPagesUrl: 'https://sepehr-mousaviyan.github.io/cv-website',
    
    // Update interval (24 hours)
    updateInterval: 24 * 60 * 60 * 1000
};
```

## 🎨 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Professional Styling**: Clean, modern design
- **LaTeX Support**: Renders LaTeX mathematical expressions
- **Auto-updates**: Periodically fetches latest CV content
- **Print-friendly**: Optimized for printing
- **Fast Loading**: Optimized for performance

## 🚀 Deployment

The website automatically deploys to GitHub Pages when you push to the main branch. The deployment workflow:

1. Validates HTML
2. Deploys to GitHub Pages
3. Updates automatically when you push changes

## 📝 LaTeX Formatting

The website supports common LaTeX commands:

- `\section{}` → `<h2>`
- `\subsection{}` → `<h3>`
- `\textbf{}` → `<strong>`
- `\textit{}` → `<em>`
- `\item` → `<li>`
- Math expressions with `$...$` or `$$...$$`

## 🔄 Updating Your CV

1. **Via Overleaf**: Update your CV in Overleaf, then re-export and upload to GitHub
2. **Via GitHub**: Edit the `.tex` file directly in GitHub
3. **Automatic**: The website checks for updates every 24 hours

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Validate HTML
npm run validate
```

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your LaTeX file URL is accessible
3. Ensure GitHub Pages is enabled in your repository settings
4. Check that all files are properly uploaded to GitHub

## 📄 License

MIT License - feel free to use and modify as needed.

---

**Need the Overleaf project URL?** 

Please provide your Overleaf project URL (e.g., `https://www.overleaf.com/read/your-project-id`) and I'll help you configure the integration!
