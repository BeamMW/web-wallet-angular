function Data() {
    this.handlers = []; 
}

Data.prototype = {

    subscribe: function (fn) {
        this.handlers.push(fn);
    },

    unsubscribe: function (fn) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    },

    fire: function (o, thisObj) {
        var scope = thisObj || window;
        this.handlers.forEach(function (item) {
            item.call(scope, o);
        });
    }
}
class BeamProvider {

    constructor() {
        this.apiResult$ = new Data();

        window.addEventListener("apiResult", (data) => {
            this.apiResult$.fire(data.detail.response);
            console.log( data.detail.response );
        }, false);
    }

    initializeFaucet() {
        window.dispatchEvent(new CustomEvent("getChromeData", {
            detail: {
                id: '50ab294a5ff6cedcfd74860898faf3f00967b9f1296c94f19dec24f2ab55595f',
                name: 'faucet'
            }
        }));   
    }

    initializeShader(cid, name) {
        window.dispatchEvent(new CustomEvent("getChromeData", {
            detail: {
                id: cid,
                name: name
            }
        }));   
    }

    setupInitApiCall(callid, method, params) {
        window.dispatchEvent(new CustomEvent("callWalletApi", {
            detail: {
                callid, method, params
            }
        }));
    }

    




    

    


    

    // _rpcRequest= (payload, callback) => {
    //     //return this._rpcEngine.handle(payload);
    // }

    // enable = () => { 
    // return new Promise((resolve, reject) => {
    //     try {
    //     // this._rpcRequest(
    //     //     { method: 'eth_requestAccounts', params: [] },
    //     //     ()=>{console.log('rcpDONE');}
    //     // );
    //     } catch (error) {
    //     console.log(error);
    //     }
    // });
    // }
}

window.beam = new BeamProvider();