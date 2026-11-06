# 第三方代码与数据声明

## 模板

- 项目：pure-admin/pure-admin-thin
- 来源：https://github.com/pure-admin/pure-admin-thin
- 初始化记录：`f0ff132561ab684bb78379239adf29f9a38ac7f1`
- 原许可：MIT；Copyright(c)2020-present,pure-admin
- 复用：模板技术组合与适配后的 `src/components/ReCol/index.ts`；清理登录、权限、Mock及无关管理页，原创业务模块另建。
- 原始MIT完整文本保留在仓库LICENSE及licenses/pure-admin-MIT.txt，并随dist分发。源仓库初始提交保留模板历史。

## 运行依赖

|依赖|版本|许可|上游|
|---|---|---|---|
|Vue|3.5.22|MIT|https://github.com/vuejs/core|
|Vue Router|4.6.3|MIT|https://github.com/vuejs/router|
|Element Plus|2.11.5|MIT|https://github.com/element-plus/element-plus|
|Apache ECharts|6.0.0|Apache-2.0|https://github.com/apache/echarts|

依赖版本锁定于pnpm-lock.yaml。发行时应保留各依赖打包许可证；构建脚本会复制直接运行依赖的LICENSE/NOTICE和数据来源声明。嵌套依赖仍按各自许可证提供，不将第三方库当作本团队独立发明。

## 数据

Open-Meteo Marine数据：CC BY4.0；Weather data by Open-Meteo.com，保留Copernicus Marine / Meteo-France等模型归属。免费API使用受其非商业服务条件约束。项目未重新许可这些数据为MIT。

地方标准只整理事实参数、条款编号和自行编写的说明；不再分发完整PDF。官方统计仅保存必要事实与出处。标准/资料原文权利归相应机构。

所有页面使用系统字体，未打包第三方字体文件。海域图为团队代码绘制的示意图，明确标注，未宣称真实地理地图。

## 原创实现与协作

新写的业务模块为src/engine、services、stores、views、除ReCol外的业务组件及测试/资料整理脚本。工程在项目负责人授权下使用AI编程辅助。参赛说明应准确区分模板、依赖、公开数据及团队新增业务设计，并由团队复核规则与实现。
