import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Asset } from '@app/models';
import { environment } from '@environment';
import {
  selectAssetsInfo
} from '@app/store/selectors/wallet-state.selectors';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AssetMetadata } from '@app/models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() cardData: Asset;
  @ViewChild('card', {static: true}) card: ElementRef;

  assets$: Observable<any>;
  iconUrl: string;
  assetData: AssetMetadata;

  constructor(private store: Store<any>) {
    this.assets$ = this.store.pipe(select(selectAssetsInfo));
    this.assetData = {
      asset_name: '',
      unit_name: '',
      short_name: '',
      smallest_unit_name: ''
    }
  }

  private hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
              ,(m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g).map(x => parseInt(x, 16))

  ngOnInit(): void {
    this.iconUrl = 
      `${environment.assetsPath}/images/modules/wallet/components/card/${
        this.cardData.asset_id === 0 ? 'icon-beam' : ('asset-' + this.cardData.asset_id)
      }.svg`;
    this.assets$.subscribe(assets => {
      const asset = assets.find(elem => elem.asset_id === this.cardData.asset_id);
      if (asset) {
        this.assetData = asset.metadata;
        if (asset.metadata.color) {
          const rgbaValues = this.hexToRgb(asset.metadata.color);
          this.card.nativeElement.setAttribute('style', 'background-image: linear-gradient(107deg, rgba(' + 
            rgbaValues.join(',') + ', .3) 2%, rgba(0, 69, 143, .3) 98%)');
        }
      }
    });
  }
}
