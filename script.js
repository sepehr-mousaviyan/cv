// Configuration - Updated with your Overleaf project details
const CONFIG = {
    // Your Overleaf project URL
    overleafProjectUrl: 'https://www.overleaf.com/project/64e59dded3b340f0eb5e921b',
    
    // Alternative: Direct LaTeX file URL (if you export from Overleaf)
    latexFileUrl: 'https://raw.githubusercontent.com/sepehr-mousaviyan/cv/main/v1_Sepehr_s_Resume/shape.tex', // Sepehr's actual CV
    
    // GitHub Pages configuration
    githubPagesUrl: 'https://sepehr-mousaviyan.github.io/cv',
    
    // Update interval in milliseconds (24 hours)
    updateInterval: 24 * 60 * 60 * 1000
};

class CVLoader {
    constructor() {
        this.cvContainer = document.getElementById('cv-container');
        this.loadingElement = document.getElementById('loading');
        this.lastUpdatedElement = document.getElementById('last-updated');
        this.init();
    }

    init() {
        this.updateLastUpdatedTime();
        this.loadCVContent();
        
        // Set up periodic updates
        setInterval(() => {
            this.loadCVContent();
        }, CONFIG.updateInterval);
    }

    async loadCVContent() {
        try {
            this.showLoading();
            
            // Try to load from LaTeX file URL first, then fallback to Overleaf
            let content = null;
            
            if (CONFIG.latexFileUrl) {
                content = await this.loadFromLatexFile();
            } else if (CONFIG.overleafProjectUrl) {
                content = await this.loadFromOverleaf();
            } else {
                throw new Error('No LaTeX source configured. Please provide either latexFileUrl or overleafProjectUrl in CONFIG.');
            }
            
            if (content) {
                this.renderCV(content);
                this.hideLoading();
            }
            
        } catch (error) {
            console.error('Error loading CV content:', error);
            this.showError(error.message);
            this.hideLoading();
        }
    }

    async loadFromLatexFile() {
        try {
            const response = await fetch(CONFIG.latexFileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch LaTeX file: ${response.status}`);
            }
            
            const latexContent = await response.text();
            return this.parseLatexToHTML(latexContent);
        } catch (error) {
            console.error('Error loading from LaTeX file:', error);
            throw error;
        }
    }

    async loadFromOverleaf() {
        // Note: This is a simplified approach. Overleaf doesn't provide direct API access
        // You would need to export your LaTeX file and host it somewhere accessible
        throw new Error('Overleaf direct integration not implemented. Please export your LaTeX file and provide the latexFileUrl in CONFIG.');
    }

    parseLatexToHTML(latexContent) {
        // Enhanced LaTeX to HTML parser
        let html = latexContent;
        
        // Remove LaTeX document structure and packages first
        html = html.replace(/\\documentclass\{[^}]+\}/g, '');
        html = html.replace(/\\usepackage\{[^}]+\}/g, '');
        html = html.replace(/\\usepackage\[[^\]]*\]\{[^}]+\}/g, '');
        html = html.replace(/\\begin\{document\}/g, '');
        html = html.replace(/\\end\{document\}/g, '');
        html = html.replace(/\\pagestyle\{[^}]+\}/g, '');
        html = html.replace(/\\setlength\{[^}]+\}\{[^}]+\}/g, '');
        html = html.replace(/\\setlist\{[^}]+\}/g, '');
        html = html.replace(/\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}/g, '');
        html = html.replace(/\\titleformat\{[^}]+\}\{[^}]+\}\{[^}]+\}\{[^}]+\}\{[^}]+\}/g, '');
        
        // Clean up LaTeX comments
        html = html.replace(/%[^\n]*/g, '');
        
        // Convert center environment first
        html = html.replace(/\\begin\{center\}/g, '<div style="text-align: center;">');
        html = html.replace(/\\end\{center\}/g, '</div>');
        
        // Convert sections
        html = html.replace(/\\section\*\{([^}]+)\}/g, '<h2>$1</h2>');
        html = html.replace(/\\subsection\*\{([^}]+)\}/g, '<h3>$1</h3>');
        html = html.replace(/\\subsubsection\*\{([^}]+)\}/g, '<h4>$1</h4>');
        
        // Convert text formatting
        html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
        html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
        html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
        
        // Convert font sizes
        html = html.replace(/\\LARGE\s*([^\n]+)/g, '<h1>$1</h1>');
        html = html.replace(/\\Large\s*([^\n]+)/g, '<h2>$1</h2>');
        html = html.replace(/\\large\s*([^\n]+)/g, '<h3>$1</h3>');
        
        // Convert href links
        html = html.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1">$2</a>');
        
        // Convert vspace
        html = html.replace(/\\vspace\{[^}]+\}/g, '<br>');
        
        // Convert itemize lists
        html = html.replace(/\\begin\{itemize\}/g, '<ul>');
        html = html.replace(/\\end\{itemize\}/g, '</ul>');
        html = html.replace(/\\item\s*([^\n]*)/g, '<li>$1</li>');
        
        // Convert enumerate lists
        html = html.replace(/\\begin\{enumerate\}/g, '<ol>');
        html = html.replace(/\\end\{enumerate\}/g, '</ol>');
        
        // Convert line breaks
        html = html.replace(/\\\\/g, '<br>');
        
        // Split into lines and process each line
        let lines = html.split('\n');
        let processedLines = [];
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') {
                if (!inList) {
                    processedLines.push('<br>');
                }
                continue;
            }
            
            // Handle list items
            if (line.startsWith('<li>') || line.startsWith('<ul>') || line.startsWith('</ul>') || 
                line.startsWith('<ol>') || line.startsWith('</ol>')) {
                inList = true;
                processedLines.push(line);
                if (line.startsWith('</ul>') || line.startsWith('</ol>')) {
                    inList = false;
                }
                continue;
            }
            
            // Handle headings
            if (line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<h3>') || 
                line.startsWith('<h4>') || line.startsWith('<div')) {
                inList = false;
                processedLines.push(line);
                continue;
            }
            
            // Regular text lines
            if (!inList && line.length > 0) {
                processedLines.push('<p>' + line + '</p>');
            } else if (inList) {
                processedLines.push(line);
            }
        }
        
        html = processedLines.join('\n');
        
        // Clean up empty paragraphs and fix formatting
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>\s*<h/g, '<h');
        html = html.replace(/<\/h([1-6])>\s*<\/p>/g, '</h$1>');
        html = html.replace(/<p>\s*<ul>/g, '<ul>');
        html = html.replace(/<\/ul>\s*<\/p>/g, '</ul>');
        html = html.replace(/<p>\s*<ol>/g, '<ol>');
        html = html.replace(/<\/ol>\s*<\/p>/g, '</ol>');
        html = html.replace(/<p>\s*<div/g, '<div');
        html = html.replace(/<\/div>\s*<\/p>/g, '</div>');
        
        return html;
    }

    renderCV(content) {
        this.cvContainer.innerHTML = `
            <div class="cv-content">
                ${content}
            </div>
        `;
        
        // Re-render MathJax if present
        if (window.MathJax) {
            MathJax.typesetPromise([this.cvContainer]);
        }
    }

    showLoading() {
        this.loadingElement.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }

    showError(message) {
        this.cvContainer.innerHTML = `
            <div class="error">
                <h3>Error Loading CV</h3>
                <p>${message}</p>
                <p>Please check the configuration in script.js and ensure your LaTeX file is accessible.</p>
            </div>
        `;
    }

    updateLastUpdatedTime() {
        const now = new Date();
        this.lastUpdatedElement.textContent = now.toLocaleString();
    }
}

// Initialize the CV loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CVLoader();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

