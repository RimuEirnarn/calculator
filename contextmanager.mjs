/**
 * Memory-safe removal of a result element
 * @param {string} id - The ID of the element to remove
 * @param {HTMLElement} container - Parent container holding the results
 */
function removeResult(id, container) {
  const element = container.querySelector(`[data-id="${id}"]`);
  if (element) {
    // Clean up event listeners first
    const clone = element.cloneNode(true);
    element.replaceWith(clone);

    // Then remove from DOM
    // clone.remove();

    // Optional: Add animation for visual feedback
    clone.classList.add('fade-out');
    setTimeout(() => clone.remove(), 800);
  }
}

/**
 * Copies the result content to clipboard
 * @param {string} id - The ID of the element to copy
 * @param {HTMLElement} container - Parent container holding the results
 */
function copyResult(id, container) {
  const element = container.querySelector(`[data-id="${id}"]`);
  if (!element) return;

  const textToCopy = Array.from(element.querySelectorAll('p'))
    .map(p => p.textContent)
    .join('\n');

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Visual feedback
      const feedback = document.createElement('span');
      feedback.textContent = 'Copied!';
      feedback.className = 'copy-feedback';
      element.appendChild(feedback);

      setTimeout(() => feedback.remove(), 2000);
    })
    .catch(err => console.error('Failed to copy:', err));
}


/**
 * Creates a result div element with the given data
 * @param {import("./history.mjs").CalcHistory} x - Data object with id, expr, and result
 * @param {(event: Event) => void} onclick 
 * @returns {HTMLElement} The created div element
 */
function createResultDiv(x, onclick) {
  const div = document.createElement('div');
  div.dataset.id = x.id;
  div.className = 'result-container'; // Add class for styling

  const exprP = document.createElement('p');
  exprP.className = 'text-align-end';
  exprP.textContent = x.stdin;

  const resultP = document.createElement('p');
  resultP.className = 'text-align-end';
  resultP.textContent = `=> ${x.result}`;

  div.append(exprP, resultP);
  setupContextMenu(div); // Add right-click functionality

  // Click handler for replace functionality
  div.addEventListener('click', (e) => {
    // Ignore if click originated from context menu buttons
    if (e.target.closest('.context-menu')) return;

    // Visual feedback
    div.classList.add('replace-pulse');
    setTimeout(() => div.classList.remove('replace-pulse'), 800);

    // Execute replace callback
    onclick()
  });
  return div;
}

/**
 * Creates a context menu element
 * @returns {HTMLElement} The context menu div
 */
function createContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.textContent = 'Copy';
  copyBtn.className = 'menu-btn copy-btn';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'menu-btn delete-btn';

  menu.append(copyBtn, deleteBtn);
  return menu;
}

/**
 * Sets up right-click context menu for an element
 * @param {HTMLElement} element - The element to attach the menu to
 */
function setupContextMenu(element) {
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const id = element.dataset.id;
    const container = element.parentElement;

    let menu = document.querySelector('.context-menu');
    if (!menu) {
      menu = createContextMenu();
      document.body.appendChild(menu);
    }

    menu.style.display = 'block';
    menu.style.position = 'absolute'
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const closeMenu = () => {
      menu.style.display = 'none';
      document.removeEventListener('click', closeMenu);
    };

    document.addEventListener('click', closeMenu);

    // Update button actions
    menu.querySelector('.copy-btn').onclick = () => {
      copyResult(id, container);
      closeMenu();
    };

    menu.querySelector('.delete-btn').onclick = () => {
      removeResult(id, container);
      closeMenu();
    };
  });
}

export { setupContextMenu, createResultDiv, createContextMenu, removeResult, copyResult }