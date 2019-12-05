<template>
    <div class="class">
        <div class="video-container">
            <div>
                <video id="teacher" autoplay/>
            </div>
            <div>
                <video id="student" autoplay/>
            </div>
        </div>

        <draw-board v-if="studentId" :student-id="studentId"/>

        <error-tip-modal ref="errorTip"/>
    </div>
</template>

<script>
    import ErrorTipModal from "../shared/errorTipModal";
    import DrawBoard from "./draw-board";
    import { getClassInfo } from "@/api/class";

    export default {
        name: "class",
        components: {DrawBoard, ErrorTipModal},
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
                },
                classroomId: 0,
                classInfo: {},
            }
        },
        props: {},
        watch: {},
        computed: {
            userId () {
                return this.$store.state.user.userIdentity.id;
            },
            studentId() {
                return this.classInfo?.studentId;
            }
        },
        methods: {
            async createMedia() {
                // 保存本地流到全局
                try {
                    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
                    let video = document.querySelector('#teacher');
                    video['disablePictureInPicture'] = true;
                    video.srcObject = this.localStream;
                    this.initPeer(); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
                } catch (e) {
                    switch (e.name) {
                        case 'NotReadableError' : {
                            this.$refs.errorTip.show('摄像头被占用');
                            break;
                        }
                        case 'NotFoundError' : {
                            console.log('没有摄像头');
                            break;
                        }
                        default: console.log('getUserMedia: ', e.name)
                    }
                }
            },
            initPeer() {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection(this.iceServers);
                this.peer.addStream(this.localStream); // 添加本地流
                // 监听ICE候选信息 如果收集到，就发送给对方
                this.peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        let message = {sender: this.userId, receiver: this.studentId, sdp: event.candidate};
                        this.$stompClient.send('/sendICE', JSON.stringify(message), {});
                    }
                };
                this.peer.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
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
                    let message = {sender: this.userId, receiver: this.studentId, sdp: offer};
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
                        receiver: this.studentId,
                        sdp: answer
                    };
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
            handleWebSocketEvent() {
                this.$bus.on('on-getOffer', this.onGetOffer);
                this.$bus.on('on-getAnswer', this.onGetAnswer);
                this.$bus.on('on-getICE', this.onGetICE);
            },
            getClassInfo() {
                getClassInfo(this.classroomId).then(res => {
                    if (res.code === 200) {
                        this.classInfo = res.data;
                    }
                });
            }
        },
        mounted() {
            this.handleWebSocketEvent();
            this.$nextTick(() => {
                this.createMedia();
            });
        },
        created() {
            this.classroomId = this.$route.params.classroomId;
            if (this.classroomId) {
                this.getClassInfo();
            }
        }
    }
</script>

<style lang="less">
    .class {
        position: relative;
        height: 100%;
        width: 100%;

        .video-container{
            width: 240px;
            display: inline-block;

            video{
                width: 100%;
                height: 180px;
                background-color: #000;
            }
        }
    }
</style>