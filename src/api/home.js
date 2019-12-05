import http from '@/libs/http.request'

export const getClassRoomListByTeacher = () => {
    return http.get('/class/room/teacher')
};