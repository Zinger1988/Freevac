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
            onStop: []
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

    static init(){
        this.element.Counter = this;
        this.element.textContent = `${Counter.getZero(Math.floor(this.counterValue / 60))}:${Counter.getZero(this.counterValue % 60)}`;
    }

    static getZero(value) {
        return value >= 10 ? value: '0' + value;
    }

    start() {
        if(this.isCountdown) return;

        this.reset();
        this.isCountdown = true;
        this.timer = setInterval(() => {
            if(this.timeLeft > 0){
                this.timeLeft -= 1;
                this.element.textContent = `${Counter.getZero(Math.floor(this.timeLeft / 60))}:${Counter.getZero(this.timeLeft % 60)}`;
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
        this.element.textContent = `${Counter.getZero(Math.floor(this.counterValue / 60))}:${Counter.getZero(this.counterValue % 60)}`;
        this.isCountdown = false;
        clearInterval(this.timer);

        this.eventsCb.onReset.forEach(cb => cb())
    }
}

class RecordStream{
    constructor({videoElementID, constraints}) {
        this.element = document.querySelector(videoElementID);
        this.constraints = constraints;
        this.stream = null;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.#init();
    }

    static async startRecording(instance){

        instance.isRecording = true;

        console.log('record started');
        let stream = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia({...instance.constraints, audio: true});
        } catch(err) {
            console.log('The following getUserMedia error occured: ' + err);
        }

        instance.mediaRecorder = new MediaRecorder(stream);

        instance.chunks = [];

        instance.mediaRecorder.ondataavailable = function(e) {
            console.log('data available')
            instance.chunks.push(e.data);
        }

        instance.mediaRecorder.onstop = function (e) {

            console.log('mediaRecorder stopped');

            const blob = new Blob(instance.chunks, { 'type' : 'video/webm; codecs=vp9' });
            instance.chunks = [];

            instance.stream.getTracks().forEach(function(track) {
                track.stop();
            });

            instance.element.srcObject = null;

            instance.element.removeAttribute('autoplay');
            instance.element.setAttribute('controls','');
            instance.element.src = window.URL.createObjectURL(blob);
        }

        instance.mediaRecorder.start();
    }

    static stopRecording(instance){
        console.log('record stopped');

        instance.isRecording = false;
        instance.mediaRecorder.stop();
    }

    async #init() {
        this.element.RecordStream = this;
        await RecordStream.getStream(this)
        await RecordStream.bindStream(this);
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

        /* record stream */

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
        const videoElem = document.querySelector('#live-stream').RecordStream;

        /* counter */

        new Counter('#video-counter');
        const counter = document.querySelector('#video-counter').Counter;

        counter.onStart = function () {
            RecordStream.startRecording(videoElem)
        }

        counter.onStop = function () {
            RecordStream.stopRecording(videoElem)
        }

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
        const videoElem = document.querySelector('#live-stream').RecordStream;
        const counter = document.querySelector('#video-counter').Counter;
        const recordBtn = document.querySelector('#record-btn');
        const recordBtnIcon = recordBtn.querySelector('.btn__icon');
        const recordBtnText = recordBtn.querySelector('.btn__text');

        recordBtn.addEventListener('click', function () {
            if(videoElem.isRecording){
                recordBtnIcon.classList.remove('icon--check-48');
                recordBtnIcon.classList.add('icon--camera-48');
                recordBtnText.textContent = 'Снять';
                counter.stop();
            } else {
                recordBtnIcon.classList.remove('icon--camera-48');
                recordBtnIcon.classList.add('icon--check-48');
                recordBtnText.textContent = 'Снято';
                counter.start();
            }
        })

    }
};