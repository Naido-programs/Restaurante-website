function sideMenu(openBtnID, closeBtnID, menuContainerID, overlayID, side) {
    let openBtn = document.getElementById(openBtnID)
    let closeBtn = document.getElementById(closeBtnID)
    let overlay = document.getElementById(overlayID)
    let menuContainer = document.getElementById(menuContainerID)

    openBtn.addEventListener("click", (e) => {
        overlay.classList.replace("opacity-0", "opacity-100")
        menuContainer.classList.add("flex")
        menuContainer.classList.remove("hidden")
        setTimeout(() => {
            if (side == "right") {
                menuContainer.classList.replace("translate-x-full", "translate-x-0")
            }
            else {
                menuContainer.classList.replace("-translate-x-full", "translate-x-0")
            }
            document.body.classList.add("overflow-hidden")
        }, 100)
    })

    closeBtn.addEventListener("click", (e) => {
        if (side == "right") {
            menuContainer.classList.replace("translate-x-0", "translate-x-full")
        }
        else {
            menuContainer.classList.add("translate-x-0", "-translate-x-full")
        }
        overlay.classList.replace("opacity-100", "opacity-0")
        document.body.classList.remove("overflow-hidden")
        setTimeout(() => {
            menuContainer.classList.add("hidden")
        }, 400)

    })
}
//   SPA

async function getPage(name) {
  try {
    const respuesta = await fetch(name);
    if (!respuesta.ok) throw new Error('No se pudo cargar el archivo');
    
    const contenido = await respuesta.text();
    //console.log(contenido);

    return contenido
  } catch (error) {
    console.error('Error:', error);
  }
}

// 1. Definimos rutas. Las dinámicas usan ":param" como placeholder.
const routes = [
    {path: '/', render: () => {return getPage("../pages/main.html")}},
    {path: '/Nosotros', render: () => {return getPage("../pages/about.html")}},
    {path: '/Carta', render: () => {return getPage("../pages/menu.html")}},
];

const notFound = () => `<h1>404</h1><p>Esa ruta no existe.</p>`;
const app = document.getElementById('app');

// 2. Matcher: compara la ruta actual contra el patrón de cada ruta definida
function matchRoute(path) {
    for (const route of routes) {
        const paramNames = [];
        const pattern = route.path.replace(/:([^/]+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        const match = path.match(new RegExp(`^${pattern}$`));
        if (match) {
            const params = {};
            paramNames.forEach((name, i) => (params[name] = match[i + 1]));
            return { route, params };
        }
    }
    return null;
}

async function render() {
    const path = location.pathname;
    const result = matchRoute(path);
    app.innerHTML = result ? await result.route.render(result.params) : notFound();

    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('border-sky-700', link.dataset.route === path);
    });
}

// 3. Navegación programática: cambia la URL sin recargar
function navigate(path) {
    history.pushState(null, '', path);
    render();
}

// 4. Interceptamos los clicks en los <a> internos
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-route]');
    if (!link) return;
    e.preventDefault();
    navigate(link.getAttribute('href'));
});

// 5. El botón "atrás/adelante" del navegador dispara "popstate"
window.addEventListener('popstate', render);
window.addEventListener('DOMContentLoaded', render);



document.addEventListener("DOMContentLoaded", () => {
    sideMenu("sideMenuOpenBtn", "sideMenuCloseBtn", "sideMenuContainer", "sideMenuOverlay", "right")
    render()
    console.log(routes)
})