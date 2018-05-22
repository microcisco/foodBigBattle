import Language from "./Language";
import ResourceMgr from "./ResourceMgr";
import Utils from "./Utils";
import Food from "./prefabs/Food";
import MainControl from "./MainControl";

interface IConfig {
    initTime: number;        //初始运动时间
    initAmount: number;      //初始出现数量
    gradualTime: number;     //渐增时间
    gradualAmount: number;   //渐增数量
    minTime: number;         //最小时间
    maxAmount: number;       //最大数量
    scoreBase: number;       //升级分数基数
    stageTotalTime: number;  //关卡总时间
}

const config: IConfig = {
    initTime: 3,
    initAmount: 1,
    gradualTime: 0.5,
    gradualAmount: 1,
    minTime: 0.5,
    stageTotalTime: 18,
    maxAmount: 4,
    scoreBase: 10    //升级分数
};

const {ccclass, property} = cc._decorator;

class MailGameHold {
    startGameNode: cc.Node;
    gameLayout: cc.Node;
    timeComp: cc.Label;
    scoreComp: cc.Label;
    maskNode: cc.Node;
}

@ccclass
export default class MainGame extends MainControl {

    @property({visible: false})
    isInitEnd: boolean = false;  //已经初始化完成

    @property({visible: false})
    isGaming: boolean = false;  //正在玩游戏

    @property({visible: false})
    nextFoodRainTime: number = 0;  //下一次撒食物的时间

    @property({visible: false})
    score: number = 0;  //游戏分数

    @property({visible: false})
    remainingTime: number = 0;  //游戏剩余时间

    @property(cc.Prefab)
    foodPref: cc.Prefab = null;

    @property({visible: false})
    foodPool: cc.NodePool = null;

    private getHold(): MailGameHold {
        let hold = new MailGameHold();
        hold.startGameNode = this.targetNode.getChildByName('ui').getChildByName('startGame');
        hold.gameLayout = this.targetNode.getChildByName('game');
        hold.maskNode = this.targetNode.getChildByName('ui').getChildByName('mask');
        hold.timeComp = this.targetNode.getChildByName('ui').getChildByName('timeLayout').getChildByName('time').getComponent(cc.Label);
        hold.scoreComp = this.targetNode.getChildByName('ui').getChildByName('scoreLayout').getChildByName('score').getComponent(cc.Label);
        return hold;
    }

    protected async onLoad(): void {
        //初始化对象池
        this.foodPool = new cc.NodePool(Food);
        const initCount = 30;
        for (let i = 0; i < initCount; ++i) {
            this.foodPool.put(cc.instantiate(this.foodPref));
        }
        //加载关卡资源
        await new Promise((resolve, reject) => {
            cc.loader.loadResDir('stage/a', (err, resource, urls) => {
                this.isInitEnd = true;
                if (err) {
                    reject(err);
                    throw new Error(Language.s1);
                }
                resource.forEach(it => {
                    if (it instanceof cc.SpriteFrame) ResourceMgr.addResource(it.name, it);
                });
                resolve();
            });
        });
    }

    /**
     * @description 开始游戏点击事件处理
     * */
    private clickStartGame(): void {
        //隐藏开始游戏按钮
        this.getHold().startGameNode.active = false;
        //重置分数
        this.setScore(0);
        //设置倒计时
        this.setRemainingTime(config.stageTotalTime);
        //关闭遮罩
        this.getHold().maskNode.active = false;
        //设置第一波食物雨开始时间
        this.nextFoodRainTime = 0;
        //设置游戏状态
        this.isGaming = true;
    }

    /**
     * @description 设置分数
     * */
    private setScore(value: number): void {
        this.getHold().scoreComp.string = value.toFixed(0);
        this.score = value;
    }

    /**
     * @description 设置剩余时间
     * */
    private setRemainingTime(value: number): void {
        this.getHold().timeComp.string = value.toFixed(2);
        this.remainingTime = value;
    }

    protected registerEvent(): void {
        this.getHold().startGameNode.on(cc.Node.EventType.TOUCH_END, this.clickStartGame, this);
    }

    protected unRegisterEvent(): void {
        this.getHold().startGameNode.on(cc.Node.EventType.TOUCH_END, this.clickStartGame, this);
    }

    /**
     * @description 开始游戏点击事件处理
     * */
    public notifyFoodBeClicked(food: Food): void {
        if (!food) return;
        //加分
        this.score += food.score;
        //回收食物
        this.recyclingFood(food);
        //更新分数显示
        this.setScore(this.score);
    }

    /**
     * @description 回收食物
     * */
    public recyclingFood(food: Food): void {
        //回收食物
        food.node.removeFromParent(true);
        this.foodPool.put(food.node);
    }

    /**
     * @description 生产新一波的食物雨
     * */
    private produceNewFoodRain(): void {
        //本次随机出现的材质
        let allTextureName = ResourceMgr.getAllTextureName();
        let names = Utils.getElesFromArray<string>(allTextureName, 3);
        //计算食物雨等级
        let level = this.score / config.scoreBase;
        let time = config.initTime - config.gradualTime * level;
        let amount = Math.floor(config.initAmount + config.gradualAmount * level);
        if (time < config.minTime) time = config.minTime;
        if (amount > config.maxAmount) amount = config.maxAmount;
        //生成食物
        let pots = null;  //每个食物的随机坐标
        for (let i = 0; i < amount; ++i) {
            let node = Utils.getNodeFromPool(this.foodPool, this.foodPref, this);
            if (!pots) {
                let allPot = [];
                let length = (cc.director.getWinSize().width + node.getComponent(Food).getBoundingBox().width) / 2;
                let maxAmount = Math.floor(length / node.getComponent(Food).getBoundingBox().width);
                for (let i = 0; i < maxAmount; ++i) {
                    if (i === 0)
                        allPot.push(0);
                    else {
                        allPot.push(i * node.getComponent(Food).getBoundingBox().width);
                        allPot.push(-i * node.getComponent(Food).getBoundingBox().width);
                    }
                }
                pots = Utils.getElesFromArray(allPot, amount);    //随机出现的嘴杓
            }
            let foodScript = node.getComponent(Food);
            node.x = pots[i];
            let addY = Utils.randomFloat(foodScript.getBoundingBox().height * (i / 2), foodScript.getBoundingBox().height * (i + 1));
            node.y += addY;
            foodScript.init(2,
                ResourceMgr.getTextureByName(names[Utils.randomInt(0, names.length - 1)]));  //调用初始化方法
            node.runAction(cc.sequence(
                cc.moveTo(time * (node.y / (node.y - addY)), new cc.Vec2(node.x, -foodScript.getBoundingBox().height)),
                cc.callFunc((foodNode: cc.Node) => {
                    let food = foodNode.getComponent(Food);
                    food.ctrScript.recyclingFood(food);
                }, node)
            ));
            this.getHold().gameLayout.addChild(node);
        }
        //计算下一波食物雨出现的时间
        this.nextFoodRainTime = 0.5;
    }

    /**@description 检查游戏是否结束
     * */
    checkedGameFinish():void {
        if (this.remainingTime > 0) return;  //游戏没结束
        //游戏结束
        this.remainingTime = 0;
        //设置游戏状态
        this.isGaming = false;
        //打开遮罩
        this.getHold().maskNode.active = true;
        //显示开始游戏按钮
        this.getHold().startGameNode.active = true;
    }

    protected update(dt: number): void {
        if (!this.isInitEnd) return;  //没有初始化完成不做处理
        if (!this.isGaming) return;   //没有开始玩游戏
        this.nextFoodRainTime -= dt;
        if (this.nextFoodRainTime <= 0) this.produceNewFoodRain();  //下一次撒食物的时间到了
        this.remainingTime -= dt;
        this.checkedGameFinish();
        this.setRemainingTime(this.remainingTime);  //设置剩余游戏时间

    }


}