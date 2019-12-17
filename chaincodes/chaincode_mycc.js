const shim = require('fabric-shim');
const Chaincode = class{
    //链码初始化操作
    async Init(stub){
        var ret = stub.getFunctionAndParameters();
        var args  = ret.params;
        var a = args[0];
        var aValue = args[1];
        var b = args[2];
        var bValue = args[3];
        await stub.putState(a,Buffer.from(aValue));
        await stub.putState(b,Buffer.from(bValue));
        return shim.success(Buffer.from('mycc init success'));
    }

    async Invoke(stub){
        var ret = stub.getFunctionAndParameters();
        let method = this[ret.fcn];
        if (!method) {
            console.error('找不到要调用的函数,函数名:' + ret.fcn);
            throw new Error('找不到要调用的函数,函数名:' + ret.fcn);
        }
        try {
            let payload = await method(stub, ret.params); //直接调用函数,获取返回值
            return shim.success(Buffer.from(payload));
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async invoke(stub,args){
        var aname = args[0];
        var bname = args[1];
        var abalance = await stub.getState(aname);
        var bbalance = await stub.getState(bname);
        var money = args[2];
        var aNewBalance = parseInt(abalance) - parseInt(money);
        var bNewBalance = parseInt(bbalance) + parseInt(money);
        await stub.putState(aname,Buffer.from(aNewBalance.toString()));
        await stub.putState(bname,Buffer.from(bNewBalance.toString()));
        return 'mycc invoke success';
    }

    async query(stub,args){
        let a = args[0];
        let balance = await stub.getState(a);
        return balance.toString();
    }

};
shim.start(new Chaincode());