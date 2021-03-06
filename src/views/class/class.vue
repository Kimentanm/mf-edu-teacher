<template>
    <div class="class">
        <div class="header-bar">
            <Menu mode="horizontal" theme="dark" active-name="1" style="height: 100%;padding: 0 16px;">
                <!-- <div class="layout-logo"></div> -->
                <div class="custom-bar">
                    <h2>{{classInfo.className}}
                        <div v-if="online" class="student-signal online"></div>
                        <Tooltip class="student-signal outline" v-else :content="outlineTypeTip">
                        </Tooltip>
                    </h2>
                </div>

                <div class="layout-nav">
                    <Tooltip content="离开教室">
                        <MenuItem name="login-out">
                            <!-- <Button type="primary" >OUT</Button> -->
                            <Button type="primary" shape="circle" @click="goToHome">OUT</Button>
                        </MenuItem>
                    </Tooltip>
                </div>
                <div class="layout-nav">
                    <Tooltip content="录制屏幕" v-if="isVideo">
                        <MenuItem name="video-begin">
                            <Icon type="ios-videocam" size='35' @click="goVideoTape"/>
                        </MenuItem>
                    </Tooltip>
                    <Tooltip content="结束录制" v-else>
                        <MenuItem name="video-end">
                            <div class="layout-nav-circle marR5" />
                            <Icon type="ios-videocam" size='35' @click="endVideoTape"/>
                        </MenuItem>
                    </Tooltip>
                </div>
            </Menu>
        </div>
        <div class="main-content">
            <div class="video-container">
                <div style="position: relative">
                    <span>{{myVideoTip}}</span>
                    <video muted id="teacher" autoplay/>
                </div>
                <div style="position: relative">
                    <video id="student" autoplay/>
                </div>
            </div>
            <div id="class-container">
                <ppt-upload ref="ppt-upload" v-show="!pptUrl" @on-upload-success="handleUploadSuccess"/>
                <draw-board v-for="(item, index) in classCourseware[this.classroomId]" :key="index" ref="draw-board"
                            v-show="pptUrl === item && studentId"
                            :student-id="studentId"
                            :url="item"
                            :isCurrent="item === pptUrl"
                            :online="online"
                            :iceServers="iceServers"
                            @on-ppt-reupload="handlePptReupload"
                            @on-show-courseware="handleShowCoursewareList"/>
                <transition name="fade">
                    <courseware-list v-show="coursewareListShow" ref="courseware-list" :classroomId="classroomId"
                                     @click-item="handleClickItem"/>
                </transition>
            </div>
        </div>

        <error-tip-modal ref="errorTip"/>
    </div>
</template>

<script>
    import ErrorTipModal from "../shared/errorTipModal";
    import DrawBoard from "./draw-board";
    import {getClassInfo} from "@/api/class";
    import HeaderBar from '../main/components/header-bar'
    import PptUpload from "./ppt-upload";
    import CoursewareList from "./components/courseware-list";
    import {mapState} from 'vuex';
    import Recorder from '../../libs/ScreenRecord.js'

    let recorder = new Recorder('');

    export default {
        name: "class",
        components: {CoursewareList, PptUpload, DrawBoard, ErrorTipModal, HeaderBar},
        data() {
            return {
                localStream: undefined,
                peer: undefined,
                circleShow: false,
                account: '123',
                offerOption: {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                },
                iceServers: {
                    iceServers: [
                        {
                            "urls": ["stun:111.231.135.83:3478"],
                        },
                        {
                            "urls": ["turn:111.231.135.83:3478?transport=udp"],
                            "username": "kimen",
                            "credential": "123456"
                        }
                    ]
                },
                classroomId: 0,
                classInfo: {},
                myVideoTip: '',
                online: false,
                outlineType: 0,
                pptUrl: '',
                coursewareListShow: true,
                isVideo: true,
                videoHref: ''
            }
        },
        props: {},
        watch: {},
        computed: {
            ...mapState({
                classCourseware: state => state.app.classCourseware
            }),
            baseMessage() {
                return {sender: this.userId, receiver: this.studentId};
            },
            userId() {
                return this.$store.state.user.userIdentity.id;
            },
            studentId() {
                return this.classInfo?.studentId;
            },
            outlineTypeTip() {
                let tip = '学生未进入课堂';
                switch (this.outlineType) {
                    case 0 :
                        tip = '学生未进入课堂';
                        break;
                    case 1 :
                        tip = '学生窗口未置顶';
                        break;
                    default:
                }
                return tip;
            }
        },
        methods: {
            handleClickItem(url) {
                this.pptUrl = url;
                if (!url) {
                    this.$refs['ppt-upload'].startUpload();
                }
            },
            handlePptReupload() {
                this.pptUrl = '';
            },
            handleShowCoursewareList() {
                this.coursewareListShow = !this.coursewareListShow;
            },
            handleUploadSuccess(pptUrl) {
                this.pptUrl = pptUrl;
                if (!this.classCourseware[this.classroomId]) {
                    this.classCourseware[this.classroomId] = [];
                }
                this.classCourseware[this.classroomId].push(pptUrl);
                this.$refs['courseware-list'].refreshList();
            },
            goToHome() {
                this.$destroy();
                this.$router.replace({
                    name: 'home'
                })
            },
            goVideoTape() {
                recorder.startRecord().then(() => {
                    this.$Message.success('开始录像');
                    this.isVideo = false;
                }).catch(err => {
                    if (err.name === 'NotFoundError') {
                        this.$refs.errorTip.show('该设备当前无麦克风，无法完成录制！');
                    }
                });
            },
            endVideoTape() {
                this.$Message.success('结束路线录像，录像文件存储在您的桌面');
                this.isVideo = true;
                recorder.stopRecord();
            },
            async createMedia() {
                // 保存本地流到全局
                this.localStream = null;
                try {
                    this.myVideoTip = "";
                    this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
                } catch (e) {
                    switch (e.name) {
                        case 'NotReadableError' : {
                            this.myVideoTip = '摄像头被占用';
                            this.$refs.errorTip.show('摄像头被占用');
                            break;
                        }
                        case 'NotFoundError' : {
                            this.myVideoTip = '没有摄像头';
                            console.log('没有摄像头');
                            try {
                                this.myVideoTip = "";
                                this.localStream = await navigator.mediaDevices.getUserMedia({
                                    audio: false,
                                    video: true
                                });
                            } catch (e) {
                                switch (e.name) {
                                    case 'NotReadableError' : {
                                        this.myVideoTip = '摄像头被占用';
                                        this.$refs.errorTip.show('摄像头被占用');
                                        break;
                                    }
                                    case 'NotFoundError' : {
                                        this.myVideoTip = '没有摄像头';
                                        console.log('没有摄像头');
                                        break;
                                    }
                                    default:
                                        console.log('getUserMedia: ', e.name)
                                }
                            }
                            break;
                        }
                        default:
                            console.log('getUserMedia: ', e.name)
                    }
                }
                if (this.localStream != null) {
                    let video = document.querySelector('#teacher');
                    video['disablePictureInPicture'] = true;
                    video.srcObject = this.localStream;
                }
                this.initPeer(); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
                this.sendStartRequest();
            },
            initPeer() {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection(this.iceServers);
                if (this.localStream) {
                    this.peer.addStream(this.localStream); // 添加本地流
                }
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
            async createOffer() { // 创建并发送 offer
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
            onGetStartRequest() {
                this.initPeer();
                this.online = true;
                this.$stompClient.send('/sendStartResponse', JSON.stringify(this.baseMessage), {});
            },
            onGetStartResponse(data) {
                this.createOffer();
                this.online = true;
            },
            handleOnWebSocketEvent() {
                this.$bus.on('on-getOffer', this.onGetOffer);
                this.$bus.on('on-getAnswer', this.onGetAnswer);
                this.$bus.on('on-getICE', this.onGetICE);
                this.$bus.on('on-getStartRequest', this.onGetStartRequest);
                this.$bus.on('on-getStartResponse', this.onGetStartResponse);
                this.$bus.on('on-getCloseRequest', this.closeConnection);
                this.$bus.on('on-getStudentBlur', this.onGetStudentBlur);
                this.$bus.on('on-getStudentFocus', this.onGetStudentFocus);
            },
            handleOffWebSocket() {
                this.$bus.off('on-getOffer', this.onGetOffer);
                this.$bus.off('on-getAnswer', this.onGetAnswer);
                this.$bus.off('on-getICE', this.onGetICE);
                this.$bus.off('on-getStartRequest', this.onGetStartRequest);
                this.$bus.off('on-getStartResponse', this.onGetStartResponse);
                this.$bus.off('on-getCloseRequest', this.closeConnection);
                this.$bus.off('on-getStudentBlur', this.onGetStudentBlur);
                this.$bus.off('on-getStudentFocus', this.onGetStudentFocus);
            },
            onGetStudentFocus() {
                this.online = true;
                this.outlineType = 0;
            },
            onGetStudentBlur() {
                this.online = false;
                this.outlineType = 1;
            },
            getClassInfo() {
                getClassInfo(this.classroomId).then(res => {
                    if (res.code === 200) {
                        this.classInfo = res.data;
                        this.$nextTick(() => {
                            this.createMedia();
                        });
                    }
                });
            },
            sendStartRequest() {
                this.$stompClient.send('/sendStartRequest', JSON.stringify(this.baseMessage), {});
            },
            closeConnection() {
                this.online = false;
                this.outlineType = 0;
                if (this.peer) {
                    this.peer.close();
                }
                this.peer = null;
            }
        },
        mounted() {
            this.handleOnWebSocketEvent();
        },
        created() {
            recorder = new Recorder();
            this.classroomId = this.$route.params.classroomId;
            if (this.classroomId) {
                this.getClassInfo();
            }
        },
        beforeDestroy() {
            this.handleOffWebSocket();
            this.$stompClient.send('/sendEndClass', JSON.stringify(this.baseMessage), {});
            this.$stompClient.send('/sendCloseRequest', JSON.stringify(this.baseMessage), {});
        },
        destroyed() {
            this.outlineType = 0;
            if (this.localStream) {
                const tracks = this.localStream.getTracks();
                tracks.forEach(track => {
                    track.stop();
                })
            }
            this.localStream = null;
            this.closeConnection();
        }
    }
</script>

<style lang="less">
    .class {
        position: relative;
        height: 100%;
        width: 100%;
        background-image: url('../../assets/images/class-background.jpg');
        background-size: cover;
        background-position: center;

        .layout-nav-circle {
            width: 13px;
            height: 13px;
            background: red;
            border-radius: 100%;
            animation: mymove 1s infinite;
            -webkit-animation: mymove 1s infinite; /*Safari and Chrome*/
        }

        @keyframes mymove {
            50% {
                background: transparent;
            }
        }

        @-webkit-keyframes mymove /*Safari and Chrome*/ {
            50% {
                background: transparent;
            }
        }

        .header-bar {
            height: 64px;

            .layout-logo {
                width: 100px;
                height: 30px;
                background: #5b6270;
                border-radius: 3px;
                float: left;
                position: relative;
                top: 15px;
                left: 20px;
            }

            .custom-bar {
                width: 200px;
                height: 100%;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);

                .student-signal {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    right: 34px;
                    transform: translateY(-50%);
                }

                .outline {
                    background-color: #ed4014;
                }

                .online {
                    background-color: #19be6b;
                }

                h2 {
                    height: 100%;
                    color: #fff;
                    text-align: center;
                    line-height: 64px;
                    position: relative;
                }
            }

            .layout-nav {
                height: 100%;
                float: right;


                .ivu-menu-item {
                    height: 100%;
                    padding: 0 10px;
                    display: flex;
                    align-items: center;
                }

                .ivu-tooltip {
                    height: 100%;

                    .ivu-tooltip-rel {
                        height: 100%;
                    }
                }
            }
        }

        .main-content {
            height: ~'calc(100% - 64px)';
            padding: 16px;

            .video-container {
                width: 240px;
                display: inline-block;

                span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                video {
                    width: 100%;
                    height: 180px;
                    background-color: #000;
                    transform: rotateY(180deg);
                }
            }

            #class-container {
                width: ~"calc(100% - 240px)";
                height: 100%;
                display: inline-block;
                vertical-align: top;
                padding-left: 16px;
                position: relative;
            }
        }
    }
</style>
