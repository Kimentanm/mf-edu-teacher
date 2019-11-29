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
        <div ref="draw-board-container" class="draw-board-container" style="position: relative">
            <iframe id="my-iframe" :src="url" frameborder="0"></iframe>
            <div class="draw-board-toolbar">
                <div class="draw-board-toolbar-content">
                    <div style="text-align: center">
                        <Poptip placement="left" width="20" popper-class="toolbar-line-width">
                            <Tooltip content="线宽" placement="left" :offset="-4" theme="light">
                                <Button style="margin-bottom: 10px" shape="circle" icon="ios-brush"></Button>
                            </Tooltip>
                            <el-slider @change="lineWidthChange" slot="content" v-model="lineWidth" :max="20" vertical height="120px"></el-slider>
                        </Poptip>
                        <Tooltip content="颜色" placement="left" :offset="-4" theme="light">
                            <ColorPicker class="toolbar-color" @on-change="colorChange" v-model="color" alpha :colors="recommendColors"></ColorPicker>
                        </Tooltip>
                        <Tooltip content="上一个动画" placement="left" :offset="-4" theme="light">
                            <Button @click="back" style="margin-bottom: 10px" type="success" shape="circle" icon="ios-skip-backward"></Button>
                        </Tooltip>
                        <Tooltip content="下一个动画" placement="left" :offset="-4" theme="light">
                            <Button @click="next" type="success" shape="circle" icon="ios-skip-forward"></Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div ref="palette-content" class="palette-content">
                <canvas ref="canvas"></canvas>
            </div>
        </div>

        <error-tip-modal ref="errorTip"></error-tip-modal>
    </div>
</template>

<script>
    import ErrorTipModal from "../shared/errorTipModal";
    import {Palette} from '../../libs/palette';

    export default {
        name: "class",
        components: {ErrorTipModal},
        data() {
            return {
                url: 'http://ow365.cn/?i=20087&n=5&furl=http://www.amaxchina.xyz/download/test.pptx',
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
                myIframeWindow: {},
                color: '#ed4014',
                recommendColors: ['#2d8cf0', '#5cadff', '#2b85e4', '#2db7f5', '#19be6b', '#ff9900',
                    '#ed4014', '#000', '#17233d', '#515a6e', '#808695', '#c5c8ce', '#fff'],
                currHandle: 'line',
                lineWidth: 5,
                palette: null, // 画板,
                allowCancel: true,
                allowGo: true,
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
            colorChange() {
                this.palette.changeWay({color: this.color});
            },
            lineWidthChange() {
                this.palette.changeWay({lineWidth: this.lineWidth});
            },
            back() {
                this.myIframeWindow.postMessage("preAnim", '*');
                let message = {
                    sender: this.userId,
                    receiver: 276,
                };
                this.$stompClient.send('/back', JSON.stringify(message), {});
            },
            next() {
                this.myIframeWindow.postMessage("nextAnim", '*');
                let message = {
                    sender: this.userId,
                    receiver: 276,
                };
                this.$stompClient.send('/next', JSON.stringify(message), {});
            },
            async createMedia(data) {
                // 保存本地流到全局
                try {
                    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
                    let video = document.querySelector('#teacher');
                    video['disablePictureInPicture'] = true;
                    video.srcObject = this.localStream;
                    this.initPeer(data); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
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
            initPalette() {
                this.palette = new Palette(this.$refs['canvas'], {
                    drawColor: this.color,
                    drawType: this.currHandle,
                    lineWidth: this.lineWidth,
                    allowCallback: this.allowCallback,
                });
                console.log(this.palette);
            },
            allowCallback(cancel, go) {
                this.allowCancel = !cancel;
                this.allowGo = !go;
            },
            handleWebSocketEvent() {
                this.$bus.on('on-getOffer', this.onGetOffer);
                this.$bus.on('on-getAnswer', this.onGetAnswer);
                this.$bus.on('on-getICE', this.onGetICE);
            },
            handlePaletteResize() {
                let width = this.$refs['draw-board-container'].offsetWidth - 56;
                let height = this.$refs['draw-board-container'].offsetHeight;
                let canvasWidth = (height - 35) * 148732 / 83700;
                let canvasHeight = width * 2569 / 4565;
                this.$refs['canvas'].width = canvasHeight < height ? width : canvasWidth;
                this.$refs['canvas'].height = canvasHeight < height ? canvasHeight : height;
                this.$refs['palette-content'].style.width = width + 'px';
                this.$refs['palette-content'].style.height = (canvasHeight < height ? JSON.parse(JSON.stringify(this.$refs['canvas'].height)) + 35
                    : this.$refs['canvas'].height) + 'px';
                if (canvasHeight >= height) {
                    this.$refs['canvas'].height -= 35;
                }
            }
        },
        mounted() {
            this.myIframeWindow = document.getElementById('my-iframe').contentWindow;
            this.handleWebSocketEvent();
            this.handlePaletteResize();
            window.onresize = () => {
                this.handlePaletteResize();
            };
            this.initPalette();
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
            width: 240px;
            display: inline-block;

            video{
                width: 100%;
                height: 180px;
                background-color: #000;
            }
        }

        .draw-board-container {
            width: ~"calc(100% - 240px)";
            height: 100%;
            display: inline-block;
            vertical-align: top;
            padding-left: 16px;
            position: relative;

            .palette-content {
                position: absolute;
                top: 50%;
                left: 16px;
                transform: translateY(-50%);
                text-align: center;
            }

            canvas {
                /*position: absolute;*/
                /*top: 48%;*/
                /*left: 16px;*/
                /*transform: translateY(-50%);*/
                /*border: 1px solid #000;*/
            }

            iframe {
                height: 100%;
                display: inline-block;
                width: ~"calc(100% - 40px)";
            }

            .draw-board-toolbar {
                display: inline-block;
                vertical-align: top;
                width: 40px;
                height: 100%;
                background-color: rgba(255,255,255, 0.5);

                &-content {
                    height: 100%;
                    display: flex;
                    align-items: center;

                    .toolbar-line-width {
                        min-width: 86px;

                        .ivu-poptip-body-content {
                            overflow: unset;
                        }
                    }

                    .toolbar-color {

                        i {
                            display: none;
                        }

                        .ivu-input-icon-normal+.ivu-input {
                            padding-right: 7px;
                            border-radius: 50px;
                            cursor: pointer;

                            .ivu-color-picker-color {
                                width: 14px;
                                height: 14px;
                                top: 4px;
                            }
                        }

                        margin-bottom: 10px;
                    }
                }
            }
        }
    }
</style>