// ============================================
// 1. FUNCIÓN DEL MENÚ LATERAL (sin cambios)
// ============================================
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

// ============================================
// 2. DETECCIÓN DE ENTORNO (GitHub Pages o local)
// ============================================
function getBasePath() {
    // Detectar si estamos en GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        // Obtener el nombre del repositorio desde la URL
        const pathParts = window.location.pathname.split('/');
        // Si hay más de 2 partes (ej: /usuario/repositorio/pagina)
        if (pathParts.length > 2) {
            return '/' + pathParts[1]; // Retorna '/repositorio'
        }
    }
    return ''; // Localhost o dominio propio
}

const BASE_PATH = getBasePath();
//console.log('Base Path:', BASE_PATH || 'Raíz del dominio');

// ============================================
// 3. CARGA DE PÁGINAS (con rutas relativas)
// ============================================
async function getPage(name) {
    try {
        // ✅ IMPORTANTE: Usar rutas relativas o con base path
        const url = name.startsWith('/') ? name : '/' + name;
        const fullUrl = BASE_PATH + url;
        
        //console.log('Cargando:', fullUrl);
        const respuesta = await fetch(fullUrl);
        
        if (!respuesta.ok) throw new Error('No se pudo cargar el archivo');
        return await respuesta.text();
    } catch (error) {
        //console.error('Error:', error);
        return `<h1>404</h1><p>No se pudo cargar la página: ${name}</p>`;
    }
}

// ============================================
// 4. DEFINICIÓN DE RUTAS (CORREGIDO)
// ============================================
// ✅ Las rutas deben coincidir con los archivos HTML reales
const routes = [
    { 
        path: '/', 
        render: () => getPage('pages/main.html') 
    },
    { 
        path: '/nosotros', 
        render: () => getPage('pages/nosotros.html') 
    },
    { 
        path: '/carta', 
        render: () => getPage('pages/carta.html') 
    },
    // ✅ Ruta para GitHub Pages (cuando entran directamente)
    { 
        path: '/index.html', 
        render: () => getPage('pages/main.html') 
    },
    // ✅ Ruta para páginas con extensión .html (enlaces directos)
    { 
        path: '/nosotros.html', 
        render: () => getPage('pages/nosotros.html') 
    },
    { 
        path: '/carta.html', 
        render: () => getPage('pages/carta.html') 
    },
];

const notFound = () => `<h1>404</h1><p>Esa ruta no existe.</p>`;
const app = document.getElementById('app');

// ============================================
// 5. MATCHER DE RUTAS (mejorado)
// ============================================
function matchRoute(path) {
    // ✅ Limpiar la ruta: eliminar base path si existe
    let cleanPath = path;
    if (BASE_PATH && path.startsWith(BASE_PATH)) {
        cleanPath = path.substring(BASE_PATH.length) || '/';
    }
    
    // ✅ Si la ruta termina en .html, intentar buscar sin la extensión
    let routePath = cleanPath;
    if (routePath.endsWith('.html')) {
        routePath = routePath.slice(0, -5);
        // Si después de quitar .html queda vacío, es la raíz
        if (routePath === '') routePath = '/';
    }
    
    //console.log('Buscando ruta para:', routePath);
    
    for (const route of routes) {
        const paramNames = [];
        const pattern = route.path.replace(/:([^/]+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        const match = routePath.match(new RegExp(`^${pattern}$`));
        if (match) {
            const params = {};
            paramNames.forEach((name, i) => (params[name] = match[i + 1]));
            return { route, params };
        }
    }
    return null;
}

// ============================================
// 6. RENDERIZADO
// ============================================
async function render() {
    let path = location.pathname;
    
    // ✅ Si estamos en GitHub Pages y la ruta es solo el repositorio
    if (BASE_PATH && path === BASE_PATH) {
        path = '/';
    }
    
    const result = matchRoute(path);
    
    if (result) {
        try {
            app.innerHTML = await result.route.render(result.params);
        } catch (error) {
            app.innerHTML = notFound();
        }
    } else {
        app.innerHTML = notFound();
    }

    // ✅ Actualizar clase activa en los enlaces
    document.querySelectorAll('nav a[data-route]').forEach(link => {
        const linkPath = link.getAttribute('href');
        console.log(">>",linkPath, path)
        const isActive = (path === '/' && linkPath === '/') || 
                          (path != '/' && linkPath != '/' && path.includes(linkPath)) ||
                          (path.endsWith('.html') && linkPath === path.replace('.html', ''));
        link.classList.toggle('border-sky-700', isActive);
    });
}

// ============================================
// 7. NAVEGACIÓN (CORREGIDO)
// ============================================
function navigate(path) {
    // ✅ Si hay base path, agregarlo
    const fullPath = BASE_PATH + path;
    //console.log('Navegando a:', fullPath);
    history.pushState(null, '', fullPath);
    render();
}

// ============================================
// 8. MANEJO DE ENLACES
// ============================================
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-route]');
    if (!link) return;
    
    e.preventDefault();
    let href = link.getAttribute('href');
    
    // ✅ Si el enlace tiene .html al final, navegar sin él
    if (href.endsWith('.html')) {
        href = href.slice(0, -5);
    }
    
    navigate(href);
});

// ============================================
// 9. MANEJO DE POPSTATE (botón atrás/adelante)
// ============================================
window.addEventListener('popstate', render);

// ============================================
// 10. INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar menú lateral
    sideMenu("sideMenuOpenBtn", "sideMenuCloseBtn", "sideMenuContainer", "sideMenuOverlay", "right");
    
    // ✅ Renderizar la página inicial
    render();
    
    //console.log('🚀 SPA Iniciada con Base Path:', BASE_PATH || 'Raíz');
    //console.log('📄 Rutas disponibles:', routes.map(r => r.path));
});