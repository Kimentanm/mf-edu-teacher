<template>
    <div class="class">
        <div class="video-container">
            <div>
                <video src="" id="rtcA" controls autoplay></video>
                <h5>test</h5>
            </div>
            <div>
                <video src="" id="rtcB" controls autoplay></video>
                <h5>test</h5>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "class",
        components: {},
        data() {
            return {
                localstream: undefined,
                peer: undefined
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            async createMedia(data) {
                // 保存本地流到全局
                try {
                    this.localstream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                    let video = document.querySelector('#rtcA');
                    video.srcObject = this.localstream;
                } catch (e) {
                    console.log('getUserMedia: ', e)
                }
                this.initPeer(data); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
            },
            initPeer(data) {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection();
                this.peer.addStream(this.localstream); // 添加本地流
                // 监听ICE候选信息 如果收集到，就发送给对方
                // this.peer.onicecandidate = (event) => {
                //     if (event.candidate) {
                //         socket.emit('1v1ICE', {account: data.self, self: this.account, sdp: event.candidate});
                //     }
                // };
                // this.peer.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
                //     this.isToPeer = true;
                //     this.loading = false;
                //     let video = document.querySelector('#rtcB');
                //     video.srcObject = event.stream;
                // };
            },
        },
        mounted() {
            this.createMedia();
        },
        created() {
        }
    }
</script>

<style lang="less">
    .class {
        position: relative;

        .video-container{
            display: flex;
            justify-content: center;
            video{
                width: 400px;
                height: 300px;
                margin-left: 20px;
                background-color: #ddd;
            }
            /*video::-webkit-media-controls{*/
            /*    display:none !important;*/
            /*}*/
            /*播放轴*/
            video::-webkit-media-controls-timeline {
                display:none !important;
            }
            /*播放按钮*/
            video::-webkit-media-controls-play-button {
                display:none !important;
            }
            /*时间*/
            video::-webkit-media-controls-current-time-display {
                display:none !important;
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
    }
</style>