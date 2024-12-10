# MRBS-Display

<div style="background-color: #591bb7; height: 100px;border-radius: 8px;display:flex;justify-content: center; align-items: center;">
<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/bcc-logo-en-CmDVMASO%20-%20%E5%89%AF%E6%9C%AC.png?raw=true" alt="image-20241210095740692" />
</div>


MRBS-Display（会议预约系统平板端，以下简称**平板端**）是**BCC MRBS**（BCC会议室预约系统）的平板端应用，供用户浏览和快速预约会议。

<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/image-20241210112331408.png?raw=true" alt="image-20241210112331408" style="zoom: 25%;" />

> 图1  正式版页面。目前并没有会议

## 平台架构

平台分为三部分开发：

- 内核网页（inner）：使用uniapp编写，发布为H5网页。最新地址为：
  - 正式版：https://meeting-manage-dev.businessconnectchina.com:11443/display/v2.1/index.html
  - 测试版：https://meeting-manage-test.businessconnectchina.com:12443/display/v2.1/index.html

- 外壳容器（shell-new）：使用uniapp编写，内含一个全屏webview容器，此容器总是显示后台指定版本的内核网页（允许远程更新和回退）。其编译为安卓本地打包资源（\_\_UNI\_\_2E5D094），供下一步使用。
- 安卓应用（uniapp-android）：使用Android Studio编写，编译为可在平板上直接安装的安卓APK软件包。

平台由 [mrbs-server](https://github.com/synaric-y/mrbs-server)（mrbs管理员后台）提供支持。

## 核心功能

- 预约平板快速会议（于2.1版过时）& 在企业微信扫码预约会议
- 显示会议室状态（空闲中|会议中）；显示会议标题、预订人、会议时长等信息（部分字段可配置是否展示）
- 国际化支持，可切换中文|英文|韩文
- 远程版本更新
- 实现专用设备管理，应用锁定+开机自启+限制旋转+屏幕常亮

## 开发环境

- HbuilderX 4.36（最新版）

- Android Studio Ladybug | 2024.2.1 Patch 2

- 安卓平板

  | 机型   | Android 版本 | API Level        | 分辨率      | 架构  | 备注   |
  | ------ | ------------ | ---------------- | ----------- | ----- | ------ |
  | Xiaomi | 13.0         | 33（"Tiramisu"） | 1200 x 1920 | arm64 | 测试用 |
  | HJC    |              |                  |             |       |        |

## 安装/运行

- inner

  1.  ```
      npm install
      ```

  2. 发行-> 网站PC Web或手机H5 -> 在`unpackage\dist\build\web`下找到打包好的网页

- shell-new
  1. ```
     npm install
     ```
  2. 发行 -> App-Android/iOS-本地打包 -> 生成本地打包App资源 -> 在`unpackage\resources`下找到打包好的资源
  
- uniapp-android

  1. 等待sync结束，选择build->Generate Signed App Bundle/APK

  2. l连接平板，使用adb安装apk文件

  3. 等待安装结束，使用adb运行以下命令，设置设备管理员：

     ```shell
     adb shell dpm remove-active-admin com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
     ```

  4. 重启设备，应用将自动开启并进入任务锁定模式

## 目录结构

### 根目录

- assets：存放README用到的图片
- inner: 内核网页
- shell-new: 外壳容器
- uniapp-android: 安卓应用
- `.gitignore`
- `LICENSE`
- `README.md`：英文文档
- `README-zh.md`：中文文档

### inner

- api：接口js文件
- components：全局组件，如电量显示、对话框、语言选择等
- constants：业务常量，如时间单位、会议类别代码等
- docs：jsdoc文档，打开index.html即可查看完整文档
- mixin：用于向各个组件混入vuex的get/set方法
- node_modules：npm install存放安装包的位置
- pages：存放主页
  - `index/index.vue`：主页
- src：i18n相关文件
- static：小图标
- store：vuex相关文件
- uni_modules：uniapp内置组件的存放位置
- utils：js工具类，如请求、时间计算等
- views：存放子视图
  - `ActivateView.vue`：激活页
  - `LoginView.vue`：登录页
  - `SettingView.vue`：设置页
- `App.vue`：主组件
- `index.html`：入口网页
- `jsdoc.json`：jsdoc的配置文件
- `main.js`：入口程序
- `manifest.json`：uniapp发行配置
- `package.json`：npm install清单
- `package-lock.json`：npm install下载记录
- `pages.json`：uniapp路由|页面配置
- `uni.promisfy.adaptor.js`：uniapp库函数，作用未知
- `uni.scss`：uniapp全局样式

### shell-new

- pages：存放主页
  - `index/index.vue`：主页
- static：测试用，存放静态网页
- unpackage：导出的资源
  - cache：编译缓存
  - dist：编译结果
  - release
    - apk：云打包存放apk的文件夹
  - resources
    - \_\_UNI\_\_2E5D094：本地打包Android资源，其中`__UNI__2E5D094`是appid
- `App.vue`：主组件
- `index.html`：入口网页
- `main.js`：入口程序
- `manifest.json`：uniapp发行配置
- `pages.json`：uniapp路由|页面配置
- `uni.promisfy.adaptor.js`：uniapp库函数，作用未知
- `uni.scss`：uniapp全局样式

### uniapp-android

- app：主项目文件夹
- gradle
  - wrapper：存放下载的gradle
- `.gitignore`
- `build.gradle`：这个目录下的不重要（app目录下的build.gradle非常重要）
- `gradle.properties`：未知
- `gradlew`：gradle脚本文件
- `gradlew.bat`：gradle脚本文件
- `HBuilder-Hello.iml`：未知
- `local.properties`：未知
- `MyApplication.iml`：未知
- `settings.gradle`：未知

#### app

- build：debug版本输出目录

- libs：依赖库

- release：release版本输出目录

- src：源码

- `app.iml`：未知

- `build.gradle`：**极其重要**，与Android版本、包名、依赖有关

- `proguard-rules`：未知

- `test.jks`：测试用安卓签名证书，现无作用

- `test.keystore`：目前在用的安卓签名证书

  ```
  key store password:
  123456
  
  Key alias:
  testalias
  
  Key password:
  123456
  ```

  使用以下命令查看keystore：

  ```shell
  keytool -list -v -keystore test.keystore 
  ```

  按要求输入密钥即可。

