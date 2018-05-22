import MainControl from "./MainControl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Mask extends MainControl {
    protected registerEvent(): void {
        this.targetNode.on(cc.Node.EventType.TOUCH_END, ()=>{}, this);
    }

    protected unRegisterEvent(): void {
        this.targetNode.off(cc.Node.EventType.TOUCH_END, ()=>{}, this);
    }

}
