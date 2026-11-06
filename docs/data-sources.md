# 数据来源与获取记录

所有可见数据来源配置在 `src/data/sources.json`，报告导出会带上该清单。

## 1. 正式地方标准

名称：DB21/T3719—2023《虾夷扇贝吊耳养殖技术规程》。

元数据： https://dbba.sacinfo.org.cn/stdDetail/2639a50053cec0d0480009c83e7fc31dc52428da7ae87cbcbfbe1cab5e4647d4

官方下载： https://dbba.sacinfo.org.cn/portal/download/2639a50053cec0d0480009c83e7fc31dc52428da7ae87cbcbfbe1cab5e4647d4

取回文件：1,467,216字节，8页；SHA-256：`6b59558c579e23e345454d5e780c044ab8592a682765773a7845c5405f27d31d`。获取日期2026-11-06。已核对封面标准号、发布日期、实施日期与PDF第5页4.1/4.2条。标准全文保留在开发工作区核读，未加入代码仓库或编译产物。最初检索到的报批稿已被正式文本依据替换。

## 2. 辽宁2025年产业数据

省农业农村厅2026-08-05对省十四届人大五次会议第1450315号建议的答复：
https://nync.ln.gov.cn/nync/zfxxgk/fdzdgknr/jyta/srddbjy/sssjrdwchy2026n/2026080510590998860/index.shtml

采用该答复明确的2025年统计口径：海水产品总产量475.6万吨，海水养殖产量401.7万吨。仅作省级产业背景，不映射为示例养殖场产量，不参加环境评估。静态文件 `src/data/industry.json`。

## 3. 生态与良种扩展资料

省政府发布的2023年海洋生态预警监测公报说明：
https://www.ln.gov.cn/web/ywdt/tjdt/2024083010393556284/

仅作历史区域生态背景；不据此声称当前示例点发生赤潮。DB21/T4105—2025良种生态适应性评价资料作为未来扩展条目，未用于本期四项规则。

## 4. 公开海况

文档： https://open-meteo.com/en/docs/marine-weather-api

示例请求点39.05°N、122.8°E。API可能返回邻近有效海洋模型网格，原始网格坐标保留。`scripts/fetch-marine-data.mjs`获取3天逐小时海面温度、有效波高、海面流速。时间使用Asia/Shanghai。只保存一份小快照，不抓取大范围数据。

快照： `src/data/snapshots/changhai-demo.json`；SHA-256与预报时段在 `manifest.json`。`pnpm verify:data`检查校验和与记录数。调用 `pnpm fetch:data`更新时必须将快照和manifest一起提交；演示截图与旧快照要记录对应提交，避免混淆。

原始流速为响应中的单位，适配器支持km/h、m/s、cm/s和knots并显式换算，不根据变量名称猜单位。接口失败保留已有快照；无值保留null。

数据许可：Open-Meteo数据署名CC BY4.0，保留Open-Meteo及模型提供方信息。免费接口用于本次非商业竞赛原型；商用部署重新核对服务条款。没有将API数据描述为团队采样。

## 5. 用户输入和测试情景

浏览器本地保存，无自动上传。人工填写仅标记“用户填写”，不擅自标为经过验证的传感器观测。测试情景始终标记模拟，不纳入真实海洋数据库。报告JSON将参数来源一并导出。
