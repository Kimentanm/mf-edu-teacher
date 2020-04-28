<template>
    <Upload
            ref="upload"
            class="ppt-upload"
            type="drag"
            :max-size="5 * 1024"
            :accept="contentTypes.join(',')"
            :action="baseUrl + '/courseware/upload'"
            :on-error="handleUploadError"
            :on-format-error="handleFileFormatError"
            :before-upload="handleBeforeUpload"
            :on-exceeded-size="handleExceededSize"
            :on-success="handleUploadSuccess">
        <div class="ppt-upload-tag">
            <img src="../../assets/images/word-icon.png">
            <img class="marL20" src="../../assets/images/ppt-icon.png">
            <img class="marL20" src="../../assets/images/pdf-icon.png">
            <img class="marL20" src="../../assets/images/video-icon.png">
            <p>您可以上传Word文档、PPT课件、PDF文件、Video视频</p>
            <p>点击或拖拽上传文件</p>
        </div>

        <loading-modal :show="uploadLoading" title="正在上传课件"></loading-modal>

        <error-tip-modal ref="errorTip"></error-tip-modal>
    </Upload>
</template>

<script>
    import baseUrl from '../../config/url';
    import ErrorTipModal from "../shared/errorTipModal";
    import LoadingModal from "../shared/loadingModal";

    export default {
        name: "ppt-upload",
        components: {LoadingModal, ErrorTipModal},
        data() {
            return {
                baseUrl,
                uploadLoading: false,
                contentTypes: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'video/mp4', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            startUpload() {
                this.$refs.upload.handleClick();
            },
            handleUploadSuccess(response, file, fileList) {
                this.uploadLoading = false;
                this.$emit('on-upload-success', response.data[0].location)
            },
            handleUploadError(error, file, fileList) {
                this.$refs.errorTip.show("课件上传失败，请重试");
                this.uploadLoading = false;
            },
            handleFileFormatError(file, fileList) {
                this.$refs.errorTip.show("请上传PPT或PDF或视频文件");
                this.uploadLoading = false;
            },
            handleBeforeUpload(file) {
                if (this.contentTypes.indexOf(file.type) === -1) {
                    this.$refs.errorTip.show("请上传PPT或PDF或视频文件");
                    return false;
                }
                this.uploadLoading = true;
            },
            handleExceededSize() {
                this.$refs.errorTip.show("请上传小于5M的PPT");
                this.uploadLoading = false;
            }
        },
        created() {
        }
    }
</script>

<style lang="less">
    .ppt-upload {
        width: 100%;
        height: 100%;
        position: relative;
        &-tag {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            img {
                width: 60px;
                height: 60px;
            }

            p {
                color: #fff;
                font-size: 25px;
                margin-top: 20px;
            }
        }

        .ivu-upload-drag {
            height: 100%;
            background: #515a6e;
        }
    }
</style>
