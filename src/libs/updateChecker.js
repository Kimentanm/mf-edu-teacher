import { dialog, shell, app } from 'electron'
const EAU = require('electron-asar-hot-updater');
import axios from 'axios'
import baseUrl from '../config/url';

// 注意这个autoUpdater不是electron中的autoUpdater
import {autoUpdater} from "electron-updater"

let mainWindow;

const checkVersion = async ( win ) => {
    let version = app.getVersion();
    mainWindow = win;
    const res = await axios.post(baseUrl + "/version/last?type=TEACHER");
    if (res.data.code === 200) {
        const latest = res.data.data.versionNo; // 获取版本号
        const result = compareVersion2Update(version, latest); // 比对版本号，如果本地版本低于远端则更新
        if (result) {
            dialog.showMessageBox({
                type: 'info',
                title: '发现新版本',
                buttons: ['Yes', 'No'],
                message: '发现新版本' + latest + '，更新了很多功能，是否去下载最新的版本？',
            }, (res) => {
                if (res === 0) { // if selected yes
                    handleUpdate();
                }
            })
        }
    }
};

function handleUpdate() {
    //和之前package.json配置的一样
    autoUpdater.setFeedURL('http://www.kimen.com.cn/download/');

    //更新错误
    autoUpdater.on('error', function (error) {
        console.log('error');
    });

    //检查中
    autoUpdater.on('checking-for-update', function () {
        console.log('checking-for-update');
    });

    //发现新版本
    autoUpdater.on('update-available', function (info) {
        mainWindow.webContents.send('startDownload');
    });

    //当前版本为最新版本
    autoUpdater.on('update-not-available', function (info) {
        console.log('update-not-available');
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        console.log(JSON.stringify(progressObj));
        mainWindow.webContents.send('setProgressBar', progressObj);
        mainWindow.setProgressBar(progressObj.percent);
    });


    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        console.log('update-downloaded');
        dialog.showMessageBox({
            type: 'info',
            title: '应用更新成功',
            buttons: ['立即重启', '稍后重启'],
            message: '应用更新成功，请立即重启当前应用',
        }, (res) => {
            if (res === 0) { // if selected yes
                autoUpdater.quitAndInstall();
            } else {
                mainWindow.webContents.send('endDownload');
            }
        });
        // ipcMain.on('isUpdateNow', (e, arg) => {
        //     //some code here to handle event
        //
        // });
        // // win.webContents.send('isUpdateNow')
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
}

const hotUpdate = () => {
    // Initiate the module
    EAU.init({
        'api': baseUrl + "/version/last?type=TEACHER", // The API EAU will talk to
        'server': false, // Where to check. true: server side, false: client side, default: true.
        'debug': false, // Default: false.
        'formatRes': function(res) {
            if (res.code === 200) {
                const data = res.data;
                return {
                    version: data.versionNo,
                    asar: data.resUrl,
                };
            }
        }
    });

    EAU.check(function (error, last, body) {
        if (error) {
            if (error === 'no_update_available') { return false; }
            dialog.showErrorBox('info', error);
            return false
        }

        mainWindow.webContents.send('startDownload');

        EAU.progress(function (state) {
            mainWindow.webContents.send('setProgressBar', state);
            mainWindow.setProgressBar(state.percent);
        });

        EAU.download(function (error) {
            if (error) {
                if (error === 'failed_to_download_update') {
                    dialog.showMessageBox(
                        {
                            type: 'error',
                            title: '发生错误',
                            message: "下载更新文件失败，请重新启动客户端！",
                            buttons: ['重启', '取消']
                        }, (res) => {
                            if (res === 0) {
                                app.relaunch();
                                app.quit();
                            }
                        });
                    return false;
                }
                dialog.showErrorBox('info', error)
                return false;
            }
            dialog.showMessageBox({
                type: 'info',
                title: '应用更新成功',
                buttons: ['立即重启', '稍后重启'],
                message: '应用更新成功，请立即重启当前应用',
            }, (res) => {
                if (res === 0) { // if selected yes
                    app.relaunch();
                    app.quit();
                } else {
                    mainWindow.webContents.send('endDownload');
                }
            });
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