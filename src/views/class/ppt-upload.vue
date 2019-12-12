<template>
    <Upload
            class="ppt-upload"
            type="drag"
            :max-size="5 * 1024"
            accept="application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            :action="baseUrl + '/common/file/upload'"
            :on-error="handleUploadError"
            :on-format-error="handleFileFormatError"
            :before-upload="handleBeforeUpload"
            :on-exceeded-size="handleExceededSize"
            :on-success="handleUploadSuccess">
        <div class="ppt-upload-tag">
            <img src="http://q1zqh6yul.bkt.clouddn.com/PPT.png">
            <p>点击或拖拽上传PPT</p>
        </div>

        <loading-modal :show="uploadLoading" title="正在上传PPT"></loading-modal>

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
                uploadLoading: false
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            handleUploadSuccess(response, file, fileList) {
                this.uploadLoading = false;
                this.$emit('on-upload-success', response.data.location)
            },
            handleUploadError(error, file, fileList) {
                this.$refs.errorTip.show("PPT上传失败，请重试");
                this.uploadLoading = false;
            },
            handleFileFormatError(file, fileList) {
                this.$refs.errorTip.show("请上传PPT文件");
                this.uploadLoading = false;
            },
            handleBeforeUpload(file) {
                if (file.type !== 'application/vnd.ms-powerpoint' && file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                    this.$refs.errorTip.show("请上传PPT文件");
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
        width: ~"calc(100% - 240px)";
        height: 100%;
        display: inline-block;
        vertical-align: top;
        padding-left: 16px;
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
            }
        }

        .ivu-upload-drag {
            height: 100%;
            background: #515a6e;
        }
    }
</style>