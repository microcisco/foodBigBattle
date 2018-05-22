enum RandomMode {
    int,
    float
}

export default class Utils {
    /**
     * @description 获取范围内随机整数[左闭右闭区间]
     * */
    static randomInt(lowerValue: number, upperValue: number): number {
        return Utils.random(RandomMode.int, lowerValue, upperValue);
    }

    /**
     * @description 获取范围内随机浮点数[左闭右开区间]
     * */
    static randomFloat(lowerValue: number, upperValue: number): number {
        return Utils.random(RandomMode.float, lowerValue, upperValue);
    }

    private static random(mode: RandomMode, lowerValue: number, upperValue: number): number {
        let randValue = (upperValue - lowerValue) * Math.random();
        switch (mode) {
            case RandomMode.int:
                randValue = Math.round(randValue) + lowerValue;
                break;
            case RandomMode.float:
                randValue = randValue + lowerValue;
                break;
            default:
                break;
        }
        return randValue;
    }

    /**
     * @description 获取范围内随机浮点数[左闭右开区间]
     * */
    static getElesFromArray<T>(datas: Array<T>, amount: number): Array<T> {
        let array = [];
        while (array.length < amount) {
            let index = Utils.randomInt(0, datas.length - 1);
            if (!~array.indexOf(datas[index])) array.push(datas[index]);
        }
        return array;
    }

    /**
     * @description 从对象池中获取对象
     * */
    static getNodeFromPool(pool: cc.NodePool, pref: cc.Prefab, ...params: any[]): cc.Node {
        if (pool.size() <= 0) pool.put(cc.instantiate(pref));
        return pool.get(...params);
    }

}