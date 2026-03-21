

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'Achieves', 'Skills']
let revealObserver = null

function hideEmptySectionTitle(id) {
    const title = document.getElementById(id)
    if (!title) {
        return
    }

    if (!title.textContent.trim()) {
        title.classList.add('is-empty')
    } else {
        title.classList.remove('is-empty')
    }
}

function initRevealObserver() {
    if (!('IntersectionObserver' in window) || revealObserver) {
        return
    }

    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return
            }

            entry.target.classList.add('is-visible')
            revealObserver.unobserve(entry.target)
        })
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    })
}

function applyRevealStyle(element, index, type) {
    element.classList.add('reveal-on-scroll')

    if (type === 'title') {
        element.classList.add('reveal-title')
        element.style.setProperty('--reveal-delay', `${Math.min(index * 60, 160)}ms`)
        return
    }

    element.classList.add('reveal-content')
    element.style.setProperty('--reveal-delay', `${Math.min(index * 85, 320)}ms`)

    if (element.tagName === 'LI') {
        element.classList.add('reveal-list-item')
    }
}

function registerRevealElements(root = document) {
    const groups = [
        { selector: '.top-section .top-section-content', type: 'title' },
        { selector: 'section header', type: 'title' },
        { selector: 'section .main-body > *', type: 'content' }
    ]

    groups.forEach(({ selector, type }) => {
        root.querySelectorAll(selector).forEach((element, index) => {
            if (element.classList.contains('reveal-on-scroll')) {
                return
            }

            applyRevealStyle(element, index, type)

            if (!revealObserver) {
                element.classList.add('is-visible')
                return
            }

            revealObserver.observe(element)
        })
    })
}

window.addEventListener('DOMContentLoaded', event => {
    initRevealObserver()
    registerRevealElements()

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
            hideEmptySectionTitle('home-subtitle')
            hideEmptySectionTitle('Achieves-subtitle')
            hideEmptySectionTitle('Skills-subtitle')
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach(name => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const mountPoint = document.getElementById(name + '-md')
                mountPoint.innerHTML = html
                registerRevealElements(document)

                MathJax.typeset()
            })
            .catch(error => console.log(error));
    })

    hideEmptySectionTitle('home-subtitle')
    hideEmptySectionTitle('Achieves-subtitle')
    hideEmptySectionTitle('Skills-subtitle')
}); 

