// Visual Element Editor - Mover elementos con mouse y ver cambios en tiempo real
(function() {
    let isEditMode = false;
    let selectedElement = null;
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;
    let originalTransform = '';
    let infoPanel = null;

    // Crear panel de información
    function createInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'visual-editor-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 350px;
            max-height: 300px;
            overflow-y: auto;
            border: 2px solid #00ff00;
            display: none;
        `;
        document.body.appendChild(panel);
        return panel;
    }

    // Crear botón toggle
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'visual-editor-toggle';
        button.textContent = '✏️ Editar Elementos';
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

    function toggleEditMode() {
        isEditMode = !isEditMode;
        const button = document.getElementById('visual-editor-toggle');
        const panel = document.getElementById('visual-editor-panel');
        
        if (isEditMode) {
            button.textContent = '✏️ Editar (ON)';
            button.style.background = '#00aa00';
            panel.style.display = 'block';
            panel.innerHTML = '<strong>MODO EDICIÓN ACTIVO</strong><br><br>Instrucciones:<br>1. Haz clic en cualquier elemento<br>2. Arrastra con el mouse<br>3. Suelta para soltar<br>4. Los valores se mostrarán aquí';
            document.addEventListener('click', selectElement, true);
            document.addEventListener('mousemove', dragElement);
            document.addEventListener('mouseup', stopDrag);
        } else {
            button.textContent = '✏️ Editar Elementos';
            button.style.background = '#ff6b00';
            panel.style.display = 'none';
            document.removeEventListener('click', selectElement, true);
            document.removeEventListener('mousemove', dragElement);
            document.removeEventListener('mouseup', stopDrag);
            if (selectedElement) {
                selectedElement.style.outline = '';
                selectedElement = null;
            }
        }
    }

    function selectElement(e) {
        if (!isEditMode) return;
        
        // No seleccionar elementos del editor
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
        
        draggedElement = selectedElement;
        originalTransform = selectedElement.style.transform || '';
        
        offsetX = e.clientX - selectedElement.getBoundingClientRect().left;
        offsetY = e.clientY - selectedElement.getBoundingClientRect().top;

        updateInfoPanel();
    }

    function dragElement(e) {
        if (!draggedElement || !isEditMode) return;

        const rect = draggedElement.parentElement.getBoundingClientRect();
        const newX = e.clientX - rect.left - offsetX;
        const newY = e.clientY - rect.top - offsetY;

        draggedElement.style.position = 'relative';
        draggedElement.style.left = newX + 'px';
        draggedElement.style.top = newY + 'px';

        updateInfoPanel();
    }

    function stopDrag() {
        if (draggedElement && isEditMode) {
            updateInfoPanel();
        }
    }

    function updateInfoPanel() {
        if (!selectedElement) return;

        const panel = document.getElementById('visual-editor-panel');
        const styles = window.getComputedStyle(selectedElement);
        const tag = selectedElement.tagName.toLowerCase();
        const id = selectedElement.id ? `#${selectedElement.id}` : '';
        const classes = selectedElement.className ? `.${selectedElement.className.split(' ').join('.')}` : '';
        
        let html = `<strong>${tag}${id}${classes}</strong><br><br>`;
        html += `<strong>Posición:</strong><br>`;
        html += `left: ${selectedElement.style.left || '0'}<br>`;
        html += `top: ${selectedElement.style.top || '0'}<br>`;
        html += `<br><strong>CSS Aplicado:</strong><br>`;
        html += `transform: ${selectedElement.style.transform || 'none'}<br>`;
        html += `position: ${selectedElement.style.position || 'static'}<br>`;
        html += `margin-top: ${selectedElement.style.marginTop || 'auto'}<br>`;
        html += `<br><strong>📋 CSS para copiar:</strong><br>`;
        
        if (selectedElement.style.left && selectedElement.style.left !== '0px') {
            html += `left: ${selectedElement.style.left};<br>`;
        }
        if (selectedElement.style.top && selectedElement.style.top !== '0px') {
            html += `top: ${selectedElement.style.top};<br>`;
        }
        
        panel.innerHTML = html;
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createInfoPanel();
            createToggleButton();
        });
    } else {
        createInfoPanel();
        createToggleButton();
    }

    console.log('✅ Visual Editor cargado. Busca el botón ✏️ en la esquina superior derecha');
})();
