# MRBS-Display

MRBS-Display（会议预约系统平板端，以下简称**平板端**）是**BCC MRBS**（BCC会议室预约系统）的平板端应用，供用户浏览和快速预约会议。

<img src="C:\Users\octene.wang\Desktop\mrbs-display\assets\image-20241210095740692.png" alt="image-20241210095740692" style="zoom: 25%;" />

> 图1  正式版页面。目前并没有会议



## 平台架构

平台分为三部分开发：

- 内核网页（inner）：使用uniapp编写，发布为H5网页。最新地址为：
  - 正式版：https://meeting-manage-dev.businessconnectchina.com:11443/display/v2.1/index.html
  - 测试版：https://meeting-manage-test.businessconnectchina.com:12443/display/v2.1/index.html

- 外壳容器（shell-new）：使用uniapp编写，内含一个全屏webview容器，此容器总是显示后台指定版本的内核网页（允许远程更新和回退）。其编译为安卓本地打包资源（\_\_UNI\_\_2E5D094），供下一步使用。
- 真机应用（uniapp-android）：使用Android Studio编写，编译为可在平板上直接安装的安卓APK软件包。

平台由 [mrbs-server](https://github.com/synaric-y/mrbs-server)（mrbs管理员后台）提供支持。

## 核心功能

- 预约平板快速会议（于2.1版过时）& 在企业微信扫码预约会议
- 显示会议室状态（空闲中|会议中）；显示会议标题、预订人、会议时长等信息（部分字段可配置是否展示）
- 国际化支持，可切换中文|英文|韩文
- 远程版本更新
- 实现专用设备，应用锁定+开机自启+限制旋转+屏幕常亮

## 开发环境

- HbuilderX 4.36（最新版）

- Android Studio Ladybug | 2024.2.1 Patch 2

- 安卓平板

  | 机型   | Android 版本 | API Level        | 架构  | 备注   |
  | ------ | ------------ | ---------------- | ----- | ------ |
  | Xiaomi | 13.0         | 33（"Tiramisu"） | arm64 | 测试用 |
  |        |              |                  |       |        |

# Environment And Dependencies

- uni-app SDK 4.24
- HbuilderX 4.24
- 8-11 inch Android tablet, the system has screen fixing function (optional)

> Recommend Google native system, which has fixed system-level evaluation functions.

# Install

```
npm install
```

# Run

It can be run using the uni-app universal base or a custom base. For details, see[uni-app](https://nativesupport.dcloud.net.cn/AppDocs/)。


# Support

![BCCGloballogo.jpg](doc/img/1.jpg?t=1723515608897)
