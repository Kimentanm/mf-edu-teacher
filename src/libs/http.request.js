import Axios from 'axios'
import { Message } from 'view-design'
import { getToken, clearToken } from '@/libs/util'
import baseUrl from "../config/url"

class HttpRequest {
    constructor () {
        this.options = {
            method: '',
            url: ''
        }
        // 存储请求队列
        this.queue = {}
    }
    // 销毁请求实例
    destroy (url) {
        delete this.queue[url]
        const queue = Object.keys(this.queue)
        return queue.length
    }
    // 请求拦截
    interceptors (instance, url) {
        // 添加请求拦截器
        instance.interceptors.request.use(config => {
            const token = getToken();
            if (!config.url.includes('/users')) {
                config.headers['x-access-token'] = token
            }
            if (token && token !== 'undefined') {
                config.headers['Authorization'] = 'Bearer ' + token; // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
            }
            config.headers['X-Requested-With'] = 'XMLHttpRequest ';
            // Spin.show()
            // 在发送请求之前做些什么
            return config
        }, error => {
            // 对请求错误做些什么
            return Promise.reject(error)
        });

        // 添加响应拦截器
        instance.interceptors.response.use((res) => {
            let { data } = res
            const is = this.destroy(url)
            if (!is) {
                setTimeout(() => {
                    // Spin.hide()
                }, 500)
            }
            if (data.code !== 200) {
                if (data.code === 998) {
                    clearToken();
                    window.location.href = '/#/login'
                    Message.error({
                        background: true,
                        content: data.message,
                        duration: 60,
                        closable: true
                    });
                    return;
                } else {
                    if (data.msg) Message.error(data.msg)
                }
                return data
            }
            return data
        }, (error) => {
            Message.error('服务内部错误')
            // 对响应错误做点什么
            return Promise.reject(error)
        })
    }
    // 创建实例
    create () {
        let conf = {
            baseURL: baseUrl,
            // timeout: 2000,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-URL-PATH': location.pathname
            }
        }
        return Axios.create(conf)
    }
    // 合并请求实例
    mergeReqest (instances = []) {
        //
    }

    handleError (error) {
        if(error.response.status === 403){
            let ssoRedirect = error.response.headers['sso-redirect'];
            if(ssoRedirect){
                // clearToken();
                location.href = 'http://localhost:8080/login?redirect=http://localhost:9000/category/category';
                return;
            }
        }
        if (error.response.message === '999') {
            // 错误的token 请求
            clearToken()
            // router.push({name: 'login'});
        }
        return Promise.reject(error);
    }
    // 请求实例
    request (options) {
        const instance = this.create()
        this.interceptors(instance, options.url)
        options = Object.assign({}, options)
        this.queue[options.url] = instance
        return instance(options)
    }

    get (url, params) {
        return this.request({url, params, method: 'get'})
            .catch(this.handleError);
    }

    post (url, data, config) {
        return this.request({url, data, method: 'post'})
            .catch(this.handleError);
    }

    put (url, data, config) {
        return this.request({url, data, method: 'put'})
            .catch(this.handleError);
    }

    delete (url, config) {
        return this.request({url, method: 'delete'})
            .catch(this.handleError);
    }
}

const http = new HttpRequest();
export default http
