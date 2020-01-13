# Running Beam Web wallet on windows platform (master)

## Run wallet service

[Download wallet service](https://builds.beam-mw.com/files/wallet-service-wip/2019.12.10/Release/win/wallet-service-masternet-4.1.7005.zip)

Start wallet service `wallet-service-masternet -n eu-node01.masternet.beam.mw:8100`


## Run wallet extension

`npm install`

`npm run developing`

Enable developer mode in Chrome `chrome://extensions/`

Import unpacked extension from `./dist/web-wallet`
