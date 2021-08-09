"use strict"

class InputFocus{
    static init(elements){
        if(elements.length){
            elements.forEach(el => {

                el.InputFocus = {
                    input: el.querySelector('.input-row__input-text'),
                    title: el.querySelector('.input-row__title'),
                }

                const {input, title} = el.InputFocus;

                input.InputFocusUpdate = function() {
                    if(input.value.trim().length){
                        InputFocus.minifyTitle(title);
                    } else {
                        InputFocus.unMinifyTitle(title);
                    }
                }

                if(input.value.length || input.placeholder.length){
                    InputFocus.minifyTitle(title);
                }

                title.addEventListener('click', () => InputFocus.focus(el.InputFocus));
                input.addEventListener('focus', () => InputFocus.focus(el.InputFocus));
                input.addEventListener('blur', () => InputFocus.blur(el.InputFocus));
                input.addEventListener('change', () => InputFocus.blur(el.InputFocus));
            })
        }
    }

    static focus({input, title}){
        input.focus();
        if(!title.classList.contains('input-row__title--focus') && !input.readOnly){
            input.focus();
            InputFocus.minifyTitle(title);
        }
    }

    static blur({input, title}) {
        if(!input.value.trim().length && !input.placeholder.length && !input.readOnly){
            input.value = "";
            InputFocus.unMinifyTitle(title);
        }
    }

    static minifyTitle(title){
        title.classList.add('input-row__title--focus');
    }

    static unMinifyTitle(title){
        title.classList.remove('input-row__title--focus');
    }

    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        InputFocus.init(this.elements);
    }
}

const SiteJS = {
    onload: document.addEventListener('DOMContentLoaded', function () {
        SiteJS.init();
    }),
    init: function () {
        this.modal();
        new InputFocus('.input-row');
        this.moveElement({
            elementId: 'user-title',
            targetId: 'profile-video',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.prepend(element);
            }
        });
        this.moveElement({
            elementId: 'user-description',
            targetId: 'user-position',
            mediaQuery: 'max-width: 767px',
            insertionMethod: function (element, target) {
                target.after(element);
            }
        });
        this.moveElement({
            elementId: 'profile-view-primary',
            targetId: 'profile-view-grid',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.prepend(element);
            }
        });
        this.moveElement({
            elementId: 'take-video-balloon',
            targetId: 'profile-video',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.prepend(element);
            }
        });
        this.moveElement({
            elementId: 'user-info',
            targetId: 'profile-video',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.prepend(element);
            }
        });
    },
    resizeThrottler: function(cb){
        let throttle = false;

        window.addEventListener('resize', () => {
            if(!throttle) {
                throttle = true;
                setTimeout(() => {
                    cb();
                    throttle = false;
                }, 500)
            }
        })
    },
    moveElement: function ({elementId, targetId, mediaQuery, insertionMethod}) {
        const element = document.getElementById(elementId);
        const target = document.getElementById(targetId);

        if(!element || !target) return;

        const elementMockup = document.createElement('div');
        elementMockup.cssText = "display: none";
        elementMockup.setAttribute('data-element-dom-anchor',`${elementId}`);
        element.after(elementMockup);

        move();
        this.resizeThrottler(move);

        function move() {
            if(window.matchMedia(`(${mediaQuery})`).matches){
                insertionMethod(element, target);
            } else {
                elementMockup.before(element);
            }
        }
    },
    modal: function () {
        const modalShowBtn = document.querySelectorAll('[data-modal-id]');
        const modalHideBtn = document.querySelectorAll('.modal-close');
        const modals = document.querySelectorAll('.modal');

        modalShowBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalID = btn.getAttribute('data-modal-id');
                const modal = document.getElementById(modalID);

                showModal(modal);
            })
        });

        modalHideBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                hideModal(modal);
            })
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if(e.target === e.currentTarget){
                    modalAnimationOut(e.target);
                }
            })
        });

        function showModal(modalElement) {
            requestAnimationFrame(() => modalAnimationIn(modalElement));
            document.body.classList.add('no-overflow');
        }

        function hideModal(modalElement) {
            requestAnimationFrame(() => modalAnimationOut(modalElement));
            document.body.classList.remove('no-overflow');
        }

        function modalAnimationIn(modalElement) {
            const modalHolder = modalElement.querySelector('.modal__holder');
            let alpha = .01;
            modalElement.classList.add('visible');

            const timer = setInterval(() => {
                if (alpha >= 0.56){
                    clearInterval(timer);
                    modalHolder.classList.add('visible');
                } else {
                    alpha += alpha * 0.1;
                    modalElement.style.backgroundColor = `rgba(0,0,0, ${alpha})`;
                }
            }, 5);
        }

        function modalAnimationOut(modalElement) {
            const modalHolder = modalElement.querySelector('.modal__holder');
            modalHolder.classList.remove('visible');

            let alpha = 1;

            const timer = setInterval(() => {
                if (alpha <= 0.1){
                    clearInterval(timer);
                    modalElement.classList.remove('visible');
                } else {
                    alpha -= alpha * 0.1;
                    modalElement.style.backgroundColor = `rgba(0,0,0, ${alpha})`;
                }
            }, 5);
        }
    }
};