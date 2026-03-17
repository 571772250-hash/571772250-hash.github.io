

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'Achieves']
const revealSelector = 'section header h2, .main-body > *, .achieves-group, .achieves-item'

function getAchievesMeta(titleText) {
    const title = titleText.toLowerCase()

    if (title.includes('论文') || title.includes('publication')) {
        return {
            groupIcon: 'bi-journal-richtext',
            itemIcon: 'bi-file-earmark-text'
        }
    }

    if (title.includes('奖项') || title.includes('award')) {
        return {
            groupIcon: 'bi-trophy-fill',
            itemIcon: 'bi-award-fill'
        }
    }

    if (title.includes('专利') || title.includes('patent')) {
        return {
            groupIcon: 'bi-lightbulb-fill',
            itemIcon: 'bi-patch-check-fill'
        }
    }

    if (title.includes('技能') || title.includes('skill')) {
        return {
            groupIcon: 'bi-tools',
            itemIcon: 'bi-stars'
        }
    }

    return {
        groupIcon: 'bi-bookmark-star-fill',
        itemIcon: 'bi-chevron-right'
    }
}

function createRevealObserver() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll(revealSelector).forEach(element => {
            element.classList.add('revealed')
        })
        return null
    }

    return new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return
            }

            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
        })
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
    })
}

function observeRevealElements(observer, scope = document) {
    const elements = scope.querySelectorAll(revealSelector)
    elements.forEach((element, index) => {
        if (element.dataset.revealReady === 'true') {
            return
        }

        element.dataset.revealReady = 'true'
        element.style.setProperty('--reveal-delay', `${Math.min(index * 90, 520)}ms`)

        if (observer) {
            observer.observe(element)
        } else {
            element.classList.add('revealed')
        }
    })
}

function extractAchievementYear(text) {
    const match = text.match(/\b(20\d{2})(?:[./-]\d{1,2})?\b/)
    return match ? match[1] : ''
}

function enhanceAchievesSection() {
    const container = document.getElementById('Achieves-md')
    if (!container) {
        return
    }

    const nodes = Array.from(container.children)
    if (!nodes.length) {
        return
    }

    const fragment = document.createDocumentFragment()
    let currentGroup = null

    nodes.forEach(node => {
        if (node.tagName === 'H4') {
            const groupMeta = getAchievesMeta(node.textContent)
            currentGroup = document.createElement('section')
            currentGroup.className = 'achieves-group'
            currentGroup.dataset.itemIcon = groupMeta.itemIcon

            const title = document.createElement('div')
            title.className = 'achieves-group-title'
            title.innerHTML = `<i class="bi ${groupMeta.groupIcon}" aria-hidden="true"></i><span>${node.innerHTML}</span>`
            currentGroup.appendChild(title)
            fragment.appendChild(currentGroup)
            return
        }

        if (!currentGroup) {
            fragment.appendChild(node.cloneNode(true))
            return
        }

        if (node.tagName === 'UL') {
            const list = document.createElement('div')
            list.className = 'achieves-list'

            Array.from(node.children).forEach((item, index) => {
                if (item.tagName !== 'LI') {
                    return
                }

                const card = document.createElement('article')
                card.className = 'achieves-item'
                card.style.setProperty('--reveal-delay', `${Math.min(index * 110, 660)}ms`)

                const itemIcon = document.createElement('span')
                itemIcon.className = 'achieves-item-icon'
                itemIcon.innerHTML = `<i class="bi ${currentGroup.dataset.itemIcon || 'bi-chevron-right'}" aria-hidden="true"></i>`
                card.appendChild(itemIcon)

                const year = extractAchievementYear(item.textContent)
                if (year) {
                    const badge = document.createElement('span')
                    badge.className = 'achieves-year'
                    badge.textContent = year
                    card.appendChild(badge)
                }

                const content = document.createElement('div')
                content.className = 'achieves-item-content'
                content.innerHTML = item.innerHTML
                card.appendChild(content)
                list.appendChild(card)
            })

            currentGroup.appendChild(list)
            return
        }

        currentGroup.appendChild(node.cloneNode(true))
    })

    container.innerHTML = ''
    container.appendChild(fragment)
}

window.addEventListener('DOMContentLoaded', event => {
    const revealObserver = createRevealObserver()

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
            observeRevealElements(revealObserver)
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

                if (name === 'Achieves') {
                    enhanceAchievesSection()
                }

                observeRevealElements(revealObserver, mountPoint.parentElement)
                MathJax.typeset()
            })
            .catch(error => console.log(error));
    })

    observeRevealElements(revealObserver)
}); 

