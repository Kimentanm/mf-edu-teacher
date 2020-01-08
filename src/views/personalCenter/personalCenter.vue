<style scoped>
     .ivu-card-body {
            height: 100%;
            overflow: auto;
        }

     .cropperAgain{
         height:300px;
         width: 500px ;
     }
</style>
<template>
<Card>
<div style="height: 100%">
    <Row :gutter="25">
        <Col span="7">
            <div> <br/></div>
        </Col>
        <Col span="10">
            <Row :gutter="5">
            <Col span="6">
                <div class="demo-avatar" >
                    <a @click="changeAvatar">
                        <Avatar :src="userForm.imageUrl" icon="ios-person" size="85" />
                    </a>
                </div>
            </Col>
            <Col span="18">
                <List >
                    <ListItem>
                        <span>姓名：{{userForm.realName}}</span>
                    </ListItem>
                    <ListItem>
                        <span>用户ID：{{userForm.id}}</span>
                    </ListItem>
                    <ListItem>
                    <span>密码：******</span>
                    <ListItemMeta/>
                    <template slot="action">
                        <li>
                            <a @click="changeKey">修改密码</a>
                        </li>
                    </template>
                    </ListItem>
                </List>
            </Col>
        </Row>
        <Divider dashed />
            <Form :model="userForm" :label-width="80">
                <FormItem label="昵称">
                    <Input v-model="userForm.userName" placeholder="请输入昵称..."></Input>
                </FormItem>
                <FormItem label="手机号">
                    <Input v-model="userForm.mobilePhone" placeholder="请输入手机号..."></Input>
                </FormItem>
                <FormItem label="性别">
                    <RadioGroup v-model="userForm.gender">
                        <Radio :label="0">男生</Radio>
                        <Radio :label="1">女生</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="是否启用">
                    <i-switch  size="large">
                        <span slot="open">On</span>
                        <span slot="close">Off</span>
                    </i-switch>
                </FormItem>
                <FormItem label="个性标签">
                    <Input v-model="userForm.signature" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="谁言烟火不寂寞，谁言灰烟火不堕落    ———杀大海"></Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" :loading="isSaving" @click="handleSubmit()">保存</Button>
                </FormItem>
            </Form>
        </Col>
        <Col span="7">
            <div>
                <br/>
                <Modal
                    title="修改密码"
                    v-model="changKeyShow"
                     @on-ok="handPasswords"
                    :mask-closable="false">
                    <Form ref='saveForm' :model='saveForm' :rules='userFormRule' :label-width='90'>
                        <FormItem label='密码' prop='password'>
                        <Input  type="password" v-model='saveForm.password' :maxlength=500 style="width:350px;"
                                :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                        </FormItem>
                        <FormItem label='确认密码' prop='pwdCheck'>
                        <Input type="password" v-model='saveForm.pwdCheck' :maxlength=500 style="width: 350px;"  
                                :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                        </FormItem>
                    </Form>
                </Modal>
                <Modal v-model="showAvatar">
                    <img class="own-img" :src="userForm.imageUrl"/>
                    <a>
                        <div class="fileInput update-own-img-button">
                            <input type="file" multiple="multiple" accept="image/png, image/jpeg, image/gif, image/jpg"
                                   @change="handleChange"
                                   id="fileupload"/>
                        </div>
                    </a>
                </Modal>

                <Modal v-model="pictureShow">
                    <p slot="header">裁剪图片</p>
                    <div class="cropperAgain">
                        <vueCropper
                                ref="cropper"
                                :img="cut.Img"
                                :outputSize="cut.size"
                                :outputType="cut.outputType"
                                :autoCrop="cut.autoCrop"
                                :autoCropWidth="cut.autoCropWidth"
                                :autoCropHeight="cut.autoCropHeight">
                        </vueCropper>
                    </div>
                    <Spin fix v-if="pictureModalLoading">
                        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                        <div>正在加载...</div>
                    </Spin>
                    <div slot="footer">
                        <Button type="primary" @click="handleCrop" :loading="pictureButtonLoading">保存</Button>
                    </div>
                </Modal>
            </div>
        </Col>
    </Row>
</div>
</Card>  
</template>
<script>
    import {cropperPicture,getUserIdentity} from '../../libs/util';
    import VueCropper from 'vue-cropper';
    import { commitTeacherData,savePassword,saveAvatar } from '@/api/personalCenter.js'
    import { mapActions } from 'vuex'

    export default {
        components: {VueCropper},
        name: 'personalcenter',
        data () {
            const pwdCheckValidate = (rule, value, callback) => {
                if (this.saveForm.password != '' && value == '') {
                    callback(new Error('确认密码不能为空'));
                } else if (this.saveForm.password != value) {
                    callback(new Error('新密码和确认密码应相同'));
                } else {
                    callback();
                }
            };
            const userNameCheckValidate = (rule, value, callback) => {
                if (value) {
                if (value.indexOf(":") !== -1) {
                    callback(new Error('用户名中不能包含特殊字符'));
                } else {
                    callback();
                }
                } else {
                callback(new Error('用户名不能为空'));
                }
            };
            return {
                 cut: {
                    size: 1,
                    Img: '',
                    outputType: 'jpeg || png || web',
                    autoCrop: true,
                    autoCropWidth: 120,
                    autoCropHeight: 120
                },
                pictureShow:false,
                pictureModalLoading: false,
                pictureButtonLoading: false,
                showAvatar:false,
                enterPassword:'',//用于保存密码
                saveForm:{
                    userName: undefined,
                    realName: undefined,
                    password: undefined,
                    imageUrl: undefined,
                    mobilePhone: undefined,
                    gender: undefined,
                    email: undefined,
                    pwdCheck: undefined,
                },
                showCropedImage:false,
                changKeyShow:false,
                isSaving:false,
                // userForm:{},
                userFormRule: {
                    password: [
                        { required: true, message: '密码不能为空.', trigger: 'blur' },
                        { type: 'string', max: 255, message: '密码最多255字符', trigger: 'blur' },
                    ],
                    pwdCheck:[
                        {required: true, validator: pwdCheckValidate, trigger: 'blur'}
                    ]
                    },
            }
        },
        computed:{
            userForm(){
                return this.$store.state.user.userIdentity;
            }
        },
        methods:{
             ...mapActions([
                'getUserInfo',
                'handleLogOut',
            ]),
            // getUserForm(){
            //     this.userForm= this.$store.state.user.userIdentity;
            // },
            changeKey(){
                this.changKeyShow=true;
                 this.getUserInfo();
                 this.saveForm = this.$store.state.user.userIdentity;
                 this.saveForm.password='';
            },
            //保存按钮
            handleSubmit() {
                commitTeacherData(this.userForm).then(res => {
                    console.log(this.userForm)
                    if (res.code === 200) {
                        this.getUserInfo();
                        this.$Message.success('更新成功！');
                    }
                    else{
                        this.$Message.error('更新失败！' + res.code);
                    }
                })
            },
            //保存密码
            handPasswords(){
                let params = {
                    id:this.saveForm.id,
                    password:this.saveForm.password,
                    type:"TEACHER"
                }
                 savePassword(params).then(res => {
                    if (res.code === 200) {
                        this.$Message.success('修改密码成功,请重新登录');
                        // 执行登出操作
                        this.handleLogOut();
                        this.$router.push({
                            name: 'login'
                        });
                    }
                    else{
                        this.$Message.error('修改失败！' + res.code);
                    }
                })
            },
            changeAvatar(){
               this.showAvatar=true;
            },
            //更换头像
           handleChange (e) {
                this.pictureModalLoading = true;
                this.showAvatar = false;
                this.pictureShow = true;
                let reader = cropperPicture(e);
                // console.log(reader);
                reader.onload = (event) => {
                    let data = event.target.result;
                    reader.onload = null;
                    this.cut.Img = data;
                    this.pictureModalLoading = false;
                };
            },
             handleCrop () {
                this.pictureButtonLoading = true;
                let fd = new FormData();
                // 获取截图的blob数据
                this.$refs.cropper.getCropBlob((data) => {
                    fd.append("picturefile", data, "cropped.png");
                    const config = {
                        headers: {'Content-Type': 'multipart/form-data'}
                    };
                    saveAvatar  (fd, config).then(resp => {
                        if (resp.code === 200) {
                            this.pictureButtonLoading = false;
                            this.pictureShow = false;
                            this.$store.dispatch('getUserInfo');
                            this.$Message.success("修改头像成功");
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                });
            }  
        },
        created() {
        },
        mounted(){
            // this.getUserForm();
        }
    }
</script>