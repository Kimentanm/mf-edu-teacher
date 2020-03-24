import {
    desktopCapturer,
    app
} from 'electron'

import fs from 'fs';


/**
 *自动录屏模块*录制桌面
 *
 * @class Recorder
 */
class Recorder {

    constructor(path) {
        this.mediaOutputPath = path;
    }


    /**
     *开始录制
     *
     * @memberof Recorder
     */
    startRecord = () => {
        desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
            if (error) throw error;
            for (let i = 0; i < sources.length; ++i) {
                if (sources[i].name === '梦飞在线一对一（教师端）') {
                    /* 要获取桌面音频必须设置audio约束如下 */
                    navigator.mediaDevices.getUserMedia({
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: sources[i].id,
                                maxWidth: window.screen.width,
                                maxHeight: window.screen.height
                                /*cursor:"never" */
                                /*取消录制鼠标，以免鼠标闪烁，这个目前标准定义了各浏览器还没实现，
                                如果需要请使用webrtc-adapter，使用最新API，
                                视频录制被单独分离成getDisplayMedia，
                                但是cursor约束条件是否有效暂时也不确定。没试过。*/
                            }
                        },
                        audio: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                            }
                        },
                    }).then(Mediastream => {
                        this.getMicroAudioStream().then((audioStream) => {
                            let tracks = Mediastream.getTracks(); //需要移除音轨，添加混流后的音轨
                            let findAudioTrack = tracks.find(a => a.kind === 'audio');
                            console.log(findAudioTrack);
                            if (findAudioTrack) {
                                Mediastream.removeTrack(findAudioTrack);
                            }
                            Mediastream.addTrack(audioStream.getAudioTracks()[0])//注！此处添加麦克风音轨无效
                            tracks = Mediastream.getTracks();
                            console.log(tracks);
                            // this.mixAudioStream(audioStream);
                            this.createRecorder(Mediastream);
                        });
                        // this.mixAudioStream(Mediastream).then(audioStream => {
                        //     this.createRecorder(Mediastream);
                        // });


                    }).catch(err => {
                        this.getUserMediaError(err);

                    })
                }
            }
        });
    }

    /**
     *混合音轨
     *
     * @memberof Recorder
     */
    mixAudioStream = (Mediastream) => {
        let systemAudioTrack = Mediastream.getAudioTracks()[0]; //获取强制获取的桌面音【轨】
        return new Promise((resolve, reject) => {
            this.getMicroAudioStream().then(audioStream => {//获取麦克风音频【流】
                let audioContext = new AudioContext();//创建音频上下文
                let microphoneStreamNode = audioContext.createMediaStreamSource(audioStream);//创建节点
                let sysAudioStream = new MediaStream();//创建一个媒体流
                sysAudioStream.addTrack(systemAudioTrack);//把系统音轨添加到新的媒体流
                let sysAudioStreamNode = audioContext.createMediaStreamSource(sysAudioStream);//创建系统音频节点
                let mixedOutput = audioContext.createMediaStreamDestination();//创建一个输出媒体流节点
                microphoneStreamNode.connect(mixedOutput);//把麦克风节点和系统音节点添加到输出媒体流
                sysAudioStreamNode.connect(mixedOutput);//把麦克风节点和系统音节点添加到输出媒体流
                resolve(mixedOutput.stream);//返回混合后的媒体流
            }).catch(err => {
                console.error(err);
                reject()
            })
        })

    }

    /**
     *获取麦克风音频流
     *
     * @memberof Recorder
     */
    getMicroAudioStream = () => {
        return navigator.mediaDevices.getUserMedia({audio: true})
    }


    /**
     *获取媒体源失败
     *
     * @memberof Recorder
     */
    getUserMediaError = (err) => {
        console.error('mediaError', err.name);


    }


    getUserAudioError = (err) => {
        console.log('audioError', err);

    }

    /**
     *开始视频录制
     *
     * @memberof Recorder
     */
    createRecorder = (stream) => {
        this.recorder = new MediaRecorder(stream);
        this.recorder.start();
        this.recorder.ondataavailable = event => {
            let blob = new Blob([event.data], {
                type: 'video/mp4'
            });
            this.saveMedia(blob);

        };

    }


    /**
     *数据转换并保存成MP4
     *
     * @memberof Recorder
     */
    saveMedia = (blob) => {
        let reader = new FileReader();
        let _t = this;
        reader.onload = function () {
            let buffer = new Buffer(reader.result)
            fs.writeFile(_t.mediaOutputPath, buffer, {}, (err, res) => {
                if (err) {
                    console.error(err);
                    return
                }
            })
        }
        reader.readAsArrayBuffer(blob);

    }


    /**
     *停止录制视频
     *
     * @memberof Recorder
     */
    stopRecord = () => {
        this.recorder.stop();
    }


}

export default Recorder;
