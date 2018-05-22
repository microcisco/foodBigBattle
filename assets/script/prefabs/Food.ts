import MainGame from "../MainGame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Food extends cc.Component {

    @property(cc.Node)
    display: cc.Node = null;

    @property({visible: false})
    ctrScript: MainGame = null;

    @property({visible: false})
    score: number = 0;

    onLoad() {

    }

    registerEvent(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.clickFood, this);
    }

    unRegisterEvent(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.clickFood, this);
    }

    /**@description 对象池调用put方法后调用  回收资源
     * */
    private clickFood(event: cc.Event.EventTouch): void {
        if (!this.ctrScript) return;
        //通知主控脚本被点击了
        this.ctrScript.notifyFoodBeClicked(this);
    }

    /**@description 对象池调用put方法后调用  回收资源
     * */
    public unuse(): void {
        this.unRegisterEvent();

    }

    /**@description 对象池调用get方法后调用  重置脚本
     * */
    public reuse(...params: any[]): void {
        //设置控制脚本
        if (params[0] instanceof MainGame) this.ctrScript = params[0];
        //注册事件
        this.registerEvent();
        //重置坐标
        this.node.x = 0;
        this.node.y = cc.director.getWinSize().height + this.getBoundingBox().height;
    }

    /**@description 初始化脚本
     * */
    public init(score: number, texture: cc.SpriteFrame): void {
        this.score = score;  //设置food分数
        this.display.getComponent(cc.Sprite).spriteFrame = texture;
    }

    /**@description 对象池调用get方法后调用  重置脚本
     * */
    public getBoundingBox(): cc.Rect {
        return this.display.getBoundingBox();
    }

    // update (dt) {}
}
