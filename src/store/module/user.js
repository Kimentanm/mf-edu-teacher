import { login, getUserInfo } from '@/api/user';
import { setToken, getToken, setAccess, getAccess, getPermissionIds, setPermissionIds, getUserName, setUserName,
    getUserId, setUserId, setAvator, getAvator, clearCookies, getUserIdentity, setUserIdentity } from '@/libs/util'

export default {
    state: {
        token: getToken(),
        userIdentity: getUserIdentity(),
    },
    mutations:  {
        setToken (state, token) {
            state.token = token;
            setToken(token)
        },
        setUserIdentity (state, userIdentity) {
            state.userIdentity = userIdentity
            setUserIdentity(userIdentity)
        }
    },
    actions: {
        // 登录
        handleLogin({commit}, userForm) {
            userForm.userName = userForm.userName.trim();
            return new Promise((resolve, reject) => {
                login({
                    username: userForm.userName,
                    password: userForm.password
                }).then(res => {
                    if (res.code === 200) {
                        commit('setToken', res.data);
                        resolve()
                    } else {
                        reject(res)
                    }
                }).catch(err => {
                    reject(err)
                })
            })
        },
        // 退出登录
        handleLogOut({state, commit}) {
            return new Promise((resolve, reject) => {
                clearCookies();
                commit('setToken', '');
                resolve();
            })
        },
        // 获取用户相关信息
        getUserInfo({state, commit}) {
            return new Promise((resolve, reject) => {
                getUserInfo().then(res => {
                    const data = res.data;
                    commit('setUserIdentity', data);
                    resolve(data)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
}