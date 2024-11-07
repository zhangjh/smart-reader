import { toast } from 'react-toastify';

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
    async authCheck (userId, module, cb, failCb) {
      try {
        // 校验权限
        const response = await fetch(`${serviceDomain}/order/list?status=1&userId=${userId}`);
        const data = await response.json();
    
        if (!data.success) {
          throw new Error("查询付费订阅失败：" + data.errorMsg);
        }
    
        if (data.data.length > 0) {
          const orders = data.data.results;
          const curTime = new Date().getTime();
          
          let validSubscriptionFound = false;
          
          for (const order of orders) {
            if (curTime <= order.createTime + 30 * 24 * 60 * 60 * 1000) {
              // 存在有效的订阅，校验通过
              validSubscriptionFound = true;
              break;
            }
          }
    
          if (!validSubscriptionFound) {
            // 如果没有有效的订阅
            throw new Error("您的付费订阅已失效，请重新订阅");
          }
    
          // 如果找到有效订阅，调用成功回调
          if (cb) {
            cb();
          }
          return;
        }
    
        // 没有订单存在，可以试用一次
        const trialResponse = await fetch(`${serviceDomain}/trial/auth?userId=${userId}&productType=zhiyue&model=${module}`);
        const trialData = await trialResponse.json();
    
        if (!trialData.success) {
          throw new Error("试用失败：" + trialData.errorMsg);
        }
    
        if (!trialData.success) {
          // 已经试用过了
          throw new Error("每个新用户仅可试用一次，请选择合适的计划付费订阅");
        }
    
        const createTrialResponse = await fetch(`${serviceDomain}/trial/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            model: module,
          }),
        });
    
        const createTrialData = await createTrialResponse.json();
    
        if (createTrialData.success) {
          if (cb) {
            cb();
          }
          toast.success("新用户试用成功");
        }
      } catch (error) {
        toast.error(error.message);
        if (failCb) {
          failCb(error.message);
        }
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    },
    async getUserInfo() {
      const userId = window.localStorage.getItem('userId');
      if(!userId || userId === "null" || userId === "undefined") {
        console.log("未登录，需要登录");
        window.location.href = "/sign-in?redirect_url=" + window.location.pathname;
        return "";
      }
      return userId;
    },
    sliceContent (content, maxLength) {
      // 如果不是string 类型，直接返回
      if (typeof content !== 'string') {
        return "";
      }
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    },
  };

export default util;