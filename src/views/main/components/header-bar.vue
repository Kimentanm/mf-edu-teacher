<template>
    <div class="header-bar">
        <Menu :active-name="activeName" mode="horizontal" theme="dark" active-name="1" style="height: 100%">
            <div class="layout-logo"></div>
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
        props: {},
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