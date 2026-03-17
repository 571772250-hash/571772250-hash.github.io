

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'Achieves']

function getAchievesMeta(titleText) {
    const title = titleText.toLowerCase()

    if (title.includes('论文') || title.includes('publication')) {
        return {
            groupIcon: 'bi-journal-richtext',
            groupType: 'publication'
        }
    }

    if (title.includes('奖项') || title.includes('award')) {
        return {
            groupIcon: 'bi-trophy-fill',
            groupType: 'award'
        }
    }

    if (title.includes('专利') || title.includes('patent')) {
        return {
            groupIcon: 'bi-lightbulb-fill',
            groupType: 'patent'
        }
    }

    if (title.includes('技能') || title.includes('skill')) {
        return {
            groupIcon: 'bi-tools',
            groupType: 'skill'
        }
    }

    return {
        groupIcon: 'bi-bookmark-star-fill',
        groupType: 'default'
    }
}

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

function extractAchievementYear(text) {
    const rangeMatch = text.match(/\b(20\d{2}\s*[-–]\s*20\d{2})\b/)
    if (rangeMatch) {
        return rangeMatch[1].replace(/\s*/g, '')
    }

    const match = text.match(/\b(20\d{2})(?:[./-]\d{1,2})?\b/)
    return match ? match[1] : ''
}

function getAchievementItemIcon(groupType, text, index) {
    const lowerText = text.toLowerCase()

    if (groupType === 'publication') {
        if (lowerText.includes('journal')) {
            return 'bi-journal-text'
        }
        if (lowerText.includes('doi') || lowerText.includes('paper')) {
            return 'bi-file-earmark-medical'
        }
        return 'bi-file-earmark-text'
    }

    if (groupType === 'award') {
        return 'bi-award-fill'
    }

    if (groupType === 'patent') {
        if (lowerText.includes('system') || lowerText.includes('系统')) {
            return 'bi-diagram-3-fill'
        }
        if (lowerText.includes('bookshelf') || lowerText.includes('书柜')) {
            return 'bi-bookshelf'
        }
        if (lowerText.includes('abaqus')) {
            return 'bi-bounding-box-circles'
        }
        if (lowerText.includes('仿真') || lowerText.includes('simulation')) {
            return 'bi-boxes'
        }
        if (lowerText.includes('发明专利') || lowerText.includes('invention patent')) {
            return 'bi-lightbulb'
        }
        if (lowerText.includes('实用新型') || lowerText.includes('utility model')) {
            return 'bi-wrench-adjustable-circle'
        }
        return ['bi-lightbulb', 'bi-patch-check', 'bi-diagram-3', 'bi-box'][index % 4]
    }

    if (groupType === 'skill') {
        if (lowerText.includes('autocad') || lowerText.includes('solidworks') || lowerText.includes('建模')) {
            return 'bi-pencil-square'
        }
        if (lowerText.includes('abaqus') || lowerText.includes('仿真')) {
            return 'bi-gear-fill'
        }
        if (lowerText.includes('ros2') || lowerText.includes('robot')) {
            return 'bi-robot'
        }
        if (lowerText.includes('gazebo') || lowerText.includes('urdf')) {
            return 'bi-box'
        }
        if (lowerText.includes('keyshot') || lowerText.includes('渲染')) {
            return 'bi-palette-fill'
        }
        return ['bi-tools', 'bi-gear', 'bi-cpu', 'bi-stars'][index % 4]
    }

    return 'bi-chevron-right'
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
            currentGroup.dataset.groupType = groupMeta.groupType

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

                const itemIcon = document.createElement('span')
                itemIcon.className = 'achieves-item-icon'
                itemIcon.innerHTML = `<i class="bi ${getAchievementItemIcon(currentGroup.dataset.groupType || 'default', item.textContent, index)}" aria-hidden="true"></i>`
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

                MathJax.typeset()
            })
            .catch(error => console.log(error));
    })

    hideEmptySectionTitle('home-subtitle')
    hideEmptySectionTitle('Achieves-subtitle')
}); 

