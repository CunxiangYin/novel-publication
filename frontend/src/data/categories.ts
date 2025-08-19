export interface CategoryData {
  firstCategory: string
  secondCategories: {
    name: string
    thirdCategories: string[]
  }[]
}

export const categories: CategoryData[] = [
  {
    firstCategory: "男频",
    secondCategories: [
      {
        name: "都市",
        thirdCategories: ["娱乐明星", "商战职场", "青春校园", "都市生活", "都市异能", "异术超能"]
      },
      {
        name: "短篇",
        thirdCategories: ["短故事", "短篇小说", "美文游记", "生活随笔", "评论文集", "诗歌散文", "人物传记", "影视剧本"]
      },
      {
        name: "军事",
        thirdCategories: ["谍战特工", "军旅生涯", "军事战争", "战争幻想", "抗战烽火"]
      },
      {
        name: "科幻",
        thirdCategories: ["古武机甲", "未来世界", "星际文明", "超级科技", "时空穿梭", "进化变异", "末世危机"]
      },
      {
        name: "历史",
        thirdCategories: ["架空历史", "秦汉三国", "上古先秦", "历史传记", "两晋隋唐", "五代十国", "两宋元明", "清史民国", "外国历史", "民间传说"]
      },
      {
        name: "奇幻",
        thirdCategories: ["历史神话", "另类幻想", "现代魔法", "剑与魔法", "史诗奇幻", "神秘幻想"]
      },
      {
        name: "轻小说",
        thirdCategories: ["搞笑吐槽", "原生幻想", "恋爱日常", "衍生同人"]
      },
      {
        name: "体育",
        thirdCategories: ["篮球运动", "体育赛事", "足球运动"]
      },
      {
        name: "武侠",
        thirdCategories: ["古武未来", "武侠同人", "传统武侠", "武侠幻想", "国术无双"]
      },
      {
        name: "仙侠",
        thirdCategories: ["古典仙侠", "修真文明", "幻想修仙", "现代修真", "神话修真"]
      },
      {
        name: "现实",
        thirdCategories: ["家庭伦理", "女性题材", "社会悬疑", "时代叙事", "青年故事", "人间百态"]
      },
      {
        name: "玄幻",
        thirdCategories: ["东方玄幻", "异世大陆", "王朝争霸", "高武世界"]
      },
      {
        name: "悬疑",
        thirdCategories: ["诡秘悬疑", "奇妙世界", "侦探推理", "探险生存", "古今传奇"]
      },
      {
        name: "游戏",
        thirdCategories: ["电子竞技", "虚拟网游", "游戏异界", "游戏系统", "游戏主播"]
      },
      {
        name: "诸天无限",
        thirdCategories: ["无限", "诸天", "综漫"]
      }
    ]
  },
  {
    firstCategory: "女频",
    secondCategories: [
      {
        name: "短篇",
        thirdCategories: ["影视剧本", "评论文集", "生活随笔", "美文游记", "短篇小说", "诗歌散文", "人物传记", "短故事"]
      },
      {
        name: "古代言情",
        thirdCategories: ["古代情缘", "宫闱宅斗", "经商种田", "古典架空", "女尊王朝", "穿越奇情", "西方时空", "清穿民国", "上古蛮荒", "热血江湖"]
      },
      {
        name: "科幻空间",
        thirdCategories: ["星际恋歌", "时空穿梭", "未来世界", "古武机甲", "超级科技", "进化变异", "末世危机"]
      },
      {
        name: "浪漫青春",
        thirdCategories: ["青春校园", "青春疼痛", "叛逆成长", "青春纯爱"]
      },
      {
        name: "轻小说",
        thirdCategories: ["古典衍生", "影视衍生", "动漫衍生", "其他衍生", "同人衍生", "唯美幻想", "萌系变身", "青春日常"]
      },
      {
        name: "仙侠奇缘",
        thirdCategories: ["武侠情缘", "古典仙侠", "现代修真", "远古洪荒", "仙侣奇缘"]
      },
      {
        name: "现代言情",
        thirdCategories: ["都市异能", "极道江湖", "民国情缘", "商战职场", "豪门世家", "都市生活", "婚恋情缘", "娱乐明星", "异国情缘"]
      },
      {
        name: "现实生活",
        thirdCategories: ["家与情感", "行业人生", "探索科幻", "人文博览"]
      },
      {
        name: "玄幻言情",
        thirdCategories: ["东方玄幻", "异世大陆", "远古神话", "异族恋情", "魔法幻情", "西方奇幻", "异能超术"]
      },
      {
        name: "悬疑推理",
        thirdCategories: ["推理侦探", "诡秘惊险", "悬疑探险", "奇妙世界", "神秘文化", "幽情奇缘"]
      },
      {
        name: "游戏竞技",
        thirdCategories: ["电子竞技", "网游情缘", "游戏异界", "体育竞技"]
      }
    ]
  }
]

// 获取所有一级分类
export const getFirstCategories = (): string[] => {
  return categories.map(c => c.firstCategory)
}

// 根据一级分类获取二级分类
export const getSecondCategories = (firstCategory: string): string[] => {
  const category = categories.find(c => c.firstCategory === firstCategory)
  return category ? category.secondCategories.map(sc => sc.name) : []
}

// 根据一级和二级分类获取三级分类
export const getThirdCategories = (firstCategory: string, secondCategory: string): string[] => {
  const category = categories.find(c => c.firstCategory === firstCategory)
  if (!category) return []
  
  const secondCat = category.secondCategories.find(sc => sc.name === secondCategory)
  return secondCat ? secondCat.thirdCategories : []
}