const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const featuresArr = {
    "single": [
      "单篇文章解析",
      "AI总结与评分",
      "智能问答",
      "文档多语种翻译"
    ],
    "basic": [
      "不限次数使用",
      "AI总结与评分",
      "智能问答",
      "文档多语种翻译"
    ],
    "senior": [
      "不限次数使用",
      "AI总结与评分",
      "智能问答",
      "文档多语种翻译",
      "个人知识库"
    ]
  };

  const payModules = [{"key": "download", "desc": "电子书下载"}, 
    {"key": "reader", "desc": "阅读器"}, 
    {"key": "chat", "desc": "智能问答"}, 
    {"key": "translate", "desc": "文档多语种翻译"}];

  const util = {
    featuresArr,
    payModules,
    // 用户Id，模块，权限校验成功后的回调函数
    async authCheck(userId, module, cb) {
      // 校验权限
      await fetch(`${serviceDomain}/order/list?status=1&userId=${userId}`)
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            throw new Error("查询付费订阅失败：" + response.errorMsg);
          }
          if(response.data.length > 0) {
            const orders = response.data.results;
            for(const order of orders) {
              const curTime = new Date().getTime();
              // 订单一个月的有效期
              if(curTime > order.createTime + 30 * 24 * 60 * 60 * 1000) {
                // 已经失效
                console.log("orderId:", order.id, " expired");
              } else {
                // 存在有效的订阅，校验通过
                break;
              }
            }
            // 如果到这了，证明没有有效订阅
            throw new Error("您的付费订阅已失效，请重新订阅");
          } else {
            // 没有订单存在，可以试用一次
            fetch(`${serviceDomain}/trial/auth?userId=${userId}&productType=zhiyue&model=${module}`)
              .then(response => response.json())
              .then(response => {
                if(!response.success) {
                  throw new Error("试用失败：" + response.errorMsg);
                }
                if(!response.success) {
                  // 已经试用过了
                  throw new Error("每个新用户仅可试用一次，请选择合适的计划付费订阅");
                } 
                // 新用户每个模块可以试用一次，记录试用次数
                fetch(`${serviceDomain}/trial/create`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: userId,
                    // 试用的功能模块
                    model: module
                  }),
                }).then(response => response.json())
                .then(response => {
                  console.log(response);
                  if(response.success) {
                    toast.success("新用户试用成功");
                  }
                });
              })
              .then(() => {
                if(cb) {
                  cb();
                }
              })
              .catch(error => {
                toast.error(error.message);
                setTimeout(() => {
                  window.location.href = "/";
                }, 3000);
              });
          }
        });
    },
  };

export default util;