document.addEventListener('DOMContentLoaded', async event => {
    const wasm = await require("./func.cpp");
    wasm.init().then((inst: any) => {
        let inputElementNum = <HTMLInputElement>document.getElementById('log-numb');
        let inputElementBase = <HTMLInputElement>document.getElementById('log-base');
        let resultElement = <HTMLDivElement>document.getElementById('log-res-val');
        let calcualteButtonElement = <HTMLButtonElement>document.getElementById('log-calculate');
        
        calcualteButtonElement.onclick = (event: any) => {
            resultElement.innerHTML = inst.exports._Z3logdd(inputElementNum.value, inputElementBase.value);
        }
    });
});
