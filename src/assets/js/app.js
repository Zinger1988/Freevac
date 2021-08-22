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

class Counter{
    constructor(elementID) {
        this.element = document.querySelector(elementID);
        this.counterValue = parseInt(this.element.getAttribute('data-counter'));
        this.timer = null;
        this.timeLeft = this.counterValue;
        this.isCountdown = false;
        this.eventsCb = {
            onStart: [],
            onReset: [],
            onStop: [],
            beforeChange: [],
            afterChange: []
        }

        Counter.init.call(this);
    }

    set onStart(cb) {
        if(typeof cb !== 'function'){
            console.error('Callback should be a function')
        } else {
            this.eventsCb.onStart.push(cb);
        }
    }

    set onReset(cb) {
        if(typeof cb !== 'function'){
            console.error('Callback should be a function')
        } else {
            this.eventsCb.onReset.push(cb);
        }
    }

    set onStop(cb) {
        if(typeof cb !== 'function'){
            console.error('Callback should be a function')
        } else {
            this.eventsCb.onStop.push(cb);
        }
    }

    set beforeChange(cb) {
        if(typeof cb !== 'function'){
            console.error('Callback should be a function')
        } else {
            this.eventsCb.beforeChange.push(cb);
        }
    }

    set afterChange(cb) {
        if(typeof cb !== 'function'){
            console.error('Callback should be a function')
        } else {
            this.eventsCb.afterChange.push(cb);
        }
    }

    static init(){
        this.element.Counter = this;
        if((this.counterValue / 60) >= 1){
            this.element.textContent = `${Counter.getZero(Math.floor(this.counterValue / 60))}:${Counter.getZero(this.counterValue % 60)}`;
        } else {
            this.element.textContent = `${this.counterValue % 60}`;
        }
    }

    static getZero(value) {
        return value >= 10 ? value: '0' + value;
    }

    start() {
        if(this.isCountdown) return;

        this.reset();
        this.isCountdown = true;
        this.timer = setInterval(() => {
            this.eventsCb.beforeChange.forEach(cb => cb())
            if(this.timeLeft > 0){
                this.timeLeft -= 1;
                this.eventsCb.afterChange.forEach(cb => cb())
                if((this.counterValue / 60) >= 1){
                    this.element.textContent = `${Counter.getZero(Math.floor(this.timeLeft / 60))}:${Counter.getZero(this.timeLeft % 60)}`;
                } else {
                    this.element.textContent = `${this.timeLeft % 60}`;
                }
            } else {
                this.stop()
            }
        },1000);

        this.eventsCb.onStart.forEach(cb => cb())
    }

    stop() {
        if (!this.isCountdown) return;
        clearInterval(this.timer);

        this.eventsCb.onStop.forEach(cb => cb())
    }

    reset() {
        this.timeLeft = this.counterValue;

        if((this.counterValue / 60) >= 1){
            this.element.textContent = `${Counter.getZero(Math.floor(this.counterValue / 60))}:${Counter.getZero(this.counterValue % 60)}`;
        } else {
            this.element.textContent = `${this.counterValue % 60}`;
        }

        this.isCountdown = false;
        clearInterval(this.timer);

        this.eventsCb.onReset.forEach(cb => cb())
    }
}

class Video {
    constructor({element, isMuted = false, autoplay = false, isControlled = true}) {
        this.element = element;
        this.autoplay = autoplay;
        this.state = {
            isMuted: isMuted,
            isPaused: !autoplay,
            isControlled: isControlled,
        };
        this.controls = {
            playBtn: document.createElement('div'),
            soundBtn: document.createElement('div'),
        }
    }

    init(){
        let {element, autoplay, state: {isMuted, isPaused, isControlled}, controls: {playBtn, soundBtn}} = this;

        if(!element) return

        element.muted = isMuted;
        element.autoplay = autoplay;
        element.controls = false;
        element.loop = false;
        element.Video = this;

        if(isControlled){
            playBtn.classList.add('video-player__play');
            element.after(playBtn);

            if(isPaused) {
                playBtn.classList.add('video-player__play--paused');
            }

            soundBtn.classList.add('video-player__sound', 'icon', 'icon--size--md', 'icon--soundon-24');
            element.after(soundBtn);

            if(isMuted) {
                soundBtn.classList.add('icon--soundoff-24');
                soundBtn.classList.remove('icon--soundon-24');
            }

            Video.setHandlers(this);
        }
    }

    static setHandlers(instance){
        let {element, controls: {playBtn, soundBtn}, state: {isMuted, isPaused}} = instance;

        playBtn.addEventListener('click', async () => {
            if(isPaused){
                await element.play();
                playBtn.classList.remove('video-player__play--paused');
                playBtn.classList.add('video-player__play--active');
            } else {
                element.pause();
                playBtn.classList.add('video-player__play--paused');
                playBtn.classList.remove('video-player__play--active');
            }

            isPaused = !isPaused;
        })

        soundBtn.addEventListener('click', () => {
            if(isMuted){
                element.muted = false;
                soundBtn.classList.remove('icon--soundoff-24');
                soundBtn.classList.add('icon--soundon-24');
            } else {
                element.muted = true;
                soundBtn.classList.add('icon--soundoff-24');
                soundBtn.classList.remove('icon--soundon-24');
            }

            isMuted = !isMuted;
        })

        element.addEventListener('ended', () => {
            playBtn.classList.add('video-player__play--paused');
            playBtn.classList.remove('video-player__play--active');
            isPaused = true;
        });
    }

    static destroy(instance){
        let {element, controls: {playBtn, soundBtn}} = instance;
        playBtn.remove();
        soundBtn.remove();
        delete element.Video;
    }
}

class VideoRecorder{
    constructor({element, constraints}) {
        this.element = element;
        this.constraints = constraints;
        this.controls = {
            marker: document.createElement('div')
        }
    }

    async init(){
        let {element, controls: {marker}} = this;

        element.innerHTML = '';
        element.VideoRecorder = this;

        marker.classList.add('video-canvas__record-dot');

        await VideoRecorder.getStream(this);
        await VideoRecorder.bindStream(this);
    }

    static async getStream(instance){
        const {constraints} = instance;
        const errors = {
            NotAllowedError: {
                title: 'Ой...',
                text: `Чтобы создать видеорезюме необходимо предоставить доступ к камере и микрофону
                           твоего устройства. Проверь настройки браузера и обнови страницу.`,
            },
            OverconstrainedError: {
                title: 'Ой...',
                text: `Похоже, твоя камера не может обеспечить требуемое разрешение видео.`,
            },
            NoAccessGetUserMedia: {
                title: 'Ой...',
                text: `Похоже твой браузер не поддерживает технологию записи, используемую нами. Не пора ли обновиться?`,
            }
        };

        try{
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const error = new Error('Can\'t get acces to  navigator.mediaDevices.getUserMedia');
                error.name = 'NoAccessGetUserMedia';
                throw error;
            }

            if(localStorage.getItem('fatalError') === 'noMediaDevices'){
                localStorage.removeItem('fatalError');
            }

            try {
                instance.stream = await navigator.mediaDevices.getUserMedia(constraints);
                localStorage.removeItem('fatalError');
            } catch(err) {
                if(localStorage.getItem('fatalError') === 'noAccessToCamera') {
                    new FatalError({...errors[err.name], isFullScreen: false})
                } else {
                    new FatalError(errors[err.name]);
                    localStorage.setItem('fatalError','noAccessToCamera');
                }
            }
        } catch (err) {
            console.dir(err);

            if(localStorage.getItem('fatalError') === 'noMediaDevices'){
                new FatalError({...errors[err.name], isFullScreen: false})
            } else {
                new FatalError(errors[err.name])
                localStorage.setItem('fatalError','noMediaDevices');
            }
        }
    }

    static async bindStream(instance){
        const {stream, element} = instance;
        element.srcObject = await stream;
        element.muted = true;
        await element.play();
    }

    static async startRecording(instance){
        const {stream, element, controls: {marker}} = instance;
        let chunks = [];
        let options = {};
        let types = ["video/mpeg"];

        types.find(type => {
            if(MediaRecorder.isTypeSupported(type)){
                options = {mimeType: type};
            }
        });

        instance.mediaRecorder = new MediaRecorder(stream, options);
        instance.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        element.before(marker);

        instance.mediaRecorder.start();

        instance.mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, options);
            chunks = [];

            stream.getTracks().forEach( (track) => track.stop());
            element.srcObject = null;
            element.src = window.URL.createObjectURL(blob);

            marker.remove();

            new Video({element: element}).init();
        }
    }

    static stopRecording(instance){
        instance.mediaRecorder.stop();
    }

    static async reset(instance){
        const {element} = instance;

        element.srcObject = null;
        Video.destroy(element.Video);

        await VideoRecorder.getStream(instance);
        await VideoRecorder.bindStream(instance);
    }

    static destroy(instance){
        const {element, stream} = instance;

        stream.getTracks().forEach( (track) => track.stop());
        element.srcObject = null;
        element.removeAttribute('src');

        if(element.Video){
            Video.destroy(element.Video);
            delete element.Video;
        }

        delete element.VideoRecorder;
    }
}

class Modal {
    static modalElements = null;
    static activeModal = null;
    static modalOverlay = document.createElement('div');

    constructor(modalSelector) {
        Modal.modalElements = Array.from(document.querySelectorAll(modalSelector));
        Modal.modalOverlay.id = 'modal-overlay';
        Modal.setHandlers();
    }

    static setHandlers(){
        const modalButtons = document.querySelectorAll('[data-modal-id]');

        modalButtons.forEach(button => {
            button.addEventListener('click', () => {
                if(Modal.activeModal){
                    Modal.hide();
                }
                const modalId = button.getAttribute('data-modal-id');
                Modal.show(modalId);
                Modal.showOverlay();
            })
        });

        Modal.modalOverlay.addEventListener('click', (e) => {
            Modal.hide();
            Modal.hideOverlay();
        })

        Modal.modalElements.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if(e.target.classList.contains('modal-close') || e.target.closest('.modal-close')){
                    Modal.hide();
                    Modal.hideOverlay();
                }
            })
        });
    }

    static showOverlay(){
        const overlay = document.querySelector('#modal-overlay');
        if(overlay) return;

        document.body.append(Modal.modalOverlay);
        document.body.classList.add('no-overflow');

        let alpha = .01;
        const timer = setInterval(() => {
            if (alpha >= 0.56){
                clearInterval(timer);
            } else {
                Modal.modalOverlay.style.backgroundColor = `rgba(0,0,0, ${alpha += 0.1})`;
            }
        }, 20);
    }

    static hideOverlay(){
        const overlay = document.querySelector('#modal-overlay');
        if(!overlay) return;

        document.body.classList.remove('no-overflow');

        let alpha = 0.56;
        const timer = setInterval(() => {
            if (alpha <= 0.1){
                overlay.remove()
                clearInterval(timer);
            } else {
                Modal.modalOverlay.style.backgroundColor = `rgba(0,0,0, ${alpha -= 0.1})`;
            }
        }, 20);
    }

    static show(modalId){
        const targetModal = Modal.modalElements.find(element => element.id === modalId);
        Modal.activeModal = targetModal;
        targetModal.classList.add('visible');
    }

    static hide(){
        Modal.activeModal.classList.remove('visible');
        Modal.activeModal = null;
    }
}

class FatalError {
    constructor({title, text, isFullScreen = true}) {
        this.title = title;
        this.text = text;
        this.isFullScreen = isFullScreen;
        this.element = FatalError.render(this);
    }

    static minify(element){
        element.classList.add('fatal-error--minified');
    }

    static render({title, text, isFullScreen}){
        const element = document.createElement('div');
        element.classList.add('fatal-error');
        element.innerHTML = `
            <div class="fatal-error__inner">
                <div class="fatal-error__body">
                    <div class="emoji fatal-error__emoji">
                        <div class="emoji__face emoji__face--sad">
                            <div class="emoji__eye emoji__eye--left"></div>
                            <div class="emoji__eye emoji__eye--right"></div>
                            <div class="emoji__mouth"></div>
                        </div>
                    </div>
                    <div class="fatal-error__info">
                        <div class="fatal-error__title">${title}</div>
                        <div class="fatal-error__text">${text}</div>
                    </div>
                </div>
                <div class="fatal-error__footer">
                    <button class="btn btn--size--regular btn--style--outline-white fatal-error__close-btn">
                        <i class="btn__icon icon icon--size--sm icon--close-16"></i>
                        <span class="btn__text">Закрыть</span>
                    </button>
                </div>
            </div>
        `;

        const closeBtn = element.querySelector('.fatal-error__close-btn');

        closeBtn.addEventListener('click', () => {
            if(isFullScreen){
                isFullScreen = false;
                FatalError.minify(element);
                document.body.classList.remove('no-overflow');
                closeBtn.remove();
            }
        })

        if(!isFullScreen){
            FatalError.minify(element);
            document.body.classList.remove('no-overflow');
            closeBtn.remove();
        }

        document.body.append(element);
        return element;
    }
}

const SiteJS = {
    onload: document.addEventListener('DOMContentLoaded', function () {
        SiteJS.init();
    }),
    init: function () {
        new Modal('.modal');
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
            elementId: 'video-counter',
            targetId: 'profile-video',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.prepend(element);
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
            elementId: 'take-video-tile',
            targetId: 'profile-video',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.before(element);
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
        this.expandTextarea('.input-text--textarea');
        this.recordVideo();
        this.completeInput('[data-complete-input]','[data-complete-group]');
        this.smoothScroll('[data-scroll-to]');
        this.copyToClipboard('#freevak-link-copy', '#freevak-link');
        this.inputFile('.input-row--file','.input-row__input-file','.input-row__input-text');
        this.tabs();
        this.replaceElements();
        this.videoPlayer();
        this.typeDisplay();
    },
    typeDisplay() {
        if ("ontouchstart" in document.documentElement) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('hover-device');
        }
    },
    videoPlayer(){
        const player = document.querySelector('.video-player');

        if(!player) return
        new Video({
            element: player
        }).init();
    },
    replaceElements(){
        const wrapperEl = document.querySelectorAll('.replace-elements');

        wrapperEl.forEach(wrapper => {

            const elements = wrapper.querySelectorAll('.replace-elements__item');
            elements.forEach(elem => {

                elem.addEventListener('click', (e) => {
                    if(e.target.classList.contains('replace-elements__arr-left')
                        || e.target.classList.contains('replace-elements__arr-right')
                        || e.target.closest('.replace-elements__arr-left')
                        || e.target.closest('.replace-elements__arr-right')){
                        e.preventDefault();
                    }
                })

                const arrowLeft = elem.querySelector('.replace-elements__arr-left');
                const arrowRight = elem.querySelector('.replace-elements__arr-right');

                arrowLeft.addEventListener('click', (e) => {

                    const prevElement = elem.previousElementSibling;

                    if(prevElement){
                        prevElement.replaceWith(elem);
                        elem.after(prevElement);
                        this.alert('Порядок видео изменен','success').start
                    }
                })

                arrowRight.addEventListener('click', (e) => {

                    const nextElement = elem.nextElementSibling;

                    if(nextElement){
                        nextElement.replaceWith(elem);
                        elem.before(nextElement);
                        this.alert('Порядок видео изменен','success').start
                    }
                })
            })
        })
    },
    tabs(){
        const elements = document.querySelectorAll('[data-tab-group]');
        if(!elements.length) return;

        const groups = [];

        elements.forEach(element => {
            const groupName = element.getAttribute('data-tab-group');
            let targetGroup = groups.find(group => groupName === group.name);

            if(!targetGroup){
                groups.push({
                    name: groupName,
                    anchors: [],
                    contentElements: []
                })
                targetGroup = groups[groups.length - 1]
            }

            const isAnchor = element.hasAttribute('data-tab-anchor');
            if(isAnchor){
                targetGroup.anchors.push(element);
            } else {
                targetGroup.contentElements.push(element);
            }
        });

        function showContent(activeAnchor, group){
            const anchorTarget = activeAnchor.getAttribute('data-tab-anchor');

            group.contentElements.forEach(element => {
                const elementID = element.getAttribute('data-tab-content-id')
                anchorTarget === elementID
                    ? element.style = ''
                    : element.style.display = 'none';
            })

            group.anchors.forEach(anchor => {
                anchor.removeAttribute('data-tab-active','');

                if(anchor === activeAnchor){
                    anchor.setAttribute('data-tab-active','');
                }
            })
        }

        groups.forEach( group => {
            group.anchors.forEach(anchor => {
                if(anchor.hasAttribute('data-tab-active')){
                    showContent(anchor, group);
                }
                anchor.addEventListener('click', () => {
                    showContent(anchor, group);
                })
            })
        })
    },
    inputFile(wrapperSelector, inputFileSelector, inputTextSelector){
        const wrappers = document.querySelectorAll(wrapperSelector);

        wrappers.forEach(item => {
            const inputFile = item.querySelector(inputFileSelector);
            const inputText = item.querySelector(inputTextSelector);

            inputText.addEventListener('click', () => {
                inputFile.click();
            });

            inputFile.addEventListener("change", () => {
                let value = '';
                if(inputFile.files.length) {
                    for(let key of inputFile.files){
                        value += key.name + " ";
                    }
                }
                inputText.value = value
                if(inputText.InputFocusUpdate) inputText.InputFocusUpdate();
            })
        });
    },
    copyToClipboard(triggerSelector, sourceInputID){
        const triggers = document.querySelectorAll(triggerSelector);
        const sourceInput = document.querySelector(sourceInputID);

        if(!sourceInput) return;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                sourceInput.select();
                document.execCommand('copy');
                this.alert('Ссылка скопирована', 'success').start
            })
        })
    },
    alert(text, style = 'info', timeout = 3000){

        const events = {
            beforeShow: [],
            afterShow: [],
            beforeHide: [],
            afterHide: [],
        }

        const styles = {
            info: {
                className: 'alert--info',
                icon: 'icon--check-24'
            },
            warning: {
                className: 'alert--warning',
                icon: 'icon--check-24'
            },
            success: {
                className: 'alert--success',
                icon: 'icon--check-24'
            },
            danger: {
                className: 'alert--danger',
                icon: 'icon--check-24'
            },
        }

        function start(){
            const element = document.createElement('div');
            element.classList.add('alert', styles[style]['className']);
            element.innerHTML = `
                <i class="icon icon--size--md ${styles[style]['icon']} alert__icon"></i>
                <span class="alert__text">${text}</span>
            `;

            events.beforeShow.forEach(cb => cb());
            document.body.append(element);
            events.afterShow.forEach(cb => cb());

            setTimeout(() => {
                events.beforeHide.forEach(cb => cb());
                element.remove();
                events.afterHide.forEach(cb => cb());
            }, timeout);
        }

        return {
            beforeShow(cb) {
                if(typeof cb !== 'function'){
                    console.error('Callback should be a function')
                } else {
                    events.beforeShow.push(cb);
                }

                return this
            },
            afterShow(cb) {
                if(typeof cb !== 'function'){
                    console.error('Callback should be a function')
                } else {
                    events.afterShow.push(cb);
                }

                return this
            },
            beforeHide(cb) {
                if(typeof cb !== 'function'){
                    console.error('Callback should be a function')
                } else {
                    events.beforeHide.push(cb);
                }

                return this
            },
            afterHide(cb) {
                if(typeof cb !== 'function'){
                    console.error('Callback should be a function')
                } else {
                    events.afterHide.push(cb);
                }

                return this
            },
            get start(){
                return start()
            }
        }
    },
    smoothScroll: function(btnSelector){
        const buttons = document.querySelectorAll(btnSelector);

        buttons.forEach( btn => {
            const targetId = btn.getAttribute('data-scroll-to');
            const targetElement = document.querySelector('#' + targetId);

            btn.addEventListener('click', () => {
                const targetCoords = targetElement.getBoundingClientRect();

                window.scrollTo({
                    top: targetCoords.top + pageYOffset - 50,
                    left: targetCoords.left + pageXOffset - 50,
                    behavior: 'smooth'
                });
            })
        })
    },
    expandTextarea: function(selector){
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            if(el.tagName.toLowerCase() !== 'textarea') return;

            calcHeight(el);
            el.addEventListener('input', (e) => calcHeight(e.currentTarget));
        })

        function calcHeight(element) {
            element.style.height = window.getComputedStyle(element).getPropertyValue("min-height");
            element.style.height = element.scrollHeight + (element.offsetHeight - element.clientHeight) + 'px';
        }
    },
    createElement: function({tag, classes, html}) {
        const btn = document.createElement(tag);
        btn.classList.add(...classes);
        btn.innerHTML = html;
        return btn;
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
    completeInput: function(inputSelector, groupSelector){

        const inputs = document.querySelectorAll(inputSelector);
        const groups = document.querySelectorAll(groupSelector);

        if(!inputs.length || !groups.length) return;

        groups.forEach(group => {
            group.addEventListener('click', (e) => {

                if(e.target.hasAttribute('data-complete-btn') || e.target.closest('[data-complete-btn]')) {

                    if(e.target.hasAttribute('data-complete-text')){
                        updateInputs(e.target.textContent);
                        return;
                    }

                    const textContainer = e.target.querySelector('[data-complete-text]');

                    if(!textContainer){
                        console.error('CompleteInput requests an element width "data-complete-text"-attribute');
                    } else {
                        updateInputs(textContainer.textContent);
                    }
                }
            })
        })

        function updateInputs(value){
            inputs.forEach(input => {
                input.value = value.trim();
                if(input.InputFocusUpdate) input.InputFocusUpdate();
            })
        }
    },
    async recordVideo(){

        const videoElement = document.querySelector('.video-record');
        if(!videoElement) return;

        let recorderInstance = null;
        let initialSrc = null;

        if(!videoElement.hasAttribute('src')){
            recorderInstance = new VideoRecorder({
                element: videoElement,
                constraints: {
                    video: {
                        width: 720,
                        height: 720,
                        facingMode: 'user'
                    },
                    audio: true
                }
            });
            await recorderInstance.init();
        }

        const controlBar = document.querySelector('#record-control-bar');
        const recordBtn = controlBar.querySelector('#record-btn');
        const counterInstance = new Counter('#video-counter');
        const countdownInstance = new Counter('#video-countdown');

        function rollbackVideoElem(){
            VideoRecorder.destroy(recorderInstance);
            recorderInstance = null;
            videoElement.src = initialSrc;
            initialSrc = null;

            videoElement.addEventListener('loadeddata', function() {
                new Video({element: videoElement}).init();
            }, {once: true});

            videoElement.load();
        }

        const doneBtn = this.createElement({
            tag: 'button',
            classes: ['btn', 'btn--style--accent', 'btn--size--lg', 'btn--fluid'],
            html: `<i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                   <span class="btn__text">Снято</span>`
        });

        const cancelBtn = this.createElement({
            tag: 'button',
            classes: ['btn', 'btn--style--primary-lighter', 'btn--size--lg', 'btn--fluid'],
            html: `<i class="icon icon--size--lg icon--arrowleft-48 btn__icon"></i>
                   <span class="btn__text">Отмена</span>`
        });

        doneBtn.addEventListener('click', (e) => counterInstance.stop());

        cancelBtn.addEventListener('click', (e) => {
            e.currentTarget.remove();
            controlBar.prepend(recordBtn);
            countdownInstance.reset();
            counterInstance.element.style.display = '';

            if(initialSrc) rollbackVideoElem();
        });

        recordBtn.addEventListener('click',  async(e) => {
            if(!recorderInstance){
                initialSrc = videoElement.getAttribute('src') || null;

                if(videoElement.Video) Video.destroy(videoElement.Video);

                recorderInstance = new VideoRecorder({
                    element: videoElement,
                    constraints: {
                        video: {
                            width: 720,
                            height: 720,
                            facingMode: 'user'
                        },
                        audio: true
                    }
                })
                await recorderInstance.init();
            }

            countdownInstance.start();
        });

        /* videoCounter callbacks ----------------------------- */

        counterInstance.onStart = () => {
            VideoRecorder.startRecording(recorderInstance);
            controlBar.prepend(doneBtn);
        };

        counterInstance.onStop = () => {
            VideoRecorder.stopRecording(recorderInstance);
            doneBtn.remove();
            controlBar.prepend(controlBarMarkup);
            counterInstance.element.style.display = 'none';
        };


        /* Countdown callbacks ----------------------------- */

        countdownInstance.onStart = () => {
            countdownInstance.element.setAttribute('style','');
            recordBtn.remove();
            controlBar.prepend(cancelBtn);
            countdownInstance.element.style.display = 'block';
            counterInstance.element.style.display = "block";
        };

        countdownInstance.beforeChange = () => {
            if(countdownInstance.timeLeft <= 1){
                countdownInstance.element.style.display = 'none';
                cancelBtn.remove();
                counterInstance.start();
            }
        };

        countdownInstance.onReset = () => {
            countdownInstance.element.setAttribute('style','');
        };


        /* Control bar ----------------------------- */

        const controlBarMarkup = document.createElement('div');
        controlBarMarkup.classList.add('grid','grid--on-xs');
        controlBarMarkup.innerHTML = `
            <div class="grid__col--12">
                <button class="btn btn--style--accent btn--size--lg btn--fluid">
                    <i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                    <span class="btn__text">Сохранить</span>
                </button>
            </div>
            <div class="grid__col--12 grid__col--md--6">
                <button class="btn btn--style--primary-lighter btn--size--lg btn--fluid" id="record-overwrite">
                    <i class="icon icon--size--lg icon--camera-48 btn__icon"></i>
                    <span class="btn__text">Переснять</span>
                </button>
            </div>
            <div class="grid__col--12 grid__col--md--6">
                <button class="btn btn--style--primary-lighter btn--size--lg btn--fluid" id="record-cancel">
                    <i class="icon icon--size--lg icon--close-48 btn__icon"></i>
                    <span class="btn__text">Отменить</span>
                </button>
            </div>
        `;

        const overwriteBtn = controlBarMarkup.querySelector('#record-overwrite');
        const cancelRecord = controlBarMarkup.querySelector('#record-cancel');

        overwriteBtn.addEventListener('click', () => {
            controlBarMarkup.remove();
            countdownInstance.reset();
            counterInstance.reset();
            countdownInstance.start();
            VideoRecorder.reset(recorderInstance);
        });

        cancelRecord.addEventListener('click', async () => {
            controlBarMarkup.remove();
            countdownInstance.reset();
            counterInstance.reset();
            counterInstance.element.style.display = '';
            controlBar.prepend(recordBtn);
            await VideoRecorder.reset(recorderInstance);

            if(initialSrc) rollbackVideoElem();
        })
    }
};