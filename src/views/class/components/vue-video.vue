<template>
    <div id="vue-video">
        <video id="my-video" ref="my-video" controls controlslist="nodownload" preload="auto" :src="src"></video>
    </div>
</template>

<script>
    export default {
        name: "vue-video",
        components: {},
        props: {
            src: String
        },
        data() {
            return {}
        },
        computed: {},
        watch: {},
        methods: {
            pause() {
                this.$refs['my-video'].pause();
            },
            play() {
                this.$refs['my-video'].play();
            },
            getTime() {
                return this.$refs['my-video'].currentTime
            },
            setTime(currentTime) {
                this.$refs['my-video'].currentTime = currentTime;
            }
        },
        mounted() {
            let video = document.querySelector('#my-video');
            video['disablePictureInPicture'] = true;
        },
        created() {
        }
    }
</script>

<style lang="less">
    #vue-video {

        video {
            height: 100%;
            width: 100%;
        }

        video:focus {
            outline: none;
        }

        video::-webkit-media-controls-timeline {
            /*display:none !important;*/
        }
        /*播放按钮*/
        video::-webkit-media-controls-play-button {
            /*display:none !important;*/
        }
        /*时间*/
        video::-webkit-media-controls-current-time-display {
            /*display:none !important;*/
        }
        /*声音*/
        video::-webkit-media-controls-mute-button {
            display:none !important;
        }
        /*全屏*/
        video::-webkit-media-controls-fullscreen-button {
            display:none !important;
        }
    }
</style>
