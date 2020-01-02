import { dialog, shell, app } from 'electron'
const EAU = require('electron-asar-hot-updater');
import axios from 'axios'
const release = 'https://api.github.com/repos/Molunerfinn/PicGo/releases/latest'
const downloadUrl = 'https://github.com/Molunerfinn/PicGo/releases/latest'

let mainWindow;

const checkVersion = async ( version, win ) => {
    mainWindow = win;
    // const res = await axios.get(release)
    // if (res.status === 200) {
    //     const latest = res.data.name // 获取版本号
    //     const result = compareVersion2Update(version, latest) // 比对版本号，如果本地版本低于远端则更新
    //     if (result) {
            dialog.showMessageBox({
                type: 'info',
                title: '发现新版本',
                buttons: ['Yes', 'No'],
                message: '发现新版本' + version + '，更新了很多功能，是否去下载最新的版本？',
                checkboxLabel: '以后不再提醒',
                checkboxChecked: false
            }, (res, checkboxChecked) => {
                if (res === 0) { // if selected yes
                    hotUpdate();
                }
            })
        // }
};

const hotUpdate = () => {
    // Initiate the module
    EAU.init({
        'api': 'http://localhost:8082/mf-edu/version/last?type=teacher', // The API EAU will talk to
        'server': false, // Where to check. true: server side, false: client side, default: true.
        'debug': false, // Default: false.
        // 'body': {
        //     name: packageInfo.name,
        //     current: packageInfo.version
        // }, // Default: name and the current version
        'formatRes': function(res) {
            const data = res.data;
            const result = {
                version: 'v0.1.1',
                asar: data.resUrl
            }
            return result;
        } // 对返回的数据进行格式化操作的回调函数，保证EAU可以正常操作操作数据。比如格式化后返回：{version: xx, asar: xx}
    });

    EAU.check(function (error, last, body) {
        if (error) {
            if (error === 'no_update_available') { return false; }
            dialog.showErrorBox('info', error)
            return false
        }

        mainWindow.webContents.send('startDownload');

        EAU.progress(function (state) {
            console.log(state);
            mainWindow.webContents.send('setProgressBar', state);
            mainWindow.setProgressBar(state.percent);
        });

        EAU.download(function (error) {
            console.log(error);
            if (error) {
                dialog.showErrorBox('info', error)
                return false
            }
            // dialog.showErrorBox('info', 'App updated successfully! Restart it please.')
            if (process.platform === 'darwin') {
                app.relaunch()
                app.quit()
            } else {
                app.quit()
            }
        })
    });
}

// if true -> update else return false
const compareVersion2Update = (current, latest) => {
    const currentVersion = current.split('.').map(item => parseInt(item))
    const latestVersion = latest.split('.').map(item => parseInt(item))
    let flag = false

    for (let i = 0; i < 3; i++) {
        if (currentVersion[i] < latestVersion[i]) {
            flag = true
        }
    }

    return flag
}

export default checkVersion;