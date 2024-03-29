const URL_BACKEND = 'https://join.christof-mark.com/smallest_backend_ever';
const URL_MAIL = 'https://join.christof-mark.com/send_mail.php';
const HEADER_CTX_MENU_ANIM_TIME = 220;
let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ü'];

setURL(URL_BACKEND);

/**
 * Initiates the main page
 */
async function init() {
    await includeHTML();
    await loadDataFromServer();
    loadCurrentUser()
    hasTouch();
    setHeaderUserBadge();
    handleWelcomeOnMobile();
    controlMenuHighlighting();
}


/**
 * Loads all data from the server
 */
async function loadDataFromServer(login) {
    await downloadFromServer();
    users = await loadFromServer('users');
    if (login) return; // To handle login only user data is required
    tasks = await loadFromServer('tasks');
    categories = await loadFromServer('categories');
}


/**
 * Loads the data of the logged-in user
 */
function loadCurrentUser() {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || guestUser;
}


/**
 * Saves the current user in localStorage
 */
function saveCurrentUser() {
    userAsString = JSON.stringify(currentUser);
    localStorage.setItem('currentUser', userAsString);
}


/**
 * Loads the requested data from server
 * @param {string} key 
 * @returns Data from server as Array
 */
async function loadFromServer(key) {
    let item = [];
    item = JSON.parse(backend.getItem(key)) || [];
    return Array.from(item);
}


/**
 * Saves the data to the server
 * @param {String} key 
 * @param {Array} item 
 */
async function saveOnServer(key, item) {
    itemAsString = JSON.stringify(item);
    await backend.setItem(key, itemAsString);
}


/**
 * Checks if "Remember me" is set
 * @returns Boolean
 */
function readRememberMe() {
    const remMe = JSON.parse(localStorage.getItem('rememberMe')) || false;
    return remMe;
}


/**
 * Controls the welcome screen on mobile view
 */
function handleWelcomeOnMobile() {
    let welcome;
    let isLogin = new URLSearchParams(window.location.search);
    if (!isLogin.get('login')) {
        try {
            welcome = document.getElementById('welcome-mobile');
            welcome.classList.add('d-none');
        } catch {/* Nothing to be done */}
        return;
    }

    const windowWidth = window.innerWidth;
    const delay = WELCOME_MSG_TRANS + WELCOME_MSG_DELAY + 10;
    welcome = document.getElementById('welcome-mobile');

    if (windowWidth <= MOBILE_MAX_WIDTH && isLogin.get('login')) {
        setTimeout(() => {
            welcome.classList.add('welcome-mobile-fade');
        }, 1);
        setTimeout(() => {
            welcome.classList.add('d-none');
        }, delay);
    }
    else {
        welcome.classList.add('d-none');
    }
}


/**
 * Reads the page name and converts it to a container ID
 * @returns String
 */
function getPageName() {
    let path = window.location.pathname;
    path = path.split('/').pop();
    path = path.split('.').shift();
    path = 'menu-' + path;

    return path;
}


/**
 * Highlightes the menu item for the current page
 */
function controlMenuHighlighting() {
    const path = getPageName();

    if (path != 'menu-help') {
        let menuToActivate = document.getElementById(path);
        menuToActivate.classList.add('nav-item-active');
    }
}


/**
 * Toggles the visibility of the context menu
 * @param {String} ctxMenuId The ID of the context menu
 */
function toggleContextMenu(ctxMenuId) {
    const ctxMenu = document.getElementById(ctxMenuId);

    if (ctxMenu.classList.contains('d-none')) {
        if (ctxMenu.id != 'context-sub--move') toggleCloseOnClickOutsideLayer(ctxMenuId, true);
        showCtxMenu(ctxMenu);
    }
    else {
        toggleCloseOnClickOutsideLayer(ctxMenuId, false);
        hideCtxMenu(ctxMenu);
    }
}


/**
 * Shows the context menu
 * @param {Object} ctxMenu The context menu
 */
function showCtxMenu(ctxMenu) {
    ctxMenu.classList.remove('d-none');
    setTimeout(() => {
        ctxMenu.classList.add('context--show');
    }, 1);
}


/**
 * Hides the context menu
 * @param {Object} ctxMenu The context menu
 */
function hideCtxMenu(ctxMenu) {
    ctxMenu.classList.remove('context--show');
    setTimeout(() => {
        ctxMenu.classList.add('d-none');
    }, HEADER_CTX_MENU_ANIM_TIME);
}


/**
 * Toggles the close-on-click-outside layer
 * @param {String} ctxMenuId The ID of the context menu
 * @param {Boolean} display Sets whether the close-on-click-outside layer should be displayed or hidden
 */
function toggleCloseOnClickOutsideLayer(ctxMenuId, display) {
    const closeOnClickOutsideHeader = document.getElementById('close-on-click-outside--header');
    const closeOnClickOutsideMain = document.getElementById('close-on-click-outside--main');
    if (display) {
        if (ctxMenuId == 'context-menu-task') {
            closeOnClickOutsideHeader.setAttribute('onclick', `controlVisTaskCtx()`);
            closeOnClickOutsideMain.setAttribute('onclick', `controlVisTaskCtx()`);
        }
        else {
            closeOnClickOutsideHeader.setAttribute('onclick', `toggleContextMenu('${ctxMenuId}')`);
            closeOnClickOutsideMain.setAttribute('onclick', `toggleContextMenu('${ctxMenuId}')`);
        }
        closeOnClickOutsideHeader.classList.remove('d-none');
        closeOnClickOutsideMain.classList.remove('d-none');
    }
    else {
        closeOnClickOutsideHeader.classList.add('d-none');
        closeOnClickOutsideMain.classList.add('d-none');
    }
}


/**
 * Logout and reset currentUser (if "Remember me" is not requested)
 */
async function logout() {
    if (!readRememberMe()) {
        currentUser = {};
        saveCurrentUser();
    }
    window.location.href = './index.html';
}


/**
 * Sets the user badge in the header
 */
function setHeaderUserBadge() {
    const img = document.getElementById('header-img-user');
    const badge = document.getElementById('header-badge-user');
    if (currentUser['name'] == 'Guest') {
        img.classList.remove('d-none');
        badge.classList.add('d-none');
    }
    else {
        badge.innerHTML = currentUser['short_name'];
        badge.style.backgroundColor = currentUser['color'];
        badge.classList.remove('d-none');
        img.classList.add('d-none');
    }
}


/**
 * Removes all :hover stylesheets for use on mobile device
 * @returns 
 */
function hasTouch() {
    return 'ontouchstart' in document.documentElement
        || navigator.maxTouchPoints > 0
        || navigator.msMaxTouchPoints > 0;
}

if (hasTouch()) { // remove all the :hover stylesheets
    try { // prevent exception on browsers not supporting DOM styleSheets properly
        for (let si in document.styleSheets) {
            const styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover')) {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    } catch (ex) { }
}


/**
 * Validating that full name is given
 * @param {Object} username The input field for the user name
 * @param {String} msgElemId The ID of the HTML message element
 * @param {String} className The CSS class name to be used
 * @returns Boolean
 */
function nameValidation(username, msgElemId, className) {
    let usernameString = username.value.trim();
    if (!usernameString.includes(' ') || !hasLettersAtFirstPos(usernameString)) {
        document.getElementById(msgElemId).classList.remove(className);
        return false;
    }
    else {
        document.getElementById(msgElemId).classList.add(className);
        return true;
    }
}


/**
 * Checks if all parts of the user name start with a letter
 * @param {String} username The full user name
 * @returns Boolean
 */
function hasLettersAtFirstPos(username) {
    const fullName = username.split(' ');

    for (let n = 0; n < fullName.length; n++) {
        let letterId = alphabet.indexOf(fullName[n][0].toUpperCase());
        if (letterId < 0) return false;
    }
    return true;
}


/**
 * Create initials from first letters of ssername
 * @param {String} name The full name of the user
 * @returns String
 */
function getInitials(name) {
    const fullName = name.split(' ');
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
    return initials.toUpperCase();
}


/**
 * Generate random color for User initials background
 * @returns HSL color as String
 */
function generateColors() {
    let h = Math.floor(Math.random() * 359);
    return color = `hsl(${h}, 100%, 50%)`;
}


/**
 * Getting the first letter of the last name
 * @param {number} id Index of the user
 * @returns Letter of the last name 
 */
function getFirstLetterOfLastName(id) {
    let user = users[id]['name'];
    let names = user.split(' ');
    let surname = names[names.length - 1];

    return surname[0].toUpperCase();
}


/**
 * Displays a request popup
 * @param {String} id The ID of the request popup
 */
function requestDelete(id) {
    let popup = document.getElementById(id);
    popup.classList.add('animation');
}


/**
 * Hides a request popup
 * @param {String} id The ID of the request popup
 */
function cancelDelete(id) {
    let popup = document.getElementById(id);
    popup.classList.remove('animation');
}


/**
 * Escapes special characters in a string
 * @param {String} string The string to be treated
 * @returns String
 */
function escapeHtml(string) {
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
 }