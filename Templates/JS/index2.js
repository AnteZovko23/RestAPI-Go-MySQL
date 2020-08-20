;(function(window) {
		   
    'use strict';

    var support = { transitions: Modernizr.csstransitions },
        // transition end event name
        transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        onEndTransition = function( el, callback ) {
            var onEndCallbackFn = function( ev ) {
                if( support.transitions ) {
                    if( ev.target != this ) return;
                    this.removeEventListener( transEndEventName, onEndCallbackFn );
                }
                if( callback && typeof callback === 'function' ) { callback.call(this); }
            };
            if( support.transitions ) {
                el.addEventListener( transEndEventName, onEndCallbackFn );
            }
            else {
                onEndCallbackFn();
            }
        },
        // the pages wrapper
        stack = document.querySelector('.pages-stack'),
        // the page elements
        pages = [].slice.call(stack.children),
        // total number of page elements
        pagesTotal = pages.length,
        // index of current page
        current = 0,
        // menu button
        menuCtrl = document.querySelector('button.menu-button'),
        // the navigation wrapper
        nav = document.querySelector('.pages-nav'),
        // the menu nav items
        navItems = [].slice.call(nav.querySelectorAll('.link--page')),
        // check if menu is open
        isMenuOpen = false;

    function init() {
        buildStack();
        initEvents();
    }

    function buildStack() {
        var stackPagesIdxs = getStackPagesIdxs();

        // set z-index, opacity, initial transforms to pages and add class page--inactive to all except the current one
        for(var i = 0; i < pagesTotal; ++i) {
            var page = pages[i],
                posIdx = stackPagesIdxs.indexOf(i);

            if( current !== i ) {
                classie.add(page, 'page--inactive');

                if( posIdx !== -1 ) {
                    // visible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,100%,0)';
                    page.style.transform = 'translate3d(0,100%,0)';
                }
                else {
                    // invisible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,75%,-300px)';
                    page.style.transform = 'translate3d(0,75%,-300px)';		
                }
            }
            else {
                classie.remove(page, 'page--inactive');
            }

            page.style.zIndex = i < current ? parseInt(current - i) : parseInt(pagesTotal + current - i);
            
            if( posIdx !== -1 ) {
                page.style.opacity = parseFloat(1 - 0.1 * posIdx);
            }
            else {
                page.style.opacity = 0;
            }
        }
    }

    // event binding
    function initEvents() {
        // menu button click
        menuCtrl.addEventListener('click', toggleMenu);

        // navigation menu clicks
        navItems.forEach(function(item) {
            // which page to open?
            var pageid = item.getAttribute('href').slice(1);
            item.addEventListener('click', function(ev) {
                ev.preventDefault();
                openPage(pageid);
            });
        });

        // clicking on a page when the menu is open triggers the menu to close again and open the clicked page
        pages.forEach(function(page) {
            var pageid = page.getAttribute('id');
            page.addEventListener('click', function(ev) {
                if( isMenuOpen ) {
                    ev.preventDefault();
                    openPage(pageid);
                }
            });
        });

        // keyboard navigation events
        document.addEventListener( 'keydown', function( ev ) {
            if( !isMenuOpen ) return; 
            var keyCode = ev.keyCode || ev.which;
            if( keyCode === 27 ) {
                closeMenu();
            }
        } );
    }

    // toggle menu fn
    function toggleMenu() {
        if( isMenuOpen ) {
            closeMenu();
        }
        else {
            openMenu();
            isMenuOpen = true;
        }
    }

    // opens the menu
    function openMenu() {
        // toggle the menu button
        classie.add(menuCtrl, 'menu-button--open')
        // stack gets the class "pages-stack--open" to add the transitions
        classie.add(stack, 'pages-stack--open');
        // reveal the menu
        classie.add(nav, 'pages-nav--open');

        // now set the page transforms
        var stackPagesIdxs = getStackPagesIdxs();
        for(var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
            var page = pages[stackPagesIdxs[i]];
            page.style.WebkitTransform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)'; // -200px, -230px, -260px
            page.style.transform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)';
        }
    }

    // closes the menu
    function closeMenu() {
        // same as opening the current page again
        openPage();
    }

    // opens a page
    function openPage(id) {
        var futurePage = id ? document.getElementById(id) : pages[current],
            futureCurrent = pages.indexOf(futurePage),
            stackPagesIdxs = getStackPagesIdxs(futureCurrent);

        // set transforms for the new current page
        futurePage.style.WebkitTransform = 'translate3d(0, 0, 0)';
        futurePage.style.transform = 'translate3d(0, 0, 0)';
        futurePage.style.opacity = 1;

        // set transforms for the other items in the stack
        for(var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
            var page = pages[stackPagesIdxs[i]];
            page.style.WebkitTransform = 'translate3d(0,100%,0)';
            page.style.transform = 'translate3d(0,100%,0)';
        }

        // set current
        if( id ) {
            current = futureCurrent;
        }
        
        // close menu..
        classie.remove(menuCtrl, 'menu-button--open');
        classie.remove(nav, 'pages-nav--open');
        onEndTransition(futurePage, function() {
            classie.remove(stack, 'pages-stack--open');
            // reorganize stack
            buildStack();
            isMenuOpen = false;
        });
    }

    // gets the current stack pages indexes. If any of them is the excludePage then this one is not part of the returned array
    function getStackPagesIdxs(excludePageIdx) {
        var nextStackPageIdx = current + 1 < pagesTotal ? current + 1 : 0,
            nextStackPageIdx_2 = current + 2 < pagesTotal ? current + 2 : 1,
            idxs = [],

            excludeIdx = excludePageIdx || -1;

        if( excludePageIdx != current ) {
            idxs.push(current);
        }
        if( excludePageIdx != nextStackPageIdx ) {
            idxs.push(nextStackPageIdx);
        }
        if( excludePageIdx != nextStackPageIdx_2 ) {
            idxs.push(nextStackPageIdx_2);
        }

        return idxs;
    }

    init();

})(window);


$('.lefter').click(function(){window.open('/inventory/searchResult?table=Computers', '_blank')});		
$('.left').click(function(){window.open('/inventory/searchResult?table=Furniture', '_blank')});
$('.center').click(function(){window.open('/inventory/searchResult?table=Printers', '_blank')});
$('.right').click(function(){window.open('/inventory/searchResult?table=Supplies', '_blank')});
$('.righter').click(function(){window.open('/inventory/searchResult?table=Warehouse', '_blank')}); 


const inputField = document.querySelector('.chosen-value');
const dropdown = document.querySelector('.value-list');
const dropdownArray = [... document.querySelectorAll('li')];
console.log(typeof dropdownArray)
dropdown.classList.add('open');
inputField.focus(); // Demo purposes only
let valueArray = [];
dropdownArray.forEach(item => {
valueArray.push(item.textContent);
});

const closeDropdown = () => {
dropdown.classList.remove('open');
}

inputField.addEventListener('input', () => {

dropdown.classList.add('open');
let inputValue = inputField.value.toLowerCase();
let valueSubstring;
if (inputValue.length > 0) {
for (let j = 0; j < valueArray.length; j++) {
if (!(inputValue.substring(0, inputValue.length) === valueArray[j].substring(0, inputValue.length).toLowerCase())) {
dropdownArray[j].classList.add('closed');
} else {
dropdownArray[j].classList.remove('closed');
}
}
} else {
for (let i = 0; i < dropdownArray.length; i++) {
dropdownArray[i].classList.remove('closed');
}
}
});

dropdownArray.forEach(item => {
item.addEventListener('click', (evt) => {
inputField.value = item.textContent;
dropdownArray.forEach(dropdown => {
dropdown.classList.add('closed');
});
});
})

inputField.addEventListener('focus', () => {


inputField.placeholder = 'Results per Page';
dropdown.classList.add('open');
dropdownArray.forEach(dropdown => {
dropdown.classList.remove('closed');
});
});

inputField.addEventListener('blur', () => {
inputField.placeholder = 'Results per Page';
dropdown.classList.remove('open');
});

document.addEventListener('click', (evt) => {
const isDropdown = dropdown.contains(evt.target);
const isInput = inputField.contains(evt.target);
if (!isDropdown && !isInput) {
dropdown.classList.remove('open');
}
});

function send(e){
if(e.keyCode == 13){
document.getElementById("searchBox").submit();
}

}

$('.spotify-embed-close').on('click', function() {
if($('.spotify-embed-block').is(':hidden') && $(window).width() > 768){
$('.spotify-embed-close').animate({
 bottom: 380
}, 400);
var top_text = 'Hide <i class="fa fa-angle-down">'
$('.close-text').empty().append(top_text);
} else if($('.spotify-embed-block').is(':hidden') && $(window).width() <= 768){
$('.spotify-embed-close').animate({
 bottom: 80
}, 400);
var top_text = 'Hide <i class="fa fa-angle-down">'
$('.close-text').empty().append(top_text);
}
else {
$('.spotify-embed-close').animate({
 bottom: 0
}, 400);
var bottom_text = '<i class="fa fa-music">'
$('.close-text').empty().append(bottom_text);
}
$('.spotify-embed-block').slideToggle();
});