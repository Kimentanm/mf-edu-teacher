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

        <Modal v-model="loginModal" title="正在登陆" width="300px" class-name="login-loading" :closable="false">
            <Spin>
                <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
            </Spin>
            <div slot="footer">

            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'

    export default {
        name: "login",
        components: {},
        data() {
            return {
                loginForm: {
                    userName: 'admin',
                    password: '123456'
                },
                loginFormRules: {
                    userName: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                },
                loginModal: false
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
                this.$socket.emit('msginfo', '123');
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
            }
        },
        created() {
            this.sockets.subscribe('msginfo', (data) => {
                console.log(data);
            });
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
    }

    .login-loading {
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal{
            top: 0;
        }

        .ivu-modal-body {
            padding: unset;
        }

        .spin-icon-load {
            font-size: 32px !important;
            animation: ani-demo-spin 1s linear infinite;
        }

        .ivu-modal-header {
            border-bottom: unset;
        }

        .ivu-modal-header-inner {
            text-align: center;
        }

        .ivu-modal-footer {
            border-top: unset;
        }
    }
</style>