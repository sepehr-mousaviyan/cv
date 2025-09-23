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
        // Aggressive LaTeX to HTML parser - removes ALL LaTeX syntax
        let html = latexContent;
        
        // Remove ALL LaTeX commands and environments
        html = html.replace(/\\[a-zA-Z]+\{[^}]*\}/g, ''); // Remove \command{content}
        html = html.replace(/\\[a-zA-Z]+\[[^\]]*\]\{[^}]*\}/g, ''); // Remove \command[options]{content}
        html = html.replace(/\\[a-zA-Z]+/g, ''); // Remove remaining \commands
        html = html.replace(/\\begin\{[^}]+\}/g, ''); // Remove \begin{environment}
        html = html.replace(/\\end\{[^}]+\}/g, ''); // Remove \end{environment}
        html = html.replace(/\\[^a-zA-Z]/g, ''); // Remove remaining \symbols
        
        // Clean up LaTeX comments
        html = html.replace(/%[^\n]*/g, '');
        
        // Remove extra whitespace and empty lines
        html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
        html = html.replace(/^\s+|\s+$/gm, '');
        
        // Split into lines and process
        let lines = html.split('\n');
        let processedLines = [];
        let currentSection = '';
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
            
            // Skip lines that are just LaTeX remnants
            if (line.match(/^[\\{}[\]]+$/) || line.match(/^[0-9\s\-\.]+$/)) {
                continue;
            }
            
            // Detect section headers (lines that are all caps or title case)
            if (line.match(/^[A-Z][A-Z\s]+$/) || 
                line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+$/) ||
                line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+$/)) {
                
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                
                // Clean up section name
                let sectionName = line.replace(/[{}[\]]/g, '').trim();
                processedLines.push(`<h2>${sectionName}</h2>`);
                currentSection = sectionName;
                continue;
            }
            
            // Detect subsection headers (lines with specific patterns)
            if (line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+$/) && 
                (line.includes('Skills') || line.includes('Tools') || line.includes('Experience'))) {
                
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                
                let subsectionName = line.replace(/[{}[\]]/g, '').trim();
                processedLines.push(`<h3>${subsectionName}</h3>`);
                continue;
            }
            
            // Handle list items (lines starting with bullet points or dashes)
            if (line.match(/^[•\-\*]\s/) || line.match(/^[A-Z][a-z]+.*\d{4}/)) {
                if (!inList) {
                    processedLines.push('<ul>');
                    inList = true;
                }
                
                // Clean up list item
                let item = line.replace(/^[•\-\*]\s*/, '').replace(/[{}[\]]/g, '').trim();
                if (item.length > 0) {
                    processedLines.push(`<li>${item}</li>`);
                }
                continue;
            }
            
            // Handle regular paragraphs
            if (!inList && line.length > 0) {
                // Clean up the line
                let cleanLine = line.replace(/[{}[\]]/g, '').trim();
                
                // Skip lines that are just numbers or dates
                if (cleanLine.match(/^\d{4}/) || cleanLine.match(/^[A-Z][a-z]+\s+\d{4}/)) {
                    continue;
                }
                
                if (cleanLine.length > 0) {
                    processedLines.push(`<p>${cleanLine}</p>`);
                }
            }
        }
        
        // Close any open list
        if (inList) {
            processedLines.push('</ul>');
        }
        
        html = processedLines.join('\n');
        
        // Final cleanup
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<br>\s*<br>\s*<br>/g, '<br><br>');
        
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

