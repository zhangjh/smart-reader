import { toast } from 'react-toastify';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

  const payModules = [
    {"key": "download", "desc": "电子书下载"}, 
    {"key": "reader", "desc": "阅读器"}, 
    {"key": "chat", "desc": "智能问答"}, 
    {"key": "translate", "desc": "文档多语种翻译"}
  ];

  const util = {
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
        const response = await fetch(`${serviceDomain}/order/list?status=1&userId=${userId}&pageIndex=1&pageSize=100`);
        const data = await response.json();
    
        if (!data.success) {
          throw new Error("查询付费订阅失败：" + data.errorMsg);
        }
    
        // 查询到付费订阅，统计剩余次数
        if (data.data.results && data.data.results.length > 0) {
          const orders = data.data.results;
          const curTime = new Date().toISOString(); // 获取当前时间的UTC格式
        
          // 统计订单总次数
          for (const order of orders) {
            // 付费方案按月生效，未用完的会过期
            const orderTime = new Date(order.create_time); // 解析UTC时间
            const expireTime = new Date(orderTime.getTime() + 30 * 24 * 60 * 60 * 1000); // 计算过期时间
            if (new Date(curTime) <= expireTime) {
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
    
        if (trialData.success && trialData.data && trialData.data.length > 0) {
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
    // 只在首次注册时调用保存用户, user: clerk useUser
    async signUpSaveUser(user) {
      try {
        const id = user.id;
        const userName = user.username;
        const avatar = user.imageUrl;
        const email = user.emailAddresses[0].emailAddress;
        // 如果有邮箱认为是邮箱登录，否则只记录clerk
        let extType = "clerk";
        if(email) {
          extType = "email";
        }
        const response = await fetch(`${serviceDomain}/user/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            extType,
            extId: id,
            avatar,
            email,
            userName
          })
        });
        
        const result = await response.json();
        if (!result.success) {
          console.error('注册失败:', result.errorMsg);
          return;
        }
        
        // 确保在注册成功后立即设置localStorage
        localStorage.setItem("extId", id);
        localStorage.setItem("userId", result.data.id);
        
        return result;
      } catch (error) {
        console.error('注册过程出错:', error);
      }
    },
    /**
     * userName,
      avatar,
      extType,
      extId,
      email
     */
    async register(saveUser) {
      try {
        const response = await fetch(`${serviceDomain}/user/register`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(saveUser)
        });
        const res = await response.json();
        if(!res.success) {
          console.log(res.errorMsg);
          toast.error("保存用户信息出错:" + res.errorMsg);
          return null;
        } else {
          // 写本地缓存
          const user = res.data;
          window.localStorage.setItem("userId", user.id);
          window.localStorage.setItem("extId", saveUser.extId);
          return res;
        }
      } catch(error) {
        console.error("注册失败:", error);
        toast.error("注册失败，请稍后重试");
        return null;
      }
    },
    async getUserByExtId({extId, extType, avatar, email, userName}) {
      // 查询内部userId
      const userId = fetch(`${serviceDomain}/user/getUser?extId=${extId}&extType=${extType}`)
        .then(response => response.json())
        .then(async response => {
          if(!response.success) {
            // 三方登录的不走注册，需要在这里注册一下
            return await util.register({
              extType, extId, avatar, email, userName
            });
          }
          localStorage.setItem("extId", extId);
          localStorage.setItem("userId", response.data.id);
          return response.data.id;
        });
      return userId;
    },
    async fetchItems() {
      return fetch(`${serviceDomain}/order/getItems`)
        .then(response => response.json())
        .then(response => {
          if (!response.success) {
            toast.error("获取方案信息失败:" + response.errorMsg);
            return []; // 确保返回空数组而不是 undefined
          }
          const data = response.data;
          const newItems = [];
          for (let key in data) {
            const solution = data[key];
            if (newItems.indexOf(solution) !== -1) {
              continue;
            }
            newItems.push({
              key: key,
              title: solution.name,
              oriPrice: solution.oriPrice,
              price: solution.price,
              featuresArr: solution.description
            });
          }
          return newItems; // 确保返回 newItems
        });
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