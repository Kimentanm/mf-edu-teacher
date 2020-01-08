<template>
    <div class="login">
        <div class="login-con">
            <Card class="login-con-card">
                <Form ref="loginForm" :model="loginForm" :rules="loginFormRules">
                    <FormItem prop="userName">
                        <Input v-model="loginForm.userName" placeholder="请输入账号" style="width: 200px">
                            <Icon type="ios-contact" slot="prefix" />
                        </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input v-model="loginForm.password" type="password" password placeholder="请输入密码" style="width: 200px" >
                            <Icon type="ios-lock" slot="prefix" />
                        </Input>
                    </FormItem>
                </Form>
            </Card>
            <Button style="margin-top: 10px" size="large" long type="info" @click="handleSubmit">登录</Button>
        </div>

        <loading-modal :show="loginModal" title="正在登陆"/>

        <progress-modal :show="progressModal" title="正在下载更新"
                        :percent="percent"
                        :transferred="transferred" :total="total"/>

        <p class="copyright">© 2019, MF Corporation Pvt. Ltd. All Rights Reserved.</p>
    </div>
</template>

<script>
    import LoadingModal from '@/views/shared/loadingModal.vue'
    import { mapActions } from 'vuex'
    import ProgressModal from "./shared/progressModal";
    let ipcRenderer = require('electron').ipcRenderer;

    export default {
        name: "login",
        components: {
            ProgressModal,
            LoadingModal
        },
        data() {
            return {
                loginForm: {
                    userName: '',
                    password: '',
                    type: 'TEACHER'
                },
                loginFormRules: {
                    userName: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                },
                loginModal: false,
                progressModal: false,
                percent: 0,
                transferred: 0,
                total: 0
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            ...mapActions([
                'handleLogin',
                'getUserInfo'
            ]),
            handleSubmit() {
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        this.loginModal = true;
                        this.handleLogin(this.loginForm).then(res => {
                            this.getUserInfo().then(res => {
                                this.$router.push({
                                    name: 'home'
                                })
                            }).catch(err => {
                                this.loginModal = false;
                                this.$Message.error("获取当前用户基本信息失败");
                            })
                        }).catch(err => {
                            this.loginModal = false;
                            this.$Message.error("登录名或密码错误");
                        })
                    }
                });
            },
            handleStartDownload() {
                this.progressModal = true;
            },
            handleSetProgressBar(event, state) {
                this.percent = parseFloat((state.percent * 100).toFixed(2));
                this.transferred = parseFloat((state.size.transferred / (1000 * 1000)).toFixed(2));
                this.total = parseFloat((state.size.total / (1000 * 1000)).toFixed(2));
            }
        },
        created() {
            ipcRenderer.on('startDownload', this.handleStartDownload);
            ipcRenderer.on('setProgressBar', this.handleSetProgressBar);
        },
        beforeDestroy() {
            ipcRenderer.removeListener('startDownload', this.handleStartDownload);
            ipcRenderer.removeListener('setProgressBar', this.handleSetProgressBar);
        }
    }
</script>

<style lang="less">
    .login {
        width: 100%;
        height: 100%;
        background-image: url('../assets/images/login-background.jpg');
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        flex-direction: column;

        &-con {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            align-self: center;
            text-align: center;

            &-card {
                margin: 0 auto;
            }
        }

        .copyright {
            position: absolute;
            bottom: 10px;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            left: 50%;
            transform: translateX(-50%);
        }
    }
</style>