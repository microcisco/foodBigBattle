const {ccclass, property} = cc._decorator;

@ccclass
export default abstract class MainControl extends cc.Component {

    @property(cc.Node)
    targetNode: cc.Node = null;


    protected onEnable(): void {
        this.registerEvent();
    }

    protected onDisable(): void {
        this.unRegisterEvent();
    }

    protected abstract registerEvent():void;
    protected abstract unRegisterEvent():void;
}