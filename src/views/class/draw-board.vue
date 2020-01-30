<template>
    <div ref="draw-board-container" class="draw-board-container" style="position: relative">
        <iframe id="my-iframe" :src="baseUrl + url" frameborder="0"></iframe>
        <div class="draw-board-toolbar">
            <div class="draw-board-toolbar-content">
                <div style="text-align: center">
                    <Tooltip content="画笔" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('line')" style="margin-bottom: 10px" shape="circle" icon="ios-brush"></Button>
                    </Tooltip>
                    <Poptip placement="left" width="20" popper-class="toolbar-line-width">
                        <Tooltip content="线宽" placement="left" :offset="-4" theme="light">
                            <Button style="margin-bottom: 10px" shape="circle" icon="md-resize"></Button>
                        </Tooltip>
                        <el-slider @change="lineWidthChange" slot="content" v-model="lineWidth" :max="20" vertical height="120px"></el-slider>
                    </Poptip>
                    <Tooltip content="上一步" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('cancel')" style="margin-bottom: 10px" shape="circle" icon="ios-redo"></Button>
                    </Tooltip>
                    <Tooltip content="橡皮擦" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('eraser')" style="margin-bottom: 10px" shape="circle" icon="ios-pint"></Button>
                    </Tooltip>
                    <Tooltip content="清屏" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('clear')" style="margin-bottom: 10px" shape="circle" icon="md-trash"></Button>
                    </Tooltip>
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
                <Tooltip style="bottom: 90px" class="horizontal" :content="palettePermission ? '取消授权' : '画板授权'" placement="left" :offset="-4" theme="light">
                    <Button @click="controlStudentPalette" type="warning" shape="circle" icon="ios-bulb" />
                </Tooltip>
                <Tooltip style="bottom: 50px" class="horizontal" content="重新上传PPT" placement="left" :offset="-4" theme="light">
                    <Button @click="pptReupload" type="primary" shape="circle" icon="md-refresh" />
                </Tooltip>
                <Tooltip style="bottom: 10px" class="horizontal" :content="startClassFlag ? '暂停上课' : '开始上课'" placement="left" :offset="-4" theme="light">
                    <Button @click="startClass" type="error" shape="circle" :icon="startClassFlag ? 'md-pause' : 'md-play'" />
                </Tooltip>
            </div>
        </div>
        <div ref="palette-content" class="palette-content" :class="handleCanvasCursor">
            <canvas ref="canvas" />
        </div>

        <error-tip-modal ref="errorTipModal" />
    </div>
</template>

<script>
    import ErrorTipModal from "../shared/errorTipModal";
    let Mousetrap = require('mousetrap');
    import {Palette} from '../../libs/palette';

    export default {
        name: "draw-board",
        components: {ErrorTipModal},
        data() {
            return {
                baseUrl: 'http://ow365.cn/?i=20293&n=5&furl=',
                myIframeWindow: {},
                color: '#ed4014',
                recommendColors: ['#2d8cf0', '#5cadff', '#2b85e4', '#2db7f5', '#19be6b', '#ff9900',
                    '#ed4014', '#000', '#17233d', '#515a6e', '#808695', '#c5c8ce', '#fff'],
                currHandle: 'line',
                lineWidth: 5,
                palette: null, // 画板,
                allowCancel: true,
                allowGo: true,
                peer: null,
                channel: null,
                startClassFlag: false,
                lastEvent: '',
                palettePermission: false
            }
        },
        props: {
            studentId: Number,
            url: String,
            online: Boolean,
            iceServers: Object
        },
        watch: {},
        computed: {
            baseMessage() {
                return {sender: this.userId, receiver: this.studentId};
            },
            handleCanvasCursor() {
                let result = '';
                switch (this.currHandle) {
                    case "line": result = 'cursor-pen'; break;
                    case "eraser" : result = 'cursor-eraser'; break;
                    default:
                }
                return result;
            },
            userId () {
                return this.$store.state.user.userIdentity.id;
            },
        },
        methods: {
            controlStudentPalette() {
                this.palettePermission = !this.palettePermission;
                let data = JSON.parse(JSON.stringify(this.baseMessage));
                data.content = this.palettePermission;
                this.$stompClient.send('/controlStudentPalette', JSON.stringify(data), {});
            },
            initPeer() {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection(this.iceServers);
                // 监听ICE候选信息 如果收集到，就发送给对方
                this.peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        let message = {sender: this.userId, receiver: this.studentId, sdp: event.candidate};
                        this.$stompClient.send('/sendPaletteICE', JSON.stringify(message), {});
                    }
                };
            },
            handleClick(type) {
                if (['cancel', 'go', 'clear'].includes(type)) {
                    this.moveCallback(type);
                    this.palette[type]();
                    return;
                }
                this.palette.changeWay({type: type});
                if (['color', 'lineWidth'].includes(type)) return;
                this.currHandle = type;
            },
            colorChange() {
                this.palette.changeWay({color: this.color});
            },
            lineWidthChange() {
                this.palette.changeWay({lineWidth: this.lineWidth});
            },
            back() {
                this.myIframeWindow.postMessage("preAnim", '*');
                this.$stompClient.send('/back', JSON.stringify(this.baseMessage), {});
            },
            next() {
                this.myIframeWindow.postMessage("nextAnim", '*');
                this.$stompClient.send('/next', JSON.stringify(this.baseMessage), {});
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
            },
            initPalette() {
                this.palette = new Palette(this.$refs['canvas'], {
                    drawColor: this.color,
                    drawType: this.currHandle,
                    lineWidth: this.lineWidth,
                    allowCallback: this.allowCallback,
                    moveCallback: this.moveCallback
                });
            },
            allowCallback(cancel, go) {
                this.allowCancel = !cancel;
                this.allowGo = !go;
            },
            moveCallback(...arr) {
                let data = {
                    width: this.$refs['canvas'].width,
                    height: this.$refs['canvas'].height,
                    arr: [...arr]
                };
                if (data.arr[0] !== 'gatherImage') {
                    this.lastEvent = data.arr[0];
                }
                if (this.lastEvent === 'gatherImage') {
                    return;
                }
                this.lastEvent = data.arr[0];
                try {
                    this.channel.send(JSON.stringify(data));
                } catch (e) {

                }
            },
            async onGetPaletteOffer(data) {
                try {
                    // 接收端设置远程 offer 描述
                    await this.peer.setRemoteDescription(data.sdp);
                    // 接收端创建 answer
                    let answer = await this.peer.createAnswer();
                    // 接收端设置本地 answer 描述
                    await this.peer.setLocalDescription(answer);
                    let message = {
                        sender: this.userId,
                        receiver: this.studentId,
                        sdp: answer
                    };
                    this.$stompClient.send('/sendPaletteAnswer', JSON.stringify(message), {});
                } catch (e) {
                    console.log('onOffer: ', e);
                }
            },
            async onGetPaletteAnswer(data) {
                try {
                    await this.peer.setRemoteDescription(data.sdp); // 呼叫端设置远程 answer 描述
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            async onGetPaletteICE(data) {
                try {
                    await this.peer.addIceCandidate(data.sdp); // 设置远程 ICE
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            handleOnWebSocketEvent() {
                this.$bus.on('on-getPaletteOffer', this.onGetPaletteOffer);
                this.$bus.on('on-getPaletteAnswer', this.onGetPaletteAnswer);
                this.$bus.on('on-getPaletteICE', this.onGetPaletteICE);
                this.$bus.on('on-getStartClassResponse', this.onGetStartClassResponse);
                this.$bus.on('on-getCloseRequest', this.closeConnection);
            },
            handleOffWebSocketEvent() {
                this.$bus.off('on-getPaletteOffer', this.onGetPaletteOffer);
                this.$bus.off('on-getPaletteAnswer', this.onGetPaletteAnswer);
                this.$bus.off('on-getPaletteICE', this.onGetPaletteICE);
                this.$bus.off('on-getStartClassResponse', this.onGetStartClassResponse);
                this.$bus.off('on-getCloseRequest', this.closeConnection);
            },
            closeConnection() {
                this.startClassFlag  = false;
                this.endClass();
            },
            async onGetStartClassResponse() {
                if (this.startClassFlag) {
                    this.startClassFlag = false;
                    this.endClass();
                } else {
                    if (this.peer === null) {
                        await this.initPeer();
                        await this.createDataChannel();
                        this.onDataChannel();
                    }
                    await this.createPaletteOffer();
                    this.myIframeWindow.postMessage("goPage,0", '*');
                    this.startClassFlag = true;
                }
            },
            async createPaletteOffer() { // 建立DataChannel，创建并发送 offer
                try {
                    // 创建offer
                    let offer = await this.peer.createOffer(this.offerOption);
                    // 呼叫端设置本地 offer 描述
                    await this.peer.setLocalDescription(offer);
                    // 给对方发送 offer
                    let message = {sender: this.userId, receiver: this.studentId, sdp: offer, content: this.baseUrl + this.url};
                    this.$stompClient.send('/sendPaletteOffer', JSON.stringify(message), {});
                } catch (e) {
                    console.log('createOffer: ', e);
                }
            },
            endClass() {
                this.clearState();
                this.$stompClient.send('/sendEndClass', JSON.stringify(this.baseMessage), {});
            },
            clearState() {
                this.peer.close();
                this.peer = null;
            },
            createDataChannel() { // 创建 DataChannel
                try{
                    this.channel = this.peer.createDataChannel('messagechannel');
                    this.handleChannel(this.channel);
                } catch (e) {
                    console.log('createDataChannel:', e);
                }
            },
            onDataChannel() { // 接收 DataChannel
                this.peer.ondatachannel = (event) => {
                    this.channel = event.channel;
                    this.handleChannel(this.channel);
                };
            },
            handleChannel(channel) { // 处理 channel
                channel.binaryType = 'arraybuffer';
                channel.onopen = (event) => { // 连接成功
                    console.log('channel onopen', event);
                };
                channel.onclose = function(event) { // 连接关闭
                    console.log('channel onclose', event)
                };
                channel.onmessage = (e) => { // 收到消息
                    const data = JSON.parse(e.data);
                    const teacherWidth = data.width;
                    const teacherHeight = data.height;
                    const width = this.$refs['canvas'].width;
                    const height = this.$refs['canvas'].height;
                    let [type, ...arr] = data.arr;
                    let temp = [...arr];
                    if (type === 'eraser') {
                        temp[0] = temp[0] * width / teacherWidth;
                        temp[1] = temp[1] * height / teacherHeight;
                        temp[2] = this.$refs['canvas'].width;
                        temp[3] = this.$refs['canvas'].height;
                    }
                    if (temp[1] && type !== 'eraser') {
                        temp[0][0] = temp[0][0] * width / teacherWidth;
                        temp[0][1] = temp[0][1] * height / teacherHeight;
                        temp[1][0] = temp[1][0] * width / teacherWidth;
                        temp[1][1] = temp[1][1] * height / teacherHeight;
                        temp[2] = temp[2] * width / teacherWidth
                    }
                    let [...args] = temp;
                    this.palette[type](...args);
                };
            },
            pptReupload() {
                if (!this.startClassFlag) {
                    this.$emit('on-ppt-reupload')
                } else {
                    this.$refs.errorTipModal.show('请先结束当前课程');
                }
            },
            startClass() {
                // if (this.online) {
                    this.$stompClient.send('/sendStartClassRequest', JSON.stringify(this.baseMessage), {});
                // } else {
                //     this.$refs.errorTipModal.show('学生不在线，无法开始上课');
                // }
            }
        },
        mounted() {
            this.myIframeWindow = document.getElementById('my-iframe').contentWindow;
            this.handleOnWebSocketEvent();
            window.addEventListener('resize', this.handlePaletteResize());
            this.$nextTick(async () => {
                this.handlePaletteResize();
                this.initPalette();
                await this.initPeer();
                await this.createDataChannel();
                this.onDataChannel();
            });
        },
        created() {
            Mousetrap.bind(['command+z', 'ctrl+z'], () => {
                this.handleClick('cancel');
                return false;
            });
            Mousetrap.bind(['command+shift+z', 'ctrl+shift+z'], () => {
                this.handleClick('go');
                return false;
            });
        },
        beforeDestroy() {
            this.handleOffWebSocketEvent();
            window.removeEventListener('resize', this.handlePaletteResize());
        }
    }
</script>

<style lang="less">
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

        iframe {
            height: 100%;
            display: inline-block;
            width: ~"calc(100% - 40px)";
            pointer-events: none;
        }

        .cursor-pen {
            cursor: url("../../assets/images/palette-pen.ico") 0 30, auto;
        }

        .cursor-eraser {
            cursor: url("../../assets/images/palette-eraser.ico") 4 30, auto;
        }

        .draw-board-toolbar {
            display: inline-block;
            vertical-align: top;
            width: 40px;
            height: 100%;
            background-color: rgba(255,255,255, 0.5);

            &-content {
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;

                .ivu-color-picker .ivu-select-dropdown {
                    left: -221px;
                }

                /*.leave-class-btn {*/
                /*    position: absolute;*/
                /*    bottom: 14px;*/
                /*    left: 50%;*/
                /*    transform: translateX(-50%)*/
                /*}*/

                .horizontal {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                }

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
</style>