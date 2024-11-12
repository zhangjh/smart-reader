import { SignIn } from '@clerk/nextjs';
import { toast } from 'react-toastify';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const featuresArr = {
    "single": [
      "单次找书下载(版权风险可能调整)",
      "电子书阅读器",
      "单篇文章解析",
      "AI总结与评分",
      "单文章不限次智能问答",
    ],
    "basic": [
      "10次找书下载(版权风险可能调整)",
      "电子书阅读器",
      "不限次文章解析",
      "AI总结与评分",
      "不限次智能问答",
    ],
    "senior": [
      "不限次找书下载(版权风险可能调整)",
      "电子书阅读器",
      "不限次文章解析",
      "AI总结与评分",
      "不限次智能问答",
      "不限次文档多语种翻译(告别token焦虑)",
    ]
  };

  const payModules = [
    {"key": "download", "desc": "电子书下载"}, 
    {"key": "reader", "desc": "阅读器"}, 
    {"key": "chat", "desc": "智能问答"}, 
    {"key": "translate", "desc": "文档多语种翻译"}
  ];

  const util = {
    featuresArr,
    payModules,
    // 用户Id，模块，权限校验成功后的回调函数
    async authCheck (userId, module, cb, failCb) {
      let remaings = {
        'download': 0,
        'reader': 0,
        'chat': 0,
        'translate': 0
      };
      try {
        // 校验权限
        const response = await fetch(`${serviceDomain}/order/list?status=1&userId=${userId}`);
        const data = await response.json();
    
        if (!data.success) {
          throw new Error("查询付费订阅失败：" + data.errorMsg);
        }
    
        // 查询到付费订阅，统计剩余次数
        if (data.data.results && data.data.results.length > 0) {
          const orders = data.data.results;
          const curTime = new Date().getTime();
        
          // 统计订单总次数
          for (const order of orders) {
            // 付费方案按月生效，未用完的会过期
            if (curTime <= order.createTime + 30 * 24 * 60 * 60 * 1000) {
              // 存在有效的订阅，检查资源使用情况
              const itemType = order.item_type;
              switch(itemType) {
                // 单次，但智能问答不限次
                case "single":
                  remaings['download'] += 1;
                  remaings['reader'] += 1;
                  remaings['chat'] += 999;
                  break;
                // 基础版：10次下载，不限次解析
                case "basic":
                  remaings['download'] += 10;
                  remaings['reader'] += 999;
                  remaings['chat'] += 999;
                  break;
                // 高级版：不限次下载，翻译
                case "senior":
                  remaings['download'] += 999;
                  remaings['reader'] += 999;
                  remaings['chat'] += 999;
                  remaings['translate'] += 999;
                  break;
              }
            }
          }
          // 查询已用次数
          const usageResponse = await fetch(`${serviceDomain}/usage/total?userId=${userId}&module=${module}`);
          const usagesData = await usageResponse.json();
          if(!usagesData.success) {
            throw new Error("查询使用次数失败：" + usagesData.errorMsg);
          }
          const usage = usagesData.data;
          // 次数已用完
          console.log("剩余次数：", remaings[module] - usage);
          if (remaings[module] - usage <= 0) {
            throw new Error("您的生效付费订阅次数已用完，请重新订阅");
          }
          
          if (cb) {
            cb();
          }
          return;
        }

        // 没有付费订阅，新用户可以试用一次
        const trialResponse = await fetch(`${serviceDomain}/trial/auth?userId=${userId}&productType=zhiyue&model=${module}`);
        const trialData = await trialResponse.json();
    
        if (!trialData.success) {
          throw new Error("试用失败：" + trialData.errorMsg);
        }
    
        if (trialData.success) {
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
          window.location.href = "/#solution";
        }, 1500);
      }
    },

    async saveUsage (module, userId) {
      fetch(`${serviceDomain}/usage/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productType: "zhiyue",
            module,
            userId,
          }),
        })
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            toast.error(response.errorMsg);
            return;
          }
        });
    },
    async getUserInfo() {
      const userId = window.localStorage.getItem('userId');
      if(!userId || userId === "null" || userId === "undefined") {
        console.log("未登录，需要登录");
        <SignIn fallbackRedirectUrl={window.location.pathname} />
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