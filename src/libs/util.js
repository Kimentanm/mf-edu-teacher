import Cookies from 'js-cookie'
// cookie保存的天数
import {forEach, hasOneOf} from '@/libs/tools'

export const TOKEN_KEY = 'token';

export const USER_IDENTITY_KEY = 'user_identity';

export const ACCESS_KEY = 'user_access';

export const PERMISSION_KEY = 'user_permission';

export const USER_NAME = 'user_name';

export const USER_ID = 'user_id';

export const USER_AVATOR = 'user_avator';

export const setAccess = access => {
  Cookies.set(ACCESS_KEY, access.join(','))
};
export const getAccess = () => {
  const access = Cookies.get(ACCESS_KEY);
  return access && access.split(',')
};
export const clearAccess = () => {
  Cookies.remove(ACCESS_KEY);
};

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token)
};
export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) return token;
  else return false
};

export const setUserIdentity = (userIdentity) => {
  Cookies.set(USER_IDENTITY_KEY, userIdentity)
};
export const getUserIdentity = () => {
  const userIdentity = Cookies.get(USER_IDENTITY_KEY);
  if (userIdentity) return JSON.parse(userIdentity);
  else return false
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const setPermissionIds = permissionIds => {
  Cookies.set(PERMISSION_KEY, permissionIds.join(','))
};
export const getPermissionIds = () => {
  const permissionIds = Cookies.get(PERMISSION_KEY);
  return permissionIds && permissionIds.split(',')
};
export const clearPermissionIds = () => {
  Cookies.remove(PERMISSION_KEY);
};

export const setUserName = username => {
  Cookies.set(USER_NAME, username);
};
export const getUserName = () => {
  return Cookies.get(USER_NAME);
};
export const clearUserName = () => {
  Cookies.remove(USER_NAME);
};

export const setUserId = userId => {
  Cookies.set(USER_ID, userId);
};
export const getUserId = () => {
  return Cookies.get(USER_ID);
};
export const clearUserId = () => {
  Cookies.remove(USER_ID);
};

export const setAvator = avatorImgPath => {
  Cookies.set(USER_AVATOR, avatorImgPath);
};
export const getAvator = () => {
  return Cookies.get(USER_AVATOR);
};
export const clearAvator = () => {
  Cookies.remove(USER_AVATOR);
};

export const clearCookies = () => {
  clearAccess();
  clearAvator();
  clearPermissionIds();
  clearToken();
  clearUserId();
  clearUserName();
};

export const hasChild = (item) => {
  return item.children && item.children.length !== 0
};

// const showThisMenuEle = (item, permissionNames) => {
//   if (item.meta && item.meta.access && item.meta.access.length) {
//     if (hasOneOf(item.meta.access, permissionNames)) return true;
//     else return false
//   } else return true
// };

export const getMenu = (list) => {
  let res = [];
  forEach(list, item => {
    if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta,
        role: item.role
      };
      if ((hasChild(item) || (item.meta && item.meta.showAlways))) {
        obj.children = getMenu(item.children);
        if (!obj.children || obj.children.length === 0) {
          obj.meta.hideInMenu = true;
          delete obj.children
        }
      }
      if (item.meta && item.meta.href) obj.href = item.meta.href;
      res.push(obj);
    }
  });

  return res
}

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = (routeMetched, homeRoute) => {
  let res = routeMetched.filter(item => {
    return item.meta === undefined || !item.meta.hide
  }).map(item => {
    let obj = {
      icon: (item.meta && item.meta.icon) || '',
      name: item.name,
      meta: item.meta
    }
    return obj
  })
  res = res.filter(item => {
    return !item.meta.hideInMenu
  })
  return [Object.assign(homeRoute, {to: homeRoute.path}), ...res]
}

/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
export const getMenuByRouter = (list) => {
  let res = [];
  forEach(list, item => {
    if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta,
      };
      if ((hasChild(item))) {
        let children = getMenuByRouter(item.children)
        obj = children[0]
      }
      res.push(obj)
    }
  });
  return res
};

export const showTitle = (item, vm) => vm.$config.useI18n ? vm.$t(item.name) : ((item.meta && item.meta.title) || item.name)

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  localStorage.tagNaveList = JSON.stringify(list)
}
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = localStorage.tagNaveList
  return list ? JSON.parse(list) : []
}

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = routers => {
  let i = -1
  let len = routers.length
  let homeRoute = {}
  while (++i < len) {
    let item = routers[i]
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children)
      if (res.name) return res
    } else {
      if (item.name === 'home') homeRoute = item
    }
  }
  return homeRoute
}

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const {name, path, meta} = newRoute
  let newList = [...list]
  if (newList.findIndex(item => item.name === name) >= 0) return newList
  else newList.push({name, path, meta})
  return newList
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  if (route.meta && route.meta.access) return hasOneOf(access, route.meta.access)
  else return true
}

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const routePermissionJudge = (list) => {
    return list.some(item => {
      if (item.children && item.children.length) {
        return routePermissionJudge(item.children)
      } else if (item.name === name) {
        return hasAccess(access, item)
      }
    })
  }

  return routePermissionJudge(routes)
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split('?')[1].split('&')
  let paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextName = (list, name) => {
  let res = ''
  if (list.length === 2) {
    res = 'home'
  } else {
    if (list.findIndex(item => item.name === name) === list.length - 1) res = list[list.length - 2].name
    else res = list[list.findIndex(item => item.name === name) + 1].name
  }
  return res
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
  let i = -1
  while (++i < times) {
    callback()
  }
}

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = (file) => {
  let nameSplit = file.name.split('.')
  let format = nameSplit[nameSplit.length - 1]
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsText(file) // 以文本格式读取
    let arr = []
    reader.onload = function (evt) {
      let data = evt.target.result // 读到的数据
      let pasteData = data.trim()
      arr = pasteData.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(row => {
        return row.split('\t')
      }).map(item => {
        return item[0].split(',')
      })
      if (format === 'csv') resolve(arr)
      else reject(new Error('[Format Error]:你上传的不是Csv文件'))
    }
  })
}

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = (array) => {
  let columns = []
  let tableData = []
  if (array.length > 1) {
    let titles = array.shift()
    columns = titles.map(item => {
      return {
        title: item,
        key: item
      }
    })
    tableData = array.map(item => {
      let res = {}
      item.forEach((col, i) => {
        res[titles[i]] = col
      })
      return res
    })
  }
  return {
    columns,
    tableData
  }
}

export const findNodeUpper = (ele, tag) => {
  if (ele.parentNode) {
    if (ele.parentNode.tagName === tag.toUpperCase()) {
      return ele.parentNode
    } else {
      return findNodeUpper(ele.parentNode, tag)
    }
  }
}

export const findNodeDownward = (ele, tag) => {
  const tagName = tag.toUpperCase()
  if (ele.childNodes.length) {
    let i = -1
    let len = ele.childNodes.length
    while (++i < len) {
      let child = ele.childNodes[i]
      if (child.tagName === tagName) return child
      else return findNodeDownward(child, tag)
    }
  }
}

export const showByAccess = (access, canViewAccess) => {
  return hasOneOf(canViewAccess, access)
};

// 选择图片

export const cropperPicture = (event) => {
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  return reader;
};

// 深度拷贝
export const cloneObj = (obj) => {
  let str;
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return;
  } else if (window.JSON) {
    str = JSON.stringify(obj); // 序列化对象
    newobj = JSON.parse(str); // 还原
  } else {
    for (let i in obj) {
      newobj[i] = typeof obj[i] === 'object' ? cloneObj(obj[i]) : obj[i];
    }
  }
  return newobj;
};
