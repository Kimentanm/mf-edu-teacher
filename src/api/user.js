import http from '@/libs/http.request'

export const login = ({ username, password, type }) => {
  const data = {
    username,
    password,
    type
  };
  return http.post('authenticate', data)
};

export const getUserInfo = () => {
  return http.get('teacher/identity')
};

export const logout = (token) => {
  return http.request({
    url: 'logout',
    method: 'post'
  })
};
