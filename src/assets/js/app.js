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

class RecordStream{
    constructor({videoElementID, constraints}) {
        this.element = document.querySelector(videoElementID);
        this.constraints = constraints;
        this.mediaRecorder = null;
        this.#init();
    }

    static #createPlayBtn(instance){
        instance.playBtn = document.createElement('div');
        const {element, playBtn} = instance;

        playBtn.classList.add('video-canvas__btn');
        this.#setPlayBtnState(playBtn);

        playBtn.addEventListener('click', (e) => {
            element.paused
                ? element.play()
                : element.pause();

            this.#setPlayBtnState(e.currentTarget, element.paused);
        })

        element.before(playBtn);
    }

    static #setPlayBtnState(playBtn, isPaused = true){
        if(isPaused){
            playBtn.classList.remove('video-canvas__btn--active');
            playBtn.classList.add('video-canvas__btn--paused');
        } else {
            playBtn.classList.add('video-canvas__btn--active');
            playBtn.classList.remove('video-canvas__btn--paused');
        }
    }

    static async startRecording(instance){
        let recordStream = null;
        let chunks = [];

        try {
            recordStream = await navigator.mediaDevices.getUserMedia({...instance.constraints, audio: true});
        } catch(err) {
            console.log('The following getUserMedia error occured: ' + err);
        }

        instance.mediaRecorder = new MediaRecorder(recordStream);
        instance.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        const {stream, element, mediaRecorder} = instance;

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { 'type' : 'video/webm; codecs=vp9' });
            chunks = [];

            stream.getTracks().forEach( (track) => track.stop());
            element.srcObject = null;
            element.removeAttribute('autoplay');
            element.src = window.URL.createObjectURL(blob);

            this.#createPlayBtn(instance);

            element.addEventListener('ended', () => {
                this.#setPlayBtnState(instance.playBtn);
            });
        }

        mediaRecorder.start();
    }

    static stopRecording(instance){
        instance.mediaRecorder.stop();
    }

    async #init() {
        this.element.RecordStream = this;
        await RecordStream.getStream(this)
        await RecordStream.bindStream(this);
    }

    static async reset(instance){
        const {element} = instance;
        let {playBtn} = instance;

        element.srcObject = null;
        element.setAttribute('autoplay', '');
        element.removeAttribute('controls');
        element.src = '';

        playBtn.remove();
        playBtn = null;

        await RecordStream.getStream(instance)
        await RecordStream.bindStream(instance);
    }

    static async getStream(instance){
        const {constraints} = instance;

        try {
            instance.stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch(err) {
            console.log('The following getUserMedia error occured: ' + err);
        }
    }

    static async bindStream(instance){
        const {stream, element} = instance;
        element.srcObject = await stream;
        element.play();
    }
}

const SiteJS = {
    onload: document.addEventListener('DOMContentLoaded', function () {
        SiteJS.init();
    }),
    init: function () {
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
        this.modal();
        this.recordVideo();
    },
    createButton: function({tag, classes, html}) {
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
                    hideModal(e.target);
                }
            });
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
                    modalElement.style.backgroundColor = `rgba(0,0,0, ${alpha += 0.1})`;
                }
            }, 20);
        }

        function modalAnimationOut(modalElement) {
            const modalHolder = modalElement.querySelector('.modal__holder');
            modalHolder.classList.remove('visible');

            let alpha = 0.56;

            const timer = setInterval(() => {
                if (alpha <= 0.1){
                    clearInterval(timer);
                    modalElement.classList.remove('visible');
                } else {
                    modalElement.style.backgroundColor = `rgba(0,0,0, ${alpha -= 0.1})`;
                }
            }, 20);
        }
    },
    recordVideo(){
        new RecordStream({
            videoElementID: '#live-stream',
            constraints: {
                video: {
                    width: {
                        min: 480,
                        ideal: 780,
                        max: 1080,
                    },
                    height: {
                        min: 640,
                        ideal: 1360,
                        max: 1920,
                    },
                    facingMode: 'user'
                }
            }
        });
        new Counter('#video-counter');
        new Counter('#video-countdown');

        const actionList = document.querySelector('#action-list');
        const controlBar = document.querySelector('#record-control-bar');
        const recordBtn = controlBar.querySelector('#record-btn');
        const recordStream = document.querySelector('#live-stream').RecordStream;
        const videoCounter = document.querySelector('#video-counter').Counter;
        const countdownCounter = document.querySelector('#video-countdown').Counter;

        const doneBtn = this.createButton({
            tag: 'button',
            classes: ['btn', 'btn--style--accent', 'btn--size--lg', 'btn--fluid'],
            html: `<i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                   <span class="btn__text">Снято</span>`
        });

        const cancelBtn = this.createButton({
            tag: 'button',
            classes: ['btn', 'btn--style--primary-lighter', 'btn--size--lg', 'btn--fluid'],
            html: `<i class="icon icon--size--lg icon--arrowleft-48 btn__icon"></i>
                   <span class="btn__text">Отмена</span>`
        });

        doneBtn.addEventListener('click', (e) => videoCounter.stop());

        cancelBtn.addEventListener('click', (e) => {
            e.currentTarget.remove();
            controlBar.prepend(recordBtn);
            countdownCounter.reset();
        });

        recordBtn.addEventListener('click',  (e) => {
            countdownCounter.start();
        });


        /* videoCounter callbacks ----------------------------- */

        videoCounter.onStart = () => {
            RecordStream.startRecording(recordStream);
            controlBar.prepend(doneBtn);
        };

        videoCounter.onStop = () => {
            RecordStream.stopRecording(recordStream);
            doneBtn.remove();
            controlBar.prepend(controlBarMarkup);
            videoCounter.element.style.display = 'none';
        };


        /* Countdown callbacks ----------------------------- */

        countdownCounter.onStart = () => {
            countdownCounter.element.setAttribute('style','');
            recordBtn.remove();
            controlBar.prepend(cancelBtn);
            countdownCounter.element.style.display = 'block';
            actionList.style.display = 'none';
        };

        countdownCounter.beforeChange = () => {
            if(countdownCounter.timeLeft <= 1){
                countdownCounter.element.style.display = 'none';
                cancelBtn.remove();
                videoCounter.start();
            }
        };

        countdownCounter.onReset = () => {
            countdownCounter.element.setAttribute('style','');
            actionList.style.display = '';
        };


        /* Control bar ----------------------------- */

        const controlBarMarkup = document.createElement('div');
        controlBarMarkup.classList.add('grid','grid--on-xs');
        controlBarMarkup.innerHTML = `
            <div class="grid__col--12">
                <button class="btn btn--style--accent btn--size--lg btn--fluid">
                    <i class="icon icon--size--lg icon--check-48 btn__icon"></i>
                    <span class="btn__text">Сохранить видео</span>
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
            countdownCounter.reset();
            videoCounter.reset();
            countdownCounter.start();
            RecordStream.reset(recordStream);
            videoCounter.element.style.display = '';
        });

        cancelRecord.addEventListener('click', () => {
            controlBarMarkup.remove();
            countdownCounter.reset();
            videoCounter.reset();
            RecordStream.reset(recordStream);
            videoCounter.element.style.display = '';
            actionList.style.display = '';
            controlBar.prepend(recordBtn);
        })
    }
};