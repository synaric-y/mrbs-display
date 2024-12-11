# MRBS-Display

MRBS-Display（会议预约系统平板端，以下简称**平板端**）是**BCC MRBS**（BCC会议室预约系统）的平板端应用，供用户浏览和快速预约会议。

<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/image-20241210112331408.png?raw=true" alt="image-20241210112331408" style="zoom: 25%;" />

## 平台架构

平台分为三部分开发：

- 内核网页（inner）：使用uniapp编写，发布为H5网页。最新地址为：
  - 正式版：https://meeting-manage-dev.businessconnectchina.com:11443/display/v2.1/index.html
  - 测试版：https://meeting-manage-test.businessconnectchina.com:12443/display/v2.1/index.html

- 外壳容器（shell-new）：使用uniapp编写，内含一个全屏webview容器，此容器总是显示后台指定版本的内核网页（允许远程更新和回退）。其编译为安卓本地打包资源（\_\_UNI\_\_2E5D094），供下一步使用。
- 安卓应用（uniapp-android）：使用Android Studio编写，编译为可在平板上直接安装的安卓APK软件包。

平台由 [mrbs-server](https://github.com/synaric-y/mrbs-server)（mrbs管理员后台）提供支持。

<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/image-20241211114557430.png?raw=true" style="zoom:50%;" />

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

  | 机型   | Android 版本     | API Level | 分辨率      | 架构  | 备注          |
  | ------ | ---------------- | --------- | ----------- | ----- | ------------- |
  | Xiaomi | 13.0("Tiramisu") | 33        | 1200 x 1920 | arm64 | 测试用        |
  | HJC    | 11.0("R")        | 30        | 1200 x 2000 | arm64 | 正式用（4台） |

## 安装/运行

- inner

  1.  ```
      npm install
      ```

  2. 打开HbuilderX->发行-> 网站PC Web或手机H5 -> 在`unpackage\dist\build\web`下找到打包好的网页

- shell-new
  1. ```
     npm install
     ```
  2. 打开HbuilderX->发行 -> App-Android/iOS-本地打包 -> 生成本地打包App资源 -> 在`unpackage\resources`下找到打包好的资源
  
- uniapp-android

  1. 等待sync结束，选择build->Generate Signed App Bundle/APK

  2. 连接平板，使用adb安装apk文件

  3. 等待安装结束，运行应用（如不运行，HJC平板下次重启时将无法设置主页面应用）

  4. 使用adb运行以下命令，设置设备管理员：
  
     ```shell
     adb shell dpm set-device-owner com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
     ```
  
  5. 重启设备，应用将自动开启并进入任务锁定模式

## 目录结构

### 根目录

- assets：存放README用到的图片
- apks：最新打包的可以运行的apk
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

  ```yaml
  apply plugin: 'com.android.application'
  apply plugin: 'org.jetbrains.kotlin.android'
  
  //构建时间
  def generateTime() {
      return new Date().format("yyyyMMddHHmmss")
  }
  
  android {
      compileSdkVersion 34
      buildToolsVersion '30.0.3'
      namespace 'com.android.HelloH5'
      defaultConfig {
          applicationId "com.bcc.mrbsDisplay"
          minSdkVersion 21
          targetSdkVersion 30
          versionCode 1
          versionName "1.0"
          multiDexEnabled true
          ndk {
              abiFilters 'x86', 'armeabi-v7a', 'arm64-v8a'
          }
          manifestPlaceholders = [
                  "apk.applicationId"     : "com.android.HelloH5",
                  "GETUI_APPID"           : "unipush的appid",
                  "plus.unipush.appid"    : "unipush的appid",
                  "plus.unipush.appkey"   : "unipuish的appkey",
                  "plus.unipush.appsecret": "unipush的secrety"
          ]
          compileOptions {
              sourceCompatibility JavaVersion.VERSION_1_8
              targetCompatibility JavaVersion.VERSION_1_8
          }
      }
      // 自定义打包名称
      android.applicationVariants.all { variant ->
          variant.outputs.all {
              outputFileName = "mrbsDisplay_${buildType.name}_v${versionName}_${generateTime()}.apk"
          }
      }
  
      signingConfigs {
          config {
              keyAlias 'testalias'
              keyPassword '123456'
              storeFile file('test.keystore')
              storePassword '123456'
              v1SigningEnabled true
              v2SigningEnabled true
          }
      }
      buildTypes {
          debug {
              signingConfig signingConfigs.config
              minifyEnabled false
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
          release {
              signingConfig signingConfigs.config
              minifyEnabled false
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
      }
  
      lintOptions {
          checkReleaseBuilds false
          abortOnError false
      }
      //使用uniapp时，需复制下面代码
      /*代码开始*/
      aaptOptions {
          additionalParameters '--auto-add-overlay'
          //noCompress 'foo', 'bar'
          ignoreAssetsPattern "!.svn:!.git:.*:!CVS:!thumbs.db:!picasa.ini:!*.scc:*~"
      }
      kotlinOptions {
          jvmTarget = '1.8'
      }
      /*代码结束*/
  
  }
  repositories {
      flatDir {
          dirs 'libs'
      }
  }
  dependencies {
      implementation fileTree(include: ['*.jar'], dir: 'libs')
      implementation fileTree(include: ['*.aar'], dir: 'libs')
      /*uniapp所需库-----------------------开始*/
      implementation 'androidx.recyclerview:recyclerview:1.1.0'
      implementation 'com.facebook.fresco:fresco:2.5.0'
      implementation "com.facebook.fresco:animated-gif:2.5.0"
      /*uniapp所需库-----------------------结束*/
      // 基座需要，必须添加
      implementation 'com.github.bumptech.glide:glide:4.9.0'
      implementation 'com.alibaba:fastjson:1.2.83'
      implementation 'androidx.webkit:webkit:1.3.0'
      implementation 'androidx.appcompat:appcompat:1.1.0'
      implementation 'androidx.localbroadcastmanager:localbroadcastmanager:1.0.0'
      implementation 'androidx.core:core:1.5.0'
      implementation "androidx.fragment:fragment:1.1.0"
      // 微信
      implementation 'com.tencent.mm.opensdk:wechat-sdk-android-without-mta:6.7.9'
      // 支付宝
      implementation 'com.alipay.sdk:alipaysdk-android:15.8.11'
      // 高德
      implementation 'com.amap.api:3dmap:9.5.0'
      implementation 'com.amap.api:search:9.4.5'
      // 友盟统计
      implementation 'com.umeng.umsdk:common:9.6.1'
      implementation 'com.umeng.umsdk:asms:1.8.0'
      implementation 'com.umeng.umsdk:abtest:1.0.1'
      implementation 'com.umeng.umsdk:apm:1.9.1'
  
      implementation('com.getui:gtsdk:3.3.7.0'){
          exclude(group: 'com.getui')
      }//个推SDK
      implementation('com.getui:gtc-dcloud:3.2.16.7')  //个推核心组件
  }
  
  ```

  部分重要字段：

  ```yaml
  compileSdkVersion 34 				# 编译sdk版本
  buildToolsVersion '30.0.3'
  namespace 'com.android.HelloH5'		# 源码包名
  
  defaultConfig {
      applicationId "com.bcc.mrbsDisplay"		# 应用包名
      minSdkVersion 21						# 最低sdk版本
      targetSdkVersion 30						# 目标sdk版本
      ...
  }
  ...
  signingConfigs {			# 签名文件配置
          config {
              keyAlias 'testalias'	# 别名
              keyPassword '123456'	# 密码1
              storeFile file('test.keystore')	# 密钥文件名
              storePassword '123456'	# 密码2
              v1SigningEnabled true
              v2SigningEnabled true
          }
      }
      
      
  ...
  dependencies {	# 依赖配置
      implementation fileTree(include: ['*.jar'], dir: 'libs')	# 从libs文件夹解析jar包
      implementation fileTree(include: ['*.aar'], dir: 'libs')	# 从libs文件夹解析aar包
      ...
  }
  ```

  

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

##### src/main

- assets：uniapp打包资源目录

  - apps

    - `__UNI__2E5D094`：安卓本地打包资源

  - data：配置文件

    - dcloud_control.xml：**极其重要**，用于配置appid

      ```xml
      <hbuilder>
      <apps>
          <app appid="__UNI__2E5D094" appver=""/>
      </apps>
      </hbuilder>
      ```

    - dcloud_error.html：未知

    - dcloud_properties.xml：未知

- java/com/android/HelloH5：核心源码文件

  - MyActivity.kt：主页面，任务锁定等功能在此实现
  - MyDeviceAdminReceiver.kt：用于接受dpm授权用的类，通过adb访问这个类可将应用设为`device owner`，从而能够开启`lock task`模式

- res：一些常量

  - drawable-xxhdpi：存放logo图片等
  - layout：空
  - values：字符串常量
    - strings.xml：存放app_name（`会议助手`），即应用安装后显示的名字
    - values.xml：布局信息，是`Theme.AppCompat.NoActionBar`的子类
  - xml
    - device_admin_sample.xml：device admin授权权限，只有一个`<force-lock/>`，似乎并没有实质性的作用。

- `AndroidManifest.xml`：安卓应用清单文件，**非常重要**

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <manifest xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:tools="http://schemas.android.com/tools">
  
      <!-- Barcode(二维码)  begin -->
      <uses-permission android:name="android.permission.CAMERA" />
      <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
      <uses-feature android:name="android.hardware.camera" />
      <uses-feature android:name="android.hardware.camera.autofocus" />
      <uses-permission android:name="android.permission.VIBRATE" />
      <uses-permission android:name="android.permission.FLASHLIGHT" />
      <!-- Barcode(二维码)  end -->
  
  
      <!-- 蓝牙 ibeacon权限-->
      <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
      <uses-permission android:name="android.permission.BLUETOOTH" />
  
      <!-- 基座删除的部分权限 -->
      <uses-permission android:name="android.permission.GET_TASKS" />
      <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
      <uses-permission android:name="android.permission.READ_CONTACTS" />
      <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
      <uses-feature android:name="android.hardware.camera.autofocus" />
      <uses-permission android:name="android.permission.WRITE_CONTACTS" />
      <uses-permission android:name="android.permission.CAMERA" />
      <uses-permission android:name="android.permission.GET_ACCOUNTS" />
      <uses-permission android:name="android.permission.RECORD_AUDIO" />
      <uses-permission android:name="android.permission.SEND_SMS" />
      <uses-permission android:name="android.permission.READ_PHONE_STATE" />
      <uses-permission android:name="android.permission.FLASHLIGHT" />
      <uses-feature android:name="android.hardware.camera" />
      <uses-permission android:name="android.permission.WRITE_SMS" />
      <uses-permission android:name="android.permission.READ_SMS" />
      <uses-permission android:name="android.permission.USE_BIOMETRIC"/>
      <uses-permission android:name="android.permission.STATUS_BAR"
          tools:ignore="ProtectedPermissions" />
  
      <application
          android:name="io.dcloud.application.DCloudApplication"
          android:allowClearUserData="true"
          android:icon="@drawable/icon"
          android:label="@string/app_name"
          android:largeHeap="true"
          android:debuggable="true"
          android:launchMode="singleInstance"
          android:excludeFromRecents="true"
          >
  
  
  
          <receiver android:name=".MyDeviceAdminReceiver"
              android:label="@string/app_name"
              android:description="@string/app_name"
              android:permission="android.permission.BIND_DEVICE_ADMIN">
              <meta-data android:name="android.app.device_admin"
                  android:resource="@xml/device_admin_sample" />
              <intent-filter>
                  <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
              </intent-filter>
          </receiver>
  
          <activity
              android:name=".MyActivity"
              android:exported="true"
              android:launchMode="singleTask"
              android:configChanges="orientation"
              android:theme="@style/MyTheme"
              android:hardwareAccelerated="true"
              android:screenOrientation="sensorLandscape"
  
              android:windowSoftInputMode="adjustResize">
  
              <intent-filter>
                  <action android:name="android.intent.action.MAIN"/>
                  <category android:name="android.intent.category.HOME"/>
                  <category android:name="android.intent.category.DEFAULT"/>
                  <category android:name="android.intent.category.LAUNCHER" />
              </intent-filter>
  
          </activity>
          <meta-data
              android:name="dcloud_appkey"
              android:value="04a4b763686b5aab03521c02dc135ab7" />
      </application>
  
  </manifest>
  ```

  部分重要字段：

  ```xml
  <application
      android:name="io.dcloud.application.DCloudApplication" 
      android:allowClearUserData="true"
      android:icon="@drawable/icon" 					# 图标
      android:label="@string/app_name"				# 应用显示名
      android:largeHeap="true"
      android:debuggable="true"
      android:launchMode="singleInstance"				# 单例运行
      android:excludeFromRecents="true"				# 不显示在“概览”中
  >
  ```

  ```xml
  <receiver 
      android:name=".MyDeviceAdminReceiver"			# dpm授权接收类的类名
      android:label="@string/app_name"
      android:description="@string/app_name"
      android:permission="android.permission.BIND_DEVICE_ADMIN"> # 权限
      <meta-data android:name="android.app.device_admin"
          android:resource="@xml/device_admin_sample" />		   # 授权配置文件
      <intent-filter>
          <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" /> # 只接收dpm授权这种广播
      </intent-filter>
  </receiver>
  ```

  ```xml
  <activity
      android:name=".MyActivity"					# 主活动
      android:exported="true"
      android:launchMode="singleTask"
      android:configChanges="orientation"			# 屏幕旋转时触发configChange事件
      android:theme="@style/MyTheme"				# 主题配置
      android:hardwareAccelerated="true"
      android:screenOrientation="sensorLandscape"	# 允许横屏正方向和横屏反方向
  
      android:windowSoftInputMode="adjustResize">	# 输入框自动顶起
  
      <intent-filter> 
          <action android:name="android.intent.action.MAIN"/>		# 设为主屏幕应用
          <category android:name="android.intent.category.HOME"/>	# 设为主屏幕应用
          <category android:name="android.intent.category.DEFAULT"/>
          <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
  
  </activity>
  ```

  ```xml
  <meta-data
              android:name="dcloud_appkey"
              android:value="04a4b763686b5aab03521c02dc135ab7" /> # dcloud线上申请的appkey
  ```

## 杂项

### 安卓应用签名

位于`uniapp-android\app\test.keystore`，使用keytool（安装jdk即可使用）生成

生成方法：[生成 Android 签名证书](https://dev.weixin.qq.com/docs/framework/guideline/devtools/android-cert.html)

 查看：

```
keytool -list -v -keystore test.keystore 
```

内有sha1和sha256值，用于线上申请dcloud的appkey

此外，该证书还用于生成签名的apk

### appkey

登录[dcloud开发者中心](https://dev.dcloud.net.cn/pages/app/list)，找到应用，点击"各平台信息"，点击"修改"，填入应用包名（`com.bcc.mrbsDisplay`）、sha1和sha256

保存后，生成离线key，这个key就是appkey了，将其填入`AndroidMenifest.xml`的指定位置中

### 包名的区别

- 源码包名：src/main/java下的结构，能够定位自己编写的类
- `android:name`：如`io.dcloud.application.DCloudApplication`，这实际上是第三方包，属于代码引用
- 应用包名：`com.bcc.mrbsDisplay`，也是发布后安卓系统识别整个应用程序所用的名字，也可以理解成应用`ID`

### 设备管理员

[Device administration overview](https://developer.android.com/work/device-admin?hl=zh-cn)

该文档讲解了如何编写一个`DeviceAdminReceiver`的子类用于接收授权信息，也提供了清单文件的配置方法，但没有提及如何进行授权。最方便的办法是通过adb进行授权。

```shell
# 授权
adb shell dpm set-device-owner com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver

# 收回权限
adb shell dpm remove-active-admin com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
```

注意包名的组合，是`应用包名/源码包名.类名`

有时有必要收回权限，如：HJC平板在被授权的情况下无法卸载应用，此时需要先收回权限，再卸载，重装后需要重新授权。

## 支持

![BCCGlobalLogo](https://github.com/synaric-y/mrbs-display/raw/main/doc/img/1.jpg?t=1723515608897)
