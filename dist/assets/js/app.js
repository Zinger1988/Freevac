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
                    if(input.value.trim().length || input.placeholder.trim().length){
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
        if(!title.classList.contains('input-row__title--focus') && !input.readOnly && !input.disabled){
            input.focus();
            InputFocus.minifyTitle(title);
        }
    }

    static blur({input, title}) {
        if(!input.value.trim().length && !input.placeholder.length && !input.readOnly && !input.disabled){
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
    constructor(element) {
        this.element = element;
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
        };
        this.callbacks = {
            onPlay: () => {},
            onPause: () => {},
            onStop: () => {},
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

    static onPlay(instance, cb) {
        instance.callbacks.onPlay = cb;
    }

    static onStop(instance, cb) {
        instance.callbacks.onStop = cb;
    }

    static onPause(instance, cb) {
        instance.callbacks.onPause = cb;
    }

    static async play(instance){
        const {element, controls: {playBtn}} = instance;

        element.play();
        playBtn.classList.remove('video-player__play--paused');
        playBtn.classList.add('video-player__play--active');

        instance.state.isPaused = false;
        instance.callbacks.onPlay();
    }

    static pause(instance){
        const {element, controls: {playBtn}} = instance;

        element.pause();
        playBtn.classList.add('video-player__play--paused');
        playBtn.classList.remove('video-player__play--active');

        instance.state.isPaused = true;
        instance.callbacks.onPause();
    }

    static stop(instance){
        const {element} = instance;

        Video.pause(instance);
        element.currentTime = 0;
        instance.callbacks.onStop();
    }

    static mute(instance){
        let {element, controls: {soundBtn}} = instance;

        element.muted = true;
        soundBtn.classList.add('icon--soundoff-24');
        soundBtn.classList.remove('icon--soundon-24');

        instance.state.isMuted = true;
    }

    static unmute(instance){
        let {element, controls: {soundBtn}} = instance;

        element.muted = false;
        soundBtn.classList.remove('icon--soundoff-24');
        soundBtn.classList.add('icon--soundon-24');

        instance.state.isMuted = false;
    }

    static setHandlers(instance){
        let {element, controls: {playBtn, soundBtn}} = instance;

        playBtn.addEventListener('click', async () => {
            if(instance.state.isPaused){
                await Video.play(instance);
            } else {
                Video.pause(instance);
            }
        })

        soundBtn.addEventListener('click', () => {
            if(instance.state.isMuted){
                Video.unmute(instance);
            } else {
                Video.mute(instance);
            }
        })

        element.addEventListener('ended', () => {
            playBtn.classList.add('video-player__play--paused');
            playBtn.classList.remove('video-player__play--active');
            instance.state.isPaused = true;
            instance.callbacks.onStop();
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
            },
            NotReadableError: {
                title: 'Oй...',
                text: `Не можем подключиться к твоей камере`
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

    static preventScroll(e){
        if(!e.target.classList.contains('.modal__main') && !e.target.closest('.modal__main')){
            e.preventDefault()
        }
    }

    constructor(modalSelector) {
        Modal.modalElements = Array.from(document.querySelectorAll(modalSelector));
        Modal.modalOverlay.id = 'modal-overlay';
        Modal.setHandlers();
        Modal.callbacks = {
            onHide: (activeModal) => {
                if(activeModal.querySelector('.form')){
                    SiteJS.formReset(activeModal.querySelector('.form'));
                }
            },
        }
    }

    static bindButton(buttonEl) {
        buttonEl.addEventListener('click', () => {
            if(Modal.activeModal){
                Modal.hide();
            }
            const modalId = buttonEl.getAttribute('data-modal-id');
            Modal.show(modalId);
            Modal.showOverlay();
        })
    }

    static setHandlers(){
        const modalButtons = document.querySelectorAll('[data-modal-id]');

        modalButtons.forEach(button => {
            Modal.bindButton(button);
        });

        Modal.modalOverlay.addEventListener('click', (e) => {
            Modal.callbacks.onHide(Modal.activeModal);
            Modal.hide();
            Modal.hideOverlay();

        })

        Modal.modalElements.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if(e.target.classList.contains('modal-close') || e.target.closest('.modal-close')){
                    Modal.hide();
                    Modal.hideOverlay();
                    // Modal.callbacks.onHideBtnClick(Modal.activeModal);
                }
            })

            const modalMain = modal.querySelector('.modal__main');

            function preventModalScroll(e){

                let scrollTo = null;
                e.stopPropagation();

                if (e.type === 'wheel') {
                    scrollTo = (e.wheelDelta * -1);
                }

                if (scrollTo) {
                    e.preventDefault();
                    this.scrollTo({
                        top: scrollTo + this.scrollTop,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
            }

            // modalMain.addEventListener("wheel", preventModalScroll);
        });
    }

    static showOverlay(){
        const overlay = document.querySelector('#modal-overlay');
        if(overlay) return;

        document.body.append(Modal.modalOverlay);
        // window.addEventListener("wheel", Modal.preventScroll, {passive: false});
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
        // window.removeEventListener("wheel", Modal.preventScroll, {passive: false});

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
        const modalMain = Modal.activeModal.querySelector('.modal__main');

        if(modalMain.scrollTop > 0){
            modalMain.scrollTo({
                top: scrollTo + modalMain.scrollTop,
                left: 0,
                behavior: 'smooth'
            });
        }

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

class Validation {
    constructor(element) {
        this.element = element;
        this.validityChecks = [];
        this.invalidities = [];
        this.invaliditiesElements = [];
    }

    init() {
        this.setHandler(this.element, 'validation')
    }

    setHandler(element, text) {
        if (element.tagName.toLowerCase() !== 'select') {
            element.addEventListener('keyup', (e) => {
                e.preventDefault();
                console.log(text)
                this.checkValidity(element)
            })
        } else {
            element.addEventListener('change', (e) => {
                e.preventDefault();
                console.log(text)
                this.checkValidity(element)
            })
        }
    }

    checkValidity(element) {
        this.clearInvalidities(element);

        if (!this.element.disabled) {
            this.validityChecks.forEach(check => {
                if (check.isInvalid(this.element)) {
                    this.addInvalidity(check.invalidityMessage);
                }
            })

            if (this.invalidities.length) {
                this.element.classList.add('invalid');
                this.element.classList.remove('valid');

                this.createInvalidityElements(this.invalidities);
                this.showInvalidityElements(this.invaliditiesElements);

                return false

            } else {
                this.element.classList.add('valid');
                this.element.classList.remove('invalid');
            }
        }
    }

    createInvalidityElements(invalidities) {
        invalidities.forEach(invalidity => {
            const message = document.createElement('div');
            message.classList.add('error-message');
            message.textContent = invalidity;

            this.invaliditiesElements.push(message);
        })
    }

    showInvalidityElements(elements) {
        elements.forEach(item => this.element.after(item))
    }

    clearInvalidities() {
        this.invaliditiesElements.forEach(element => element.remove());
        this.invaliditiesElements = [];
        this.invalidities = [];
        this.element.classList.remove('invalid');
        this.element.classList.remove('valid');
    }

    addValidityChecks(check) {
        this.validityChecks.push(...check)
    }

    addInvalidity(message) {
        this.invalidities.push(message)
    }

    getStatus() {
        return this.invalidities.length ? 'invalid' : 'valid'
    }
}

class TalkBubbles{
    constructor(element, timeout) {
        this.$wrapper = null;
        this.$list = null;
        this.$bubbles = null;
        this.$typeMarker = null;
        this.timeout = timeout;
        this.init(element);
        this.isDone = false;
        this.events = {
            talkBubblesDone: new Event('talkBubblesDone')
        }
        this.on = function (eventName, callback) {
            this.$wrapper.addEventListener(eventName, callback);
        }
    }

    init = function(element){
        try {
            this.$wrapper = element;
            this.$wrapper.TalkBubbles = this;
            this.$list = this.$wrapper.querySelector('.talk-bubbles__list');
            this.$bubbles = this.$list.querySelectorAll('.talk-bubbles__item');
        } catch (e) {
            console.error('TalkBubbles: invalid starter markup');
        }

        this.createTypeMarker();
    }

    restart = function (){
        this.$bubbles.forEach(item => item.classList.remove('talk-bubbles__item--visible'));
        this.$typeMarker.classList.remove('talk-bubbles__type-marker--hidden');
        this.$list.style.height = this.$typeMarker.offsetHeight + 'px';
        this.animateBubbles(Array.from(this.$bubbles), 2000);
    }

    createTypeMarker = function(){
        this.$typeMarker = document.createElement('div');
        this.$typeMarker.classList.add('talk-bubbles__type-marker');
        this.$typeMarker.innerHTML = `
                    <i class="talk-bubbles__marker-point">1</i>
                    <i class="talk-bubbles__marker-point">2</i>
                    <i class="talk-bubbles__marker-point">3</i>`;
        this.$wrapper.append(this.$typeMarker);
        this.$list.style.height = this.$typeMarker.offsetHeight + 'px';
    }

    animate = function(bubbles = Array.from(this.$bubbles)){
        const bubble = bubbles[0];
        const bubbleMargin = parseInt(window.getComputedStyle(bubble).marginBottom);

        bubble.classList.add('talk-bubbles__item--visible');
        this.$list.style.height = parseInt(this.$list.style.height) + bubble.offsetHeight + bubbleMargin + 'px';

        if(bubbles.length === 1){
            this.$list.style.height = parseInt(this.$list.style.height) - this.$typeMarker.offsetHeight + 'px';
            this.$typeMarker.classList.add('talk-bubbles__type-marker--hidden');

            window.addEventListener('resize', () => {
                this.$list.style = '';
            }, {once: true})

            this.isDone = true;
            this.$wrapper.dispatchEvent(this.events.talkBubblesDone);
            return;
        }

        setTimeout(() => {
            this.animate(bubbles.slice(1), this.timeout)
        }, this.timeout)
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
            elementId: 'take-video-balloon',
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
        this.moveElement({
            elementId: 'onoborading-exit',
            targetId: 'onboarding-controls',
            mediaQuery: 'max-width: 991px',
            insertionMethod: function (element, target) {
                target.append(element);
            }
        });
        this.expandTextarea('.input-text--textarea');
        this.recordVideo('.video-record');
        this.completeInput('[data-complete-input]','[data-complete-group]');
        this.smoothScroll('[data-scroll-to]');
        this.copyToClipboard('.freevak-link-copy', '#freevak-link');
        this.inputFile('.input-row--file','.input-row__input-file','.input-row__input-text');
        this.tabs();
        this.replaceElements();
        this.videoPlayer();
        this.typeDisplay();
        this.fileAddImage();
        this.onScrollToElement({
            selector: '#steps-tile',
            onReaching(element){
                const stepsFixed = document.querySelector('.sticky-note');
                if(!stepsFixed) return;
                stepsFixed.classList.add('active');
            },
            onLeaving(element){
                const stepsFixed = document.querySelector('.sticky-note');
                if(!stepsFixed) return;
                stepsFixed.classList.remove('active');
            }
        });
        this.recordReply();
        this.vacancyDetails();

        if(document.querySelector('.reply-slider')){

            const replySlider = new Swiper('.reply-slider', {
                allowTouchMove: false,
                loop: false,
                slidesPerView: 'auto',
                breakpoints: {
                    320: {
                        spaceBetween: 8,
                    },
                    992: {
                        spaceBetween: 16,
                        centeredSlides: true,
                    }
                },
                on: {
                    init: function (swiper) {
                        swiper.$el[0].setAttribute('data-active-index', swiper.activeIndex);

                        const nextBtn = swiper.$el[0].querySelector('.reply-slider__slide-next');
                        const videoEl = swiper.slides[swiper.activeIndex].querySelector('.reply-video-record');
                        nextBtn.disabled = swiper.activeIndex !== 0 && !(videoEl && videoEl.src);
                    },
                    slideChange: function (swiper) {
                        swiper.$el[0].setAttribute('data-active-index', swiper.activeIndex);

                        const nextBtn = swiper.$el[0].querySelector('.reply-slider__slide-next');
                        const videoEl = swiper.slides[swiper.activeIndex].querySelector('.reply-video-record');

                        nextBtn.disabled = swiper.activeIndex !== 0 && !(videoEl && videoEl.src);
                    }
                }
            })

            const replySliderNested = new Swiper('.reply-slider-nested', {
                allowTouchMove: false,
                loop: false,
                slidesPerView: 'auto',
                breakpoints: {
                    320: {
                        spaceBetween: 8,
                        autoHeight: true,
                    },
                    992: {
                        spaceBetween: 16,
                        autoHeight: false,
                    },
                    1210: {
                        spaceBetween: 32,
                    }
                },
                on: {
                    init: function (swiper) {
                        replySlider.$el[0].setAttribute('data-active-index-nested', swiper.activeIndex)
                    },
                    slideChange: function (swiper) {
                        replySlider.$el[0].setAttribute('data-active-index-nested', swiper.activeIndex)
                    }
                }
            })

            const slideNextBtn = replySlider.$el[0].querySelector('.reply-slider__slide-next');
            const slidePrevBtn = replySlider.$el[0].querySelector('.reply-slider__slide-prev');

            slideNextBtn.addEventListener('click', () => {

                if(replySlider.activeIndex + 2 === replySlider.slides.length){
                    slideNextBtn.classList.add('reply-slider__nav-btn--collapsed');
                }
                replySlider.slideNext();
            });

            slidePrevBtn.addEventListener('click', () => {
                slideNextBtn.classList.remove('reply-slider__nav-btn--collapsed')

                if(replySlider.activeIndex === 0){
                    replySliderNested.slidePrev();
                }

                replySlider.slidePrev();
            });

            const nestedSlideNextBtn = replySliderNested.$el[0].querySelector('.reply-slider-nested__slide-next');
            const parentSlideNextBtn = replySliderNested.$el[0].querySelector('.reply-slider-nested__slide-next-parent');

            nestedSlideNextBtn.addEventListener('click', () => {
                replySliderNested.slideNext();
            });

            parentSlideNextBtn.addEventListener('click', () => {
                replySlider.slideNext();
            });
        }

        if(document.querySelector('.reviews-section__slider')){
            const reviewsSlider = new Swiper('.reviews-section__slider', {
                loop: false,
                slidesPerView: 2,
                navigation: {
                    nextEl: '.reviews-section__nav-item--right',
                    prevEl: '.reviews-section__nav-item--left',
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 7
                    },
                    600: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    }
                }
            });
        }

        if(document.querySelector('.hiw-section__slider')){
            const hiwSlider = new Swiper('.hiw-section__slider', {
                loop: false,
                slidesPerView: 'auto',
                slidesPerGroup: 1,
                spaceBetween: 16,
                navigation: {
                    nextEl: '.hiw-section__nav-item--right',
                    prevEl: '.hiw-section__nav-item--left',
                }
            });
        }

        if(document.querySelector('.video-slider')){
            const videoSlider = new Swiper('.video-slider', {
                effect: 'flip',
                pagination: {
                    el: '.video-slider__pagination',
                    type: 'bullets',
                },
                loop: false
            });

            let previousSlideIndex = videoSlider.activeIndex;

            const label = document.createElement('div');
            label.classList.add('swiper-label');
            label.innerText = `${videoSlider.activeIndex + 1} / ${videoSlider.slides.length}`;
            videoSlider.el.prepend(label);


            videoSlider.on('slideChange', function () {
                const previousSlide = videoSlider.slides[previousSlideIndex];
                const previousVideoElem = previousSlide.querySelector('.video-player');
                const currentSlide = videoSlider.slides[videoSlider.activeIndex];
                const currentVideoElem = currentSlide.querySelector('.video-player');

                label.innerText = `${videoSlider.activeIndex + 1} / ${videoSlider.slides.length}`;

                if(!previousVideoElem.Video.state.isMuted){
                    Video.unmute(currentVideoElem.Video);
                } else {
                    Video.mute(currentVideoElem.Video);
                }

                if(!previousVideoElem.Video.state.isPaused){
                    Video.play(currentVideoElem.Video);
                }

                Video.stop(previousVideoElem.Video);

                previousSlideIndex = videoSlider.activeIndex;
            });

            videoSlider.pagination.bullets.forEach(bullet => {
                const progressBar = document.createElement('div');
                progressBar.classList.add('bullet-progress');

                bullet.prepend(progressBar);
            })

            videoSlider.slides.forEach((slide, i) => {
                const videoEl = slide.querySelector('.video-player');
                const currentBullet = videoSlider.pagination.bullets[i];
                const progressBar = currentBullet.querySelector('.bullet-progress');

                videoEl.addEventListener('ended', () => {
                    if(videoSlider.activeIndex !== videoSlider.slides.length -1) {
                        videoSlider.slideNext();

                        const activeVideoEl = videoSlider.slides[videoSlider.activeIndex].querySelector('.video-player');
                        Video.play(activeVideoEl.Video);
                    }else{
                        videoSlider.slideTo(0);
                    }
                });

                Video.onPlay(videoEl.Video, function () {
                    console.log('video play, slide ' + i);
                    progressBar.style.animationDuration = videoEl.getAttribute('data-duration') + 's';
                    progressBar.style.animationPlayState = 'running';
                    progressBar.classList.add('bullet-progress--active');
                })
                Video.onPause(videoEl.Video, function () {
                    console.log('video pause, slide ' + i);
                    progressBar.style.animationPlayState = 'paused';
                })
                Video.onStop(videoEl.Video, function () {
                    console.log('video stop, slide ' + i);
                    progressBar.style = "";
                    progressBar.classList.remove('bullet-progress--active');
                })
            })
        }

        if(document.querySelector('.onboarding-slider')){
            const slider = document.querySelector('.onboarding-slider');
            const progressBar = slider.querySelector('.onboarding-slider__progress-inner');
            const onboardingSlider = new Swiper(slider, {
                allowTouchMove: false,
                loop: false,
                slidesPerView: 1,
                effect: 'fade',
                on: {
                    afterInit: function (swiper) {
                        const index = swiper.activeIndex;
                        const slides = swiper.slides;
                        initTalkBubbles(slides[index]);
                        progressBar.style.width = ((index + 1) / slides.length * 100).toFixed(2) + '%';
                    },
                },
            });


            onboardingSlider.on('slideChange', function (swiper) {
                const index = swiper.activeIndex;
                const slides = swiper.slides;
                initTalkBubbles(slides[index]);
                progressBar.style.width = ((index + 1) / slides.length * 100).toFixed(2) + '%';
            });

            onboardingSlider.on('slideChangeTransitionEnd', function (swiper) {
                const previousIndex = swiper.previousIndex;
                const slides = swiper.slides;

                slides[previousIndex].style.height = '0';
            });

            onboardingSlider.on('slideChangeTransitionStart', function (swiper) {
                const activeIndex = swiper.activeIndex;
                const slides = swiper.slides;

                slides[activeIndex].style.height = '';
            });

            function initTalkBubbles(wrapper){
                if(!wrapper.querySelector('.talk-bubbles') || wrapper.querySelector('.talk-bubbles').TalkBubbles){
                    return;
                }

                const bubbles = wrapper.querySelector('.talk-bubbles');
                const bubblesInstanse = new TalkBubbles(bubbles, 1500);
                bubblesInstanse.animate();
                bubblesInstanse.on('talkBubblesDone', (e) => {
                    const activeSlide = onboardingSlider.slides[onboardingSlider.activeIndex];
                    activeSlide.querySelector('.onboarding-slider__btn--next').disabled = false;
                });
            }

            const nextBtn = document.querySelectorAll('.onboarding-slider__btn--next');
            const prevBtn = document.querySelectorAll('.onboarding-slider__btn--prev');

            nextBtn.forEach(btn => {
                btn.addEventListener('click', () => {
                    onboardingSlider.slideNext();
                })
            })

            prevBtn.forEach(btn => {
                btn.addEventListener('click', () => {
                    onboardingSlider.slidePrev();
                })
            })
        }

        // form validations

        this.startValidation({
            formSelector: '#name-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#age-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#location-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#cvv-portfolio-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#position-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#about-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#experience-edit-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#experience-add-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#phone-form',
            cb: () => {alert('valid')}
        });

        this.startValidation({
            formSelector: '#email-form',
            cb: () => {alert('valid')}
        });
    },
    vacancyDetails: function (){
        const detailsEl = document.querySelector('#vacancy-details');
        const btn = document.querySelector('#show-vacancy-details');

        if(!btn || !detailsEl) {
            return
        }

        const closeDetailsBtn = detailsEl.querySelectorAll('.vacancy-details__close');

        btn.addEventListener('click', toggleDetailsVisibility);
        closeDetailsBtn.forEach(item => {
            item.addEventListener('click', toggleDetailsVisibility)
        });
        detailsEl.addEventListener('click', (e) => {
            if(e.target === e.currentTarget){
                toggleDetailsVisibility();
            }
        })

        function toggleDetailsVisibility(){
            if(detailsEl.classList.contains('vacancy-details--active')){
                detailsEl.classList.remove('vacancy-details--active');
                document.body.classList.remove('no-overflow');
            } else {
                detailsEl.classList.add('vacancy-details--active');
                document.body.classList.add('no-overflow');
            }
        }
    },
    formReset: function(formElement){
        formElement.reset();

        for ( const element of formElement){
            if(element.InputFocusUpdate) element.InputFocusUpdate();
            if(element.customValidation) element.customValidation.clearInvalidities(element);
        }
    },
    startValidation: function({formSelector, cb = () => {}}){

        const formCollection = document.querySelectorAll(formSelector);

        if(!formCollection.length) return;

        formCollection.forEach(formEl => {
            const submitBtnCollection = formEl.querySelectorAll('[data-validation-btn]');

            submitBtnCollection.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.appendValidation(formEl, cb);
                })
            })
        })
    },
    appendValidation(formElement, cb) {

        const formControls = formElement.querySelectorAll('[data-validation]');

        // Validity checks
        const validityChecks = {
            empty: [
                {
                    isInvalid(elem) {
                        if (elem.tagName.toLowerCase() == 'select') {
                            this.invalidityMessage = 'Выберите один из пунктов';
                        } else {
                            this.invalidityMessage = 'Это поле не должно быть пустым';
                        }
                        return !elem.value;
                    },
                    invalidityMessage: '',
                }
            ],
            age: [
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/[^0-9]/g);
                        return !!illegalCharacters;
                    },
                    invalidityMessage: 'В это поле можно вводить только цифры'
                }
            ],
            email: [
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g);
                        return elem.value && !illegalCharacters;
                    },
                    invalidityMessage: 'Укажите корректный e-mail'
                }
            ],
            password: [
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/[0-9]/g);
                        return elem.value && !illegalCharacters;
                    },
                    invalidityMessage: 'At least 1 number is required'
                },
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/[a-z]/g);
                        return elem.value && !illegalCharacters;
                    },
                    invalidityMessage: 'At least 1 lowercase letter is required'
                },
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/[A-Z]/g);
                        return elem.value && !illegalCharacters;
                    },
                    invalidityMessage: 'At least 1 uppercase letter is required'
                },
                {
                    isInvalid(elem) {
                        return elem.value && elem.value.length < 8;
                    },
                    invalidityMessage: 'Password is to short, at least 8 characters required'
                }
            ],
            passwordRepeat: [
                {
                    isInvalid(elem) {
                        const password = formElement.querySelector('[name="password"]');
                        return elem.value && password.value !== elem.value;
                    },
                    invalidityMessage: 'This password needs to match the first one'
                }
            ],
            tel: [
                {
                    isInvalid(elem) {
                        let illegalCharacters = elem.value.match(/[^0-9+()]/g);
                        return !!illegalCharacters;
                    },
                    invalidityMessage: 'Недопустимые символы. Только цифры, знак плюс "+" и круглые скобки "()"'
                }
            ],
        }


        // applying Validation class and binding checks for inputs by data attribute
        formControls.forEach(element => {
            if(!element.customValidation){
                element.customValidation = new Validation(element);
                element.customValidation.init()

                const validationPattern = element.getAttribute('data-validation');

                element.customValidation.addValidityChecks(validityChecks.empty);

                switch (validationPattern) {
                    case 'name':
                        element.customValidation.addValidityChecks(validityChecks.name);
                        break;
                    case 'zip':
                        element.customValidation.addValidityChecks(validityChecks.zip);
                        break;
                    case 'tel':
                        element.customValidation.addValidityChecks(validityChecks.tel);
                        break;
                    case 'cc-number':
                        element.customValidation.addValidityChecks(validityChecks.ccNumber);
                        break;
                    case 'cc-exp':
                        element.customValidation.addValidityChecks(validityChecks.ccExp);
                        break;
                    case 'age':
                        element.customValidation.addValidityChecks(validityChecks.age);
                        break;
                    case 'date':
                        element.customValidation.addValidityChecks(validityChecks.date);
                        break;
                    case 'email':
                        element.customValidation.addValidityChecks(validityChecks.email);
                        break;
                    case 'password':
                        element.customValidation.addValidityChecks(validityChecks.password);
                        break;
                    case 'password-repeat':
                        element.customValidation.addValidityChecks(validityChecks.passwordRepeat);
                        break;
                }
            }
        });

        // Checking inputs when form going to be submitted
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();

            formControls.forEach(element => {
                element.customValidation.checkValidity()
            });

            const invalidElements = Array.from(formControls).some(element => element.customValidation.getStatus() === 'invalid');

            if (!invalidElements) {
                cb();
            }
        }, {once: true})
    },
    fileAddImage: function(){
        const wrapper = document.querySelectorAll('.add-file');

        wrapper.forEach(item => {

            const inputFile = item.querySelector('.add-file__control');
            const fileListOutput = item.querySelector(`.add-file__img-holder`);
            const clearFile = item.querySelector('.add-file__clear');
            const inputText = item.querySelector('.add-file__input-text');

            inputFile.addEventListener('change', () => {

                fileListOutput.classList.remove('error');
                fileListOutput.innerHTML = '';

                for(let i = 0; i < inputFile.files.length; i++){

                    const elem = document.createElement('div');
                    elem.innerHTML = `<img src="" class="add-file__img" alt="image">`;

                    const reader = new FileReader();
                    reader.onload = function(){
                        const dataURL = reader.result;
                        const output = elem.querySelector('.add-file__img');
                        output.src = dataURL;
                    };

                    reader.onerror = function (event) {
                        fileListOutput.innerHTML = "";
                        fileListOutput.classList.add('error');
                        elem.innerHTML = `<div class="add-file_error">An error occurred during the operation. Aborting</div>`;
                        reader.abort();
                    };

                    reader.readAsDataURL(inputFile.files[i]);

                    fileListOutput.prepend(elem);
                }
            })

            if(clearFile) {
                clearFile.addEventListener('click', (e) => {
                    e.preventDefault();
                    fileListOutput.classList.remove('error');
                    fileListOutput.innerHTML = '';
                    inputFile.value = '';
                    inputText.value = '';
                })
            }

        })
    },
    onScrollToElement({selector, onReaching = () => undefined, onLeaving = () => undefined}){
        const elementCollection = document.querySelectorAll(selector);

        if(!elementCollection.length){
            return
        }

        elementCollection.forEach(element => {
            let isElementReached = false;

            window.addEventListener('scroll', () => {
                if(window.scrollY - element.offsetTop - element.offsetHeight > 150 && !isElementReached){
                    isElementReached = true;
                    onReaching(element);
                }

                if(window.scrollY - element.offsetTop - element.offsetHeight < 150 && isElementReached){
                    isElementReached = false;
                    onLeaving(element)
                }
            })
        })
    },
    typeDisplay() {
        if ("ontouchstart" in document.documentElement) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('hover-device');
        }
    },
    videoPlayer(){
        const players = document.querySelectorAll('.video-player');

        if(!players.length) return;

        players.forEach(player => new Video({element: player}).init())
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

                    e.stopPropagation();
                    const prevElement = elem.previousElementSibling;

                    if(prevElement){
                        prevElement.replaceWith(elem);
                        elem.after(prevElement);
                        this.alert('Порядок видео изменен','success').start
                    }
                })

                arrowRight.addEventListener('click', (e) => {

                    e.stopPropagation();
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
                const elementID = element.getAttribute('data-tab-content-id');
                const formFields = element.querySelectorAll('.input-text, .input-text--textarea, .input-row__input-file');

                if(anchorTarget === elementID){
                    element.style = '';
                    formFields.forEach(field => field.disabled = false);
                } else {
                    element.style.display = 'none';
                    formFields.forEach(field => field.disabled = true);
                }
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

        if(!wrappers.length) return

        wrappers.forEach(item => {
            const inputFile = item.querySelector(inputFileSelector);
            const inputText = item.querySelector(inputTextSelector);

            if(!inputFile || !inputText) return

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
                if(inputText.customValidation) inputText.customValidation.checkValidity(inputText);
            })
        });
    },
    copyToClipboard(triggerSelector, sourceInputID){
        const triggers = document.querySelectorAll(triggerSelector);
        const sourceInput = document.querySelector(sourceInputID);

        if(!sourceInput) return;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
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
        let timerId = null;

        const resetTargetClass = () => {
            const smoothScrollTargets = document.querySelectorAll('.smooth-scroll-target');

            if(timerId) {
                clearInterval(timerId);
            }

            if(smoothScrollTargets.length){
                smoothScrollTargets.forEach(item => {
                    item.classList.remove('smooth-scroll-target');
                })
            }
        }

        buttons.forEach( btn => {
            const targetId = btn.getAttribute('data-scroll-to');
            const targetElement = document.querySelector(`[data-scroll-id="${targetId}"]`);

            btn.addEventListener('click', (e) => {
                resetTargetClass();
                e.stopPropagation();
                const targetCoords = targetElement.getBoundingClientRect();
                targetElement.classList.add('smooth-scroll-target')

                window.scrollTo({
                    top: targetCoords.top + pageYOffset + 150 - document.documentElement.clientHeight / 2,
                    left: 0,
                    behavior: 'smooth'
                });

                timerId = setTimeout(resetTargetClass, 3500);
            })
        })

        document.addEventListener('click', resetTargetClass);
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
                if(input.customValidation) input.customValidation.checkValidity(input);
            })
        }
    },
    async recordReply(){

        const slides = document.querySelectorAll('.reply-slider__slide--video');
        const sliderNav = document.querySelector('.reply-slider__nav');

        if(slides.length === 0) return;

        slides.forEach(slide => {
            const recordBtn = slide.querySelector('.video-slide__btn--record');
            if(!recordBtn) return;

            recordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                createRecorder(slide, sliderNav);
            })
        })

        async function createRecorder(wrapper, sliderNav){
            const videoWrapper = wrapper.querySelector('.reply-video');
            const videoElement = wrapper.querySelector('.reply-video-record');
            const videoDuration = videoWrapper.getAttribute('data-video-duration');
            const slideNextBtn = sliderNav.querySelector('.reply-slider__slide-next');
            const slidePrevBtn = sliderNav.querySelector('.reply-slider__slide-prev');

            if(!videoElement) return;

            const controlBar = wrapper.querySelector('.reply-video-control-bar');

            const doneBtn = SiteJS.createElement({
                tag: 'button',
                classes: ['btn', 'reply-video__control-bar-btn', 'reply-video-stop', 'btn--size--lg', 'btn--fluid'],
                html: `<i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                    <span class="btn__text">
                        <span class="btn__text--counter-text">Снято</span>
                        <span class="btn__text--counter-value" data-counter="${videoDuration}s"></span>
                    </span>`
            });

            const overwriteBtn = SiteJS.createElement({
                tag: 'button',
                classes: ['btn', 'reply-video__control-bar-btn', 'reply-video-overwrite', 'btn--style--secondary', 'btn--size--lg', 'btn--fluid'],
                html: `<i class="icon icon--size--lg icon--camera-48 btn__icon"></i>
                   <span class="btn__text">Переснять</span>`
            });

            doneBtn.addEventListener('click', () => {
                counterInstance.stop();
            });

            doneBtn.style = `animation-duration: ${videoDuration}s`;
            controlBar.append(doneBtn);

            const counterInstance = new Counter(wrapper.querySelector('.btn__text--counter-value'));

            counterInstance.onStop = () => {
                VideoRecorder.stopRecording(recorderInstance);
                controlBar.innerHTML = "";
                controlBar.append(overwriteBtn);
                slideNextBtn.disabled = false;
                slidePrevBtn.disabled = false;
                counterInstance.reset();
            };

            overwriteBtn.addEventListener('click', async () => {
                slidePrevBtn.disabled = true;
                slideNextBtn.disabled = true;
                controlBar.innerHTML = "";
                const nestedLoader = wrapper.appendChild(loader);
                await VideoRecorder.reset(recorderInstance);
                controlBar.append(doneBtn);

                setTimeout(() => {
                    nestedLoader.remove();
                    VideoRecorder.startRecording(recorderInstance);
                    counterInstance.start();
                }, 500);
            });

            videoWrapper.style = 'display: block';

            let recorderInstance = null;
            let initialSrc = null;

            const loader = SiteJS.createElement({
                tag: 'div',
                classes: ['loader', 'reply-slider__loader'],
                html: `<div class="loader__spinner"></div>`
            });

            if(!videoElement.hasAttribute('src')){
                const nestedLoader = wrapper.appendChild(loader);
                slidePrevBtn.disabled = true;
                recorderInstance = new VideoRecorder({
                    element: videoElement,
                    constraints: {
                        video: {
                            width: {
                                min: 480,
                                max: 1280
                            },
                            height: {
                                min: 480,
                                max: 1280
                            },
                            facingMode: 'user',
                        },
                        audio: true
                    }
                });
                await recorderInstance.init();
                setTimeout(() => {
                    nestedLoader.remove();
                    counterInstance.start();
                    VideoRecorder.startRecording(recorderInstance);
                }, 500);
            }
        }
    },
    async recordVideo(selector){

        const videoElement = document.querySelector(selector);
        if(!videoElement) return;

        let recorderInstance = null;
        let initialSrc = null;

        if(!videoElement.hasAttribute('src')){
            recorderInstance = new VideoRecorder({
                element: videoElement,
                constraints: {
                    video: {
                        width: {
                            min: 480,
                            max: 1280
                        },
                        height: {
                            min: 480,
                            max: 1280
                        },
                        facingMode: 'user',
                    },
                    audio: true
                }
            });
            await recorderInstance.init();
        }

        const controlBar = document.querySelector('#record-control-bar');
        const recordBtn = controlBar.querySelector('#record-btn');
        const counterInstance = new Counter(document.querySelector('#video-counter'));
        const countdownInstance = new Counter(document.querySelector('#video-countdown'));

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

        const controlBarSaveMarkup = `
            <div class="grid__col--12">
                <button class="btn btn--style--accent btn--size--lg btn--fluid" id="save-record">
                    <i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                    <span class="btn__text">Сохранить</span>
                </button>
            </div>
        `;

        const controlBarOverwriteMarkup = `
            <div class="grid__col--12 grid__col--md--6">
                <button class="btn btn--style--primary-lighter btn--size--lg btn--fluid" id="record-overwrite">
                    <i class="icon icon--size--lg icon--camera-48 btn__icon"></i>
                    <span class="btn__text">Переснять</span>
                </button>
            </div>
        `;

        const controlBarCancelMarkup = `
            <div class="grid__col--12 grid__col--md--6">
                <button class="btn btn--style--primary-lighter btn--size--lg btn--fluid" id="record-cancel">
                    <i class="icon icon--size--lg icon--close-48 btn__icon"></i>
                    <span class="btn__text">Отменить</span>
                </button>
            </div>
        `;

        controlBarMarkup.innerHTML = `
            ${controlBarSaveMarkup}
            ${controlBarOverwriteMarkup}
            ${controlBarCancelMarkup}
        `;

        const overwriteBtn = controlBarMarkup.querySelector('#record-overwrite');
        const cancelRecord = controlBarMarkup.querySelector('#record-cancel');
        const saveRecord = controlBarMarkup.querySelector('#save-record');

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

        saveRecord.addEventListener('click', async () => {
            const file = await fetch(videoElement.src)
                .then(res => res.blob())
                .then(blobFile => new File([blobFile], "video.mp4", { type: "video/mpeg" }));

            const loader = document.createElement('div');
            loader.classList.add('video-holder__loader');
            loader.innerHTML = `
                <div class="video-holder__loader">
                    <div class="video-holder__loader-spinner"></div>
                    <div class="video-holder__loader-title">Загружаем видео</div>
                    <div class="video-holder__loader-subtitle">пару минут</div>
                </div>`;

            videoElement.closest('.video-holder').append(loader);

            uploadFile(file);
        })

        function uploadFile(file) {
            const formData = new FormData();

            formData.append('file', file);

            fetch('https://example.com/profile/avatar', {
                method: 'POST',
                body: formData
            })
        }
    }
};