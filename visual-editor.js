// Visual CSS Editor - Edita propiedades CSS directamente
(function() {
    let isEditMode = false;
    let selectedElement = null;
    let infoPanel = null;
    const cssProperties = ['top', 'left', 'margin-top', 'margin-bottom', 'transform', 'height', 'min-height'];

    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'visual-editor-toggle';
        button.textContent = '✏️ CSS Editor';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 15px;
            background: #ff6b00;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            z-index: 9998;
            font-size: 14px;
        `;
        
        button.addEventListener('click', toggleEditMode);
        button.addEventListener('mouseover', function() {
            this.style.background = '#ff8c00';
        });
        button.addEventListener('mouseout', function() {
            this.style.background = isEditMode ? '#00aa00' : '#ff6b00';
        });
        
        document.body.appendChild(button);
        return button;
    }

    function createInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'visual-editor-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
            border: 2px solid #00ff00;
            display: none;
        `;
        document.body.appendChild(panel);
        return panel;
    }

    function toggleEditMode() {
        isEditMode = !isEditMode;
        const button = document.getElementById('visual-editor-toggle');
        const panel = document.getElementById('visual-editor-panel');
        
        if (isEditMode) {
            button.textContent = '✏️ CSS (ON)';
            button.style.background = '#00aa00';
            panel.style.display = 'block';
            panel.innerHTML = '<strong>EDITOR CSS ACTIVO</strong><br><br>Haz clic en cualquier elemento para editar sus propiedades CSS';
            document.addEventListener('click', selectElement, true);
        } else {
            button.textContent = '✏️ CSS Editor';
            button.style.background = '#ff6b00';
            panel.style.display = 'none';
            document.removeEventListener('click', selectElement, true);
            if (selectedElement) {
                selectedElement.style.outline = '';
                selectedElement = null;
            }
        }
    }

    function selectElement(e) {
        if (!isEditMode) return;
        
        if (e.target.closest('#visual-editor-toggle') || 
            e.target.closest('#visual-editor-panel')) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();

        if (selectedElement) {
            selectedElement.style.outline = '';
        }

        selectedElement = e.target;
        selectedElement.style.outline = '3px solid #ff6b00';
        updateInfoPanel();
    }

    function updateInfoPanel() {
        if (!selectedElement) return;

        const panel = document.getElementById('visual-editor-panel');
        const tag = selectedElement.tagName.toLowerCase();
        const id = selectedElement.id ? `#${selectedElement.id}` : '';
        const classes = selectedElement.className ? `.${selectedElement.className.split(' ').join('.')}` : '';
        
        let html = `<strong>${tag}${id}${classes}</strong><br><br>`;
        html += `<strong>Propiedades CSS:</strong><br><br>`;
        
        cssProperties.forEach(prop => {
            const value = selectedElement.style[prop] || '';
            const displayProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            html += `<div style="margin-bottom: 10px;">`;
            html += `<label style="display: block; margin-bottom: 3px;">${displayProp}:</label>`;
            html += `<input type="text" data-prop="${prop}" value="${value}" style="
                width: 100%;
                padding: 5px;
                background: #111;
                color: #0f0;
                border: 1px solid #0f0;
                font-family: monospace;
                font-size: 11px;
                box-sizing: border-box;
            ">`;
            html += `</div>`;
        });
        
        html += `<br><button id="copy-css" style="
            width: 100%;
            padding: 8px;
            background: #0f0;
            color: #000;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        ">📋 Copiar CSS</button>`;
        
        panel.innerHTML = html;
        
        // Agregar listeners a los inputs
        panel.querySelectorAll('input[data-prop]').forEach(input => {
            input.addEventListener('change', function() {
                const prop = this.dataset.prop;
                const value = this.value;
                if (value) {
                    selectedElement.style[prop] = value;
                } else {
                    selectedElement.style[prop] = '';
                }
                updateInfoPanel();
            });
            input.addEventListener('input', function() {
                const prop = this.dataset.prop;
                const value = this.value;
                if (value) {
                    selectedElement.style[prop] = value;
                }
            });
        });

        // Botón copiar
        const copyBtn = panel.querySelector('#copy-css');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                let cssText = '';
                cssProperties.forEach(prop => {
                    const value = selectedElement.style[prop];
                    if (value) {
                        const displayProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                        cssText += `${displayProp}: ${value};\n`;
                    }
                });
                
                if (cssText) {
                    navigator.clipboard.writeText(cssText).then(() => {
                        copyBtn.textContent = '✅ Copiado!';
                        setTimeout(() => {
                            copyBtn.textContent = '📋 Copiar CSS';
                        }, 2000);
                    });
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createToggleButton();
            createInfoPanel();
        });
    } else {
        createToggleButton();
        createInfoPanel();
    }

    console.log('✅ CSS Editor cargado. Busca el botón ✏️ en la esquina superior derecha');
})();
