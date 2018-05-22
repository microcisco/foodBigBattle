export default class ResourceMgr {
    private static imgResourceTable: { [key: string]: cc.SpriteFrame; } = {};
    private static _instance: ResourceMgr = new ResourceMgr();

    public static getInstance(): ResourceMgr {
        return ResourceMgr._instance;
    }

    public static getTextureByName(imgName: string): cc.SpriteFrame {
        return ResourceMgr.imgResourceTable[imgName];
    }

    public static addResource(name: string, value: cc.SpriteFrame): cc.SpriteFrame {
        return ResourceMgr.imgResourceTable[name] = value;
    }

    public static getAllTextureName():Array<string>{
        return Object.keys(ResourceMgr.imgResourceTable);
    }

};