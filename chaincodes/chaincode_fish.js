'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
    //初始化智能合约的方法
    async Init(stub) {
        console.info('=========== Instantiated Fish Chaincode ===========');
        return shim.success();
    }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters(); //获取函数和参数
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('找不到要调用的函数,函数名:' + ret.fcn);
            throw new Error('找不到要调用的函数,函数名:' + ret.fcn);
        }
        try {
            let payload = await method(stub, ret.params); //直接调用函数,获取返回值
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async queryFish(stub, args) {
        if (args.length != 1) {
            throw new Error('错误的调用参数. 实例: FISH01');
        }
        let fishNumber = args[0];

        let fishAsBytes = await stub.getState(fishNumber); //从账本中获取fish的信息,账本是二进制存储的
        if (!fishAsBytes || fishAsBytes.toString().length <= 0) {
            throw new Error(fishAsBytes + ' 不存在: ');
        }
        console.log(fishAsBytes.toString());
        return fishAsBytes;
    }

    async initLedger(stub, args) {
        console.info('============= 开始 : 初始化账本 ===========');
        let fishes = [];
        fishes.push({
            vessel: "奋进号38A",
            location: "67.0006, -70.5476",
            timestamp: "1504054225",
            holder: "王大壮"
        });
        fishes.push({
            vessel: "光明号66B",
            location: "57.9006, -78.3478",
            timestamp: "1504054666",
            holder: "高大壮"
        });
        fishes.push({
            vessel: "钓鱼岛58B",
            location: "77.9034, -75.3455",
            timestamp: "1504054888",
            holder: "刘胡兰"
        });

        for (let i = 0; i < fishes.length; i++) {
            await stub.putState('FISH' + i, Buffer.from(JSON.stringify(fishes[i])));
            console.info('Added <--> ', fishes[i]);
        }
        console.info('============= 结束 :初始化账本 ===========');
    }

    async recordFish(stub, args) {
        console.info('============= START : record fish ===========');
        if (args.length != 5) {
            throw new Error('需要5个参数,第0个参数是id,后面的4个参数,   vessel, location,  timestamp, holder');
        }

        var fish = {
            vessel: args[1],
            location: args[2],
            timestamp: args[3],
            holder: args[4]
        };

        await stub.putState(args[0], Buffer.from(JSON.stringify(fish)));
        console.info('============= END : record fish ===========');
    }

    async queryAllFish(stub, args) {

        let startKey = 'FISH0';
        let endKey = 'FISH999';

        let iterator = await stub.getStateByRange(startKey, endKey);

        let allResults = [];
        while (true) {
            let res = await iterator.next();
            console.log(res);
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return Buffer.from(JSON.stringify(allResults));
            }
        }
    }

    async changeFishHolder(stub, args) {
        console.info('============= START : changeFishHolder ===========');
        if (args.length != 2) {
            throw new Error('参数数量错误,需要两个参数');
        }

        let fishAsBytes = await stub.getState(args[0]);
        let fish = JSON.parse(fishAsBytes);
        fish.holder = args[1];

        await stub.putState(args[0], Buffer.from(JSON.stringify(fish)));
        console.info('============= END : changeFishHolder ===========');
    }

}
shim.start(new Chaincode());

