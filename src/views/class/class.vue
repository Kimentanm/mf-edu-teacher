<template>
    <div class="class">
        <div class="video-container">
            <div>
                <video id="teacher" autoplay></video>
            </div>
            <div>
                <video id="student" autoplay></video>
            </div>
        </div>

        <error-tip-modal ref="errorTip"></error-tip-modal>
    </div>
</template>

<script>
    import ErrorTipModal from "../shared/errorTipModal";
    export default {
        name: "class",
        components: {ErrorTipModal},
        data() {
            return {
                localStream: undefined,
                peer: undefined,
                account: '123',
                offerOption: {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                },
                iceServers: {
                    iceServers: [
                        { url: "stun:stun.l.google.com:19302"}, // 谷歌的公共服务
                        {
                            url: 'turn:192.158.29.39:3478?transport=udp',
                            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                            username: '28224511:1379330808'
                        }
                    ]
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
                    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
                    let video = document.querySelector('#teacher');
                    video['disablePictureInPicture'] = true;
                    video.srcObject = this.localStream;
                    this.initPeer(data); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
                } catch (e) {
                    console.log('getUserMedia: ', e.name)
                    if (e.name === 'NotReadableError') {
                        this.$refs.errorTip.show('摄像头被占用');
                    }
                }
            },
            initPeer(data) {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection(this.iceServers);
                this.peer.addStream(this.localStream); // 添加本地流
                // 监听ICE候选信息 如果收集到，就发送给对方
                this.peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        let message = {sender: this.userId, receiver: 276, sdp: event.candidate};
                        this.$stompClient.send('/sendICE', JSON.stringify(message), {});
                    }
                };
                this.peer.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
                    this.loading = false;
                    let video = document.querySelector('#student');
                    video.srcObject = event.stream;
                };
            },
            async createOffer(data) { // 创建并发送 offer
                try {
                    // 创建offer
                    let offer = await this.peer.createOffer(this.offerOption);
                    // 呼叫端设置本地 offer 描述
                    await this.peer.setLocalDescription(offer);
                    // 给对方发送 offer
                    let message = {sender: this.userId, receiver: 276, sdp: offer};
                    this.$stompClient.send('/sendOffer', JSON.stringify(message), {});
                } catch (e) {
                    console.log('createOffer: ', e);
                }
            },
            /**
             * 接收offer并发送 answer
             * @returns {Promise<void>}
             */
            async onGetOffer(data) {
                try {
                    // 接收端设置远程 offer 描述
                    await this.peer.setRemoteDescription(data.sdp);
                    // 接收端创建 answer
                    let answer = await this.peer.createAnswer();
                    // 接收端设置本地 answer 描述
                    await this.peer.setLocalDescription(answer);
                    // 给对方发送 answer
                    let message = {
                        sender: this.userId,
                        receiver: 276,
                        sdp: answer
                    };
                    console.log(message);
                    this.$stompClient.send('/sendAnswer', JSON.stringify(message), {});
                } catch (e) {
                    console.log('onOffer: ', e);
                }
            },
            async onGetAnswer(data) {
                try {
                    await this.peer.setRemoteDescription(new RTCSessionDescription(data.sdp)); // 呼叫端设置远程 answer 描述
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            async onGetICE(data) {
                try {
                    await this.peer.addIceCandidate(data.sdp); // 设置远程 ICE
                } catch (e) {
                    console.log('onICE: ', e.name, e.message);
                }
            },
        },
        mounted() {
            this.$bus.on('on-getOffer', this.onGetOffer);
            this.$bus.on('on-getAnswer', this.onGetAnswer);
            this.$bus.on('on-getICE', this.onGetICE);
            this.$nextTick(() => {
                this.createMedia();
            });
        },
        created() {
        }
    }
</script>

<style lang="less">
    .class {
        position: relative;
        height: 100%;
        width: 100%;

        .video-container{

            video{
                width: 200px;
                height: 150px;
                margin-left: 20px;
                background-color: #ddd;
            }
        }
    }
</style>