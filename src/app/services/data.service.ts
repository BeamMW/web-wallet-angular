import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import {Wallet, Transaction, Utxo} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  API_BASE = 'http://127.0.0.1:8000/manager';
  HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
  };

  constructor(private http: HttpClient) {
  }

  loadWalletsList() {
    return this.http.get<Wallet[]>(this.API_BASE + '/wallets/', this.HTTP_OPTIONS);
  }

  loadAddressesList(port) {
    return this.http.get<any[]>(this.API_BASE + '/get_addr_list/?port=' + port, this.HTTP_OPTIONS);
  }

  loadContactsList(port) {
    return this.http.get(this.API_BASE + '/get_contacts_list/?port=' + port, this.HTTP_OPTIONS);
  }

  addWallet(wallet) {
    return this.http.post(this.API_BASE + '/wallets/', JSON.stringify(wallet), this.HTTP_OPTIONS);
  }

  deleteWallet(port) {
    return this.http.delete(this.API_BASE + '/wallets/' + port + '/', this.HTTP_OPTIONS);
  }

  createAddress(port) {
    return this.http.get(this.API_BASE + '/create_address/?port=' + port);
  }

  deleteAddress(port, address) {
    return this.http.get(this.API_BASE + '/delete_address/?port=' + port + '&address=' + address);
  }

  editAddress(port, address, expiration, comment) {
    return this.http.get(this.API_BASE + '/edit_address/?port=' + port +
      '&address=' + address + '&comment=' + comment + '&expiration=' + expiration);
  }

  loadWalletStatus(port) {
    return this.http.get<Wallet>(this.API_BASE + '/wallet_status/?port=' + port);
  }

  loadTxList(port) {
    return this.http.get<Transaction[]>(this.API_BASE + '/tx_list/?port=' + port);
  }

  txCancel(port, txId) {
    return this.http.get<Transaction[]>(this.API_BASE + '/tx_cancel/?port=' + port +
      '&tx_id=' + txId);
  }

  txDelete(port, txId) {
    return this.http.get<Transaction[]>(this.API_BASE + '/tx_delete/?port=' + port +
      '&tx_id=' + txId);
  }

  txSend(port, value, fee, from, address, comment) {
    return this.http.get(this.API_BASE + '/tx_send/?port=' + port +
      '&value=' + value + '&fee=' + fee + '&from=' + from + '&address=' + address + '&comment=' + comment);
  }

  tx_swap(port, fee, address, amount_beam, amount_btc) {
    return this.http.get(this.API_BASE + '/tx_swap/?address=' + address +
      '&amount_beam=' + amount_beam + '&amount_btc=' + amount_btc +
      '&port=' + port + '&fee=' + fee);
  }

  tx_swap_init() {
    return this.http.get(this.API_BASE + '/tx_swap_init/');
  }

  loadUtxo(port) {
    return this.http.get<Utxo[]>(this.API_BASE + '/get_utxo/?port=' + port);
  }
}
