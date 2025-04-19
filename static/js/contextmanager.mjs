import { history, memory } from "./history.mjs";

/**
 * Memory-safe removal of a result element
 * @param {string} id - The ID of the element to remove
 * @param {HTMLElement} container - Parent container holding the results
 * @param {Event} _
 * @param {import("./history.mjs").CalcHistory} context  
 */
function removeResult(id, container, _, context) {
  const element = container.querySelector(`[data-id="${id}"]`);
  if (element) {
    history.remove(id)
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
 * @param {Event} _
 * @param {import("./history.mjs").CalcHistory} __  
 */
function copyResult(id, container, _, __) {
  const element = container.querySelector(`[data-id="${id}"]`);
  if (!element) return;

  const textToCopy = element.querySelector(`[data-id="${id}/stdin"]`).textContent

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
 * Save the result to Memory tab
 * @param {string} id - The ID of the element to copy
 * @param {HTMLElement} container - Parent container holding the results
 * @param {Event} _
 * @param {import("./history.mjs").CalcHistory} context  
 */
function SaveToMemory(id, container, _, context) {
  const element = container.querySelector(`[data-id="${id}"]`)
  const memo_id = context.id
  if (!element) return;

  const entry = history.getItem(memo_id)
  console.log(memo_id, entry)
  if (entry)
    memory.push(entry)
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
  exprP.dataset.id = `${x.id}/stdin`
  exprP.className = 'text-align-end';
  exprP.textContent = x.stdin;

  const resultP = document.createElement('p');
  resultP.dataset.id = `${x.id}/stdout`
  resultP.className = 'text-align-end';
  resultP.textContent = `=> ${x.result}`;

  div.append(exprP, resultP);
  setupContextMenu(div, createContextMenu, initContextMenu, x); // Add right-click functionality

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
 * Creates a context menu 
 * @param {() => void} closer
 * @param {Object.<string, any>} context
 * @returns {HTMLElement} The context menu div
 */
function createContextMenu(closer, context) {
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  const copyBtn = createMenuButton('Copy', 'menu-btn copy-btn', 'gbl-copy-menu', copyResult, closer, menu, context);
  const deleteBtn = createMenuButton('Delete', 'menu-btn delete-btn', 'gbl-delete-menu', removeResult, closer, menu, context)
  const SaveBtn = createMenuButton("Save to Memory", 'menu-btn', 'gbl-save-menu', SaveToMemory, closer, menu, context)

  menu.append(copyBtn, deleteBtn, SaveBtn);
  return menu;
}

/**
 * 
 * @param {HTMLElement} base 
 * @param {Array.<{content: string, classes: string, id: string, fn: (id: string, container: HTMLElement) => void}>} schema 
 * @param {string} menu_id 
 */
function createContextMenuBySchema(base, schema, menu_id) {
  base.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.dataset.id = menu_id

    // Check if there's menu instance
    if (document.querySelector(`.context-menu[data-id="${menu_id}"]`)) return;


    document.body.appendChild(menu)
    const closeMenu = () => {
      menu.style.display = 'none';
      document.removeEventListener('click', closeMenu);
      menu.remove()
    };

    menu.style.display = 'block';
    menu.style.position = 'absolute'
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    schema.forEach(element => {
      menu.append(createMenuButton(element.content, element.classes, element.id, element.fn, closeMenu, menu))
    });

    document.addEventListener('click', closeMenu)
  })
}

/**
 * Create a context-menu button
 * @param {string} content 
 * @param {string} classes 
 * @param {string} id 
 * @param {(id: string, container: HTMLElement, event: Event, context: Object.<string, any>) => void} fn
 * @param {(menu: HTMLElement) => void} closer
 * @param {HTMLElement} menu
 * @param {Object.<string, any>} context 
 */
function createMenuButton(content, classes, id, fn, closer, menu, context) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = content
  btn.className = classes
  btn.dataset.id = id

  btn.onclick = (event) => {
    fn && fn(id, menu, event, context)
    closer && closer(menu)
  }

  return btn
}

/**
 * 
 * @param {HTMLElement} menu 
 * @param {string} id
 * @param {HTMLElement} container
 * @param {() => void} closer
 */
function initContextMenu(menu, id, container, closer) {
  // Update button actions
  menu.querySelector('.copy-btn').onclick = () => {
    copyResult(id, container);
    closer();
  };

  menu.querySelector('.delete-btn').onclick = () => {
    removeResult(id, container);
    closer();
  };
}

/**
 * Sets up right-click context menu for an element
 * @param {HTMLElement} element - The element to attach the menu to
 * @param {Object.<string, any>} context 
 */
function setupContextMenu(element, seeder = createContextMenu, initializer = initContextMenu, context) {
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const id = element.dataset.id;
    const container = element.parentElement;

    let menu = document.querySelector('.context-menu');

    const closeMenu = () => {
      menu.style.display = 'none';
      document.removeEventListener('click', closeMenu);
    };

    if (!menu) {
      menu = seeder(closeMenu, context);
      document.body.appendChild(menu);
    }

    menu.style.display = 'block';
    menu.style.position = 'absolute'
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    document.addEventListener('click', closeMenu);

    initializer(menu, id, container, closeMenu)
  });
}

export { setupContextMenu, createResultDiv, createContextMenu, removeResult, copyResult, createContextMenuBySchema }