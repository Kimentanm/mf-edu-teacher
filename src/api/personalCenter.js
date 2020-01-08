import http from '@/libs/http.request'

export const commitTeacherData = (teacherForm) => {
    return http.put('/teacher',teacherForm)
};

export const savePassword = (teacherForm) => {
    return http.put('/user/password',teacherForm)
};

export const saveAvatar = ( fd, config) => {
    return http.post('/user/avatar/upload',fd, config)
};