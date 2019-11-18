<template>
    <div class="header-bar">
        <Menu :active-name="activeName" mode="horizontal" theme="dark" active-name="1" style="height: 100%">
            <div class="layout-logo"></div>
            <div class="custom-bar">
                <div v-if="routeName === 'class-index'" class="class-bar">
                    <Button type="error" icon="md-close" shape="circle" @click="$router.go(-1)"></Button>
                </div>
            </div>
            <div class="layout-nav">
                <Tooltip content="退出登录">
                    <MenuItem name="login-out">
                        <Icon type="md-log-out" size="26" @click="loginOut"/>
                    </MenuItem>
                </Tooltip>
            </div>
        </Menu>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'

    export default {
        name: "header-bar",
        components: {},
        data() {
            return {
                activeName: ''
            }
        },
        props: {
            routeName: String
        },
        watch: {},
        computed: {},
        methods: {
            ...mapActions([
                'handleLogOut'
            ]),
            loginOut() {
                this.handleLogOut().then(() => {
                    this.$router.push({
                        name: 'login'
                    })
                });
            },
        },
        created() {
        }
    }
</script>

<style lang="less">
    .header-bar {
        height: 100%;

        .layout-logo{
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

            .class-bar {
                height: 100%;
                text-align: center;
            }
        }

        .layout-nav{
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
</style>