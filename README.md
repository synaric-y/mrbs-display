# MRBS-Display

A conference room reservation system developed based on PHP, with a web management backend and a conference room tablet display.

![](https://scrutinizer-ci.com/g/synaric-y/mrbs-server/badges/build.png?b=main)
![](https://scrutinizer-ci.com/g/synaric-y/mrbs-server/badges/code-intelligence.svg?b=main)

<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/image-20241210112331408.png?raw=true" alt="image-20241210112331408" style="zoom: 25%;" />

The current project is a display end, developed based on `uni-app` and `Android Studio`. Please see the main project and introduction for details [mrbs-server](https://github.com/synaric-y/mrbs-server)。

# Architecture

The project has a three-layer architecture, supported by [mrbs-server](https://github.com/synaric-y/mrbs-server) and [mrbs-wxwork]().

<img src="https://github.com/synaric-y/mrbs-display/blob/octene-dev/assets/image-20241211114557430.png?raw=true" style="zoom:50%;" />

- inner: This layer is developed using `uni-app`, compiled to **HTML File**(and its assets).
  - Final Version：https://meeting-manage-dev.businessconnectchina.com:11443/display/v2.1/index.html
  - Beta Version：https://meeting-manage-test.businessconnectchina.com:12443/display/v2.1/index.html

- shell-new: Also developed based on `uni-app`. This layer contains a Webview Container to render inner web page. It would be compiled to **Android local package resource**.
- uniapp-android: Developed with `Android Studio`, compiled to **Signed APK** for devices to install.

# Features

- Fast Meeting Reservation(Deprecated at v2.1) & Scan to Reserve
- Tablet screen displays conference room status and reservation information
- Sync Calendar with Microsoft Exchange, extensible third-party Calendar support
- I18n support, Chinese/English/Korean...
- Remote Update
- Dedicated devices management, Task Lock/Auto Start/Limited Rotation/Screen Keeping

# Environment And Dependencies

- HbuilderX 4.36（Latest Version）

- Android Studio Ladybug | 2024.2.1 Patch 2

- Android Tablet

  | brand  | Android Version  | API Level | Resolution  | Architecture | Description |
  | ------ | ---------------- | --------- | ----------- | ------------ | ----------- |
  | Xiaomi | 13.0("Tiramisu") | 33        | 1200 x 1920 | arm64        | development |
  | HJC    | 11.0("R")        | 30        | 1200 x 2000 | arm64        | production  |

# Install/Run

- inner

  1. ```
     npm install
     ```

  2. compiling
       1. First, Open `HbuilderX`.
       2. Open `Build` menu.
       3. Select `Web (For uni-app Only)`.
       4. Find your web page at`unpackage\dist\build\web`.

- shell-new

  1. ```
     npm install
     ```

  2. compiling
       1. First, Open `HbuilderX`.
       2. Open `Build` menu.
       3. Select `App-Android/iOS - Local Packaging`.
       4. Select `Generate App Resources.`
       5. Find resource folder(like `__UNI__2E5D094`) at`unpackage\resources`.

- uniapp-android

  1. First, wait for Gradle Synchronization finishing.

  2. Open `Build` menu.

  3. Select `Generate Signed App Bundle/APK` .

  4. Connect your device，install the APK using adb(Android Debug Bridge).
  
     ```shell
     adb install your-apk-path
     ```
  
  5. Open the application. (This step is a **must** when using HJC Tablet, or the application won't become **HOME Application** after restart )

  6. Set device admin.
  
     ```shell
     adb shell dpm set-device-owner com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
     ```
  
  7. Restart the device. The application would `auto start` and enter `Lock Task Mode`.

# File Structure

This section describes some important folders and files of this project.

## Root Directory

- assets：README assets
- apks：Latest compiled apk
- inner:  web application
- shell-new: A shell to contain web page
- uniapp-android: Android Application
- `.gitignore`
- `LICENSE`
- `README.md`：English Document
- `README-zh.md`：Chinese Document

## inner

- api：JavaScript functions sending requests to the backend
- components：global component
- constants
- docs：jsdoc (Open `index.html` to view full document)
- mixin：Used to mixin getter/setters from vuex to components
- node_modules：npm packages
- pages：
  - `index/index.vue`：main page
- src：i18n files
- static：icons
- store：vuex files
- uni_modules：uniapp native components
- utils：JavaScript utilities
- views：sub-view
  - `ActivateView.vue`：activate the device
  - `LoginView.vue`：login
  - `SettingView.vue`：setting the device
- `App.vue`：main component
- `index.html`：entrance web page
- `jsdoc.json`：jsdoc manifest file
- `main.js`：entrance program
- `manifest.json`：uniapp build settings
- `package.json`：npm install list
- `package-lock.json`：npm install records
- `pages.json`：uniapp route/uniapp page settings
- `uni.promisfy.adaptor.js`：unknown
- `uni.scss`：uniapp global style

## shell-new

- pages
  - `index/index.vue`：main page
- static：used for test
- unpackage：
  - cache
  - dist
  - release
    - apk：cloud packaging output path
  - resources
    - \_\_UNI\_\_2E5D094：local packaging resource(`__UNI__2E5D094`is appid)
- `App.vue`：main component
- `index.html`：entrance web page
- `main.js`：entrance program
- `manifest.json`：uniapp build settings
- `pages.json`：uniapp route/uniapp page settings
- `uni.promisfy.adaptor.js`：unknown
- `uni.scss`：uniapp global style

## uniapp-android

- app：main project
- gradle
  - wrapper：gradle tool path
- `.gitignore`
- `build.gradle`: unimportant
- `gradle.properties`：unknown
- `gradlew`：gradle script
- `gradlew.bat`：gradle script
- `HBuilder-Hello.iml`：unknown
- `local.properties`：unknown
- `MyApplication.iml`：unknown
- `settings.gradle`：unknown

### app

- build：debug version output path

- libs：library path

- release：release version output path

- src：source code

- `app.iml`：unknown

- `build.gradle`：**Extremely Important**，related to `Android Version`、`Application Package Name`、`Dependencies`

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

  Some important properties：

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

  

- `proguard-rules`：unknown

- `test.jks`：test signature file(unused)

- `test.keystore`：current signature file

  ```
  key store password:
  123456
  
  Key alias:
  testalias
  
  Key password:
  123456
  ```

  Run following command to view `.keystore` file(JDK required)：

  ```shell
  keytool -list -v -keystore test.keystore 
  ```

  Input `key store password` and `key password` when needed.

#### src/main

- assets：uniapp packaging resource path

  - apps

    - `__UNI__2E5D094`：uniapp packaging resource

  - data

    - dcloud_control.xml：edit `appid` to ensure `appid` is as same as the `folder name` of uniapp packaging resource.

      ```xml
      <hbuilder>
      <apps>
          <app appid="__UNI__2E5D094" appver=""/>
      </apps>
      </hbuilder>
      ```

    - dcloud_error.html：unknown

    - dcloud_properties.xml：unknown

- java/com/android/HelloH5：Java/Kotlin files

  - MyActivity.kt：Main Activity. Task Lock and other features are implemented here.
  - MyDeviceAdminReceiver.kt：Used to receive dpm(**D**evice**P**olicy**M**anager) signal. When using adb to access this class, the Application will be authorized as `Device Owner` to launch `Lock Task Mode`.

- res：some constants

  - drawable-xxhdpi：Logos
  - layout：Empty
  - values
    - strings.xml：app_name（`会议助手`）
    - values.xml：theme information(subclass of `Theme.AppCompat.NoActionBar`)
  - xml
    - device_admin_sample.xml：device admin permissions(Only contains a `<force-lock/>`)

- `AndroidManifest.xml`：**Extremely Important**

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

  Some important properties：

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

# Miscellaneous

## App Signing

The signature file is`uniapp-android\app\test.keystore`，using keytool(requires JDK) to generate.

How to generate this file：[Generate Android Signature File](https://dev.weixin.qq.com/docs/framework/guideline/devtools/android-cert.html)

How to view `.keystore` file：

```
keytool -list -v -keystore test.keystore 
```

`sha1` and `sha256` can be found in this file. They are required when apply for `appkey` on Dcloud website.

The signature file is also required to generate`signed apk`.

## Appkey

1. Login [dcloud Develop Center](https://dev.dcloud.net.cn/pages/app/list).
2. Find and open your application .
3. Open `Multi platform information`
4. Open `edit`
5. Fill in these fields:
   1. `Application package name`（e.g: `com.bcc.mrbsDisplay`）
   2. `sha1`
   3. `sha256` (if you don't know what `sha1` and `sha256` are, view `App Signing` section above)
6. Save all changes and exit edit mode.
7. Click `Generate Offline key` and copy it
8. paste this key at a **specific location** in `AndroidMenifest.xml` (view `File Structure/uniapp-android/app/src/main` for more information)

## Package Name

- Source Package Name：A kind of file structure to locate your classes, for example: `com.android.HelloH5.MyActivity`
- `android:name`：Same as Source Package Name, but sometimes refer to third-party classes, for example: `io.dcloud.application.DCloudApplication`
- Application Package Name：After installation, the Android would identify your application according to this name, for example: `com.bcc.mrbsDisplay`

## Device Admin

Official Document: [Device administration overview](https://developer.android.com/work/device-admin?hl=zh-cn)

This document illustrates how to implement a subclass of `DeviceAdminReceiver` and how to edit your `AndroidManifest.xml`. However, it doesn't mention how to grant permission. 

The easiest way is to grant permission via `adb`([Android Debug Bridge](https://developer.android.com/tools/releases/platform-tools)).

```shell
# 授权
adb shell dpm set-device-owner com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
```

Note: The package name composition is`Application Package Name/Source Package Name.ClassName`

Sometimes it is essential to remove the permission. For example: HJC tablets cannot uninstall application when it has device owner permission. 

```shell
# 收回权限
adb shell dpm remove-active-admin com.bcc.mrbsDisplay/com.android.HelloH5.MyDeviceAdminReceiver
```


# Support

![BCCGlobalLogo](https://github.com/synaric-y/mrbs-display/raw/main/doc/img/1.jpg?t=1723515608897)

