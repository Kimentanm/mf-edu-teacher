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
                peer: undefined,
                account: '123',
                offerOption: {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                }
            }
        },
        props: {},
        watch: {},
        computed: {
            userId () {
                return this.$store.state.user.userIdentity.id;
            },
        },
        methods: {
            async createMedia(data) {
                // 保存本地流到全局
                try {
                    this.localstream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
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
                this.peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.onIce({account: data.self, self: this.account, sdp: event.candidate});
                        // socket.emit('1v1ICE', {account: data.self, self: this.account, sdp: event.candidate});
                    }
                };
                this.peer.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
                    this.isToPeer = true;
                    this.loading = false;
                    let video = document.querySelector('#rtcB');
                    video.srcObject = event.stream;
                };
                this.createOffer({account: '456', self: this.account});
            },
            async onIce(data) { // 接收 ICE 候选
                try {
                    console.log(11);
                    console.log(data.sdp);
                    await this.peer.addIceCandidate(data.sdp); // 设置远程 ICE
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            async createOffer(data) { // 创建并发送 offer
                try {
                    // 创建offer
                    let offer = await this.peer.createOffer(this.offerOption);
                    // 呼叫端设置本地 offer 描述
                    await this.peer.setLocalDescription(offer);
                    // 给对方发送 offer
                    let message = {sender: this.userId, receiver: 2, sdp: offer};
                    this.$stompClient.send('/sendOffer', JSON.stringify(message), {});
                    // socket.emit('1v1offer', {account: data.self, self: this.account, sdp: offer});
                } catch (e) {
                    console.log('createOffer: ', e);
                }
            },
            async onOffer(data) { // 接收offer并发送 answer
                try {
                    // 接收端设置远程 offer 描述
                    await this.peer.setRemoteDescription(data.sdp);
                    // 接收端创建 answer
                    let answer = await this.peer.createAnswer();
                    // 接收端设置本地 answer 描述
                    await this.peer.setLocalDescription(answer);
                    // 给对方发送 answer
                    this.onAnswer({account: data.self, self: this.account, sdp: answer});
                    // socket.emit('1v1answer', {account: data.self, self: this.account, sdp: answer});
                } catch (e) {
                    console.log('onOffer: ', e);
                }
            },
            async onAnswer(data) { // 接收answer
                try {
                    await this.peer.setRemoteDescription(data.sdp); // 呼叫端设置远程 answer 描述
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
        },
        mounted() {
            this.createMedia({account: '456', self: this.account});
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